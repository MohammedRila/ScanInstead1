# Render Deployment Guide for ScanInstead

## Prerequisites
1. GitHub repository with your code
2. Render account (https://render.com)
3. All required API keys and credentials

## Deployment Steps

### 1. Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/scaninstead.git
git push -u origin main
```

### 2. Create Web Service on Render
1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: scaninstead
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or upgrade as needed)

### 3. Environment Variables (REQUIRED)
Add these environment variables in Render's dashboard:

#### Firebase Configuration
- **FIREBASE_SERVICE_ACCOUNT_JSON**: Your Firebase service account JSON (entire JSON string)
- **FIREBASE_STORAGE_BUCKET**: Your Firebase Storage bucket name (e.g., `your-project.appspot.com`)

#### Email Configuration (Gmail SMTP)
- **GMAIL_USER**: Your Gmail address (e.g., `your-email@gmail.com`)
- **GMAIL_APP_PASSWORD**: Gmail App Password (16-character password from Google)

#### AI Features
- **HUGGINGFACE_API_KEY**: Your Hugging Face API key for AI analysis

#### Application Configuration
- **BASE_URL**: Your Render app URL (e.g., `https://scaninstead.onrender.com`)
- **NODE_ENV**: `production`

### 4. Optional Environment Variables
- **TWILIO_ACCOUNT_SID**: For SMS notifications (if enabled)
- **TWILIO_AUTH_TOKEN**: For SMS notifications (if enabled)
- **TWILIO_PHONE_NUMBER**: For SMS notifications (if enabled)
- **VITE_GA_MEASUREMENT_ID**: For Google Analytics (if needed)

## Port Configuration
The app is configured to run on port 5000, which Render will automatically map to port 443 (HTTPS).

## Build Process
1. `npm install` - Install dependencies
2. `vite build` - Build the React frontend
3. `esbuild` - Bundle the Node.js backend
4. `npm start` - Start the production server

## Important Notes
- The app uses Firebase for database and storage (no PostgreSQL needed)
- Email notifications work through Gmail SMTP
- QR codes are generated server-side
- AI analysis is powered by Hugging Face
- Static files are served from the `dist` directory in production

## Troubleshooting
1. Check environment variables are set correctly
2. Verify Firebase service account JSON is valid
3. Ensure Gmail App Password is correctly generated
4. Check build logs for any missing dependencies
5. Verify BASE_URL matches your Render app URL

## Security Considerations
- Never commit sensitive environment variables to Git
- Use strong App Passwords for Gmail
- Regularly rotate API keys
- Monitor usage quotas for external services