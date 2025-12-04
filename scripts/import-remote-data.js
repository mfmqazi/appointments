const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    console.log('Importing data to PostgreSQL...');

    const backupPath = path.join(__dirname, '..', 'backup.json');
    if (!fs.existsSync(backupPath)) {
        console.error('backup.json not found!');
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    console.log(`Found ${data.users.length} users and ${data.events.length} events in backup.`);

    // Clean up existing data
    console.log('Cleaning up existing remote data...');
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();

    // Import Users
    console.log('Importing Users...');
    for (const user of data.users) {
        await prisma.user.create({
            data: user
        });
    }

    // Import Events
    console.log('Importing Events...');
    for (const event of data.events) {
        // We need to ensure dates are Date objects
        event.start = new Date(event.start);
        event.end = new Date(event.end);
        event.createdAt = new Date(event.createdAt);
        event.updatedAt = new Date(event.updatedAt);

        await prisma.event.create({
            data: event
        });
    }

    console.log('Import completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
