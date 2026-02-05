# Mallu Cupid - Production Dating App

A production-ready mobile-first dating app built with React, TypeScript, AWS Cognito, and comprehensive signup/verification flow.

## 🚀 Features

### Authentication & Security
- ✅ AWS Cognito integration for secure authentication
- ✅ Email-based OTP verification (6-digit code)
- ✅ Complete password reset flow
- ✅ Session management with JWT tokens

### Complete Signup Flow (7 Steps)
1. **Personal Info**: Name, Date of Birth, Gender (dropdown)
2. **Email & Password**: With validation and strength requirements
3. **OTP Verification**: 6-digit code with resend functionality
4. **Preferences**: Looking for, Relationship type, Interests
5. **Profile Images**: Upload 3-10 photos (1080×1350px, max 10MB each)
6. **Verification** (Optional): Government ID + Live selfie capture
7. **Dashboard**: Onboarding complete

### Password Reset Flow
1. Enter email → Receive OTP
2. Verify 6-digit code
3. Set new password

## 📦 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Authentication**: AWS Cognito
- **File Uploads**: React Dropzone
- **API Client**: Axios
- **Styling**: CSS Modules with mobile-first approach

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your AWS Cognito credentials

# Start development server
npm run dev
```

## 🔧 AWS Cognito Setup

### Step 1: Create User Pool

1. Go to AWS Console → Amazon Cognito
2. Click "Create user pool"
3. Select **Email** as sign-in option
4. Configure password requirements:
   - Minimum 8 characters
   - Require uppercase, lowercase, numbers

### Step 2: Configure MFA & Verification

- **Email verification**: Required
- **MFA**: Optional (can be enabled later)
- **Verification message**: Use default template

### Step 3: App Client Settings

- Create app client **without** client secret
- Enable authentication flows:
  - ✅ ALLOW_USER_PASSWORD_AUTH
  - ✅ ALLOW_REFRESH_TOKEN_AUTH
  - ✅ ALLOW_USER_SRP_AUTH

### Step 4: Copy Credentials

From your User Pool, copy:
- **User Pool ID**: `us-east-1_XXXXXXXXX`
- **App Client ID**: `xxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Region**: `us-east-1` (or your region)

Update `.env`:
```env
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_AWS_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🗄️ Backend API Endpoints

### User Profile
```
POST   /api/users/profile          - Create user profile
PUT    /api/users/profile          - Update user profile
GET    /api/users/profile          - Get user profile
```

### Image Management
```
POST   /api/users/profile/images   - Upload profile image
DELETE /api/users/profile/images/:id - Delete profile image
```

### Verification
```
POST   /api/users/verification     - Upload verification documents
GET    /api/users/verification/status - Get verification status
```

### Preferences
```
POST   /api/users/preferences      - Update user preferences
```

### Matching
```
GET    /api/matches                - Get user matches
GET    /api/recommendations        - Get recommendations
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cognito_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(50) NOT NULL,
  looking_for VARCHAR(50),
  relationship_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Images Table
```sql
CREATE TABLE user_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  image_index INTEGER NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Interests Table
```sql
CREATE TABLE user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  interest VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Verifications Table
```sql
CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  age_proof_url VARCHAR(500),
  selfie_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending',
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Matches Table
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID REFERENCES users(id) ON DELETE CASCADE,
  user_id_2 UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id_1, user_id_2)
);
```

## 🎨 Component Structure

```
src/
├── components/
│   └── MobileGuard.tsx           - Mobile-only access guard
├── config/
│   └── index.ts                  - Environment configuration
├── context/
│   └── AuthContext.tsx           - Global auth state management
├── features/
│   ├── auth/
│   │   ├── LandingPage.tsx       - Landing page
│   │   ├── LoginPage.tsx         - Login screen
│   │   ├── SignupStepOne.tsx     - Name, DOB, Gender
│   │   ├── SignupEmailStep.tsx   - Email & password
│   │   ├── SignupOtp.tsx         - OTP verification
│   │   ├── LookingForStep.tsx    - Preferences & interests
│   │   ├── ProfileImagesStep.tsx - Image uploads
│   │   ├── VerificationStep.tsx  - ID & selfie verification
│   │   ├── ResetStepOne.tsx      - Forgot password (email)
│   │   ├── ResetOtp.tsx          - Forgot password (OTP)
│   │   └── ResetNewPassword.tsx  - Set new password
│   └── dashboard/
│       └── Dashboard.tsx         - Main app dashboard
├── services/
│   ├── auth.service.ts           - AWS Cognito integration
│   └── api.service.ts            - Backend API client
└── styles/
    ├── auth-flow.css             - Auth screens styling
    ├── image-upload.css          - Image upload component
    ├── verification.css          - Verification screens
    ├── dashboard.css             - Dashboard styling
    └── spinner.css               - Loading spinner
```

## 📱 Image Upload Specifications

- **Minimum**: 3 images required
- **Maximum**: 10 images allowed
- **Size**: Max 10MB per image
- **Dimensions**: Recommended 1080×1350px (portrait)
- **Format**: JPEG, PNG, WebP

## 🔐 Security Features

- Password minimum 8 characters
- Email verification required before access
- JWT token-based authentication
- Secure session management
- Input validation and sanitization
- Protected routes requiring authentication

## 🎯 Mobile-First Design

- Blocks desktop/tablet access (600px+ width)
- Optimized for mobile screens (320px - 600px)
- Touch-friendly UI components
- Responsive layouts for all screen sizes

## 📝 Environment Variables

```env
# AWS Cognito Configuration
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=your-user-pool-id
VITE_AWS_CLIENT_ID=your-client-id

# API Configuration
VITE_API_BASE_URL=https://api.yourdomain.com
```

## 🚦 Development Workflow

1. **Configure AWS Cognito** (see AWS Cognito Setup section)
2. **Set up backend API** (use provided endpoints schema)
3. **Update environment variables**
4. **Run development server**: `npm run dev`
5. **Test on mobile device** or mobile emulator

## 📖 API Integration Guide

### Creating User Profile After Signup

```typescript
// After successful OTP verification
await apiService.createUserProfile({
  name: signupData.name,
  dateOfBirth: signupData.dateOfBirth,
  gender: signupData.gender,
  lookingFor: signupData.lookingFor,
  relationshipType: signupData.relationshipType,
  interests: signupData.interests
});
```

### Uploading Profile Images

```typescript
// Upload each image
for (let i = 0; i < images.length; i++) {
  await apiService.uploadProfileImage(images[i], i);
}
```

### Submitting Verification Documents

```typescript
// Upload age proof
await apiService.uploadVerificationDocument(ageProofFile, 'age_proof');

// Upload selfie
await apiService.uploadVerificationDocument(selfieFile, 'selfie');
```

## 🌐 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy 'dist' folder
```

### Backend (AWS Lambda/EC2)
- Set up API Gateway
- Configure CORS for your domain
- Deploy Lambda functions or EC2 instance
- Connect to RDS/Aurora PostgreSQL

## 📄 License

MIT

## 🤝 Contributing

This is a production-ready template. Customize as needed for your specific requirements.

---

**Built with ❤️ for the dating app community**
