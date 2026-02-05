# 🎯 Mallu Cupid - Cognito Quick Reference

## 📋 Created Resources

| Resource | Value |
|----------|-------|
| **User Pool ID** | `us-east-1_lYGQMWQbj` |
| **Client ID** | `60i5mqvn9r9ovvfhmco6qojkk3` |
| **Region** | `us-east-1` |
| **Groups** | `admin`, `user` |

---

## 🔐 Test Accounts

### Admin Account
```
Email:    admin@mallucupid.com
Password: AdminPass123!
Group:    admin
```

### Regular User Account
```
Email:    user@mallucupid.com
Password: UserPass123!
Group:    user
```

---

## 💾 Add to `.env`

```env
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=us-east-1_lYGQMWQbj
VITE_AWS_CLIENT_ID=60i5mqvn9r9ovvfhmco6qojkk3
```

---

## ✅ What's Configured

- ✅ User Pool with email verification
- ✅ Client for web/mobile apps
- ✅ Admin and user groups
- ✅ Strong password policy
- ✅ Test accounts ready
- ✅ 1-hour access tokens
- ✅ 30-day refresh tokens
- ✅ Token revocation enabled

---

## 🚀 Verify Setup

### Test Login (CLI)
```bash
aws cognito-idp initiate-auth \
  --client-id 60i5mqvn9r9ovvfhmco6qojkk3 \
  --auth-flow USER_PASSWORD_AUTH \
  --auth-parameters \
    USERNAME=admin@mallucupid.com,PASSWORD="AdminPass123!" \
  --region us-east-1
```

### Test in App
1. `npm run dev`
2. Open https://main.d19gr2nqobengq.amplifyapp.com
3. Click "Get Started"
4. Login with test account above
5. ✅ Should work!

---

## 🔄 User JWT Contains

```json
{
  "sub": "user-id",
  "email": "admin@mallucupid.com",
  "cognito:groups": ["admin"],
  "exp": 1707225000,
  "iat": 1707221400
}
```

Frontend can check: `user.group.includes('admin')`

---

## 📱 App Flow

```
Sign Up → Email OTP → Preferences → Images → Verification → Dashboard
  ↓
  ← (or Login) →
  Email + Password → Cognito → Token + Groups → Dashboard
```

---

## 🔑 Credentials Location

- ✅ **Frontend**: `/src/config/index.ts` (reads from .env)
- ✅ **Auth Service**: `/src/services/auth.service.ts` (uses CognitoIdentityServiceProvider)
- ✅ **Context**: `/src/context/AuthContext.tsx` (manages auth state)
- ✅ **Storage**: localStorage + memory (for tokens)

---

## 📞 If You Need to...

### Create Another User
```bash
aws cognito-idp admin-create-user \
  --username newuser@mallucupid.com \
  --user-pool-id us-east-1_lYGQMWQbj \
  --user-attributes Name=email,Value=newuser@mallucupid.com \
  --message-action SUPPRESS \
  --region us-east-1

# Set password
aws cognito-idp admin-set-user-password \
  --username newuser@mallucupid.com \
  --user-pool-id us-east-1_lYGQMWQbj \
  --password "Pass123!" \
  --permanent \
  --region us-east-1

# Add to group
aws cognito-idp admin-add-user-to-group \
  --username newuser@mallucupid.com \
  --group-name user \
  --user-pool-id us-east-1_lYGQMWQbj \
  --region us-east-1
```

### List All Users
```bash
aws cognito-idp list-users --user-pool-id us-east-1_lYGQMWQbj
```

### Delete Test Users
```bash
aws cognito-idp admin-delete-user \
  --username admin@mallucupid.com \
  --user-pool-id us-east-1_lYGQMWQbj
```

---

## ✨ You're All Set!

Your app is now connected to AWS Cognito with:
- Email-based authentication
- 2 user groups (admin + regular)
- Test accounts for development
- All frontend code ready

**Start coding!** 🚀

```bash
npm run dev
```
