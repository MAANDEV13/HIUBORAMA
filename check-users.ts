import prisma from '@/lib/prisma';

async function checkUsers() {
    const users = await prisma.user.findMany({
        select: {
            username: true,
            role: true,
            name: true,
        },
    });

    console.log('Users in database:');
    console.log(JSON.stringify(users, null, 2));
}

checkUsers()
    .catch(console.error)
    .finally(() => process.exit());
