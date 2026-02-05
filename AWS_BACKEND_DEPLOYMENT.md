# AWS Backend Deployment Guide
## Deploy Node.js Backend on AWS (3 Options)

Since you're already using **AWS Amplify** (frontend) and **AWS Cognito** (auth), deploying backend on AWS keeps everything in one ecosystem.

---

## Option 1: AWS Elastic Beanstalk (Recommended - Easiest)

**Best for:** Easy deployment, auto-scaling, minimal configuration

### Step 1: Install AWS CLI and EB CLI

```bash
# AWS CLI (if not installed)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# EB CLI
pip install awsebcli --upgrade
```

### Step 2: Initialize Elastic Beanstalk

```bash
cd /workspaces/Fanszone/backend

# Initialize EB
eb init

# Choose:
# - Region: us-east-1 (same as Cognito)
# - Application name: mallucupid-backend
# - Platform: Node.js
# - SSH: Yes (for debugging)
```

### Step 3: Create Environment

```bash
# Create production environment
eb create mallucupid-prod

# This creates:
# - EC2 instances
# - Load balancer
# - Auto-scaling group
# - Security groups
```

### Step 4: Set Environment Variables

```bash
# Set all required env vars
eb setenv \
  NODE_ENV=production \
  PORT=3000 \
  SUPABASE_URL=https://your-project.supabase.co \
  SUPABASE_SERVICE_KEY=your-service-key \
  DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres \
  COGNITO_USER_POOL_ID=us-east-1_lYGQMWQbj \
  COGNITO_REGION=us-east-1 \
  AWS_S3_BUCKET=mallucupid-images \
  CORS_ORIGIN=https://main.d19gr2nqobengq.amplifyapp.com,https://www.mallucupid.com,https://mallucupid.com
```

### Step 5: Deploy

```bash
# Deploy current code
eb deploy

# Get backend URL
eb status
# Output: CNAME: mallucupid-prod.us-east-1.elasticbeanstalk.com
```

**Your Backend URL:** `https://mallucupid-prod.us-east-1.elasticbeanstalk.com`

### Step 6: Configure Custom Domain (api.mallucupid.com)

**In AWS Route 53:**
1. Go to Route 53 → Hosted zones → mallucupid.com
2. Create Record:
   - **Name:** `api`
   - **Type:** `CNAME` or `A (Alias)`
   - **Value:** `mallucupid-prod.us-east-1.elasticbeanstalk.com`
   - **TTL:** 300

**Or via CLI:**
```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.mallucupid.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "mallucupid-prod.us-east-1.elasticbeanstalk.com"}]
      }
    }]
  }'
```

### Elastic Beanstalk Commands

```bash
eb deploy              # Deploy latest code
eb status              # Check environment status
eb logs                # View logs
eb open                # Open app in browser
eb health              # Check instance health
eb config              # Edit configuration
eb terminate           # Delete environment
```

### Cost Estimate
- **t3.micro** (1 instance): ~$8/month
- **t3.small** (1 instance): ~$16/month
- **Load balancer**: ~$16/month
- **Total**: ~$24-32/month (with auto-scaling can be optimized)

---

## Option 2: AWS App Runner (Container-Based)

**Best for:** Automatic scaling, fully managed, containers

### Step 1: Create Dockerfile

```bash
cd /workspaces/Fanszone/backend
```

Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Create `backend/.dockerignore`:
```
node_modules
npm-debug.log
.env
.git
```

### Step 2: Push to ECR (Elastic Container Registry)

```bash
# Create ECR repository
aws ecr create-repository \
  --repository-name mallucupid-backend \
  --region us-east-1

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t mallucupid-backend .
docker tag mallucupid-backend:latest \
  YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/mallucupid-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/mallucupid-backend:latest
```

### Step 3: Create App Runner Service

**Via AWS Console:**
1. Go to AWS App Runner → Create service
2. Source: Container registry → Amazon ECR
3. Container image URI: Select your image
4. Port: 3000
5. Add environment variables (same as above)
6. Create & deploy

**Via CLI:**
```bash
aws apprunner create-service \
  --service-name mallucupid-backend \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/mallucupid-backend:latest",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {
        "Port": "3000",
        "RuntimeEnvironmentVariables": {
          "NODE_ENV": "production",
          "SUPABASE_URL": "https://your-project.supabase.co"
        }
      }
    }
  }'
```

**Your Backend URL:** `https://random-id.us-east-1.awsapprunner.com`

### Cost Estimate
- **Pay per use**: $0.007/vCPU-hour + $0.0008/GB-hour
- **Typical**: ~$15-40/month depending on traffic

---

## Option 3: AWS Lambda + API Gateway (Serverless)

**Best for:** Ultra-low cost, auto-scaling to zero, pay per request

### Step 1: Install Serverless Framework

```bash
npm install -g serverless
cd /workspaces/Fanszone/backend
serverless create --template aws-nodejs-typescript --path .
```

### Step 2: Configure serverless.yml

Create `backend/serverless.yml`:
```yaml
service: mallucupid-backend

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    NODE_ENV: production
    SUPABASE_URL: ${env:SUPABASE_URL}
    SUPABASE_SERVICE_KEY: ${env:SUPABASE_SERVICE_KEY}
    DATABASE_URL: ${env:DATABASE_URL}
    COGNITO_USER_POOL_ID: us-east-1_lYGQMWQbj
    COGNITO_REGION: us-east-1

functions:
  api:
    handler: dist/lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors:
            origin: 'https://www.mallucupid.com'
            headers:
              - Content-Type
              - Authorization

plugins:
  - serverless-offline
```

### Step 3: Create Lambda Handler

Create `backend/src/lambda.ts`:
```typescript
import serverless from 'serverless-http';
import app from './index'; // Your Express app

export const handler = serverless(app);
```

### Step 4: Deploy

```bash
# Deploy to AWS
serverless deploy

# Output will show:
# endpoints:
#   ANY - https://abc123.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
```

### Cost Estimate
- **Free tier**: 1M requests/month + 400,000 GB-seconds compute
- **After**: $0.20 per 1M requests + $0.0000166667 per GB-second
- **Typical**: $0-10/month for small apps

---

## Comparison: Which AWS Option?

| Feature | Elastic Beanstalk | App Runner | Lambda + API Gateway |
|---------|------------------|------------|---------------------|
| **Ease of Setup** | ⭐⭐⭐⭐⭐ Easiest | ⭐⭐⭐⭐ Easy | ⭐⭐⭐ Moderate |
| **Cost (Low Traffic)** | ~$24/month | ~$15/month | ~$0-5/month |
| **Cost (High Traffic)** | ~$50-100/month | ~$40-80/month | ~$10-30/month |
| **Auto-scaling** | Yes | Yes | Instant |
| **Cold Starts** | No | No | Yes (1-2s) |
| **WebSocket Support** | Yes | Yes | Limited |
| **Container Support** | Yes | Yes | No |
| **Best For** | Traditional apps | Modern apps | Microservices |

**Recommendation:** Start with **Elastic Beanstalk** for simplicity, move to **Lambda** later if costs need optimization.

---

## Quick Setup: Elastic Beanstalk (Step-by-Step)

```bash
# 1. Navigate to backend folder
cd /workspaces/Fanszone/backend

# 2. Install EB CLI
pip install awsebcli --upgrade

# 3. Initialize EB (interactive)
eb init -p node.js-18 mallucupid-backend --region us-east-1

# 4. Create environment (takes 5-10 minutes)
eb create mallucupid-prod --single --instance-type t3.small

# 5. Set environment variables (all at once)
eb setenv \
  NODE_ENV=production \
  SUPABASE_URL=https://your-project.supabase.co \
  SUPABASE_SERVICE_KEY=your-key \
  DATABASE_URL=postgresql://postgres:pwd@db.your-project.supabase.co:5432/postgres \
  COGNITO_USER_POOL_ID=us-east-1_lYGQMWQbj \
  COGNITO_REGION=us-east-1 \
  AWS_S3_BUCKET=mallucupid-images \
  CORS_ORIGIN=https://main.d19gr2nqobengq.amplifyapp.com,https://www.mallucupid.com

# 6. Deploy
eb deploy

# 7. Get URL
eb status | grep CNAME
# Output: CNAME: mallucupid-prod.us-east-1.elasticbeanstalk.com

# 8. Open in browser (test health check)
eb open

# 9. View logs if needed
eb logs
```

---

## Update Frontend to Use AWS Backend

```bash
cd /workspaces/Fanszone

# Update .env
echo "VITE_API_BASE_URL=https://mallucupid-prod.us-east-1.elasticbeanstalk.com" > .env

# Or with custom domain:
echo "VITE_API_BASE_URL=https://api.mallucupid.com" > .env

# Commit and deploy
git add .env
git commit -m "Connect to AWS backend"
git push
```

Amplify auto-deploys on push ✅

---

## Backend Project Structure

Create this structure in `backend/`:

```
backend/
├── src/
│   ├── index.ts              # Express app entry
│   ├── config/
│   │   └── database.ts       # Supabase connection
│   ├── middleware/
│   │   └── auth.ts           # Cognito JWT verification
│   ├── routes/
│   │   ├── users.ts          # User/profile endpoints
│   │   ├── connections.ts    # Connection endpoints
│   │   ├── posts.ts          # Post endpoints
│   │   ├── messages.ts       # Messenger endpoints
│   │   └── admin.ts          # Admin endpoints
│   └── controllers/
│       ├── users.controller.ts
│       ├── connections.controller.ts
│       └── ...
├── dist/                     # Compiled JS (gitignored)
├── node_modules/            # Dependencies (gitignored)
├── package.json
├── tsconfig.json
└── .ebextensions/           # EB configuration (optional)
    └── nodecommand.config
```

---

## Monitoring & Logs

### CloudWatch Logs (Automatic)
```bash
# View logs via EB CLI
eb logs

# Or via AWS Console:
# CloudWatch → Log groups → /aws/elasticbeanstalk/mallucupid-prod
```

### Health Checks
```bash
# Check environment health
eb health

# Configure health check endpoint
# In .ebextensions/healthcheck.config:
```
```yaml
option_settings:
  aws:elasticbeanstalk:application:
    Application Healthcheck URL: /api/health
```

### Alarms
Set up CloudWatch alarms for:
- High CPU usage
- High error rate
- Low memory
- Request latency

---

## Scaling Configuration

### Auto-scaling (Elastic Beanstalk)

Edit `.ebextensions/autoscaling.config`:
```yaml
option_settings:
  aws:autoscaling:asg:
    MinSize: 1
    MaxSize: 4
  aws:autoscaling:trigger:
    MeasureName: CPUUtilization
    Statistic: Average
    Unit: Percent
    UpperThreshold: 70
    LowerThreshold: 20
```

### Horizontal Scaling
```bash
# Scale up
eb scale 3

# Scale down
eb scale 1
```

---

## SSL/HTTPS Setup

### Option 1: Let EB Handle It
```bash
# EB provides HTTPS by default
# URL: https://mallucupid-prod.us-east-1.elasticbeanstalk.com
```

### Option 2: Custom Domain with ACM Certificate
```bash
# Request certificate
aws acm request-certificate \
  --domain-name api.mallucupid.com \
  --validation-method DNS \
  --region us-east-1

# Add to EB load balancer in console
# EB Console → Configuration → Load Balancer → Add Listener (443)
```

---

## Rollback & Updates

```bash
# Deploy new version
eb deploy

# Rollback to previous version
eb swap mallucupid-prod --destination-name mallucupid-prod-old

# Blue-green deployment
eb clone mallucupid-prod --clone-name mallucupid-staging
eb deploy mallucupid-staging
eb swap mallucupid-prod --destination-name mallucupid-staging
```

---

## Cleanup & Cost Optimization

```bash
# Terminate environment (stops billing)
eb terminate mallucupid-prod

# Delete application
aws elasticbeanstalk delete-application --application-name mallucupid-backend
```

### Cost Saving Tips
1. Use **t3.micro** for development (~$8/month)
2. Use **t3.small** for production (~$16/month)
3. Use **single instance** if no high availability needed (no load balancer = save $16/month)
4. Enable **auto-scaling** to scale down during low traffic
5. Consider **Lambda** for very low traffic apps ($0-5/month)

---

## Next Steps

1. ✅ **Supabase tables created** (you're done!)
2. 🔨 **Implement backend API** (see BACKEND_GUIDE.md)
3. 🚀 **Deploy to Elastic Beanstalk** (use commands above)
4. 🔗 **Update frontend** with backend URL
5. 🧪 **Test all 35 endpoints**
6. 🌐 **Set up custom domain** (api.mallucupid.com)
7. 📊 **Monitor with CloudWatch**
8. 🎉 **Launch!**

---

## Full AWS Stack Architecture

```
Users
  ↓
AWS Route 53 (DNS: mallucupid.com)
  ↓
AWS Amplify (Frontend: www.mallucupid.com)
  ↓
AWS Elastic Beanstalk (Backend: api.mallucupid.com)
  ↓
AWS Cognito (Auth: JWT tokens)
  ↓
Supabase (Database: PostgreSQL)
AWS S3 (Media: images/videos)
```

**All AWS except database** = Unified billing, monitoring, and support!
