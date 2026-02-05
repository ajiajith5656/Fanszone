# Role-Based Authentication Implementation

## Overview

This document describes the role-based authentication system implemented for Mallu Cupid. The system supports two user roles:
- **user**: Regular users (default)
- **admin**: Administrators with elevated privileges

## Key Features

✅ **Single Login Page**: Both admins and users use the same login interface  
✅ **Backend Role Detection**: Roles are stored in the database and fetched after login  
✅ **No UI Role Selection**: Role determination is completely handled on the backend  
✅ **Backend-Only Admin Creation**: Admins can only be created through backend operations  
✅ **Role-Based Dashboard Routing**: Users are automatically routed to the appropriate dashboard

## Architecture

### Frontend Components

1. **AuthContext** (`src/context/AuthContext.tsx`)
   - Stores user role in state
   - Provides `userRole` and `setUserRole` to components

2. **Login Page** (`src/features/auth/LoginPage.tsx`)
   - Single login page for all users
   - After Cognito authentication, fetches role from backend
   - Stores role in AuthContext

3. **Dashboard Routing** (`src/App.tsx`)
   - Checks `userRole` after authentication
   - Routes to `AdminDashboard` for admin users
   - Routes to `Dashboard` for regular users

4. **Admin Dashboard** (`src/features/admin/AdminDashboard.tsx`)
   - Placeholder admin interface
   - Can be extended with admin features

### Backend Components

1. **Database Schema** (`database-schema.sql`)
   - `users` table includes `role` column
   - Default value is 'user'
   - CHECK constraint ensures only 'user' or 'admin' values

2. **API Endpoint**: `GET /api/users/role`
   - Returns the authenticated user's role
   - Called by frontend after login

3. **Admin Endpoints** (`routes/admin.ts`)
   - Protected by authentication + admin middleware
   - Allow admin users to manage other users
   - Endpoints for user management, verification approval, etc.

## Login Flow

```
┌─────────────────┐
│  User Login     │
│   (UI)          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Cognito Auth    │
│  (AWS)          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Fetch Role      │
│ GET /users/role │
└────────┬────────┘
         │
         ▼
      ┌──┴──┐
      │Role?│
      └──┬──┘
    ┌────┴────┐
    ▼         ▼
┌─────┐   ┌──────┐
│Admin│   │User  │
│ DB  │   │ DB   │
└─────┘   └──────┘
```

## Implementation Details

### 1. Database Changes

Added `role` column to `users` table:

```sql
role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin'))
```

### 2. Frontend Changes

#### AuthContext
```typescript
interface AuthContextType {
  // ... existing fields
  userRole: 'user' | 'admin' | null;
  setUserRole: (role: 'user' | 'admin' | null) => void;
}
```

#### LoginPage
```typescript
// After Cognito sign-in
const roleResponse = await apiService.getUserRole();
const userRole = roleResponse.data.role || 'user';
setUserRole(userRole);
```

#### App.tsx Routing
```typescript
{route === "dashboard" && (
  <>
    {userRole === "admin" ? (
      <AdminDashboard onSignOut={() => navigateTo("landing", 0)} />
    ) : (
      <Dashboard onSignOut={() => navigateTo("landing", 0)} />
    )}
  </>
)}
```

### 3. Backend Changes

#### User Role Endpoint
```typescript
// GET /api/users/role
router.get('/role', authenticateToken, getUserRole);

export async function getUserRole(req: Request, res: Response) {
  const cognitoId = req.user.id;
  const result = await pool.query(
    'SELECT role FROM users WHERE cognito_id = $1',
    [cognitoId]
  );
  res.json({ role: result.rows[0]?.role || 'user' });
}
```

#### Admin Middleware
```typescript
// middleware/requireAdmin.ts
export async function requireAdmin(req, res, next) {
  const cognitoId = req.user?.id;
  const result = await pool.query(
    'SELECT role FROM users WHERE cognito_id = $1',
    [cognitoId]
  );
  
  if (result.rows[0]?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  
  next();
}
```

## Creating Admin Users

⚠️ **Important**: Admin users cannot be created through the UI. They must be created through backend operations.

See [ADMIN_SETUP_GUIDE.md](./ADMIN_SETUP_GUIDE.md) for detailed instructions on:
- Creating the first admin user
- Promoting existing users to admin
- Using backend scripts and API endpoints
- Security best practices

### Quick Method (Development)

1. User signs up through normal flow
2. Manually update database:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
   ```
3. User logs out and logs back in
4. User is now routed to Admin Dashboard

## Testing

### Test Admin Login
1. Create a user through signup flow
2. Update their role to 'admin' in database
3. Login with their credentials
4. Verify they see the Admin Dashboard
5. Check browser console for role: `admin`

### Test Regular User Login
1. Create a user through signup flow
2. Don't modify their role (defaults to 'user')
3. Login with their credentials
4. Verify they see the User Dashboard
5. Check browser console for role: `user`

## Security Considerations

### Frontend Security
- ✅ Role stored in AuthContext (client-side state)
- ✅ Role fetched from backend after authentication
- ⚠️ Frontend role check is for UX only
- ⚠️ **Never trust client-side role for authorization**

### Backend Security
- ✅ All admin endpoints protected by `requireAdmin` middleware
- ✅ Middleware validates role from database
- ✅ Role cannot be changed by regular users
- ✅ Admin creation only through backend operations
- ✅ Role changes should be logged for audit

### Best Practices
1. **Always validate role on backend** for protected operations
2. **Never expose admin creation endpoints** to public
3. **Log all role changes** for security auditing
4. **Use environment variables** for super admin email
5. **Implement rate limiting** on login attempts
6. **Add 2FA for admin accounts** (future enhancement)

## API Endpoints

### Public Endpoints
- `POST /api/auth/signup` - User signup (always creates 'user' role)
- `POST /api/auth/login` - Login (handled by Cognito)

### Authenticated Endpoints
- `GET /api/users/role` - Get current user's role
- `GET /api/users/profile` - Get user profile

### Admin-Only Endpoints
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/promote` - Promote user to admin
- `PUT /api/admin/users/:id/demote` - Demote admin to user
- `PUT /api/admin/verifications/:id` - Update verification status
- `GET /api/admin/reports` - View reports

## Future Enhancements

### Short Term
- [ ] Implement actual admin features in AdminDashboard
- [ ] Add role change audit logging
- [ ] Create admin user management UI
- [ ] Add verification approval interface

### Long Term
- [ ] Multiple admin permission levels (super admin, moderator, etc.)
- [ ] Role-based feature flags
- [ ] Admin action history
- [ ] Two-factor authentication for admins
- [ ] Admin activity dashboard

## Troubleshooting

### User stuck as regular user after database update
**Solution**: User must log out and log back in for role to refresh

### Admin endpoints returning 403
**Possible causes**:
1. User role is not 'admin' in database
2. Auth token is invalid or expired
3. requireAdmin middleware not applied to route

**Solution**: Check database, verify token, check route configuration

### Role not being set after login
**Possible causes**:
1. Backend `/users/role` endpoint not implemented
2. User doesn't exist in database
3. Network error fetching role

**Solution**: Check browser network tab, verify backend endpoint, check database

### Admin seeing User Dashboard
**Possible causes**:
1. Role fetch failed but login succeeded
2. Role state not updated in AuthContext
3. Database role not set to 'admin'

**Solution**: Check console logs, verify role in database, check AuthContext state

## Files Modified

### Frontend
- ✅ `src/context/AuthContext.tsx` - Added role state
- ✅ `src/features/auth/LoginPage.tsx` - Added role fetching
- ✅ `src/services/api.service.ts` - Added getUserRole method
- ✅ `src/App.tsx` - Added role-based routing
- ✅ `src/features/admin/AdminDashboard.tsx` - Created (new)

### Backend (to be implemented)
- `routes/users.ts` - Add role endpoint
- `routes/admin.ts` - Admin routes (new)
- `controllers/users.ts` - Add getUserRole
- `controllers/admin.ts` - Admin controllers (new)
- `middleware/requireAdmin.ts` - Admin middleware (new)

### Database
- ✅ `database-schema.sql` - Added role column

### Documentation
- ✅ `ADMIN_SETUP_GUIDE.md` - Admin creation guide (new)
- ✅ `BACKEND_GUIDE.md` - Updated with role endpoints
- ✅ `ROLE_BASED_AUTH.md` - This file (new)

## Support

For questions or issues related to role-based authentication:
1. Check this documentation
2. Review [ADMIN_SETUP_GUIDE.md](./ADMIN_SETUP_GUIDE.md)
3. Check [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) for API implementation
4. Review database schema in `database-schema.sql`
