# Supabase Setup Guide
## Database + Auth Architecture

**Architecture:**
```
Frontend (AWS Amplify) → AWS Cognito (Auth) → Node.js Backend → Supabase (Database)
```

## Why This Stack?

- ✅ **Cognito**: Already configured with user pool, handles authentication
- ✅ **Supabase**: Managed PostgreSQL with real-time features, easier than RDS
- ✅ **Best of Both**: Cognito's robust auth + Supabase's developer-friendly database
- ✅ **Real-time**: Built-in WebSockets for messenger, live notifications
- ✅ **Cost**: Free tier covers development + early production

---

## Step 1: Create Supabase Project (5 minutes)

1. **Go to**: https://supabase.com
2. **Sign up/Login** with GitHub
3. **Create New Project**:
   - Organization: Create new or use existing
   - Name: `mallucupid` or `fanszone`
   - Database Password: Generate strong password (save it!)
   - Region: Choose closest to your users (US East recommended)
   - Pricing Plan: Free (500MB DB, 1GB storage, unlimited API requests)
4. **Wait**: Project initialization takes ~2 minutes

---

## Step 2: Run Database Schema

### Option A: Using Supabase Dashboard (Easiest)

1. **Open**: Supabase Dashboard → SQL Editor
2. **Copy/Paste**: Entire contents of `database-schema.sql`
3. **Click**: "Run" button
4. **Verify**: Check "Table Editor" to see 14 tables created

### Option B: Using psql Command Line

```bash
# Get connection string from Supabase Dashboard → Settings → Database
# Format: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" < database-schema.sql
```

### Verify Tables Created

Should see 14 tables:
- `users`, `user_images`, `user_interests`, `user_preferences`
- `verifications`, `matches`, `messages`, `reports`
- `connections`, `connection_requests`, `blocked_users`
- `posts`, `post_likes`, `post_comments`, `post_purchases`

---

## Step 3: Get Supabase Credentials

**Dashboard → Settings → API**

You'll need:
1. **Project URL**: `https://[project-ref].supabase.co`
2. **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Safe for frontend)
3. **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Secret! Backend only)

**Dashboard → Settings → Database**

You'll need:
4. **Connection String**: `postgresql://postgres:[PASSWORD]@db.[project-ref].supabase.co:5432/postgres`
5. **Direct Connection String** (for Prisma/TypeORM): `postgresql://postgres.[project-ref]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres`

---

## Step 4: Update Environment Variables

**Frontend**: Update `.env` (for Vite)
```env
# AWS Cognito
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=us-east-1_lYGQMWQbj
VITE_AWS_CLIENT_ID=60i5mqvn9r9ovvfhmco6qojkk3

# Backend API (Production)
VITE_API_BASE_URL=https://api.mallucupid.com

# Supabase (Optional - only if using Supabase client-side features like real-time)
# VITE_SUPABASE_URL=https://[project-ref].supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Backend**: Create `backend/.env`
```env
NODE_ENV=production
PORT=3000

# Supabase Database
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[project-ref].supabase.co:5432/postgres

# AWS Cognito (Auth verification)
COGNITO_USER_POOL_ID=us-east-1_lYGQMWQbj
COGNITO_REGION=us-east-1

# AWS S3 (Media uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=mallucupid-images

# JWT Secret
JWT_SECRET=your-super-secret-key-change-this

# CORS (Production domains)
CORS_ORIGIN=https://main.d19gr2nqobengq.amplifyapp.com,https://www.mallucupid.com,https://mallucupid.com
```

---

## Step 5: Backend Setup

### Install Dependencies

```bash
cd backend
npm install

# Core dependencies
npm install express cors dotenv helmet morgan
npm install @supabase/supabase-js pg
npm install jsonwebtoken jwks-rsa
npm install multer multer-s3 aws-sdk
npm install express-validator

# Dev dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/cors @types/jsonwebtoken
npm install -D ts-node nodemon
```

### Database Client Setup

**Create**: `backend/src/config/database.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

// Supabase Client (for real-time features, storage)
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Use service key for backend
);

// PostgreSQL Pool (for direct SQL queries)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Supabase requires SSL
  },
  max: 20, // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to Supabase PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error', err);
  process.exit(-1);
});
```

### Cognito Authentication Middleware

**Create**: `backend/src/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export interface AuthRequest extends Request {
  user?: {
    sub: string; // Cognito user ID
    email: string;
    email_verified: boolean;
    'cognito:username': string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded as any;
    next();
  });
};

// Admin role check
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.sub;
  
  try {
    const result = await pool.query(
      'SELECT role FROM users WHERE cognito_user_id = $1',
      [userId]
    );
    
    if (result.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};
```

---

## Step 6: Example API Implementation

**Create**: `backend/src/routes/users.ts`

```typescript
import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { pool } from '../config/database';

const router = Router();

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.sub;

  try {
    const result = await pool.query(`
      SELECT 
        u.*,
        COALESCE(json_agg(DISTINCT ui.*) FILTER (WHERE ui.id IS NOT NULL), '[]') as images,
        COALESCE(json_agg(DISTINCT up.*) FILTER (WHERE up.id IS NOT NULL), '[]') as interests
      FROM users u
      LEFT JOIN user_images ui ON u.id = ui.user_id
      LEFT JOIN user_interests up ON u.id = up.user_id
      WHERE u.cognito_user_id = $1
      GROUP BY u.id
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.sub;
  const { name, bio, profession, place, gender, dob } = req.body;

  try {
    const result = await pool.query(`
      UPDATE users 
      SET name = $1, bio = $2, profession = $3, place = $4, 
          gender = $5, dob = $6, updated_at = NOW()
      WHERE cognito_user_id = $7
      RETURNING *
    `, [name, bio, profession, place, gender, dob, userId]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
```

---

## Step 7: Using Supabase Real-Time (Bonus)

### Enable Real-Time for Messenger

**Supabase Dashboard → Database → Replication**
- Enable replication for `messages` table

**Backend**: Real-time message listener example

```typescript
import { supabase } from './config/database';

// Subscribe to new messages for a user
export function subscribeToMessages(userId: string, callback: Function) {
  return supabase
    .channel(`messages:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
}
```

**Frontend**: Real-time in React (optional - can use polling instead)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Subscribe to messages
useEffect(() => {
  const channel = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${currentUserId}`
      },
      (payload) => {
        setMessages(prev => [...prev, payload.new]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [currentUserId]);
```

---

## Step 8: Production Deployment

### Supabase Production Settings

1. **Database → Settings → Connection Pooling**: Enable Supavisor for better performance
2. **Authentication → Providers**: Disable unused auth providers (using Cognito)
3. **Storage → Policies**: Configure RLS policies if using Supabase Storage
4. **API → Settings**: Add production domains to CORS allowed origins

### Backend Deployment

**Recommended: AWS (Unified with your Amplify + Cognito)**

See **[AWS_BACKEND_DEPLOYMENT.md](./AWS_BACKEND_DEPLOYMENT.md)** for complete guide with 3 AWS options:
1. **Elastic Beanstalk** (Easiest, traditional)
2. **App Runner** (Container-based)
3. **Lambda + API Gateway** (Serverless, lowest cost)

**Quick AWS Elastic Beanstalk:**
```bash
cd backend
pip install awsebcli --upgrade
eb init -p node.js-18 mallucupid-backend --region us-east-1
eb create mallucupid-prod --single
eb setenv SUPABASE_URL=... SUPABASE_SERVICE_KEY=... DATABASE_URL=... 
eb deploy
```

**Alternative: Railway or Render** (If you prefer non-AWS)

<details>
<summary>Click to expand Railway deployment</summary>

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project in backend folder
cd backend
railway init

# Add environment variables
railway variables set SUPABASE_URL=https://your-project.supabase.co
railway variables set SUPABASE_SERVICE_KEY=your-key
railway variables set DATABASE_URL=postgresql://...
railway variables set COGNITO_USER_POOL_ID=us-east-1_lYGQMWQbj
railway variables set COGNITO_REGION=us-east-1
railway variables set AWS_S3_BUCKET=mallucupid-images
railway variables set CORS_ORIGIN=https://main.d19gr2nqobengq.amplifyapp.com,https://www.mallucupid.com

# Deploy
railway up

# Get your backend URL
railway domain
# Example: https://your-app.up.railway.app
```

**Update frontend `.env`:**
```env
VITE_API_BASE_URL=https://your-app.up.railway.app
```

Or with Railway custom domain:
```bash
railway domain add api.mallucupid.com
# Add CNAME: api.mallucupid.com → your-app.up.railway.app
```
</details>

<details>
<summary>Click to expand Render deployment</summary>

1. Go to https://render.com → New → Web Service
2. Connect your GitHub repository
3. Settings:
   - **Name**: mallucupid-backend
   - **Root Directory**: backend
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add environment variables in dashboard
5. Deploy

**Your backend URL**: `https://mallucupid-backend.onrender.com`

Add custom domain in Render dashboard → Custom Domain → `api.mallucupid.com`
</details>

---

### Frontend Updates

After deploying backend to AWS (or alternative), update frontend:

```bash
cd /workspaces/Fanszone

# Update .env with your backend URL
echo "VITE_API_BASE_URL=https://mallucupid-prod.us-east-1.elasticbeanstalk.com" > .env
# Or: echo "VITE_API_BASE_URL=https://api.mallucupid.com" > .env

# Commit and deploy
git add .env
git commit -m "Connect to production backend"
git push
# Amplify auto-deploys ✅
```

---

## Troubleshooting

### Connection Issues
```bash
# Test database connection
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# If connection timeout, check:
# 1. Database is not paused (free tier pauses after 7 days inactivity)
# 2. Password is correct
# 3. SSL is enabled in connection config
```

### Authentication Errors
- Verify Cognito tokens are being sent in `Authorization: Bearer [token]` header
- Check JWKS URI is correct in auth middleware
- Ensure token hasn't expired (Cognito tokens expire in 1 hour)

### Real-Time Not Working
- Enable replication for tables in Supabase Dashboard
- Check RLS policies don't block subscriptions
- Verify Supabase client is using correct anon key

---

## Cost Estimates

### Supabase Free Tier (Perfect for Development + Early Stage)
- ✅ 500MB Database
- ✅ 1GB File Storage
- ✅ Unlimited API Requests
- ✅ 50K Monthly Active Users
- ✅ Real-time (100 concurrent connections)
- ✅ Social logins
- ⏰ Database pauses after 7 days inactivity (automatic resume on next request)

### Supabase Pro ($25/month - When You Scale)
- 8GB Database
- 100GB File Storage
- Unlimited API Requests
- 100K Monthly Active Users
- Real-time (500 concurrent)
- No database pausing
- Daily backups

### When to Upgrade
- Database > 500MB
- Need > 100 concurrent real-time connections
- Want automatic daily backups
- Need more than 7 days data retention

---

## Next Steps

1. ✅ **Create Supabase project**
2. ✅ **Run database-schema.sql**
3. ✅ **Update .env files**
4. 🛠️ **Implement backend APIs** (follow BACKEND_GUIDE.md)
5. 🔗 **Connect frontend to backend**
6. 🧪 **Test all 35 API endpoints**
7. 🚀 **Deploy backend + update frontend API URL**
8. 🎉 **Launch!**

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Cognito Docs**: https://docs.aws.amazon.com/cognito/

---

## Migration from RDS (If Needed Later)

Supabase is just PostgreSQL, so migrating is simple:

```bash
# Export from Supabase
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" > backup.sql

# Import to RDS
psql "postgresql://[RDS-ENDPOINT]:5432/postgres" < backup.sql
```

No code changes needed - just update DATABASE_URL environment variable.
