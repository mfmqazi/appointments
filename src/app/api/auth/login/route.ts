import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();
        const correctPassword = process.env.FAMILY_ACCESS_PASSWORD;

        // If no password set in env, allow any password (or handle as error)
        // Ideally, we should require the env var to be set.
        if (!correctPassword) {
            console.warn("FAMILY_ACCESS_PASSWORD not set in environment variables");
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        if (password === correctPassword) {
            // Set cookie
            (await cookies()).set('family-auth', correctPassword, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
