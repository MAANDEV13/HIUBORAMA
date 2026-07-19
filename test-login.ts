import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function testLogin() {
    const username = 'admin';
    const password = 'admin123';

    console.log('Testing login for:', username);
    console.log('Password:', password);

    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (!user) {
        console.log('❌ User not found');
        return;
    }

    console.log('✅ User found:', user.name);
    console.log('Stored hash:', user.password);

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', passwordMatch);

    if (passwordMatch) {
        console.log('✅ Login would succeed');
    } else {
        console.log('❌ Password does not match');

        // Test if we can create a new hash and compare
        const newHash = await bcrypt.hash(password, 10);
        console.log('New hash:', newHash);
        const newMatch = await bcrypt.compare(password, newHash);
        console.log('New hash match:', newMatch);
    }
}

testLogin()
    .catch(console.error)
    .finally(() => process.exit());
