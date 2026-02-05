# Mallu Cupid - Production Dating App 💕

A complete, production-ready mobile-first dating app with AWS Cognito authentication, role-based access control, comprehensive signup flow, and modern dashboard.

## 🎯 Features

### ✅ Complete Authentication System
- **AWS Cognito Integration** - Secure, scalable authentication
- **Role-Based Access Control** - User and Admin roles
- **Email OTP Verification** - 6-digit code verification system
- **Password Reset Flow** - Email → OTP → New Password
- **Session Management** - JWT token-based authentication
- **Mobile-Only Access** - Optimized for mobile devices

### 📱 User Dashboard
- **Feed Tab** - Swipe to discover matches (Like, Pass, Super Like)
- **Connections Tab** - View matches and conversations
- **Profile Tab** - Manage profile, photos, and preferences
- **Room Tab** - Join chat rooms and group conversations
- **Sticky Header** - Sign out and messenger icons
- **Bottom Navigation** - Easy tab switching

### 👥 7-Step Signup Flow
1. **Personal Info** - Name, DOB, Gender (dropdown)
2. **Email & Password** - Validation + strength check
3. **OTP Verification** - 6-digit code, 30s resend
4. **Preferences** - Looking for, type, interests
5. **Photos** - 3-10 images, drag-drop
6. **Verification** - ID + live selfie (optional)
7. **Dashboard** - Onboarding complete

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Update .env with your AWS Cognito credentials
# VITE_AWS_REGION=us-east-1
# VITE_AWS_USER_POOL_ID=your-user-pool-id
# VITE_AWS_CLIENT_ID=your-client-id
# VITE_API_BASE_URL=https://main.d19gr2nqobengq.amplifyapp.com/api

# Start development server
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

### AWS Amplify (Recommended)

1. **Prepare Repository**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Deploy to Amplify**
   - See [AMPLIFY_DEPLOYMENT.md](./AMPLIFY_DEPLOYMENT.md) for detailed steps
   - Use [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) to track progress

3. **Configure Environment Variables in Amplify Console**
   ```
   VITE_AWS_REGION=us-east-1
   VITE_AWS_USER_POOL_ID=<your-pool-id>
   VITE_AWS_CLIENT_ID=<your-client-id>
   VITE_API_BASE_URL=<your-api-url>
   ```

**Quick Deploy:** The app includes `amplify.yml` for automatic AWS Amplify deployment.

## 📚 Documentation

### Deployment & Setup
- **[AMPLIFY_DEPLOYMENT.md](./AMPLIFY_DEPLOYMENT.md)** - AWS Amplify deployment guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre/post-deployment checklist
- **[PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md)** - Complete setup guide

### Backend & Database
- **[AWS_BACKEND_DEPLOYMENT.md](./AWS_BACKEND_DEPLOYMENT.md)** - Deploy backend to AWS (Elastic Beanstalk, App Runner, Lambda)
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Complete Supabase database setup guide
- **[BACKEND_GUIDE.md](./BACKEND_GUIDE.md)** - API implementation with role-based endpoints
- **[database-schema.sql](./database-schema.sql)** - PostgreSQL schema (14 tables)

### Role-Based Authentication
- **[ROLE_BASED_AUTH.md](./ROLE_BASED_AUTH.md)** - Architecture and implementation
- **[ADMIN_SETUP_GUIDE.md](./ADMIN_SETUP_GUIDE.md)** - How to create admin users

## 📦 Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Authentication:** AWS Cognito (JWT tokens)
- **Database:** Supabase (Managed PostgreSQL)
- **Backend:** Node.js + Express + TypeScript
- **API Client:** Axios
- **File Upload:** React Dropzone, Multer-S3
- **Styling:** CSS with modern gradients
- **Deployment:** AWS Amplify (Frontend), AWS/Railway (Backend)

## 🏗️ Project Structure

```
src/
├── components/        # Shared components (MobileGuard)
├── config/           # Configuration (AWS Cognito)
├── context/          # React Context (Auth with roles)
├── features/
│   ├── auth/        # Login, Signup, Password Reset
│   ├── dashboard/   # User Dashboard (Feed, Connections, Profile, Room)
│   └── admin/       # Admin Dashboard
├── services/        # API and Auth services
└── styles/          # CSS files
```

## 🔐 Security Features

- ✅ AWS Cognito for authentication
- ✅ Role-based access control (user/admin)
- ✅ JWT token validation
- ✅ HTTPS only (enforced by Amplify)
- ✅ Environment variables for secrets
- ✅ No mock data in production
- ✅ CORS configured backend

## 🎨 Key Features

### Authentication
- Single login page for all users (role determined by backend)
- No UI role selection
- Admin users created only through backend
- Automatic role-based dashboard routing

### Dashboard
- Modern card-based UI
- Swipe gestures for matching
- Real-time connections
- Empty states for no data
- Loading states during API calls

### Admin Panel
- User management
- Verification approval
- Reports handling
- Platform settings

## 📱 Browser Support

- ✅ Modern mobile browsers (Chrome, Safari, Firefox)
- ✅ Progressive Web App ready
- ✅ Touch-optimized interface
- ✅ Responsive design

## 🚀 Environment Variables

### Frontend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_AWS_REGION` | AWS region for Cognito | Yes |
| `VITE_AWS_USER_POOL_ID` | Cognito User Pool ID | Yes |
| `VITE_AWS_CLIENT_ID` | Cognito App Client ID | Yes |
| `VITE_API_BASE_URL` | Backend API URL | Yes |

### Backend (backend/.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `COGNITO_USER_POOL_ID` | For JWT verification | Yes |
| `AWS_S3_BUCKET` | For media uploads | Yes |

**See `.env.example` and `SUPABASE_SETUP.md` for complete configuration.**

## 🐛 Troubleshooting

### Authentication Issues
- Check Cognito User Pool ID and Client ID
- Verify environment variables are set correctly
- Ensure Cognito app client settings allow username/password auth

### API Connection Issues
- Verify API_BASE_URL is correct
- Check CORS configuration on backend
- Ensure backend is deployed and accessible

### Build Errors
- Run `npm run build` locally first
- Check TypeScript compilation errors
- Verify all dependencies are in package.json

## 📄 License

Private - All rights reserved

---

**Built with ❤️ for creating meaningful connections**
