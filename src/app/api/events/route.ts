import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const events = await prisma.event.findMany();
        return NextResponse.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: 'Error fetching events' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (Array.isArray(body)) {
            const eventsToCreate = body.map((e: any) => ({
                title: e.title,
                start: new Date(e.start),
                end: new Date(e.end),
                description: e.description || null,
                location: e.location || null,
                type: e.type || 'other',
                person: e.person || 'Musaddique',
                source: e.source || 'manual',
            }));

            const createdEvents = await Promise.all(
                eventsToCreate.map((data: any) => prisma.event.create({ data }))
            );

            return NextResponse.json(createdEvents);
        } else {
            const data = {
                title: body.title,
                start: new Date(body.start),
                end: new Date(body.end),
                description: body.description || null,
                location: body.location || null,
                type: body.type || 'other',
                person: body.person || 'Musaddique',
                source: body.source || 'manual',
            };

            const createdEvent = await prisma.event.create({ data });
            return NextResponse.json(createdEvent);
        }
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({ error: 'Error creating event' }, { status: 500 });
    }
}
