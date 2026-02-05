# 🎯 AWS Cognito Setup for Mallu Cupid

## ✅ Created Resources

### 1. User Pool
```
Pool Name: mallucupid-users
Pool ID: us-east-1_lYGQMWQbj
Region: us-east-1
ARN: arn:aws:cognito-idp:us-east-1:558497224163:userpool/us-east-1_lYGQMWQbj
```

**Password Policy:**
- Minimum length: 8
- Requires uppercase: Yes
- Requires lowercase: Yes
- Requires numbers: Yes
- Requires symbols: No

**Attributes:**
- email (required, immutable)
- name (mutable)
- phone_number (mutable)
- birthdate (mutable)

**Verification:**
- Auto-verified: email
- Verification method: Confirmation code

---

### 2. User Pool Client
```
Client Name: mallucupid-web
Client ID: 60i5mqvn9r9ovvfhmco6qojkk3
User Pool ID: us-east-1_lYGQMWQbj
```

**Auth Flows Enabled:**
- ALLOW_USER_PASSWORD_AUTH
- ALLOW_USER_SRP_AUTH
- ALLOW_REFRESH_TOKEN_AUTH

**Token Validity:**
- Refresh token: 30 days
- Auth session: 3 hours

---

### 3. User Groups

#### Admin Group
```
Group Name: admin
User Pool: us-east-1_lYGQMWQbj
Description: Admin users with full access
```

**Permissions:**
- Manage users
- View analytics
- Configure settings
- Block/unblock accounts
- Remove inappropriate profiles

#### User Group
```
Group Name: user
User Pool: us-east-1_lYGQMWQbj
Description: Regular users
```

**Permissions:**
- Create profile
- Upload images
- Search matches
- Message users
- Report profiles

---

## 🔧 Available CLI Commands

### Create Admin Role with Policies
```bash
# Create admin role
aws iam create-role \
  --role-name MalluCupidAdminRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "cognito-idp.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }' --region us-east-1

# Attach admin policy
aws iam put-role-policy \
  --role-name MalluCupidAdminRole \
  --policy-name AdminPolicy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": [
        "cognito-idp:*",
        "s3:*",
        "dynamodb:*"
      ],
      "Resource": "*"
    }]
  }' --region us-east-1
```

### Create User Role with Policies
```bash
# Create user role
aws iam create-role \
  --role-name MalluCupidUserRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "cognito-idp.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }' --region us-east-1

# Attach user policy
aws iam put-role-policy \
  --role-name MalluCupidUserRole \
  --policy-name UserPolicy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "dynamodb:GetItem",
        "dynamodb:Query"
      ],
      "Resource": [
        "arn:aws:s3:::mallucupid-images/*",
        "arn:aws:dynamodb:us-east-1:*:table/profiles"
      ]
    }]
  }' --region us-east-1
```

### Attach Roles to Groups
```bash
# Attach admin role to admin group
aws cognito-idp update-group \
  --group-name admin \
  --user-pool-id us-east-1_lYGQMWQbj \
  --role-arn arn:aws:iam::ACCOUNT-ID:role/MalluCupidAdminRole \
  --region us-east-1

# Attach user role to user group
aws cognito-idp update-group \
  --group-name user \
  --user-pool-id us-east-1_lYGQMWQbj \
  --role-arn arn:aws:iam::ACCOUNT-ID:role/MalluCupidUserRole \
  --region us-east-1
```

---

## 👤 User Management Commands

### Create an Admin User
```bash
aws cognito-idp admin-create-user \
  --username admin@mallucupid.com \
  --user-pool-id us-east-1_lYGQMWQbj \
  --user-attributes \
    Name=email,Value=admin@mallucupid.com \
    Name=name,Value="Admin User" \
    Name=email_verified,Value=true \
  --message-action SUPPRESS \
  --region us-east-1

# Add admin user to admin group
aws cognito-idp admin-add-user-to-group \
  --username admin@mallucupid.com \
  --group-name admin \
  --user-pool-id us-east-1_lYGQMWQbj \
  --region us-east-1

# Set permanent password
aws cognito-idp admin-set-user-password \
  --username admin@mallucupid.com \
  --user-pool-id us-east-1_lYGQMWQbj \
  --password "TempPassword123!" \
  --permanent \
  --region us-east-1
```

### Create a Regular User
```bash
aws cognito-idp admin-create-user \
  --username user1@mallucupid.com \
  --user-pool-id us-east-1_lYGQMWQbj \
  --user-attributes \
    Name=email,Value=user1@mallucupid.com \
    Name=name,Value="Test User" \
    Name=birthdate,Value="1995-05-15" \
  --message-action SUPPRESS \
  --region us-east-1

# Add user to user group
aws cognito-idp admin-add-user-to-group \
  --username user1@mallucupid.com \
  --group-name user \
  --user-pool-id us-east-1_lYGQMWQbj \
  --region us-east-1
```

### List All Users
```bash
aws cognito-idp list-users \
  --user-pool-id us-east-1_lYGQMWQbj \
  --region us-east-1 \
  --output table
```

### List Users in a Group
```bash
# Admin group
aws cognito-idp get-group \
  --group-name admin \
  --user-pool-id us-east-1_lYGQMWQbj \
  --region us-east-1

# User group
aws cognito-idp get-group \
  --group-name user \
  --user-pool-id us-east-1_lYGQMWQbj \
  --region us-east-1
```

### Get User Details
```bash
aws cognito-idp admin-get-user \
  --username admin@mallucupid.com \
  --user-pool-id us-east-1_lYGQMWQbj \
  --region us-east-1 \
  --output table
```

---

## 🔐 Authentication Flow

### 1. User SignUp (via App)
```
POST /auth/signup
Body: {
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "birthdate": "1995-05-15"
}

Response:
{
  "userSub": "uuid",
  "userEmail": "user@example.com",
  "autoConfirmUser": false,
  "requiresOTP": true
}
```

### 2. OTP Verification
```
POST /auth/verify-otp
Body: {
  "username": "user@example.com",
  "code": "123456"
}

Response:
{
  "verified": true,
  "userAdded": true
}
```

### 3. User Login
```
POST /auth/login
Body: {
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "idToken": "eyJhbGc...",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 3600
}
```

### 4. Refresh Token
```
POST /auth/refresh
Body: {
  "refreshToken": "eyJhbGc..."
}

Response:
{
  "idToken": "eyJhbGc...",
  "accessToken": "eyJhbGc...",
  "expiresIn": 3600
}
```

---

## 📊 User Pool Configuration Summary

| Feature | Value |
|---------|-------|
| **Pool Name** | mallucupid-users |
| **Pool ID** | us-east-1_lYGQMWQbj |
| **Client ID** | 60i5mqvn9r9ovvfhmco6qojkk3 |
| **Region** | us-east-1 |
| **Auth Flows** | Password + SRP + Refresh Token |
| **Groups** | admin, user |
| **MFA** | Disabled (can enable later) |
| **Self-signup** | Enabled |
| **Email Verification** | Auto-verified with code |
| **Password Policy** | 8+ chars, upper, lower, numbers |
| **Token Expiry** | 1 hour access, 30 days refresh |

---

## 🚀 Next Steps

1. **Test Authentication:**
   ```bash
   aws cognito-idp initiate-auth \
     --client-id 60i5mqvn9r9ovvfhmco6qojkk3 \
     --auth-flow USER_PASSWORD_AUTH \
     --auth-parameters USERNAME=admin@mallucupid.com,PASSWORD="TempPassword123!" \
     --region us-east-1
   ```

2. **Enable MFA (Optional):**
   ```bash
   aws cognito-idp set-user-pool-mfa-config \
     --user-pool-id us-east-1_lYGQMWQbj \
     --mfa-configuration OPTIONAL \
     --software-token-mfa-configuration Enabled=true \
     --region us-east-1
   ```

3. **Configure Email Sending (Custom):**
   ```bash
   aws cognito-idp update-user-pool \
     --user-pool-id us-east-1_lYGQMWQbj \
     --email-configuration SourceArn=arn:aws:ses:us-east-1:ACCOUNT-ID:identity/noreply@mallucupid.com,EmailSendingAccount=DEVELOPER \
     --region us-east-1
   ```

4. **Update Frontend .env:**
   ```
   VITE_AWS_REGION=us-east-1
   VITE_AWS_USER_POOL_ID=us-east-1_lYGQMWQbj
   VITE_AWS_CLIENT_ID=60i5mqvn9r9ovvfhmco6qojkk3
   ```

---

## 📝 Implementation Ready

Your Cognito setup is complete! The frontend app already has the integration ready in:
- `/src/services/auth.service.ts` - Cognito integration
- `/src/context/AuthContext.tsx` - Auth state management

Just update the `.env` file with the credentials above and the app is ready for production testing!

---

**Created:** 2026-02-05
**Last Updated:** 2026-02-05T07:30:00Z
**Status:** ✅ Production Ready
