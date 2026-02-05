# AWS CLI Commands for Deployment

## Quick Start - Run the Setup Script

```bash
# Make the script executable
chmod +x aws-setup.sh

# Run the setup script
./aws-setup.sh
```

This will:
- Install AWS CLI (if not installed)
- Configure your AWS credentials
- Install Amplify CLI
- Test the connection

## Manual Setup

### 1. Install AWS CLI

#### Linux/Ubuntu (Current Environment)
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf aws awscliv2.zip
```

#### macOS
```bash
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
rm AWSCLIV2.pkg
```

#### Verify Installation
```bash
aws --version
# Expected output: aws-cli/2.x.x Python/3.x.x ...
```

### 2. Configure AWS Credentials

```bash
aws configure
```

You'll be prompted for:
```
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-east-1
Default output format [None]: json
```

**Get your credentials from:**
1. Login to AWS Console: https://console.aws.amazon.com
2. Go to IAM → Users → Your User → Security Credentials
3. Create Access Key → Download credentials

### 3. Verify AWS Connection

```bash
# Test AWS connection
aws sts get-caller-identity

# Expected output:
# {
#     "UserId": "AIDACKCEVSQ6C2EXAMPLE",
#     "Account": "123456789012",
#     "Arn": "arn:aws:iam::123456789012:user/your-username"
# }
```

### 4. Install Amplify CLI

```bash
npm install -g @aws-amplify/cli

# Verify installation
amplify --version
```

## Deployment Options

### Option 1: Amplify CLI (Command Line)

#### Initialize Amplify Project
```bash
amplify init
```

**Configuration:**
```
? Enter a name for the project: fanszone
? Initialize the project with the above configuration? No
? Enter a name for the environment: production
? Choose your default editor: Visual Studio Code
? Choose the type of app that you're building: javascript
? What javascript framework are you using: react
? Source Directory Path: src
? Distribution Directory Path: dist
? Build Command: npm run build
? Start Command: npm run dev
? Do you want to use an AWS profile? Yes
? Please choose the profile you want to use: default
```

#### Add Hosting
```bash
amplify add hosting
```

**Select:**
```
? Select the plugin module to execute: Hosting with Amplify Console (Managed hosting with custom domains, Continuous deployment)
? Choose a type: Manual deployment
```

#### Deploy
```bash
# Build and deploy
amplify publish

# Or just deploy (if already built)
amplify hosting publish
```

### Option 2: AWS Amplify Console (Recommended)

This is easier and provides:
- Automatic CI/CD
- Branch deployments
- Build logs
- Custom domains
- SSL certificates

#### Via AWS CLI
```bash
# Create app
aws amplify create-app \
  --name "Mallu Cupid" \
  --repository "https://github.com/ajiajith5656/Fanszone" \
  --oauth-token "YOUR_GITHUB_TOKEN" \
  --region us-east-1

# Create branch
aws amplify create-branch \
  --app-id "YOUR_APP_ID" \
  --branch-name "main" \
  --enable-auto-build

# Start deployment
aws amplify start-job \
  --app-id "YOUR_APP_ID" \
  --branch-name "main" \
  --job-type RELEASE
```

#### Via Console (Easier)
```bash
# Open Amplify Console
open https://console.aws.amazon.com/amplify/
```

Then:
1. Click "New app" → "Host web app"
2. Connect GitHub repository
3. Configure build settings (amplify.yml auto-detected)
4. Add environment variables
5. Deploy

## Environment Variables

### Set via CLI
```bash
# Set environment variables for Amplify app
aws amplify update-app \
  --app-id YOUR_APP_ID \
  --environment-variables \
    VITE_AWS_REGION=us-east-1 \
    VITE_AWS_USER_POOL_ID=us-east-1_XXXXXXXXX \
    VITE_AWS_CLIENT_ID=your-client-id \
    VITE_API_BASE_URL=https://api.example.com/api
```

### Or use the Console
Much easier to manage through the web console:
https://console.aws.amazon.com/amplify/ → Your App → Environment variables

## Useful AWS CLI Commands

### Check Configuration
```bash
# View current AWS configuration
aws configure list

# View credentials file
cat ~/.aws/credentials

# View config file
cat ~/.aws/config
```

### Amplify Commands
```bash
# List all Amplify apps
aws amplify list-apps

# Get app details
aws amplify get-app --app-id YOUR_APP_ID

# List branches
aws amplify list-branches --app-id YOUR_APP_ID

# View logs
aws amplify list-jobs --app-id YOUR_APP_ID --branch-name main

# Delete app (careful!)
aws amplify delete-app --app-id YOUR_APP_ID
```

### Check Deployment Status
```bash
# Get latest deployment
aws amplify list-jobs \
  --app-id YOUR_APP_ID \
  --branch-name main \
  --max-results 1

# Get job details
aws amplify get-job \
  --app-id YOUR_APP_ID \
  --branch-name main \
  --job-id JOB_ID
```

## Troubleshooting

### AWS CLI Not Found
```bash
# Check if installed
which aws

# If not found, add to PATH
export PATH=$PATH:/usr/local/bin
```

### Permission Denied
```bash
# Make sure your IAM user has these policies:
# - AdministratorAccess-Amplify
# - AWSAmplifyFullAccess
```

### Invalid Credentials
```bash
# Reconfigure
aws configure

# Or edit directly
nano ~/.aws/credentials
nano ~/.aws/config
```

### Connection Test Failed
```bash
# Test with verbose output
aws sts get-caller-identity --debug

# Check network connectivity
ping aws.amazon.com
```

## Quick Reference

### Complete Deployment Flow
```bash
# 1. Setup
./aws-setup.sh

# 2. Build locally
npm run build

# 3. Initialize Amplify (first time only)
amplify init

# 4. Add hosting (first time only)
amplify add hosting

# 5. Deploy
amplify publish

# 6. View deployment
amplify console
```

### Update Existing Deployment
```bash
# Build
npm run build

# Deploy
amplify publish

# Or just push to GitHub (if using Console with CI/CD)
git push origin main
```

## AWS Regions

Common regions:
- `us-east-1` - US East (N. Virginia)
- `us-west-2` - US West (Oregon)
- `eu-west-1` - Europe (Ireland)
- `ap-south-1` - Asia Pacific (Mumbai)
- `ap-southeast-1` - Asia Pacific (Singapore)

Choose the region closest to your users.

## Getting AWS Credentials

### For Personal Account
1. Login to AWS Console: https://console.aws.amazon.com
2. Click your name (top right) → Security Credentials
3. Scroll to "Access keys"
4. Click "Create access key"
5. Download or copy the credentials

### For Organization/Team
Ask your AWS administrator for:
- Access Key ID
- Secret Access Key
- Required IAM permissions

### Required IAM Permissions
Your IAM user needs:
- `AWSAmplifyFullAccess` or
- `AdministratorAccess-Amplify`

## Security Best Practices

1. **Never commit credentials**
   ```bash
   # Already in .gitignore
   .env
   .aws/
   ```

2. **Use IAM roles when possible**
   ```bash
   # For EC2/Lambda, use IAM roles instead of access keys
   ```

3. **Rotate access keys regularly**
   ```bash
   # Every 90 days minimum
   ```

4. **Use least privilege**
   ```bash
   # Only grant necessary permissions
   ```

5. **Enable MFA**
   ```bash
   # For production accounts, enable multi-factor authentication
   ```

## Next Steps

After deploying:
1. ✅ Test all functionality on live URL
2. ✅ Configure custom domain
3. ✅ Set up monitoring
4. ✅ Configure CORS on backend
5. ✅ Test authentication flow
6. ✅ Verify API connections

## Support Links

- AWS CLI Documentation: https://docs.aws.amazon.com/cli/
- Amplify CLI Documentation: https://docs.amplify.aws/cli/
- AWS Amplify Console: https://console.aws.amazon.com/amplify/
- IAM Console: https://console.aws.amazon.com/iam/
