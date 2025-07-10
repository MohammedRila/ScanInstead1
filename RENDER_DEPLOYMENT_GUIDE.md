# Render Deployment Guide for ScanInstead

## Overview
This guide provides step-by-step instructions for deploying the ScanInstead application to Render with all security measures intact.

## Pre-Deployment Checklist

### ✅ Security Features Ready for Production
- **11 security packages** installed and configured
- **Input validation** on all API endpoints
- **XSS protection** with sanitization
- **Rate limiting** (100 general, 5 sensitive endpoints per 15 minutes)
- **Security headers** (CSP, HSTS, X-Frame-Options, etc.)
- **CORS configuration** for production domains
- **File upload security** with type validation
- **Email security** with TLS 1.2+ enforcement
- **Database security** with type-safe operations

## Required Environment Variables for Render

### 🔑 Essential Secrets (Required)
Add these environment variables in your Render dashboard:

```bash
# Application Configuration
BASE_URL=https://your-app-name.onrender.com
NODE_ENV=production
PORT=10000

# Database (Supabase)
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Email Service (Gmail SMTP)
GMAIL_USER=your-gmail@gmail.com
GMAIL_PASS=your-app-specific-password

# AI Services (Hugging Face)
HUGGINGFACE_API_KEY=your-huggingface-api-key

# Optional SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

### 🔐 How to Get Each Secret Key

#### 1. Supabase Keys
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or use existing
3. Go to Settings → API
4. Copy:
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_ANON_KEY`: Anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key
5. Go to Settings → Database
6. Copy connection string for `DATABASE_URL`

#### 2. Gmail SMTP Setup
1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account Settings → Security
3. Generate an "App Password" for mail
4. Use your Gmail address for `GMAIL_USER`
5. Use the app password for `GMAIL_PASS`

#### 3. Hugging Face API Key
1. Go to [huggingface.co](https://huggingface.co)
2. Create account and go to Settings → Access Tokens
3. Create a new token with read access
4. Copy token for `HUGGINGFACE_API_KEY`

#### 4. Twilio (Optional - for SMS)
1. Go to [twilio.com](https://twilio.com)
2. Create account and get free credits
3. Go to Console Dashboard
4. Copy Account SID and Auth Token
5. Get a phone number from Phone Numbers section

## Render Configuration

### 1. Service Settings
- **Environment**: Node.js
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Auto-Deploy**: Enable (from GitHub)

### 2. Security Configuration
The application automatically configures security based on `NODE_ENV=production`:

```javascript
// Automatic production security features:
- Trust proxy enabled for Render's load balancer
- CORS restricted to your domain
- Security headers optimized for production
- Rate limiting active
- HTTPS enforcement
```

### 3. Database Setup
1. Create Supabase project
2. Run the migration script:
   ```bash
   npm run migrate
   ```
3. Verify tables are created:
   - homeowners
   - salesmen  
   - pitches
   - scan_tracking

## Deployment Steps

### 1. Prepare Repository
```bash
# Ensure all dependencies are in package.json
npm install

# Test locally with production settings
NODE_ENV=production npm start
```

### 2. Deploy to Render
1. Connect your GitHub repository
2. Create new Web Service
3. Set environment variables (see list above)
4. Deploy!

### 3. Post-Deployment Verification
1. Test the main endpoints:
   - `POST /api/create` - Homeowner registration
   - `GET /api/homeowner/:id` - Data retrieval
   - `POST /api/pitch/:id` - Pitch submission
2. Verify security headers in browser dev tools
3. Test rate limiting (should get 429 after 5 requests)
4. Check email delivery

## Production Optimizations

### Performance Features
- **Compression**: Gzip compression enabled
- **Caching**: Static asset caching
- **Database**: Connection pooling with Supabase
- **File Storage**: Supabase Storage for scalability

### Security Features in Production
- **Rate Limiting**: Protects against abuse
- **Input Validation**: Prevents malicious data
- **XSS Protection**: Sanitizes all user content
- **CSRF Protection**: Secure state management
- **Security Headers**: Comprehensive protection
- **TLS Enforcement**: HTTPS-only communication

## Monitoring & Maintenance

### Health Checks
Render automatically monitors:
- HTTP response codes
- Response times
- Memory usage
- CPU usage

### Logs
Monitor application logs in Render dashboard:
- Security events (rate limiting, validation errors)
- Email delivery status
- Database connection status
- AI service calls

### Scaling
Render automatically scales based on:
- CPU usage
- Memory consumption
- Request volume

## Cost Optimization

### Free Tier Limits
- **Render Free**: 750 hours/month
- **Supabase Free**: 500MB database, 1GB bandwidth
- **Gmail SMTP**: Free with personal account
- **Hugging Face**: Free tier includes API calls

### Paid Tier Benefits
- **Render Pro**: Better performance, custom domains
- **Supabase Pro**: More storage, better performance
- **Twilio**: Pay-per-use SMS service

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Set
```bash
Error: Missing required environment variable
Solution: Double-check all variables are added in Render dashboard
```

#### 2. Database Connection Issues
```bash
Error: Connection to database failed
Solution: Verify DATABASE_URL and Supabase credentials
```

#### 3. Email Delivery Problems
```bash
Error: Email authentication failed
Solution: Verify Gmail app password is correct
```

#### 4. Rate Limiting Issues
```bash
Error: Too many requests
Solution: This is expected behavior - shows security is working
```

## Security Best Practices for Production

### 1. Environment Management
- Never commit secrets to repository
- Use Render's environment variable management
- Rotate API keys regularly

### 2. Monitoring
- Monitor failed login attempts
- Track unusual request patterns
- Set up alerts for security events

### 3. Updates
- Keep dependencies updated
- Monitor security advisories
- Test security measures regularly

## Support

### Documentation
- [Render Documentation](https://render.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Security Analysis](./SECURITY_ANALYSIS.md)

### Getting Help
- Render Community Forum
- Supabase Discord
- GitHub Issues (for application bugs)

---

**Ready to Deploy!** 🚀

Your ScanInstead application is production-ready with enterprise-grade security. All security measures will work seamlessly on Render's infrastructure.