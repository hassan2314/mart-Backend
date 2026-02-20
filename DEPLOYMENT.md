# Render Deployment Guide

## Required Settings (Render Dashboard)

This repo ([mart-Backend](https://github.com/hassan2314/mart-Backend)) has a flat structure—`package.json` is at the root. No Root Directory is needed.

If deploying manually (without Blueprint), configure these in your Render service:

| Setting | Value |
|---------|-------|
| **Root Directory** | Leave empty |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

The `render.yaml` in this repo applies these settings when using Render Blueprint.

## Environment Variables

Set these in Render (Settings → Environment). Use **Secret Files** or **Environment** for sensitive values:

- `PORT` (Render sets this automatically for web services)
- `MONGODB_URI`
- `CORS_ORIGIN`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `ACCESS_TOKEN_EXPIRY`
- `REFRESH_TOKEN_EXPIRY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `INVITATION_TOKEN_SECRET`
- `INVITATION_TOKEN_EXPIRY`

See `.env.example` for reference values.
