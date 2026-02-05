# AWS Amplify Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] AWS Cognito User Pool created
- [ ] Cognito App Client created and configured
- [ ] Backend API deployed and accessible
- [ ] CORS configured on backend API
- [ ] Database schema deployed
- [ ] Environment variables documented

### 2. Code Preparation
- [ ] All mock data removed from components
- [ ] API endpoints integrated
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Empty states added for no data scenarios
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] No console errors in development

### 3. Configuration Files
- [ ] `amplify.yml` created
- [ ] `public/_redirects` created for SPA routing
- [ ] `.env.example` updated with all required variables
- [ ] `.env` added to `.gitignore`
- [ ] Build scripts verified in `package.json`

### 4. Testing
- [ ] Login/Signup flow tested
- [ ] Password reset flow tested
- [ ] API calls working with backend
- [ ] Image upload functional
- [ ] Navigation between pages works
- [ ] Mobile responsive design verified
- [ ] Cross-browser compatibility checked

## Deployment Steps

### 1. Prepare Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 2. AWS Amplify Console Setup
- [ ] Login to AWS Amplify Console
- [ ] Create new app
- [ ] Connect GitHub repository
- [ ] Select main branch
- [ ] Review build settings (amplify.yml auto-detected)

### 3. Configure Environment Variables
Add these in Amplify Console → Environment variables:

```
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=<your-user-pool-id>
VITE_AWS_CLIENT_ID=<your-client-id>
VITE_API_BASE_URL=<your-api-url>
```

- [ ] All environment variables added
- [ ] Variable names start with `VITE_`
- [ ] No trailing slashes in URLs

### 4. Deploy
- [ ] Click "Save and deploy"
- [ ] Monitor build logs
- [ ] Wait for deployment to complete
- [ ] Note the Amplify-provided URL

## Post-Deployment Verification

### 1. Basic Functionality
- [ ] App loads without errors
- [ ] Landing page displays correctly
- [ ] Login page accessible
- [ ] Signup flow works end-to-end
- [ ] Password reset functional
- [ ] Dashboard loads after login

### 2. API Integration
- [ ] User signup creates Cognito user
- [ ] Email verification works
- [ ] Login authenticates successfully
- [ ] User role fetched from backend
- [ ] Profile data loads
- [ ] Image upload works

### 3. Navigation
- [ ] All routes accessible
- [ ] Browser back button works
- [ ] Direct URL access works
- [ ] Mobile navigation functional

### 4. Performance
- [ ] Page load time < 3 seconds
- [ ] Images load properly
- [ ] No JavaScript errors in console
- [ ] Mobile performance acceptable

### 5. Security
- [ ] HTTPS enabled (automatic with Amplify)
- [ ] API calls use HTTPS
- [ ] No sensitive data in URLs
- [ ] Environment variables not exposed
- [ ] Authentication required for protected routes

## Backend Verification

### 1. Database
- [ ] Schema deployed
- [ ] Tables created
- [ ] Indexes added
- [ ] Role column exists with default 'user'

### 2. API Endpoints
- [ ] `/users/profile` - GET, POST, PUT
- [ ] `/users/role` - GET
- [ ] `/users/verification` - POST
- [ ] `/matches` - GET
- [ ] `/recommendations` - GET
- [ ] All endpoints require authentication

### 3. CORS Configuration
```javascript
// Verify backend allows:
- https://<your-amplify-domain>.amplifyapp.com
- https://<your-custom-domain> (if applicable)
```

- [ ] Amplify domain added to CORS
- [ ] Custom domain added (if applicable)
- [ ] Credentials enabled in CORS

## Custom Domain Setup (Optional)

- [ ] Domain purchased
- [ ] Added in Amplify Console
- [ ] DNS records configured
- [ ] SSL certificate issued
- [ ] Domain resolves correctly
- [ ] Backend CORS updated for custom domain

## Monitoring Setup

- [ ] AWS Amplify monitoring enabled
- [ ] CloudWatch logs configured
- [ ] Error tracking set up
- [ ] Performance metrics reviewed
- [ ] Alerts configured (optional)

## Continuous Deployment

- [ ] Auto-deploy enabled (or disabled if manual)
- [ ] Branch settings configured
- [ ] Build notifications set up (optional)
- [ ] Slack/email notifications (optional)

## Documentation

- [ ] Deployment guide reviewed
- [ ] Team members have access
- [ ] Environment variables documented
- [ ] Rollback procedure documented
- [ ] Support contacts listed

## Troubleshooting Checklist

If deployment fails:

### Build Phase Issues
- [ ] Check build logs for errors
- [ ] Verify `npm ci` completes successfully
- [ ] Check for TypeScript compilation errors
- [ ] Verify all dependencies installed

### Runtime Issues
- [ ] Check browser console for errors
- [ ] Verify environment variables are set
- [ ] Check API endpoint accessibility
- [ ] Verify CORS configuration
- [ ] Check Cognito configuration

### Authentication Issues
- [ ] Verify Cognito User Pool ID
- [ ] Verify App Client ID
- [ ] Check Cognito App Client settings
- [ ] Verify callback URLs configured
- [ ] Check user pool region matches

## Rollback Plan

If critical issues found:

1. **Immediate Rollback**
   ```bash
   # In Amplify Console:
   # 1. Go to build history
   # 2. Find last working build
   # 3. Click "Redeploy this version"
   ```

2. **Git Rollback**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Disable App**
   - Temporarily disable in Amplify Console
   - Display maintenance page
   - Fix issues locally
   - Redeploy when ready

## Sign-Off

- [ ] Development team approval
- [ ] QA testing completed
- [ ] Security review completed
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Stakeholders notified

**Deployed by:** _______________
**Date:** _______________
**Build ID:** _______________
**Deployment URL:** _______________

## Notes

Add any deployment-specific notes here:

---
