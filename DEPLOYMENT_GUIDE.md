# Deployment Guide for ChangAn BBQ Ordering System

## Overview
This guide explains how to deploy updates to your production server and ensure customers always see the latest version.

## Automatic Cache Prevention
The system is configured to prevent caching issues:

1. **Nginx Configuration**: HTML files are never cached, while CSS/JS files are cached with unique hashes
2. **Meta Tags**: HTML includes cache-control headers to prevent browser caching
3. **Vite Build**: Automatically generates unique filenames for CSS/JS on each build

## Deploying Updates

### Step 1: Commit Your Changes Locally
```bash
cd /Users/lk333/Desktop/Ordering_System
git add -A
git commit -m "Description of your changes"
git push origin DigitalOcean
```

### Step 2: Deploy to Production Server
SSH into your Digital Ocean server:
```bash
ssh deployer@159.223.32.32
```

Then run the deployment script:
```bash
cd /home/deployer/Ordering_System
git pull origin DigitalOcean
./deploy.sh all
```

The `deploy.sh all` command will:
- Build the backend (.NET application)
- Build the customer app (React/Vite)
- Build the staff dashboard (React/Vite)
- Copy files to nginx directories
- Restart backend service
- Reload nginx

### Step 3: Verify Deployment
1. **Customer App**: Visit `http://159.223.32.32/` in incognito mode
2. **Staff Dashboard**: Visit `http://159.223.32.32/staff/` in incognito mode
3. **API**: Check `http://159.223.32.32/api/health` (if available)

## Testing After Deployment

### For Existing Users (Who May Have Cache)
- **On iPhone Safari**: Long-press refresh → "Request Desktop Website"
- **On Android Chrome**: Settings → Privacy → Clear browsing data → Cached images
- **Best Practice**: Close all browser tabs and scan QR code fresh

### For New Users
- New customers scanning QR codes will ALWAYS get the latest version automatically
- No cache issues for first-time visitors

## Quick Deploy Commands (Cheat Sheet)

**Full deployment:**
```bash
ssh deployer@159.223.32.32 "cd /home/deployer/Ordering_System && git pull origin DigitalOcean && ./deploy.sh all"
```

**Customer app only:**
```bash
ssh deployer@159.223.32.32 "cd /home/deployer/Ordering_System && git pull origin DigitalOcean && ./deploy.sh customer"
```

**Staff dashboard only:**
```bash
ssh deployer@159.223.32.32 "cd /home/deployer/Ordering_System && git pull origin DigitalOcean && ./deploy.sh staff"
```

**Backend only:**
```bash
ssh deployer@159.223.32.32 "cd /home/deployer/Ordering_System && git pull origin DigitalOcean && ./deploy.sh backend"
```

## Troubleshooting

### "Still seeing old version"
1. Open in **incognito/private mode** to verify latest code is deployed
2. If incognito shows new version but regular browser doesn't, it's a browser cache issue
3. Clear browser cache or wait (cache will expire eventually)

### "Nginx not updating"
```bash
# On server, check nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Restart nginx (if reload doesn't work)
sudo systemctl restart nginx
```

### "Deploy script fails"
```bash
# Check if script is executable
chmod +x /home/deployer/Ordering_System/deploy.sh

# Check branch
cd /home/deployer/Ordering_System
git branch

# Should be on DigitalOcean branch
git checkout DigitalOcean
```

## For Your Client

**When you make menu changes:**
1. Update items in Staff Dashboard
2. No deployment needed - changes are instant (database)

**When you need UI/feature updates:**
1. Contact your developer
2. Developer will push updates to GitHub
3. Run deployment commands above
4. New customers will see updates immediately
5. Existing customers may need to refresh once

## Emergency Rollback

If a deployment breaks something:
```bash
ssh deployer@159.223.32.32
cd /home/deployer/Ordering_System
git log --oneline -5  # See recent commits
git reset --hard <previous-commit-hash>
./deploy.sh all
```

## Monitoring

**Check if services are running:**
```bash
# Backend service
sudo systemctl status ordering-system-backend

# Nginx
sudo systemctl status nginx

# View backend logs
sudo journalctl -u ordering-system-backend -n 50 -f
```

## Contact

For technical issues or questions about deployment, contact your developer.
