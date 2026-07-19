import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('🌱 Seeding database...');

    // Create Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: hashedPassword,
            role: 'ADMIN',
            name: 'System Administrator',
        },
    });

    console.log('✅ Admin user created:', adminUser.username);

    // Create Batches
    const batches = await Promise.all([
        prisma.batch.upsert({
            where: { name: 'SH-2023' },
            update: {},
            create: { name: 'SH-2023', startYear: 2023 },
        }),
        prisma.batch.upsert({
            where: { name: 'SH-2024' },
            update: {},
            create: { name: 'SH-2024', startYear: 2024 },
        }),
        prisma.batch.upsert({
            where: { name: 'SH-2025' },
            update: {},
            create: { name: 'SH-2025', startYear: 2025 },
        }),
    ]);
    console.log('✅ Batches created');

    // Create Teachers
    const teachers = await Promise.all([
        prisma.teacher.create({ data: { name: 'Dr. Smith', email: 'smith@uni.edu' } }),
        prisma.teacher.create({ data: { name: 'Prof. Johnson', email: 'johnson@uni.edu' } }),
        prisma.teacher.create({ data: { name: 'Dr. Brown', email: 'brown@uni.edu' } }),
    ]);
    console.log('✅ Teachers created');

    // Create Sample Students
    const studentData = [
        { studentId: '2024001', name: 'Ahmed Hassan', program: 'Bachelor', batchName: 'SH-2024' },
        { studentId: '2024002', name: 'Fatima Ali', program: 'Bachelor', batchName: 'SH-2024' },
        { studentId: '2023001', name: 'Omar Khalil', program: 'Bachelor', batchName: 'SH-2023' },
        { studentId: '2025001', name: 'Zainab Yusuf', program: 'Bachelor', batchName: 'SH-2025' },
    ];

    for (const data of studentData) {
        const studentPassword = await bcrypt.hash(data.studentId, 10);
        const batch = batches.find(b => b.name === data.batchName);

        await prisma.user.upsert({
            where: { username: data.studentId },
            update: {},
            create: {
                username: data.studentId,
                password: studentPassword,
                role: 'STUDENT',
                name: data.name,
                student: {
                    create: {
                        studentId: data.studentId,
                        program: data.program,
                        batch: data.batchName, // Legacy
                        batchId: batch?.id,
                    },
                },
            },
        });
    }

    console.log('✅ Sample students created');

    // Create Semesters
    const semesters = await Promise.all([
        prisma.semester.upsert({
            where: { id: 'sem-1' },
            update: {},
            create: {
                id: 'sem-1',
                name: 'Fall 2024 - Semester 1',
                startDate: new Date('2024-09-01'),
                endDate: new Date('2024-12-31'),
                active: true,
            },
        }),
        prisma.semester.upsert({
            where: { id: 'sem-2' },
            update: {},
            create: {
                id: 'sem-2',
                name: 'Spring 2025 - Semester 2',
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-04-30'),
                active: false,
            },
        }),
    ]);

    console.log('✅ Semesters created');

    // Create Courses
    const courses = await Promise.all([
        prisma.course.upsert({
            where: { code: 'CS101' },
            update: {},
            create: { code: 'CS101', name: 'Introduction to Computer Science', credits: 3 },
        }),
        prisma.course.upsert({
            where: { code: 'MATH101' },
            update: {},
            create: { code: 'MATH101', name: 'Calculus I', credits: 3 },
        }),
        prisma.course.upsert({
            where: { code: 'ENG101' },
            update: {},
            create: { code: 'ENG101', name: 'English Composition', credits: 3 },
        }),
        prisma.course.upsert({
            where: { code: 'PHYS101' },
            update: {},
            create: { code: 'PHYS101', name: 'Physics I', credits: 3 },
        }),
        prisma.course.upsert({
            where: { code: 'CHEM101' },
            update: {},
            create: { code: 'CHEM101', name: 'Chemistry I', credits: 3 },
        }),
        prisma.course.upsert({
            where: { code: 'BIO101' },
            update: {},
            create: { code: 'BIO101', name: 'Biology I', credits: 3 },
        }),
    ]);

    console.log('✅ Courses created');

    // Create Grading Scale
    const defaultScales = [
        { grade: 'A', minMark: 85, gpaPoint: 4.0 },
        { grade: 'B+', minMark: 75, gpaPoint: 3.5 },
        { grade: 'B', minMark: 70, gpaPoint: 3.0 },
        { grade: 'C+', minMark: 65, gpaPoint: 2.5 },
        { grade: 'C', minMark: 60, gpaPoint: 2.0 },
        { grade: 'D+', minMark: 55, gpaPoint: 1.5 },
        { grade: 'D', minMark: 50, gpaPoint: 1.0 },
        { grade: 'F', minMark: 0, gpaPoint: 0.0 },
    ];

    await prisma.gradingScale.deleteMany(); // Clear existing
    for (const scale of defaultScales) {
        await prisma.gradingScale.create({ data: scale });
    }
    console.log('✅ Grading Scale created');

    // Helper function to calculate grade and GPA
    function calculateGrade(total: number): { grade: string; gpaPoint: number } {
        const sortedScales = [...defaultScales].sort((a, b) => b.minMark - a.minMark);
        for (const scale of sortedScales) {
            if (total >= scale.minMark) {
                return { grade: scale.grade, gpaPoint: scale.gpaPoint };
            }
        }
        return { grade: 'F', gpaPoint: 0.0 };
    }

    // Create Enrollments with Grades for Student 1
    const student1 = await prisma.student.findUnique({
        where: { studentId: '2024001' },
    });

    if (student1) {
        const enrollmentData = [
            { courseCode: 'CS101', attendance: 10, assessment: 15, midExam: 20, finalExam: 45 },
            { courseCode: 'MATH101', attendance: 9, assessment: 14, midExam: 18, finalExam: 40 },
            { courseCode: 'ENG101', attendance: 10, assessment: 13, midExam: 22, finalExam: 43 },
            { courseCode: 'PHYS101', attendance: 8, assessment: 12, midExam: 15, finalExam: 35 },
            { courseCode: 'CHEM101', attendance: 9, assessment: 14, midExam: 19, finalExam: 42 },
            { courseCode: 'BIO101', attendance: 10, assessment: 15, midExam: 21, finalExam: 44 },
        ];

        for (const data of enrollmentData) {
            const course = courses.find((c) => c.code === data.courseCode);
            if (!course) continue;

            const total = data.attendance + data.assessment + data.midExam + data.finalExam;
            const { grade, gpaPoint } = calculateGrade(total);
            const status = total >= 50 ? 'PASSED' : 'FAILED';

            await prisma.enrollment.create({
                data: {
                    studentId: student1.id,
                    courseId: course.id,
                    semesterId: semesters[0].id,
                    attendance: data.attendance,
                    assessment: data.assessment,
                    midExam: data.midExam,
                    finalExam: data.finalExam,
                    total,
                    grade,
                    gpaPoint,
                    status,
                },
            });
        }

        console.log('✅ Enrollments created for Ahmed Hassan');
    }

    console.log('🎉 Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
