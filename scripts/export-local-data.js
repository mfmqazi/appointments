const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    console.log('Exporting data...');

    const users = await prisma.user.findMany();
    const events = await prisma.event.findMany();

    const data = {
        users,
        events
    };

    const outputPath = path.join(__dirname, '..', 'backup.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log(`Exported ${users.length} users and ${events.length} events to backup.json`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
