# 🚀 Render Deployment Checklist

## Pre-Deployment Setup

### ✅ 1. Required Environment Variables
Copy these exact variable names to your Render dashboard:

**Essential (Required):**
- `BASE_URL` - Your Render app URL (e.g., `https://your-app.onrender.com`)
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `GMAIL_USER` - Your Gmail address
- `GMAIL_PASS` - Gmail app-specific password
- `HUGGINGFACE_API_KEY` - Hugging Face API token

**Optional (SMS Features):**
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token  
- `TWILIO_PHONE_NUMBER` - Twilio phone number

### ✅ 2. Security Features Ready
All security measures are production-ready:
- ✅ Input validation on all endpoints
- ✅ XSS protection with sanitization
- ✅ Rate limiting (100 general, 5 sensitive per 15 minutes)
- ✅ Security headers (CSP, HSTS, X-Frame-Options, etc.)
- ✅ CORS configuration
- ✅ File upload security
- ✅ Email TLS encryption
- ✅ Database type safety

### ✅ 3. Database Setup
1. Create Supabase project
2. Copy connection details to environment variables
3. Tables will auto-create on first run

## Deployment Steps

### Step 1: Connect Repository
1. Go to [render.com](https://render.com)
2. Sign up/login with GitHub
3. Click "New Web Service"
4. Connect your repository

### Step 2: Service Configuration
```yaml
Service Name: scaninstead
Environment: Node.js
Region: Choose closest to your users
Branch: main (or your default branch)
Build Command: npm install
Start Command: npm start
```

### Step 3: Environment Variables
Add all variables from the list above in Render dashboard.

### Step 4: Deploy
Click "Create Web Service" - Render will:
- Clone your repository
- Install dependencies
- Start the application
- Provide you with a URL

## Post-Deployment Verification

### ✅ Test Security
Run the security test script:
```bash
node security-test.js
```

### ✅ Test Core Features
1. **Homepage**: Visit your Render URL
2. **Create homeowner**: Test `/api/create` endpoint
3. **Email delivery**: Check email notifications work
4. **Rate limiting**: Verify protection is active
5. **File uploads**: Test pitch submissions with attachments

### ✅ Monitor Performance
Check Render dashboard for:
- Response times
- Memory usage
- Error rates
- Request volume

## Troubleshooting

### Common Issues & Solutions

**App won't start:**
- Check all required environment variables are set
- Verify DATABASE_URL format is correct
- Check build logs for missing dependencies

**Database connection fails:**
- Verify Supabase credentials
- Check DATABASE_URL includes all parameters
- Ensure Supabase project is active

**Email not working:**
- Verify Gmail app password (not regular password)
- Check GMAIL_USER and GMAIL_PASS variables
- Ensure 2FA is enabled on Gmail account

**Rate limiting too aggressive:**
- This is normal - shows security is working
- Users should wait 15 minutes between attempts

## Success Indicators

✅ **Application Status**: Web service shows "Live"
✅ **Security Headers**: Present in browser dev tools
✅ **Rate Limiting**: 429 errors after 5 requests
✅ **Email Delivery**: Welcome emails sent successfully
✅ **Input Validation**: Malformed data rejected
✅ **XSS Protection**: Script tags sanitized

## Support Resources

- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Security Guide**: See `SECURITY_ANALYSIS.md`
- **Deployment Guide**: See `RENDER_DEPLOYMENT_GUIDE.md`

---

**Your app is ready for production!** 🎉

All security measures are enterprise-grade and will protect your users' data effectively.