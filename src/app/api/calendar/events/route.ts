import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { oauth2Client, loadToken } from '@/lib/google';
import { CalendarEvent } from '@/lib/types';

export async function GET() {
    const tokens = loadToken();
    if (!tokens) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 50,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = response.data.items || [];

        const mappedEvents: CalendarEvent[] = events.map((event: any) => ({
            id: event.id || Math.random().toString(),
            title: event.summary || 'No Title',
            start: new Date(event.start.dateTime || event.start.date),
            end: new Date(event.end.dateTime || event.end.date),
            type: 'doctor', // Assumption for now, or we can parse the title
            person: 'Musaddique', // Default, logic needed to distinguish
            source: 'google',
            description: event.description,
            location: event.location
        }));

        return NextResponse.json(mappedEvents);
    } catch (error) {
        console.error('The API returned an error: ' + error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}
