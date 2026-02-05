# AWS Amplify Deployment Guide

This guide explains how to deploy Mallu Cupid to AWS Amplify.

## Prerequisites

- AWS Account
- AWS Cognito User Pool configured
- Backend API deployed (see BACKEND_GUIDE.md)
- GitHub repository (or other Git provider)

## Step 1: Prepare Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your actual values:
   ```env
   VITE_AWS_REGION=us-east-1
   VITE_AWS_USER_POOL_ID=us-east-1_XXXXXXXXX
   VITE_AWS_CLIENT_ID=your-cognito-client-id
   VITE_API_BASE_URL=https://your-api-domain.com/api
   ```

## Step 2: Push to GitHub

Ensure your code is pushed to a GitHub repository:

```bash
git add .
git commit -m "Prepare for Amplify deployment"
git push origin main
```

## Step 3: Deploy to AWS Amplify

### Option 1: Deploy via AWS Console

1. **Login to AWS Amplify Console**
   - Go to https://console.aws.amazon.com/amplify/
   - Click "New app" → "Host web app"

2. **Connect Repository**
   - Select "GitHub" (or your Git provider)
   - Authorize AWS Amplify to access your repository
   - Select your repository and branch (main)

3. **Configure Build Settings**
   - Amplify will auto-detect the `amplify.yml` file
   - Review the build settings
   - No changes needed (amplify.yml is already configured)

4. **Add Environment Variables**
   - Click "Advanced settings"
   - Add the following environment variables:
     ```
     VITE_AWS_REGION=us-east-1
     VITE_AWS_USER_POOL_ID=us-east-1_XXXXXXXXX
     VITE_AWS_CLIENT_ID=your-cognito-client-id
     VITE_API_BASE_URL=https://your-api-domain.com/api
     ```

5. **Review and Deploy**
   - Review all settings
   - Click "Save and deploy"
   - Wait for the build to complete (5-10 minutes)

6. **Access Your App**
   - Once deployed, you'll get an amplify domain like:
     `https://main.d1234567890.amplifyapp.com`

### Option 2: Deploy via AWS CLI

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure

# Initialize Amplify in your project
amplify init

# Add hosting
amplify add hosting

# Select "Hosting with Amplify Console"
# Select "Manual deployment"

# Deploy
amplify publish
```

## Step 4: Custom Domain (Optional)

1. In AWS Amplify Console, go to "Domain management"
2. Click "Add domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for SSL certificate to be issued (15-30 minutes)

## Step 5: Configure CORS

Ensure your backend API has CORS configured to accept requests from your Amplify domain:

```javascript
// Backend CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://main.d1234567890.amplifyapp.com',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

## Build Configuration

The `amplify.yml` file is already configured:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

## Redirects for SPA

The `public/_redirects` file handles client-side routing:

```
/*    /index.html   200
```

This ensures all routes are handled by React Router.

## Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_AWS_REGION` | AWS region for Cognito | `us-east-1` |
| `VITE_AWS_USER_POOL_ID` | Cognito User Pool ID | `us-east-1_abc123` |
| `VITE_AWS_CLIENT_ID` | Cognito App Client ID | `1a2b3c4d5e6f7g8h9i0j` |
| `VITE_API_BASE_URL` | Backend API base URL | `https://api.example.com/api` |

## Continuous Deployment

AWS Amplify automatically deploys on every push to your connected branch:

1. Push changes to GitHub
2. Amplify detects the push
3. Automatically builds and deploys
4. New version is live in 5-10 minutes

### Disable Auto-Deploy

If you want manual control:
1. Go to Amplify Console
2. Select your app
3. Go to "Build settings"
4. Toggle off "Auto build"

## Monitoring and Logs

### View Build Logs
1. Go to Amplify Console
2. Select your app
3. Click on a build in the left sidebar
4. View logs for each build phase

### View Access Logs
1. In Amplify Console, go to "Monitoring"
2. View metrics like requests, data transfer, errors

## Troubleshooting

### Build Fails

**Check build logs in Amplify Console**
- Look for npm/dependency errors
- Verify all environment variables are set
- Check for TypeScript errors

**Common issues:**
```bash
# Missing dependencies
npm ci --legacy-peer-deps

# TypeScript errors
npm run build
```

### App Loads But Shows Errors

**Check browser console:**
- Cognito configuration errors → Verify environment variables
- API errors → Check CORS configuration
- Network errors → Verify API_BASE_URL

### Environment Variables Not Working

1. Ensure variables start with `VITE_`
2. Redeploy after adding/changing variables
3. Clear browser cache

### Cognito Authentication Issues

1. Verify Cognito User Pool ID and Client ID
2. Check Cognito App Client settings:
   - Enable username/password auth
   - Configure callback URLs
   - Add Amplify domain to allowed origins

## Performance Optimization

### Enable CDN Caching

AWS Amplify automatically uses CloudFront CDN for optimal performance.

### Optimize Build Size

```bash
# Analyze bundle size
npm run build -- --report
```

### Enable Gzip Compression

Amplify automatically enables compression for all assets.

## Security Best Practices

1. **Never commit `.env` file**
   - Already in `.gitignore`
   - Use Amplify environment variables

2. **Use HTTPS only**
   - Amplify provides SSL by default

3. **Implement rate limiting**
   - Configure in backend API

4. **Enable AWS WAF** (optional)
   - Add Web Application Firewall rules

## Cost Estimation

AWS Amplify Pricing:
- Build minutes: Free for first 1000 minutes/month
- Hosting: $0.15/GB stored + $0.15/GB served
- Typical monthly cost: $5-20 for small apps

## Rollback

To rollback to a previous version:
1. Go to Amplify Console
2. Find the previous build
3. Click "Redeploy this version"

## Support

- AWS Amplify Documentation: https://docs.aws.amazon.com/amplify/
- AWS Support: https://console.aws.amazon.com/support/

## Next Steps

After deployment:
1. Test all features on production
2. Configure custom domain
3. Set up monitoring and alerts
4. Enable automatic backups
5. Configure CDN rules
6. Set up branch deployments for staging

## Branch Deployments

Deploy multiple branches:
1. In Amplify Console, go to "Branch management"
2. Connect additional branches (e.g., `develop`, `staging`)
3. Each branch gets its own URL
4. Perfect for testing before production

Example URLs:
- Production (main): `https://main.d123.amplifyapp.com`
- Staging (develop): `https://develop.d123.amplifyapp.com`
