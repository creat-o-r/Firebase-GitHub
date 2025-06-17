# Universal CI/CD GitHub App

Automatically sets up CI/CD workflows for any repository with framework auto-detection and Firebase deployment.

## Features

- 🔍 **Auto-detection**: Detects Next.js, React, Vue, Angular, and more
- 🚀 **One-click setup**: Adds CI/CD workflow automatically on installation
- 🌐 **Firebase deployment**: Production and preview deployments
- 💬 **Smart comments**: PR comments with deployment URLs
- 🔒 **Secure**: Uses GitHub App authentication

## Quick Start

### 1. Create GitHub App

1. Go to GitHub Settings > Developer settings > GitHub Apps
2. Click "New GitHub App"
3. Fill in:
   - **App name**: `Universal CI/CD`
   - **Homepage URL**: `https://your-railway-app.up.railway.app`
   - **Webhook URL**: `https://your-railway-app.up.railway.app/webhook`
   - **Webhook secret**: Generate a random secret
4. Set permissions:
   - Contents: Read & write
   - Actions: Read & write
   - Pull requests: Write
   - Checks: Write
5. Subscribe to events:
   - Installation
   - Push
   - Pull request
6. Generate and download private key

### 2. Deploy to Railway

1. Connect this repo to Railway
2. Set environment variables:
   ```
   APP_ID=your_app_id
   PRIVATE_KEY="your_private_key"
   WEBHOOK_SECRET=your_webhook_secret
   ```
3. Deploy

### 3. Install App

1. Go to your GitHub App settings
2. Install on repositories you want CI/CD for
3. Watch automatic setup happen!

## How it Works

1. **Installation**: App detects framework and creates `.github/workflows/ci.yml`
2. **Push to main**: Deploys to production Firebase hosting
3. **Pull request**: Creates preview deployment with comment
4. **Comments**: Automatic deployment URLs and build info

## Supported Frameworks

- Next.js
- React (Vite)
- Vue.js
- Angular
- Svelte
- Gatsby
- Astro
- Static sites

## Required Secrets

Each repository needs these secrets:
- `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON
- `FIREBASE_PROJECT_ID` - Firebase project ID

The app creates setup instructions automatically.