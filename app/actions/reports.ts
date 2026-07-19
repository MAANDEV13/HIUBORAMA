'use server'

import prisma from "@/lib/prisma"

export type SemesterResultRow = {
    sn: number
    studentId: string
    name: string
    batch: string
    courseGrades: { [courseCode: string]: string } // Grade (e.g. "A", "85")
    totalMarks: number
    gpa: number
    rank: number
}

export type SemesterResultData = {
    results: SemesterResultRow[]
    courses: { code: string; name: string; credits: number }[]
}

export async function getSemesterResults(semesterId: string): Promise<SemesterResultData> {
    // 1. Fetch all enrollments for the semester with student and course details
    const enrollments = await prisma.enrollment.findMany({
        where: { semesterId },
        include: {
            student: {
                include: {
                    user: true,
                    batchRel: true
                }
            },
            course: true
        }
    })

    // 2. Identify all unique courses
    const courseMap = new Map<string, { code: string; name: string; credits: number }>()
    enrollments.forEach(e => {
        if (!courseMap.has(e.course.code)) {
            courseMap.set(e.course.code, {
                code: e.course.code,
                name: e.course.name,
                credits: e.course.credits
            })
        }
    })
    const courses = Array.from(courseMap.values()).sort((a, b) => a.code.localeCompare(b.code))

    // 3. Group by student
    const studentMap = new Map<string, {
        student: typeof enrollments[0]['student'],
        enrollments: typeof enrollments
    }>()

    enrollments.forEach(e => {
        if (!studentMap.has(e.studentId)) {
            studentMap.set(e.studentId, {
                student: e.student,
                enrollments: []
            })
        }
        studentMap.get(e.studentId)!.enrollments.push(e)
    })

    // 4. Calculate stats for each student
    const results: SemesterResultRow[] = []

    for (const { student, enrollments } of studentMap.values()) {
        let totalMarks = 0
        let totalWeightedPoints = 0
        let totalCredits = 0
        const courseGrades: { [key: string]: string } = {}

        enrollments.forEach(e => {
            // Store grade. User asked for "course 1 course 2". 
            // We can store the letter grade, or maybe "Grade (Total)"
            // Let's store the Grade (e.g. "A")
            courseGrades[e.course.code] = e.grade || '-'

            totalMarks += e.total || 0

            if (e.gpaPoint !== null && e.course.credits > 0) {
                totalWeightedPoints += (e.gpaPoint * e.course.credits)
                totalCredits += e.course.credits
            }
        })

        const gpa = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0

        results.push({
            sn: 0, // Will assign after sorting
            studentId: student.studentId,
            name: student.user.name,
            batch: student.batch || student.batchRel?.name || '-',
            courseGrades,
            totalMarks,
            gpa: parseFloat(gpa.toFixed(2)),
            rank: 0 // Will assign after sorting
        })
    }

    // 5. Sort by GPA desc, then Total Marks desc
    results.sort((a, b) => {
        if (b.gpa !== a.gpa) return b.gpa - a.gpa
        return b.totalMarks - a.totalMarks
    })

    // 6. Assign Rank and SN
    results.forEach((row, index) => {
        row.sn = index + 1
        row.rank = index + 1
    })

    return { results, courses }
}
