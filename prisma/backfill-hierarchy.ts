/**
 * Backfill script for the Faculty → Department → Class hierarchy.
 * 
 * Run with: npx tsx prisma/backfill-hierarchy.ts
 * 
 * This script is IDEMPOTENT — safe to run multiple times.
 * It will:
 *   1. Create a default Faculty ("General Faculty", code "GEN")
 *   2. Create a default Department ("General Department", code "GEN") under it
 *   3. Assign all existing Batches (with null departmentId) to the default Department
 *   4. Create a "Default" Class for every existing BatchSemester
 *   5. Create StudentClass rows for every Student enrolled in a given semester
 */

import prisma from '../lib/prisma';

async function main() {
    console.log('🔄 Starting hierarchy backfill...\n');

    // ── Step 1: Create default Faculty ──────────────────────────
    const faculty = await prisma.faculty.upsert({
        where: { code: 'GEN' },
        update: {},
        create: {
            name: 'General Faculty',
            code: 'GEN',
        },
    });
    console.log(`✅ Faculty: "${faculty.name}" (${faculty.code}) — id: ${faculty.id}`);

    // ── Step 2: Create default Department ───────────────────────
    const department = await prisma.department.upsert({
        where: { code: 'GEN' },
        update: {},
        create: {
            name: 'General Department',
            code: 'GEN',
            facultyId: faculty.id,
        },
    });
    console.log(`✅ Department: "${department.name}" (${department.code}) — id: ${department.id}`);

    // ── Step 3: Assign all unlinked Batches to default Dept ─────
    const batchUpdateResult = await prisma.batch.updateMany({
        where: { departmentId: null },
        data: { departmentId: department.id },
    });
    console.log(`✅ Assigned ${batchUpdateResult.count} batch(es) to default Department`);

    // ── Step 4: Create default Class for every BatchSemester ────
    const batchSemesters = await prisma.batchSemester.findMany({
        include: {
            batch: true,
            semester: true,
        },
    });

    let classesCreated = 0;
    const classMap = new Map<string, string>(); // batchSemesterId → classId

    for (const bs of batchSemesters) {
        // Check if a "Default" class already exists for this batchSemester + department
        let existingClass = await prisma.class.findUnique({
            where: {
                batchSemesterId_name_departmentId: {
                    batchSemesterId: bs.id,
                    name: 'Default',
                    departmentId: department.id,
                },
            },
        });

        if (!existingClass) {
            existingClass = await prisma.class.create({
                data: {
                    name: 'Default',
                    departmentId: department.id,
                    batchSemesterId: bs.id,
                },
            });
            classesCreated++;
        }

        classMap.set(bs.id, existingClass.id);
    }
    console.log(`✅ Created ${classesCreated} default Class(es) for ${batchSemesters.length} BatchSemester(s)`);

    // ── Step 5: Create StudentClass rows ────────────────────────
    // For every student who has enrollments in a semester that maps to a BatchSemester,
    // create a StudentClass row linking them to the default Class for that BatchSemester.

    // Get all students with their batch and enrollments
    const students = await prisma.student.findMany({
        where: { batchId: { not: null } },
        include: {
            enrollments: {
                select: {
                    semesterId: true,
                },
            },
        },
    });

    let studentClassesCreated = 0;
    let studentClassesSkipped = 0;

    for (const student of students) {
        if (!student.batchId) continue;

        // Get unique semester IDs this student is enrolled in
        const semesterIds = [...new Set(student.enrollments.map(e => e.semesterId))];

        for (const semesterId of semesterIds) {
            // Find the BatchSemester for this student's batch + semester
            const bs = await prisma.batchSemester.findUnique({
                where: {
                    batchId_semesterId: {
                        batchId: student.batchId,
                        semesterId: semesterId,
                    },
                },
            });

            if (!bs) continue; // No BatchSemester exists for this combo

            const classId = classMap.get(bs.id);
            if (!classId) continue;

            // Check if StudentClass already exists
            const existing = await prisma.studentClass.findUnique({
                where: {
                    studentId_classId: {
                        studentId: student.id,
                        classId: classId,
                    },
                },
            });

            if (!existing) {
                await prisma.studentClass.create({
                    data: {
                        studentId: student.id,
                        classId: classId,
                    },
                });
                studentClassesCreated++;
            } else {
                studentClassesSkipped++;
            }
        }
    }

    console.log(`✅ Created ${studentClassesCreated} StudentClass row(s), skipped ${studentClassesSkipped} existing`);

    // ── Summary ─────────────────────────────────────────────────
    console.log('\n🎉 Backfill completed successfully!');
    console.log('   Summary:');
    console.log(`   • Faculty: ${faculty.name} (${faculty.code})`);
    console.log(`   • Department: ${department.name} (${department.code})`);
    console.log(`   • Batches assigned: ${batchUpdateResult.count}`);
    console.log(`   • Default Classes created: ${classesCreated}`);
    console.log(`   • StudentClass rows created: ${studentClassesCreated}`);
}

main()
    .catch((e) => {
        console.error('❌ Backfill error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
