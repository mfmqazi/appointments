# Deployment Guide for Family Calendar

This application is a full-stack Next.js app with a database and authentication. It cannot be hosted on GitHub Pages (which only supports static sites). The recommended hosting platform is **Vercel**.

## Prerequisites

1.  A [GitHub account](https://github.com).
2.  A [Vercel account](https://vercel.com) (you can sign up with GitHub).

## Step 1: Push to GitHub

1.  Initialize a git repository if you haven't already:
    ```bash
    git init
    ```
2.  Add all files:
    ```bash
    git add .
    ```
3.  Commit your changes:
    ```bash
    git commit -m "Initial commit with auth and calendar features"
    ```
4.  Create a new repository on GitHub.
5.  Link your local repository to GitHub and push:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git branch -M main
    git push -u origin main
    ```

## Step 2: Deploy to Vercel

1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository (`family-calendar`).
4.  In the **Configure Project** screen:
    *   **Framework Preset**: Next.js (should be auto-detected).
    *   **Root Directory**: `./` (default).

## Step 3: Configure Database (Vercel Postgres)

Since SQLite (the local file-based DB) doesn't work well in serverless environments like Vercel, we'll use Vercel Postgres.

1.  In the Vercel project deployment screen, look for the **Storage** tab or "Add Database" option (usually available after creating the project or during creation).
2.  Select **Postgres**.
3.  Accept the terms and create the database.
4.  Vercel will automatically add the necessary environment variables (`POSTGRES_URL`, etc.) to your project.

**Important:** You need to update your `prisma/schema.prisma` to use Postgres instead of SQLite for production.

1.  Open `prisma/schema.prisma` and change the provider:
    ```prisma
    datasource db {
      provider = "postgresql" // Change from "sqlite"
      url      = env("POSTGRES_PRISMA_URL") // Use Vercel's env var
      directUrl = env("POSTGRES_URL_NON_POOLING") // For migrations
    }
    ```
2.  Commit and push this change to GitHub.

## Step 4: Environment Variables

In the Vercel Project Settings -> **Environment Variables**, add the following:

*   `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., `https://your-project.vercel.app`).
*   `NEXTAUTH_SECRET`: A random string (you can generate one with `openssl rand -base64 32` or just type a long random string).
*   `FAMILY_ACCESS_PASSWORD`: (Optional, if you still use it in any legacy code, but we moved to NextAuth).

## Step 5: Finalize Deployment

1.  Vercel will automatically redeploy when you push changes.
2.  Once deployed, go to the **Deployments** tab in Vercel.
3.  You might need to run the database migration on the production database. You can do this by adding a build command or running it locally against the production DB, but the easiest way for a first deployment is to add a "Build Command" in Vercel settings:
    *   **Build Command**: `npx prisma generate && npx prisma migrate deploy && next build`

## Accessing Your App

Once deployed, visit your Vercel URL. You should see the login page.
*   **Sign Up**: Use `mfmqazi@gmail.com` or `qazi.fatima@gmail.com`.
*   **Login**: Use your credentials.

Enjoy your secure Family Calendar!
