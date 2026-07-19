# Deployment Guide for Biuborama-Portal

This guide covers two ways to deploy your application to the internet.

## Option 1: Railway (Easiest for SQLite)
**Best for:** Keeping your current database setup without changes.
**Cost:** Small monthly fee (Railway has a trial, but persistent workloads usually cost a few dollars).

Since your application uses **SQLite** (a file-based database), you need a hosting provider that keeps your files safe when the server restarts. Vercel (the default Next.js host) does *not* do this by default. Railway does.

### Steps:
1.  **Push your code to GitHub**:
    *   Make sure your project is in a GitHub repository.
2.  **Sign up for [Railway](https://railway.app/)**.
3.  **Create a New Project**:
    *   Click "New Project" -> "Deploy from GitHub repo".
    *   Select your `biuboramexams` repository.
4.  **Configure Build**:
    *   Railway usually auto-detects Next.js.
    *   **Build Command**: `npm run build` (or `npx prisma generate && next build`)
    *   **Start Command**: `npm run start`
5.  **Add Environment Variables**:
    *   Go to the "Variables" tab.
    *   Add `DATABASE_URL`: `file:/app/prisma/dev.db` (Railway mounts the volume at `/app`).
    *   Add `JWT_SECRET`: Generate a long random string (e.g., use `openssl rand -hex 32`).
    *   Add `NEXTAUTH_SECRET`: Same as above.
6.  **Add a Volume (Critical for SQLite)**:
    *   In your service settings, go to "Volumes".
    *   Click "Add Volume".
    *   Mount Path: `/app/prisma`
    *   *Why?* This ensures your `dev.db` file isn't deleted when you deploy updates.
7.  **Deploy**:
    *   Railway will build and deploy your app.
    *   Once done, it will give you a public URL (e.g., `biuborama.up.railway.app`).

---

## Option 2: Vercel + Turso (Best Performance)
**Best for:** Scaling, speed, and using the "native" Next.js platform.
**Cost:** Free tier available for both.

Vercel is the best place to host Next.js, but it doesn't support local SQLite files. We will use **Turso**, a cloud version of SQLite, to solve this.

### Phase 1: Set up the Database (Turso)
1.  Install the Turso CLI:
    ```bash
    # Windows (PowerShell)
    iwr https://get.tur.so | iex
    ```
    *Or sign up at [turso.tech](https://turso.tech).*
2.  Login and create a database:
    ```bash
    turso auth login
    turso db create biuborama-db
    ```
3.  Get the connection URL:
    ```bash
    turso db show biuborama-db --url
    # Copy the URL (starts with libsql://)
    ```
4.  Get an authentication token:
    ```bash
    turso db tokens create biuborama-db
    # Copy the token
    ```

### Phase 2: Update Your Code
1.  **Update `prisma/schema.prisma`**:
    Add `previewFeatures` to the generator and ensure the datasource is ready for the driver adapter.
    ```prisma
    generator client {
      provider = "prisma-client-js"
      previewFeatures = ["driverAdapters"]
    }

    datasource db {
      provider = "sqlite"
      url      = "file:./dev.db" // Keep this for local dev, we'll override it in prod
    }
    ```
2.  **Update `lib/prisma.ts`**:
    Modify the file to use the LibSQL adapter when running in production.
    *(I can apply this code change for you if you choose this option).*

### Phase 3: Deploy to Vercel
1.  Push your code to GitHub.
2.  Sign up for **[Vercel](https://vercel.com)**.
3.  "Add New..." -> "Project" -> Import your repo.
4.  **Environment Variables**:
    *   `TURSO_DATABASE_URL`: The `libsql://...` URL from Phase 1.
    *   `TURSO_AUTH_TOKEN`: The token from Phase 1.
    *   `JWT_SECRET`: A long random string.
5.  **Deploy**.

---

## Recommendation
*   **Choose Railway** if you want to deploy **right now** with zero code changes.
*   **Choose Vercel + Turso** if you want a professional, scalable setup and don't mind a few configuration tweaks.
