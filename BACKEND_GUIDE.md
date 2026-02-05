# Backend API Template for Mallu Cupid
# Node.js + Express + PostgreSQL

## Quick Start

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run database migrations
npm run migrate

# Start server
npm run dev
```

## Required Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "aws-sdk": "^2.1480.0",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "multer-s3": "^3.0.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "express-validator": "^7.0.1",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.20",
    "@types/node": "^20.9.0",
    "typescript": "^5.2.2",
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1"
  }
}
```

## Environment Variables (.env)

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=mallucupid
DB_USER=postgres
DB_PASSWORD=yourpassword

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=mallucupid-images

# Cognito
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_REGION=us-east-1

# JWT (for additional verification if needed)
JWT_SECRET=your-super-secret-key
```

## API Endpoints Implementation

### 1. User Profile Routes (routes/users.ts)

```typescript
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  createProfile, 
  updateProfile, 
  getProfile,
  getUserRole 
} from '../controllers/users';

const router = Router();

router.post('/profile', authenticateToken, createProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/profile', authenticateToken, getProfile);
router.get('/role', authenticateToken, getUserRole); // Get user role for role-based access

export default router;
```

### 2. Image Upload Routes (routes/images.ts)

```typescript
import { Router } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { authenticateToken } from '../middleware/auth';
import { uploadImage, deleteImage } from '../controllers/images';

const s3 = new S3Client({ region: process.env.AWS_REGION });

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET!,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `profiles/${req.user.id}/${Date.now()}-${file.originalname}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

const router = Router();

router.post('/profile/images', authenticateToken, upload.single('image'), uploadImage);
router.delete('/profile/images/:id', authenticateToken, deleteImage);

export default router;
```

### 3. Authentication Middleware (middleware/auth.ts)

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: 'id',
  clientId: null, // App client ID if needed
});

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const payload = await verifier.verify(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
    };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}
```

### 4. User Controller (controllers/users.ts)

```typescript
import { Request, Response } from 'express';
import pool from '../config/database';

export async function createProfile(req: Request, res: Response) {
  const { name, dateOfBirth, gender, lookingFor, relationshipType } = req.body;
  const cognitoId = req.user.id;
  const email = req.user.email;

  try {
    const result = await pool.query(
      `INSERT INTO users (cognito_id, email, name, date_of_birth, gender, looking_for, relationship_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [cognitoId, email, name, dateOfBirth, gender, lookingFor, relationshipType]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
}

export async function updateProfile(req: Request, res: Response) {
  const cognitoId = req.user.id;
  const updates = req.body;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           bio = COALESCE($2, bio),
           location = COALESCE($3, location)
       WHERE cognito_id = $4
       RETURNING *`,
      [updates.name, updates.bio, updates.location, cognitoId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

export async function getProfile(req: Request, res: Response) {
  const cognitoId = req.user.id;

  try {
    const userResult = await pool.query(
      'SELECT * FROM users WHERE cognito_id = $1',
      [cognitoId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const user = userResult.rows[0];
    
    // Get images
    const imagesResult = await pool.query(
      'SELECT * FROM user_images WHERE user_id = $1 ORDER BY image_index',
      [user.id]
    );

    // Get interests
    const interestsResult = await pool.query(
      'SELECT interest FROM user_interests WHERE user_id = $1',
      [user.id]
    );

    res.json({
      ...user,
      images: imagesResult.rows,
      interests: interestsResult.rows.map(r => r.interest)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
}

export async function getUserRole(req: Request, res: Response) {
  const cognitoId = req.user.id;

  try {
    const result = await pool.query(
      'SELECT role FROM users WHERE cognito_id = $1',
      [cognitoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'User not found',
        role: 'user' // Default to user role
      });
    }

    res.json({
      role: result.rows[0].role || 'user'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Failed to fetch user role',
      role: 'user' // Default to user role on error
    });
  }
}
```

### 4a. Admin Routes (routes/admin.ts)

**Important**: Admin users can only be created through backend operations. See `ADMIN_SETUP_GUIDE.md` for details.

```typescript
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import { 
  promoteToAdmin, 
  demoteToUser,
  listAllUsers,
  updateVerificationStatus
} from '../controllers/admin';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Admin management
router.put('/users/:userId/promote', promoteToAdmin);
router.put('/users/:userId/demote', demoteToUser);

// User management
router.get('/users', listAllUsers);

// Verification management
router.put('/verifications/:verificationId', updateVerificationStatus);

export default router;
```

### 4b. Admin Middleware (middleware/requireAdmin.ts)

```typescript
import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

export async function requireAdmin(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  try {
    const cognitoId = req.user?.id;
    
    if (!cognitoId) {
      return res.status(401).json({ 
        error: 'Unauthorized' 
      });
    }
    
    // Check if user is admin
    const result = await pool.query(
      'SELECT role FROM users WHERE cognito_id = $1',
      [cognitoId]
    );
    
    if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
      return res.status(403).json({ 
        error: 'Forbidden: Admin access required' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}
```

### 4c. Admin Controller (controllers/admin.ts)

```typescript
import { Request, Response } from 'express';
import pool from '../config/database';

export async function promoteToAdmin(req: Request, res: Response) {
  const { userId } = req.params;
  
  try {
    const result = await pool.query(
      `UPDATE users 
       SET role = 'admin', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, email, name, role`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to promote user' });
  }
}

export async function demoteToUser(req: Request, res: Response) {
  const { userId } = req.params;
  
  try {
    const result = await pool.query(
      `UPDATE users 
       SET role = 'user', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, email, name, role`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to demote user' });
  }
}

export async function listAllUsers(req: Request, res: Response) {
  const { page = 1, limit = 50, role } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  
  try {
    let query = 'SELECT id, email, name, role, created_at, last_active FROM users';
    let params: any[] = [];
    
    if (role) {
      query += ' WHERE role = $1';
      params.push(role);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);
    
    const result = await pool.query(query, params);
    
    res.json({
      users: result.rows,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function updateVerificationStatus(req: Request, res: Response) {
  const { verificationId } = req.params;
  const { status, rejectedReason } = req.body;
  
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  try {
    const result = await pool.query(
      `UPDATE verifications 
       SET status = $1, 
           rejected_reason = $2,
           verified_at = CASE WHEN $1 = 'approved' THEN CURRENT_TIMESTAMP ELSE verified_at END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, rejectedReason, verificationId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Verification not found' });
    }
    
    res.json({
      success: true,
      verification: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update verification' });
  }
}
```

### 5. Main Server (index.ts)

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import userRoutes from './routes/users';
import imageRoutes from './routes/images';
import verificationRoutes from './routes/verification';
import matchRoutes from './routes/matches';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/users', imageRoutes);
app.use('/api/users', verificationRoutes);
app.use('/api', matchRoutes);
app.use('/api/admin', adminRoutes); // Admin routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Deployment

### AWS Lambda (Serverless)
- Use AWS SAM or Serverless Framework
- Deploy with API Gateway
- Use RDS for PostgreSQL

### EC2/DigitalOcean
- Use PM2 for process management
- Set up Nginx reverse proxy
- Configure SSL with Let's Encrypt

### Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

## Testing

Use Postman or curl to test endpoints:

```bash
# Create profile
curl -X POST https://main.d19gr2nqobengq.amplifyapp.com/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "dateOfBirth": "1995-05-15",
    "gender": "male",
    "lookingFor": "women",
    "relationshipType": "longterm"
  }'
```

---

For complete implementation, see the full backend repository.
