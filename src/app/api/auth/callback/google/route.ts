import { NextResponse } from 'next/server';
import { oauth2Client, saveToken } from '@/lib/google';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        saveToken(tokens);
        return NextResponse.redirect('http://localhost:3000');
    } catch (error) {
        console.error('Error retrieving access token', error);
        return NextResponse.json({ error: 'Failed to retrieve access token' }, { status: 500 });
    }
}
