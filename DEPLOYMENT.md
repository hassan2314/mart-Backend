# Render Deployment Guide

## Required Settings (Render Dashboard)

If deploying manually (without `render.yaml`), configure these in your Render service:

| Setting | Value |
|---------|-------|
| **Root Directory** | `Backend` (when deploying from Mart repo root) |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

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
