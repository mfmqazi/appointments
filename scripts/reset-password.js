const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
        console.error('Usage: node scripts/reset-password.js <email> <new_password>');
        process.exit(1);
    }

    console.log(`Resetting/Creating password for ${email}...`);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.upsert({
        where: { email },
        update: { password: hashedPassword },
        create: {
            email,
            password: hashedPassword,
            name: email.split('@')[0]
        }
    });

    console.log(`Password for ${email} has been successfully set.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
