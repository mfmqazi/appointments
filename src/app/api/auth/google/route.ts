import { NextResponse } from 'next/server';
import { oauth2Client, SCOPES } from '@/lib/google';

export async function GET() {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return NextResponse.json({ error: 'Missing Google Client ID or Secret' }, { status: 500 });
    }

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    return NextResponse.redirect(authUrl);
}
