# Admin User Setup Guide

This guide explains how to create admin users for the Mallu Cupid application. Admin users can only be created through the backend - there is no UI for admin signup.

## Role-Based Authentication

The application supports two user roles:
- **user** (default): Regular users who use the dating app
- **admin**: Administrators who can manage the platform

## Creating Admin Users

### Method 1: Database Direct Insert (Recommended for Initial Setup)

After a user signs up through the normal flow, you can update their role in the database:

```sql
-- Update an existing user to admin role
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@mallucupid.com';
```

### Method 2: Backend API Endpoint (For Production)

Create a protected admin endpoint in your backend API that only super admins can access:

#### Backend Implementation Example

```typescript
// routes/admin.routes.ts
import { Router } from 'express';
import { pool } from '../db';
import { authMiddleware } from '../middleware/auth';
import { superAdminMiddleware } from '../middleware/superAdmin';

const router = Router();

// Create new admin user
router.post('/admin/users/create-admin', 
  authMiddleware, 
  superAdminMiddleware, 
  async (req, res) => {
    try {
      const { cognitoId, email, name, dateOfBirth, gender } = req.body;
      
      // Verify user exists in Cognito (they must sign up through normal flow first)
      // Then update their role in database
      
      const result = await pool.query(
        `INSERT INTO users (cognito_id, email, name, date_of_birth, gender, role)
         VALUES ($1, $2, $3, $4, $5, 'admin')
         ON CONFLICT (email) 
         DO UPDATE SET role = 'admin'
         RETURNING *`,
        [cognitoId, email, name, dateOfBirth, gender]
      );
      
      res.json({
        success: true,
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating admin:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create admin user' 
      });
    }
  }
);

// Promote existing user to admin
router.put('/admin/users/:userId/promote', 
  authMiddleware, 
  superAdminMiddleware, 
  async (req, res) => {
    try {
      const { userId } = req.params;
      
      const result = await pool.query(
        `UPDATE users 
         SET role = 'admin', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }
      
      res.json({
        success: true,
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Error promoting user:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to promote user' 
      });
    }
  }
);

// Demote admin to regular user
router.put('/admin/users/:userId/demote', 
  authMiddleware, 
  superAdminMiddleware, 
  async (req, res) => {
    try {
      const { userId } = req.params;
      
      const result = await pool.query(
        `UPDATE users 
         SET role = 'user', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }
      
      res.json({
        success: true,
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Error demoting user:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to demote user' 
      });
    }
  }
);

export default router;
```

#### Super Admin Middleware Example

```typescript
// middleware/superAdmin.ts
import { Request, Response, NextFunction } from 'express';
import { pool } from '../db';

export async function superAdminMiddleware(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  try {
    const cognitoId = req.user?.cognitoId; // Set by authMiddleware
    
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
    console.error('Super admin middleware error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}
```

### Method 3: CLI Script (For Development)

Create a Node.js script to promote users to admin:

```javascript
// scripts/promote-admin.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function promoteToAdmin(email) {
  try {
    const result = await pool.query(
      `UPDATE users 
       SET role = 'admin', updated_at = CURRENT_TIMESTAMP
       WHERE email = $1
       RETURNING id, email, name, role`,
      [email]
    );
    
    if (result.rows.length === 0) {
      console.error(`❌ User not found: ${email}`);
      return;
    }
    
    console.log('✅ User promoted to admin:');
    console.log(result.rows[0]);
  } catch (error) {
    console.error('❌ Error promoting user:', error.message);
  } finally {
    await pool.end();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Usage: node promote-admin.js <email>');
  process.exit(1);
}

promoteToAdmin(email);
```

Run the script:
```bash
node scripts/promote-admin.js admin@mallucupid.com
```

## Backend API Endpoint for Role Retrieval

Add this endpoint to your backend to allow the frontend to fetch user roles:

```typescript
// routes/users.routes.ts
import { Router } from 'express';
import { pool } from '../db';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get current user's role
router.get('/users/role', authMiddleware, async (req, res) => {
  try {
    const cognitoId = req.user?.cognitoId;
    
    if (!cognitoId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
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
    console.error('Error fetching user role:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user role',
      role: 'user' // Default to user role on error
    });
  }
});

export default router;
```

## Login Flow

1. User enters email and password in the login page (same UI for both admin and regular users)
2. Frontend authenticates with AWS Cognito
3. After successful Cognito authentication, frontend calls `/users/role` endpoint
4. Backend returns the user's role from the database
5. Frontend stores the role in AuthContext
6. Application routes user to appropriate dashboard based on role

## Admin Dashboard vs User Dashboard

After implementing role-based authentication, you can create different dashboards:

```typescript
// App.tsx or routing logic
import { useAuth } from './context/AuthContext';
import AdminDashboard from './features/admin/AdminDashboard';
import UserDashboard from './features/dashboard/Dashboard';

function AppRoutes() {
  const { isAuthenticated, userRole } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  
  // Route based on role
  if (userRole === 'admin') {
    return <AdminDashboard />;
  }
  
  return <UserDashboard />;
}
```

## Security Considerations

1. **Never expose admin creation in public APIs**: Admin user creation should only be available through:
   - Direct database access
   - Protected backend endpoints with super admin authentication
   - Server-side CLI scripts

2. **Backend Role Validation**: Always validate user roles on the backend for every protected operation:
   ```typescript
   // Every admin operation should check role
   if (user.role !== 'admin') {
     return res.status(403).json({ error: 'Forbidden' });
   }
   ```

3. **JWT Claims**: Consider adding role to JWT claims for better performance:
   ```typescript
   // When generating JWT
   const token = jwt.sign(
     { cognitoId: user.cognito_id, role: user.role },
     JWT_SECRET
   );
   ```

4. **Role Immutability**: Regular users should never be able to change their own role

5. **Audit Logging**: Log all role changes for security auditing:
   ```sql
   CREATE TABLE role_changes (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id),
     old_role VARCHAR(20),
     new_role VARCHAR(20),
     changed_by UUID REFERENCES users(id),
     changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

## Testing

### Test Admin Login
1. Create a test user through normal signup flow
2. Promote the user to admin using one of the methods above
3. Login with the admin credentials
4. Verify that `userRole` in AuthContext is set to 'admin'
5. Verify that admin-specific features are accessible

### Test User Login  
1. Create a normal user through signup
2. Login without promoting to admin
3. Verify that `userRole` is set to 'user'
4. Verify that admin features are not accessible

## Environment Variables

Add these to your backend `.env`:

```env
# Super Admin Email (for initial setup)
SUPER_ADMIN_EMAIL=superadmin@mallucupid.com

# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=mallucupid
DB_USER=postgres
DB_PASSWORD=yourpassword
```

## First Admin Setup

For the very first admin user setup:

1. Deploy your database with the updated schema
2. Create a user through the normal signup process
3. Manually update the database to set their role to 'admin':
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-admin@email.com';
   ```
4. This first admin can then use the admin panel to create additional admins

## Troubleshooting

### Role not being fetched after login
- Verify the `/users/role` endpoint is implemented in the backend
- Check that the user exists in the database with a valid `cognito_id`
- Verify the auth token is being sent correctly in request headers

### User stuck as regular user despite database showing admin
- Clear browser localStorage/sessionStorage
- Log out and log back in
- Check that the backend is returning the correct role from database

### Admin endpoint returns 403 Forbidden
- Verify the user's role in the database is actually 'admin'
- Check that the authentication middleware is working correctly
- Verify the super admin middleware is checking the correct field
