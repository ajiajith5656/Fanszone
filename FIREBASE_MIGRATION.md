# AWS to Firebase Migration Guide

This document outlines the migration from AWS services to Firebase.

## What Changed

### Frontend (React)

#### Authentication
- **Before**: AWS Cognito with `amazon-cognito-identity-js`
- **After**: Firebase Authentication

**File Changes**:
- `src/services/auth.service.ts` - Complete rewrite to use Firebase Auth SDK
- `src/config/index.ts` - Changed from AWS config to Firebase config
- `src/config/firebase.ts` - New file for Firebase initialization
- `package.json` - Replaced `amazon-cognito-identity-js` with `firebase`

**Key Differences**:
- Firebase handles email verification differently (uses email links instead of codes)
- User IDs: Cognito used `sub`, Firebase uses `uid`
- Token structure is different but both use JWT

#### Storage
- **Before**: S3 for file uploads (via backend)
- **After**: Firebase Storage with optional backend admin access

### Backend (Node.js)

#### Authentication Middleware
- `src/middleware/auth.ts` - Updated to verify Firebase ID tokens instead of Cognito JWT
- Removed dependencies: `jsonwebtoken`, `jwks-rsa`
- Now uses `firebase-admin` for token verification

#### File Storage Service
- `src/services/s3.service.ts` - Replaced with Firebase Storage implementation
- Changed from AWS S3 SDK to `firebase-admin` storage
- Path format changed from `userId/filename` to `profile-images/userId/filename`
- URL format changed from S3 public URLs to Firebase signed URLs

#### API Routes
- `src/routes/profile-images.ts` - Updated all routes to use Firebase Storage
- User ID reference changed from `req.user.sub` to `req.user.uid`
- Removed references to S3 keys, now using storage paths

#### Dependencies
- Removed: `@aws-sdk/client-s3`, `jsonwebtoken`, `jwks-rsa`
- Added: `firebase-admin`

## Setup Instructions

### 1. Frontend Setup

#### Install Dependencies
```bash
cd /workspaces/Fanszone
npm install
```

#### Configure Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing
3. Enable Authentication (Email/Password)
4. Enable Storage
5. Get your Firebase config from Project Settings
6. Add to `.env`:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_BASE_URL=http://localhost:3000
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd /workspaces/Fanszone/backend
npm install
```

#### Configure Firebase Admin
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate a new private key
3. Save as `serviceAccountKey.json` (add to `.gitignore`)
4. Add to backend `.env`:
```
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=/path/to/serviceAccountKey.json
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
DATABASE_URL=your-database-url
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

#### Start Backend
```bash
npm run dev
```

### 3. Firebase Storage Rules

Set these rules in Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-images/{userId}/{allPaths=**} {
      // Allow authenticated users to upload to their own folder
      allow create, write: if request.auth.uid == userId;
      // Allow anyone to read
      allow read;
      // Allow deletion only by owner
      allow delete: if request.auth.uid == userId;
    }
    // Block access to everything else
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### 4. Run the Application

#### Terminal 1 - Frontend
```bash
cd /workspaces/Fanszone
npm run dev
```

#### Terminal 2 - Backend
```bash
cd /workspaces/Fanszone/backend
npm run dev
```

## Migration Checklist

- [x] Replace Cognito auth with Firebase auth
- [x] Update auth middleware to use Firebase tokens
- [x] Replace S3 service with Firebase Storage
- [x] Update package.json dependencies
- [x] Update environment variable configs
- [x] Update API routes for storage paths
- [x] Update user ID references (sub → uid)
- [ ] Test authentication flow
- [ ] Test file uploads
- [ ] Test user profile updates
- [ ] Update frontend components if needed
- [ ] Test in production environment

## Breaking Changes

1. **Email Verification** - Firebase uses email links, not codes
2. **User IDs** - Changed from `sub` to `uid`
3. **Tokens** - Token structure is different, but both are valid JWT
4. **Storage URLs** - Now using signed URLs instead of public S3 URLs
5. **Storage Paths** - New format: `profile-images/{userId}/{filename}`

## Troubleshooting

### Firebase Token Verification Error
- Ensure `firebase-admin` is properly initialized
- Check `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` is correct
- Verify the service account key has required permissions

### Storage Upload Failures
- Check Firebase Storage rules
- Ensure user is authenticated
- Verify `FIREBASE_STORAGE_BUCKET` is correct

### CORS Errors
- Update `CORS_ORIGIN` to include your frontend URL
- Check that all API calls include proper headers

## Further Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Rules Documentation](https://firebase.google.com/docs/storage/security)
