# Google Calendar Sync Setup Guide

## Prerequisites
- Google Account
- Family Calendar app running locally

## Step-by-Step Instructions

### Part 1: Create Google Cloud Project & Get Credentials

#### 1. Go to Google Cloud Console
- Open your browser and navigate to: https://console.cloud.google.com/

#### 2. Create a New Project
- Click on the project dropdown at the top
- Click "New Project"
- Enter project name: "Family Calendar"
- Click "Create"
- Wait for the project to be created, then select it

#### 3. Enable Google Calendar API
- In the left sidebar, go to "APIs & Services" → "Library"
- Search for "Google Calendar API"
- Click on "Google Calendar API"
- Click "Enable"

#### 4. Configure OAuth Consent Screen
- Go to "APIs & Services" → "OAuth consent screen"
- Select "External" user type
- Click "Create"
- Fill in the required fields:
  - App name: "Family Calendar"
  - User support email: (your email)
  - Developer contact: (your email)
- Click "Save and Continue"
- On the "Scopes" page, click "Add or Remove Scopes"
  - Search for "Google Calendar API"
  - Select: `.../auth/calendar.readonly`
  - Click "Update"
  - Click "Save and Continue"
- On "Test users" page:
  - Click "Add Users"
  - Add your Google email address (and any family members)
  - Click "Save and Continue"
- Click "Back to Dashboard"

#### 5. Create OAuth 2.0 Credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth client ID"
- Select Application type: "Web application"
- Name: "Family Calendar Web Client"
- Under "Authorized redirect URIs", click "Add URI"
  - Add: `http://localhost:3000/api/auth/callback/google`
  - If you want to access from your phone, also add: `http://192.168.0.33:3000/api/auth/callback/google`
- Click "Create"
- **IMPORTANT**: A dialog will appear with your credentials
  - Copy the "Client ID"
  - Copy the "Client Secret"
  - Keep these safe!

### Part 2: Configure Your Application

#### 6. Create Environment Variables File
- In your project root folder: `family-calendar`
- Create a new file named: `.env.local`
- Add the following content (replace with your actual credentials):

```
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

#### 7. Restart the Development Server
- Stop the current dev server (Ctrl+C in the terminal)
- Run: `npm run dev`
- The server will now load your Google credentials

### Part 3: Sync Your Google Calendar

#### 8. Click "Sync Google" Button
- Open your Family Calendar app in the browser
- Click the "Sync Google" button in the top-right corner
- You'll be redirected to Google's login page

#### 9. Authorize the Application
- Select your Google account
- You may see a warning "Google hasn't verified this app"
  - Click "Advanced"
  - Click "Go to Family Calendar (unsafe)" - this is safe because it's your own app
- Review the permissions (read-only access to your calendar)
- Click "Allow"

#### 10. Import Events
- You'll be redirected back to your Family Calendar
- Your Google Calendar events should now be imported!

## Troubleshooting

### "Missing Google Client ID or Secret" Error
- Make sure you created the `.env.local` file
- Verify the credentials are correct
- Restart the dev server

### "Redirect URI Mismatch" Error
- Go back to Google Cloud Console → Credentials
- Edit your OAuth client
- Make sure the redirect URI exactly matches: `http://localhost:3000/api/auth/callback/google`

### Events Not Showing Up
- Check that you authorized the correct Google account
- Verify the calendar you want to sync has events
- Check the browser console for any error messages

## Security Notes
- The `.env.local` file is git-ignored by default (never commit it!)
- Your credentials are stored locally only
- The app only has READ access to your calendar (cannot modify)
- Tokens are stored in `token.json` in your project folder

## Next Steps
- Once synced, your Google Calendar events will appear in the Family Calendar
- You can manually create additional events in the Family Calendar
- Events from Google are read-only (edit them in Google Calendar)
