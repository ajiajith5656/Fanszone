# Mallu Cupid - Custom Domain Setup & Troubleshooting

## 📍 Current Status

- **App ID**: `d19gr2nqobengq`
- **Region**: `us-east-1`
- **Default Domain**: `d19gr2nqobengq.amplifyapp.com`
- **Custom Domain**: `mallucupid.com` 
- **Status**: ❌ **FAILED**
- **Error**: CNAME conflict - registered elsewhere

## 🔴 Problem Identified

```
Domain Status: FAILED
Reason: "One or more of the CNAMEs you provided are already associated with 
         a different resource."

Issue:
- www subdomain: ✅ Verified (working)
- Root domain: ❌ Not verified (CNAME conflict)
- Certificate: ACM validation pending
```

### DNS Records Required

```
✅ CNAME for www:
   www.mallucupid.com → d2dkjxadma9whn.cloudfront.net

❌ ACM Certificate Validation (PENDING):
   _4f67ca0f83041aa20a566eacbabaef53.mallucupid.com 
   → CNAME _c119147730c303091c2e7a0947b60677.jkddzztszm.acm-validations.aws.

❌ Root domain CNAME (CONFLICTING):
   mallucupid.com → d2dkjxadma9whn.cloudfront.net
```

## ✅ Solution Steps

### Step 1: Check Current DNS Configuration

```bash
# Check what's currently pointing to mallucupid.com
dig mallucupid.com
dig www.mallucupid.com
dig +short mallucupid.com

# Check specific records
nslookup mallucupid.com
nslookup www.mallucupid.com
```

### Step 2: Remove Old/Conflicting DNS Records

You likely have these pointing elsewhere:

1. **Log into your domain registrar** (GoDaddy, Route53, Namecheap, etc.)
2. **Check DNS settings for mallucupid.com**
3. **Remove conflicting CNAME/A records**
4. **Delete any existing CloudFront/other service mappings**

### Step 3: Update DNS Records Correctly

#### Option A: Using Route53 (AWS Native)

```bash
# Create hosted zone
aws route53 create-hosted-zone \
  --name mallucupid.com \
  --caller-reference $(date +%s)

# Get hosted zone ID
aws route53 list-hosted-zones-by-name --dns-name mallucupid.com

# Create CNAME for www
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "www.mallucupid.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "d2dkjxadma9whn.cloudfront.net"}]
      }
    }]
  }'

# Create ALIAS for root domain (recommended over CNAME)
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "mallucupid.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "d2dkjxadma9whn.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'

# Create ACM validation record
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "_4f67ca0f83041aa20a566eacbabaef53.mallucupid.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "_c119147730c303091c2e7a0947b60677.jkddzztszm.acm-validations.aws"}]
      }
    }]
  }'
```

#### Option B: Using External Registrar (GoDaddy, Namecheap, etc.)

1. **Log into domain registrar**
2. **Go to DNS settings**
3. **Add these records**:

```
Type | Host | Value | TTL
-----|------|-------|-----
CNAME | www | d2dkjxadma9whn.cloudfront.net | 3600
A | @ (root) | 76.76.19.51 (CloudFront) | 3600
CNAME | _4f67ca0f83041aa20a566eacbabaef53 | _c119147730c303091c2e7a0947b60677.jkddzztszm.acm-validations.aws | 3600
```

**Note**: Root domain (mallucupid.com) requires either:
- **A record** pointing to CloudFront IP, OR
- **ALIAS record** (AWS Route53), OR
- **ANAME record** (some registrars)

### Step 4: Disable & Re-add Domain in Amplify

```bash
# Delete the failed domain association
aws amplify delete-domain-association \
  --app-id d19gr2nqobengq \
  --domain-name mallucupid.com \
  --region us-east-1

# Wait 2-3 minutes

# Re-add domain
aws amplify create-domain-association \
  --app-id d19gr2nqobengq \
  --domain-name mallucupid.com \
  --enable-auto-sub-domain true \
  --sub-domain-settings \
    BranchName=main,Prefix=www \
    BranchName=main \
  --region us-east-1

# Check status
aws amplify get-domain-association \
  --app-id d19gr2nqobengq \
  --domain-name mallucupid.com \
  --region us-east-1
```

### Step 5: Verify DNS Propagation

```bash
# Monitor DNS propagation
watch -n 5 'dig mallucupid.com +short'
watch -n 5 'dig www.mallucupid.com +short'

# Check ACM certificate validation
aws acm list-certificates --region us-east-1 | grep mallucupid

# Using nslookup
nslookup mallucupid.com
nslookup www.mallucupid.com

# Online tool
curl -I https://mallucupid.com
curl -I https://www.mallucupid.com
```

## 🔧 AWS CLI Commands Reference

### Get current domain status
```bash
aws amplify get-domain-association \
  --app-id d19gr2nqobengq \
  --domain-name mallucupid.com \
  --region us-east-1
```

### List all domains
```bash
aws amplify list-domain-associations \
  --app-id d19gr2nqobengq \
  --region us-east-1 \
  --output json
```

### Enable auto subdomain
```bash
aws amplify update-domain-association \
  --app-id d19gr2nqobengq \
  --domain-name mallucupid.com \
  --enable-auto-sub-domain true \
  --region us-east-1
```

### Check ACM certificates
```bash
aws acm list-certificates --region us-east-1
aws acm describe-certificate --certificate-arn <arn> --region us-east-1
```

## 📊 Common CNAME Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| CNAME conflict | Domain registered elsewhere | Remove old DNS records |
| Certificate validation pending | ACM record not created | Add validation CNAME |
| www not working | Missing CNAME | Add www CNAME record |
| Root domain not working | CNAME for root (invalid) | Use A/ALIAS record |
| SSL certificate error | Certificate not validated | Wait 5-15 min or add DNS record |
| 404 errors | Routing rules missing | Check amplify.yml/custom rules |

## 🎯 Quick Checklist

- [ ] Check current DNS records (`dig mallucupid.com`)
- [ ] Remove conflicting CNAME records
- [ ] Decide: Route53 vs existing registrar
- [ ] Delete failed domain from Amplify
- [ ] Add new DNS records (CNAME for www, A/ALIAS for root, ACM validation)
- [ ] Re-create domain association in Amplify
- [ ] Wait 5-10 minutes for DNS propagation
- [ ] Verify: `curl -I https://mallucupid.com`
- [ ] Check certificate: `aws acm list-certificates`

## 📱 Testing After Fix

```bash
# Test root domain
curl -I https://mallucupid.com
# Expected: 301 redirect to www or direct content

# Test www subdomain
curl -I https://www.mallucupid.com
# Expected: 200 OK

# Check certificate
curl -v https://mallucupid.com 2>&1 | grep "subject="
```

## 🆘 If Issues Persist

1. **DNS not updating?** → Check TTL (should be 300), clear browser cache, use incognito
2. **Certificate still failing?** → Delete domain, update DNS first, then re-add in Amplify
3. **CNAME mismatch?** → Ensure CloudFront distribution is correct (`d2dkjxadma9whn.cloudfront.net`)
4. **Redirects failing?** → Check custom rules in amplify.yml

### Current Custom Rules (amplify.yml)
```yaml
redirects:
  - source: https://mallucupid.com
    target: https://www.mallucupid.com
    status: 302
  - source: "/<*>"
    target: /index.html
    status: 404-200
```

---

## 📞 Support

For AWS Amplify support: `aws amplify help`
For Route53 support: `aws route53 help`

**DNS changes typically propagate in 5-30 minutes.**
