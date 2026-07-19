import prisma from '@/lib/prisma';
import UploadGradesForm from './UploadGradesForm';

export default async function Page() {
    const semesters = await prisma.semester.findMany({
        orderBy: { startDate: 'desc' },
    });

    return <UploadGradesForm semesters={semesters} />;
}
