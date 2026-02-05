#!/bin/bash

# AWS CLI Setup and Amplify Deployment Script
# Run this script to configure AWS and deploy your app

echo "🚀 AWS Amplify Deployment Setup"
echo "================================"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "📦 Installing AWS CLI..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
    echo "✅ AWS CLI installed"
else
    echo "✅ AWS CLI already installed ($(aws --version))"
fi

echo ""
echo "🔐 Configuring AWS Credentials"
echo "You'll need:"
echo "  - AWS Access Key ID"
echo "  - AWS Secret Access Key"
echo "  - Default region (e.g., us-east-1)"
echo ""

# Configure AWS credentials
aws configure

echo ""
echo "✅ AWS credentials configured!"
echo ""

# Test AWS connection
echo "🧪 Testing AWS connection..."
if aws sts get-caller-identity &> /dev/null; then
    echo "✅ Successfully connected to AWS!"
    aws sts get-caller-identity
else
    echo "❌ Failed to connect to AWS. Please check your credentials."
    exit 1
fi

echo ""
echo "📦 Installing Amplify CLI..."
if ! command -v amplify &> /dev/null; then
    npm install -g @aws-amplify/cli
    echo "✅ Amplify CLI installed"
else
    echo "✅ Amplify CLI already installed ($(amplify --version))"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Initialize Amplify: amplify init"
echo "2. Add hosting: amplify add hosting"
echo "3. Deploy: amplify publish"
echo ""
echo "Or use AWS Amplify Console for easier deployment:"
echo "https://console.aws.amazon.com/amplify/"
