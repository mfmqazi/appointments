import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const KEY_PATH = path.join(process.cwd(), 'credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'token.json');

// If we were deploying this, we'd use environment variables.
// For this local playground, we'll try to read from a file or env.
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback/google';

export const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

export const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

export function saveToken(tokens: any) {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
}

export function loadToken() {
    if (fs.existsSync(TOKEN_PATH)) {
        const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
        oauth2Client.setCredentials(tokens);
        return tokens;
    }
    return null;
}
