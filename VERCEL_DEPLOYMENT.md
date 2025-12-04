# Vercel Deployment Guide - Family Calendar
## Secure Deployment with Access Control

This guide will help you deploy your Family Calendar to Vercel with proper security measures.

---

## Part 1: Prepare Your Project for Deployment

### Step 1: Initialize Git Repository

Open PowerShell in your project folder and run:

```powershell
git init
git add .
git commit -m "Initial commit - Family Calendar"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `family-calendar-private`
3. **IMPORTANT**: Select **"Private"** (not public!)
4. Do NOT initialize with README (we already have code)
5. Click "Create repository"

### Step 3: Push to GitHub

Copy the commands from GitHub (they'll look like this):

```powershell
git remote add origin https://github.com/YOUR-USERNAME/family-calendar-private.git
git branch -M main
git push -u origin main
```

### Step 4: Set Up Production Database

For Vercel, we need to switch from SQLite to a cloud database. We'll use Vercel Postgres (free tier).

**Update `prisma/schema.prisma`:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## Part 2: Deploy to Vercel

### Step 5: Create Vercel Account

1. Go to https://vercel.com/signup
2. Sign up with GitHub
3. Authorize Vercel to access your GitHub account

### Step 6: Import Your Project

1. Click "Add New..." → "Project"
2. Find your `family-calendar-private` repository
3. Click "Import"

### Step 7: Configure Environment Variables

**IMPORTANT**: Before deploying, add these environment variables:

1. In the Vercel project settings, find "Environment Variables"
2. Add the following variables:

```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
DATABASE_URL=postgres://... (will be auto-generated in next step)
DIRECT_URL=postgres://... (will be auto-generated in next step)
```

### Step 8: Set Up Vercel Postgres

1. In your Vercel project, go to "Storage" tab
2. Click "Create Database"
3. Select "Postgres"
4. Choose "Hobby" (free tier)
5. Click "Create"
6. Vercel will automatically add `DATABASE_URL` and `DIRECT_URL` to your environment variables

### Step 9: Update Google OAuth Redirect URI

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Navigate to "APIs & Services" → "Credentials"
3. Click on your OAuth 2.0 Client ID
4. Under "Authorized redirect URIs", add:
   ```
   https://your-project-name.vercel.app/api/auth/callback/google
   ```
   (Replace `your-project-name` with your actual Vercel URL)
5. Click "Save"

### Step 10: Deploy!

1. Click "Deploy" in Vercel
2. Wait for the build to complete (2-3 minutes)
3. Click "Visit" to see your deployed app

### Step 11: Initialize Database

After first deployment, run database migrations:

1. In Vercel project, go to "Settings" → "General"
2. Install Vercel CLI locally:
   ```powershell
   npm i -g vercel
   ```
3. Login to Vercel:
   ```powershell
   vercel login
   ```
4. Link your project:
   ```powershell
   vercel link
   ```
5. Pull environment variables:
   ```powershell
   vercel env pull
   ```
6. Run Prisma migrations:
   ```powershell
   npx prisma migrate deploy
   ```

---

## Part 3: Secure Your Application (Access Control)

### Option 1: Vercel Password Protection (Easiest)

**For Pro Plan Users:**
1. Go to your Vercel project settings
2. Navigate to "Deployment Protection"
3. Enable "Password Protection"
4. Set a strong password
5. Share this password only with family members

**Note**: This requires Vercel Pro ($20/month)

### Option 2: Custom Authentication (Free)

We'll implement a simple password-based authentication:

#### A. Create Authentication Middleware

Create `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const FAMILY_PASSWORD = process.env.FAMILY_ACCESS_PASSWORD;

export function middleware(request: NextRequest) {
  // Skip auth for login page and API routes
  if (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const authCookie = request.cookies.get('family-auth');
  
  if (!authCookie || authCookie.value !== FAMILY_PASSWORD) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

#### B. Create Login Page

Create `src/app/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Qazi Family Calendar
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Family Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter family password"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium"
          >
            Access Calendar
          </button>
        </form>
      </div>
    </div>
  );
}
```

#### C. Create Login API Route

Create `src/app/api/auth/login/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { password } = await request.json();
  const correctPassword = process.env.FAMILY_ACCESS_PASSWORD;

  if (password === correctPassword) {
    cookies().set('family-auth', correctPassword, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
```

#### D. Add Environment Variable

In Vercel, add:
```
FAMILY_ACCESS_PASSWORD=YourStrongFamilyPassword123!
```

### Option 3: IP Allowlist (Advanced)

Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

Then use Vercel Firewall (Pro plan) to allowlist specific IP addresses.

---

## Part 4: Security Best Practices

### ✅ Security Checklist

- [ ] Repository is **private** on GitHub
- [ ] `.env.local` is in `.gitignore` (never committed)
- [ ] All secrets are in Vercel Environment Variables
- [ ] Google OAuth redirect URI updated for production
- [ ] Access control implemented (password or Vercel protection)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Database credentials secured (Vercel Postgres)

### 🔒 Additional Security Measures

1. **Enable 2FA on GitHub and Vercel**
2. **Use strong passwords** for family access
3. **Regularly rotate** Google API credentials
4. **Monitor** Vercel deployment logs
5. **Set up alerts** for unusual activity

---

## Part 5: Sharing with Family

### Share Access Information:

**Website URL**: `https://your-project-name.vercel.app`

**If using password protection**:
- Password: `[Share securely via Signal/WhatsApp]`
- Instructions: "Enter the family password to access"

**For Google Calendar Sync**:
- Each family member needs to authorize with their own Google account
- They'll click "Sync Google" and sign in

---

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure all environment variables are set
- Verify Prisma schema is correct

### Database Connection Issues
- Verify `DATABASE_URL` is set in Vercel
- Run `npx prisma migrate deploy`
- Check Vercel Postgres dashboard

### Google OAuth Not Working
- Verify redirect URI in Google Cloud Console
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel
- Ensure production URL is used (not localhost)

### Password Protection Not Working
- Clear browser cookies
- Verify `FAMILY_ACCESS_PASSWORD` is set in Vercel
- Check middleware is deployed

---

## Maintenance

### Update Deployment
```powershell
git add .
git commit -m "Update description"
git push
```
Vercel will automatically redeploy!

### View Logs
- Go to Vercel Dashboard → Your Project → Deployments
- Click on a deployment → "Functions" tab → View logs

### Backup Database
- Vercel Postgres has automatic backups
- Or export manually: `npx prisma db pull`

---

## Cost Breakdown

- **Vercel Hobby Plan**: FREE
  - 100GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS
  
- **Vercel Pro** (optional): $20/month
  - Password protection
  - IP allowlist
  - Advanced analytics

- **Vercel Postgres**: FREE (Hobby tier)
  - 256MB storage
  - 60 hours compute/month
  - Perfect for family use

**Total Cost**: $0/month (or $20/month for Pro features)

---

## Summary

You now have:
✅ Secure deployment on Vercel
✅ Private GitHub repository
✅ Protected environment variables
✅ Access control for family only
✅ Production database
✅ Automatic HTTPS
✅ Easy updates via Git

Your family calendar is now secure and accessible only to you and your family! 🎉
