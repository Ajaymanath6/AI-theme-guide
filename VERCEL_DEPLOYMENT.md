# Deploying to Vercel

This guide explains how to deploy your Angular app to Vercel.

## Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Sign up/Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account

2. **Import Your Repository**
   - Click "Add New Project"
   - Import your GitHub repository: `Ajaymanath6/AI-theme-guide`
   - Vercel will auto-detect Angular

3. **Configure Build Settings**
   - **Framework Preset**: Angular
   - **Root Directory**: Leave empty (if vercel.json is in the repo root) OR set to `angular-tailwind-flowbite-app` (if Angular app is in a subdirectory)
   - **Build Command**: `npm run build:prod` (or leave empty to use vercel.json)
   - **Output Directory**: `dist/angular-tailwind-flowbite-app/browser` (or leave empty to use vercel.json)
   - **Install Command**: `npm ci` (or leave empty to use vercel.json)
   
   **IMPORTANT**: If your Angular app is in a subdirectory (e.g., `angular-tailwind-flowbite-app/`), you MUST set the **Root Directory** in Vercel project settings to that subdirectory. Otherwise, Vercel will look for files in the wrong place.

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically deploy on every push to `main`

## Option 2: Deploy via GitHub Actions (Automated)

1. **Get Vercel Credentials**
   - Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Create a new token (copy it)
   - Go to your project settings → General
   - Copy your **Organization ID** and **Project ID**

2. **Add GitHub Secrets**
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `VERCEL_TOKEN`: Your Vercel token
     - `VERCEL_ORG_ID`: Your Organization ID
     - `VERCEL_PROJECT_ID`: Your Project ID

3. **Push to GitHub**
   - The workflow (`.github/workflows/vercel.yml`) will automatically deploy on push to `main`

## Option 3: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd angular-tailwind-flowbite-app
vercel

# Deploy to production
vercel --prod
```

## Configuration

The `vercel.json` file is already configured with:
- ✅ Correct build command
- ✅ Correct output directory
- ✅ SPA routing (all routes redirect to index.html)
- ✅ Correct MIME types for JS/CSS files

## Benefits of Vercel over GitHub Pages

- ✅ **Better SPA Support**: Automatic routing for Angular apps
- ✅ **Faster Deployments**: Usually faster than GitHub Pages
- ✅ **Better CDN**: Global CDN with edge caching
- ✅ **Preview Deployments**: Automatic preview URLs for PRs
- ✅ **No 404 Issues**: Handles Angular routing automatically
- ✅ **Environment Variables**: Easy to manage secrets
- ✅ **Analytics**: Built-in analytics and monitoring

## Troubleshooting

### Build Fails
- Check Node.js version (should be 20)
- Ensure `package-lock.json` is committed
- Check build logs in Vercel dashboard

### Routing Issues
- The `vercel.json` already has rewrites configured
- All routes should redirect to `/index.html`

### Assets Not Loading
- Check `outputDirectory` in `vercel.json`
- Ensure base href is correct (should be `/` for Vercel)

## Current Configuration

- **Build Command**: `npm run build -- --configuration production`
- **Output Directory**: `dist/angular-tailwind-flowbite-app/browser`
- **Framework**: Angular (auto-detected)
- **Node Version**: 20
