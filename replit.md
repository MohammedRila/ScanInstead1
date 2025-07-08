# replit.md

## Overview

ScanInstead is a modern full-stack web application that replaces traditional door-to-door knocking with a QR-based digital pitch system. Homeowners can create unique QR codes that visitors scan to submit their business pitches digitally, eliminating interruptions while maintaining organized communication.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React Query for server state, React hooks for local state
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with structured JSON responses
- **File Processing**: Multer for handling file uploads
- **Development**: Custom Vite integration for full-stack development

### Database & Storage
- **Primary Database**: Firebase Firestore (NoSQL document database)
- **File Storage**: Firebase Storage for uploaded attachments
- **Schema Validation**: Zod for runtime type checking and validation
- **ORM Alternative**: Direct Firebase Admin SDK usage

## Key Components

### Core Entities
1. **Homeowner**: Users who create QR codes
   - ID, full name, email, creation timestamp
   - Generated QR code URL and pitch form URL

2. **Pitch**: Digital submissions from visitors
   - Visitor information (name, company, contact details)
   - Pitch content (offer description, reasoning)
   - Optional file attachments
   - Timestamp and homeowner association

### Service Layer
- **QR Code Generation**: Uses `qrcode` library to create scannable codes
- **Email Service**: Nodemailer with Gmail SMTP for pitch notifications
- **SMS Service**: Twilio integration (optional, configurable)
- **File Upload**: Firebase Storage with public URL generation

### API Endpoints
- `POST /api/create` - Create homeowner and generate QR code
- `GET /api/homeowner/:id` - Retrieve homeowner details
- `POST /api/pitch` - Submit visitor pitch with file upload support

## Data Flow

1. **Homeowner Registration**:
   - User submits name and email via `/create` page
   - System generates unique ID and creates Firebase document
   - QR code generated linking to pitch form URL
   - Response includes QR code data URL for display/download

2. **Visitor Pitch Submission**:
   - Visitor scans QR code or visits pitch URL directly
   - Form validates required fields (name, offer, reason)
   - File uploads processed through Multer to Firebase Storage
   - Pitch data stored in Firestore with homeowner reference
   - Email notification sent to homeowner with structured HTML
   - Optional SMS notification (if enabled)

3. **File Handling**:
   - Files uploaded to memory via Multer
   - Transferred to Firebase Storage with unique naming
   - Public URLs generated for email inclusion
   - File type validation (images and PDFs only)

## External Dependencies

### Database & Storage
- **Firebase Admin SDK**: Firestore database and Storage
- **Firebase Service Account**: Authentication via JSON credentials

### Communication Services
- **Resend**: Email delivery service for pitch notifications
- **Twilio**: SMS notifications (optional, feature-flagged)

### Frontend Libraries
- **React Ecosystem**: React, React DOM, React Hook Form
- **UI Components**: Radix UI primitives, Lucide React icons
- **Styling**: Tailwind CSS, class-variance-authority
- **Validation**: Zod for schema validation
- **HTTP Client**: React Query for server state management

### Backend Libraries
- **Express.js**: Web framework and middleware
- **Multer**: File upload handling
- **QRCode**: QR code generation
- **UUID**: Unique identifier generation

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR
- **API Integration**: Express server with Vite middleware
- **Environment Variables**: `.env` file for configuration

### Production Build
- **Frontend**: Vite build process generating static assets
- **Backend**: ESBuild compilation to single Node.js bundle
- **Static Serving**: Express serves built frontend assets
- **Process Management**: Single Node.js process handles both API and static files

### Environment Configuration
Required environment variables:
- `BASE_URL`: Your app's domain (e.g., https://your-app.replit.app) for QR code generation
- `FIREBASE_SERVICE_ACCOUNT_JSON`: Firebase authentication
- `FIREBASE_STORAGE_BUCKET`: Firebase Storage bucket name
- `RESEND_API_KEY`: Resend API key for email delivery
- `TWILIO_*`: SMS service configuration (optional)
- `DATABASE_URL`: PostgreSQL connection (reserved for potential future use)

### Hosting Considerations
- **Replit Integration**: Special handling for Replit domains and development tools
- **HTTPS Support**: Automatic protocol detection for QR code URLs
- **File Upload Limits**: 5MB file size restriction
- **CORS**: Configured for cross-origin requests

## Changelog

```
Changelog:
- July 08, 2025. Added dynamic landing page with homeowner/service provider selection
- July 08, 2025. Implemented Google Analytics tracking for QR code scans and user flow
- July 08, 2025. Updated QR code URLs to point to new landing page (/l/:id)
- July 08, 2025. Migrated from Replit Agent to Replit environment
- July 08, 2025. Switched email service from nodemailer/Gmail to Resend
- July 06, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```