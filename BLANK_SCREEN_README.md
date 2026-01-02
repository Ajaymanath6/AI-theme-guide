# Blank White Screen - Troubleshooting Guide

## Overview

This document explains the common causes of blank white screens in Angular applications, particularly related to **base href path issues**.

## The Problem

When you see a blank white screen, it's often because:
- CSS files are not loading (404 errors)
- JavaScript files are not loading (404 errors)
- Assets are being requested from the wrong path
- **Base href mismatch** between your configuration and actual deployment path

## Scenarios Where Base Href Causes Blank White Screens

### 1. Local Development (Most Common)
- **Problem**: Base href set to `/AI-theme-guide/` but running on `http://localhost:4200/`
- **Result**: Browser tries to load `http://localhost:4200/AI-theme-guide/styles.css` → 404 → No CSS → Blank white screen
- **Solution**: Use `<base href="/">` for local development

### 2. GitHub Pages Deployment
- **Problem**: Base href is `/` but repo is at `username.github.io/repo-name/`
- **Result**: Assets load from root instead of `/repo-name/` → 404 → Blank screen
- **Solution**: Use `<base href="/repo-name/">` for GitHub Pages

### 3. Production Deployment to Subdirectory
- **Problem**: App deployed to `https://example.com/app/` but base href is `/`
- **Result**: Assets try to load from root → 404 → Blank screen
- **Solution**: Use `<base href="/app/">`

### 4. Different Environments (Dev/Staging/Prod)
- **Problem**: Same base href for all environments
- **Result**: Works in one, breaks in others
- **Solution**: Use environment-specific base href

### 5. Hash Routing vs Path Routing
- **Problem**: Base href mismatch with routing strategy
- **Result**: Routes break, assets don't load
- **Solution**: Match base href with routing strategy

## How to Detect This Issue

### Check Browser Console
Look for errors like:
```
Refused to apply style from 'http://localhost:4200/AI-theme-guide/styles.css' 
because its MIME type ('text/html') is not a supported stylesheet MIME type
```

### Check Network Tab
Look for 404 errors on:
- `styles.css`
- `main.js`
- `polyfills.js`
- Other asset files

### Common Error Messages
- `MIME type ('text/html') is not a supported stylesheet MIME type`
- `Failed to load resource: the server responded with a status of 404`
- `GET http://localhost:4200/AI-theme-guide/styles.css 404 (Not Found)`

## Solutions

### Solution 1: Environment-Based Base Href (Recommended)

**Create `src/environments/environment.ts`:**
```typescript
export const environment = {
  production: false,
  baseHref: '/'
};
```

**Create `src/environments/environment.prod.ts`:**
```typescript
export const environment = {
  production: true,
  baseHref: '/AI-theme-guide/'
};
```

**Update `angular.json` build configurations:**
```json
"build": {
  "configurations": {
    "production": {
      "baseHref": "/AI-theme-guide/",
      // ... other config
    },
    "development": {
      "baseHref": "/",
      // ... other config
    }
  }
}
```

### Solution 2: Build-Time Flag

```bash
# Local development
ng serve  # Uses default base href "/"

# Production build for GitHub Pages
ng build --base-href /AI-theme-guide/
```

### Solution 3: Manual Fix in `index.html`

**For Local Development:**
```html
<base href="/">
```

**For GitHub Pages:**
```html
<base href="/AI-theme-guide/">
```

**Note**: You'll need to change this manually when switching between local and production, which is not ideal.

## Quick Troubleshooting Checklist

When you see a blank white screen:

1. ✅ **Check Browser Console** - Look for 404 errors on CSS/JS files
2. ✅ **Verify Base Href** - Does it match your deployment path?
3. ✅ **Check Network Tab** - Are assets loading correctly?
4. ✅ **Verify Routing** - Does routing configuration match base href?
5. ✅ **Check Tailwind CSS** - Is Tailwind compiling correctly?
6. ✅ **Check Angular Build** - Did the build complete successfully?
7. ✅ **Clear Browser Cache** - Sometimes cached files cause issues

## Current Project Configuration

### Local Development
- **Base Href**: `/` (in `src/index.html`)
- **Command**: `ng serve`
- **URL**: `http://localhost:4200/`

### GitHub Pages Deployment
- **Base Href**: `/AI-theme-guide/` (set via build flag)
- **Command**: `ng build --base-href /AI-theme-guide/`
- **URL**: `https://username.github.io/AI-theme-guide/`

### GitHub Actions Workflow
The `.github/workflows/deploy.yml` automatically sets the correct base href:
```yaml
- name: Build
  run: npm run build -- --base-href /AI-theme-guide/
```

## Prevention Tips

1. **Always test locally** before deploying
2. **Use environment files** for different base hrefs
3. **Document your deployment paths** in this README
4. **Set up CI/CD** to automatically use correct base href
5. **Test in production-like environment** before actual deployment

## Additional Resources

- [Angular Base Href Documentation](https://angular.io/guide/deployment#the-base-tag)
- [GitHub Pages Angular Deployment](https://angular.io/guide/deployment#deploy-to-github-pages)
- [Angular Environment Configuration](https://angular.io/guide/build#configuring-application-environments)

## Summary

**The blank white screen issue occurs in:**
- ✅ Local development (wrong base href)
- ✅ GitHub Pages (subdirectory deployments)
- ✅ Production subdirectory deployments
- ✅ Multi-environment setups
- ✅ When switching between deployment targets

**The fix**: Always match the base href to your actual deployment path, and use different values for local vs production builds.

