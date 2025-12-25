import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { oauth2Client, loadToken } from '@/lib/google';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');

    if (!eventId) {
        return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const tokens = loadToken();
    if (!tokens) {
        console.warn('API: Authentication failed - token.json not found or invalid.');
        return NextResponse.json({ error: 'Not authenticated with Google. Please sync your calendar first.' }, { status: 401 });
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
        const response = await calendar.events.get({
            calendarId: 'primary',
            eventId: eventId,
        });

        const event = response.data;
        const mappedEvent = {
            title: event.summary || 'No Title',
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date,
            description: event.description,
            location: event.location,
            source: 'google',
            originalId: event.id
        };

        return NextResponse.json(mappedEvent);
    } catch (error) {
        console.error('Failed to fetch event:', error);
        return NextResponse.json({ error: 'Failed to fetch event', details: error }, { status: 500 });
    }
}
