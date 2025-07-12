import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHomeownerSchema, insertPitchSchema, insertSalesmanSchema, insertScanTrackingSchema } from "@shared/schema";
import { generateQRCode } from "./services/qr";
import { sendPitchEmail, sendSalesmanVerificationEmail, sendHomeownerWelcomeEmail } from "./services/email";
import { sendPitchSMS } from "./services/sms";
import { uploadToSupabase, serveFile } from "./services/supabase-storage";
import { analyzePitch, performHiddenAnalysis, performDataIntelligenceAnalysis } from "./services/ai";
import { dataMonitor } from "./services/data_monitor";
import { getHomeownerAnalytics, getSalesmanLeaderboard, getRealtimeStats } from "./routes/supabase";
import { body, param, validationResult } from "express-validator";
import xss from "xss";

import multer from "multer";
import path from "path";
import { promises as fs } from "fs";

// Security validation middleware
const validateRequest = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array(),
    });
  }
  next();
};

// UUID validation
const validateUUID = param('id').isUUID().withMessage('Invalid ID format');

// Input sanitization
const sanitizeInput = (req: any, res: any, next: any) => {
  // Sanitize all string inputs in body
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key].trim());
      }
    }
  }
  next();
};

// Configure multer for temporary file uploads with expanded file type support
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (increased for business documents and media)
  },
  fileFilter: (req, file, cb) => {
    // Support for various business documents, images, videos, and audio files
    const allowedMimeTypes = [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
      // Documents  
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'text/plain', 'text/csv',
      // Videos (for service demo videos)
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',

    ];

    const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|bmp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|mp4|avi|mov|wmv)$/i;

    const hasValidMimeType = allowedMimeTypes.includes(file.mimetype);
    const hasValidExtension = allowedExtensions.test(file.originalname);

    if (hasValidMimeType && hasValidExtension) {
      return cb(null, true);
    } else {
      cb(new Error('File type not supported. Please upload images, documents (PDF, Word, Excel, PowerPoint), or videos.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Sign in existing homeowner
  app.post("/api/homeowner-signin", 
    [
      body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
      sanitizeInput,
      validateRequest
    ],
    async (req, res) => {
    try {
      const { email } = req.body;

      // Check if homeowner exists
      const existingHomeowner = await storage.getHomeownerByEmail(email);

      if (!existingHomeowner) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this email address. Please create a new account.',
        });
      }

      res.json({
        success: true,
        message: 'Welcome back! Redirecting to your dashboard.',
        homeowner: existingHomeowner,
      });
    } catch (error) {
      console.error('Error signing in:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sign in',
      });
    }
  });

  // Create homeowner and generate QR code
  app.post("/api/create", 
    [
      body('fullName').isLength({ min: 1, max: 100 }).withMessage('Full name is required (max 100 characters)'),
      body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
      body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
      body('notificationPreference').optional().isIn(['email', 'sms', 'both']).withMessage('Invalid notification preference'),
      sanitizeInput,
      validateRequest
    ],
    async (req, res) => {
    try {
      const validatedData = insertHomeownerSchema.parse(req.body);

      // Check if user already exists
      const existingHomeowner = await storage.getHomeownerByEmail(validatedData.email);

      if (existingHomeowner) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Please sign in instead.',
          existingUser: true,
          homeowner: existingHomeowner,
        });
      }

      const homeowner = await storage.createHomeowner(validatedData);

      // Generate QR code
      const qrUrl = await generateQRCode(homeowner.pitchUrl);

      // Send welcome email
      try {
        console.log('Attempting to send welcome email to:', homeowner.email);
        const emailResult = await sendHomeownerWelcomeEmail(homeowner);
        console.log('Welcome email sent successfully!', emailResult);
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't fail the registration if email fails, but log it
      }

      res.json({
        success: true,
        homeowner: {
          ...homeowner,
          qrUrl,
        },
      });
    } catch (error) {
      console.error('Error creating homeowner:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create homeowner',
      });
    }
  });

  // Get homeowner by ID
  app.get("/api/homeowner/:id", 
    [validateUUID, validateRequest],
    async (req, res) => {
    try {
      const homeowner = await storage.getHomeowner(req.params.id);
      if (!homeowner) {
        return res.status(404).json({
          success: false,
          message: 'Homeowner not found',
        });
      }
      res.json({
        success: true,
        homeowner,
      });
    } catch (error) {
      console.error('Error getting homeowner:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get homeowner',
      });
    }
  });

  // Get pitches for homeowner (fast loading for dashboard)
  app.get("/api/homeowner/:id/pitches", 
    [validateUUID, validateRequest],
    async (req, res) => {
    try {
      const pitches = await storage.getPitchesByHomeowner(req.params.id);

      // Skip heavy data intelligence analysis for dashboard loading
      // Intelligence analysis runs in background monitoring instead

      res.json({
        success: true,
        pitches,
      });
    } catch (error) {
      console.error('Error getting pitches:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get pitches',
      });
    }
  });

  // Submit pitch
  app.post("/api/pitch/:id", 
    [
      validateUUID,
      body('visitorName').isLength({ min: 1, max: 100 }).withMessage('Visitor name is required (max 100 characters)'),
      body('offer').isLength({ min: 1, max: 500 }).withMessage('Offer description is required (max 500 characters)'),
      body('reason').isLength({ min: 1, max: 1000 }).withMessage('Reason is required (max 1000 characters)'),
      body('company').optional().isLength({ max: 100 }).withMessage('Company name too long (max 100 characters)'),
      body('visitorEmail').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
      body('visitorPhone').optional().isMobilePhone().withMessage('Valid phone number required'),
      sanitizeInput,
      validateRequest
    ],
    upload.single('file'), 
    async (req, res) => {
    try {
      const homeownerId = req.params.id;
      const homeowner = await storage.getHomeowner(homeownerId);

      if (!homeowner) {
        return res.status(404).json({
          success: false,
          message: 'Homeowner not found',
        });
      }

      let fileUrl: string | undefined;
      let fileName: string | undefined;

      // Upload file to Supabase Storage if provided
      if (req.file) {
        try {
          fileUrl = await uploadToSupabase(req.file);
          fileName = req.file.originalname;
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload file',
          });
        }
      }

      const pitchData = {
        ...req.body,
        homeownerId,
        fileName: fileName || "",
      };

      const validatedData = insertPitchSchema.parse(pitchData);

      // Perform basic analysis without external AI models for faster processing
      let aiAnalysis;
      let hiddenAnalysis;
      try {
        const pitchContent = `${validatedData.offer} ${validatedData.reason}`;
        const businessName = validatedData.businessName || 'Unknown Business';

        // Create basic analysis without external API calls
        aiAnalysis = {
          sentiment: 'positive',
          confidence: 0.85,
          categories: ['business', 'service'],
          urgency: 'medium',
          businessType: businessName.toLowerCase().includes('roofing') ? 'roofing' : 
                       businessName.toLowerCase().includes('solar') ? 'solar' :
                       businessName.toLowerCase().includes('security') ? 'security' : 'service',
          summary: pitchContent.substring(0, 100) + '...',
          isSpam: false
        };

        // Create basic hidden analysis
        hiddenAnalysis = {
          match_lvl: 0.8,
          s_flag: 0.0,
          i_tag: 'service_request',
          u_score: 0.6,
          k_meta: 'business_pitch',
          xtext: pitchContent.substring(0, 100),
          rscore: 0.75,
          clickT: 0,
          b_prob: 0.1,
          n_pred: 'respond',
          c_prob: 0.7
        };

        console.log('Basic analysis completed');
      } catch (aiError) {
        console.error('Analysis failed:', aiError);
        // Continue without analysis if it fails
      }

      // Build pitch object with all data including hidden analysis
      const pitchWithData = {
        ...validatedData,
        ...(fileUrl && { fileUrl }),
        aiAnalysis,
        hiddenAnalysis
      };
      const pitch = await storage.createPitch(pitchWithData);

      // Send email notification
      try {
        console.log('Attempting to send email to:', homeowner.email);
        await sendPitchEmail(homeowner, pitch);
        console.log('Email sent successfully!');
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the request if email fails
      }

      // Send SMS notification if enabled
      try {
        await sendPitchSMS(homeowner, pitch);
      } catch (smsError) {
        console.error('Error sending SMS:', smsError);
        // Don't fail the request if SMS fails
      }

      res.json({
        success: true,
        message: 'Pitch submitted successfully',
        pitch,
      });
    } catch (error) {
      console.error('Error submitting pitch:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit pitch',
      });
    }
  });

  // Homeowner registration route
  app.post("/api/homeowner/register/:id", async (req, res) => {
    try {
      const homeownerId = req.params.id;
      const validatedData = insertHomeownerSchema.parse(req.body);

      const homeowner = await storage.registerHomeowner(homeownerId, validatedData);

      // Send welcome email for completed registration
      try {
        console.log('Attempting to send registration confirmation email to:', homeowner.email);
        const emailResult = await sendHomeownerWelcomeEmail(homeowner);
        console.log('Registration confirmation email sent successfully!', emailResult);
      } catch (emailError) {
        console.error('Error sending registration confirmation email:', emailError);
        // Don't fail the registration if email fails, but log it
      }

      res.json({
        success: true,
        message: 'Homeowner registered successfully! Check your email for confirmation.',
        homeowner,
      });
    } catch (error) {
      console.error('Error registering homeowner:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to register homeowner',
      });
    }
  });

  // Salesman registration route
  app.post("/api/salesman/register", 
    [
      body('firstName').isLength({ min: 1, max: 50 }).withMessage('First name is required (max 50 characters)'),
      body('lastName').isLength({ min: 1, max: 50 }).withMessage('Last name is required (max 50 characters)'),
      body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
      body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
      body('businessName').isLength({ min: 1, max: 100 }).withMessage('Business name is required (max 100 characters)'),
      body('businessType').isLength({ min: 1, max: 50 }).withMessage('Business type is required (max 50 characters)'),
      sanitizeInput,
      validateRequest
    ],
    async (req, res) => {
    try {
      const validatedData = insertSalesmanSchema.parse(req.body);

      // Check if user already exists
      const existingSalesman = await storage.getSalesmanByEmail(validatedData.email);

      if (existingSalesman) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists.',
          existingUser: true,
          salesman: existingSalesman,
        });
      }

      const salesman = await storage.createSalesman(validatedData);

      // Send verification email
      try {
        console.log('Attempting to send verification email to:', salesman.email);
        await sendSalesmanVerificationEmail(salesman);
        console.log('Verification email sent successfully!');
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Don't fail the registration if email fails, but log it
      }

      res.json({
        success: true,
        message: 'Service provider registered successfully! Please check your email for verification.',
        salesman,
        needsVerification: true,
      });
    } catch (error) {
      console.error('Error registering salesman:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to register service provider',
      });
    }
  });

  // Salesman email verification route (GET for email links)
  app.get("/api/salesman/verify", 
    [
      validateRequest
    ],
    async (req, res) => {
    try {
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Email parameter is required.',
        });
      }

      // Find salesman by email
      const salesman = await storage.getSalesmanByEmail(email);

      if (!salesman) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this email address.',
        });
      }

      if (salesman.isVerified) {
        return res.json({
          success: true,
          message: 'Email is already verified.',
          salesman,
          alreadyVerified: true,
        });
      }

      // Verify the salesman
      await storage.verifySalesman(salesman.id);

      res.json({
        success: true,
        message: 'Email verified successfully! Your account is now active.',
        salesman: {
          ...salesman,
          isVerified: true,
        },
      });
    } catch (error) {
      console.error('Error verifying salesman:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify email',
      });
    }
  });

  // Salesman email verification route (POST for manual verification)
  app.post("/api/salesman/verify", 
    [
      body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
      sanitizeInput,
      validateRequest
    ],
    async (req, res) => {
    try {
      const { email } = req.body;

      // Find salesman by email
      const salesman = await storage.getSalesmanByEmail(email);

      if (!salesman) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this email address.',
        });
      }

      if (salesman.isVerified) {
        return res.json({
          success: true,
          message: 'Email is already verified.',
          salesman,
          alreadyVerified: true,
        });
      }

      // Verify the salesman
      await storage.verifySalesman(salesman.id);

      res.json({
        success: true,
        message: 'Email verified successfully! Your account is now active.',
        salesman: {
          ...salesman,
          isVerified: true,
        },
      });
    } catch (error) {
      console.error('Error verifying salesman:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify email',
      });
    }
  });

  // Salesman sign-in route
  app.post("/api/salesman/signin", 
    [
      body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
      sanitizeInput,
      validateRequest
    ],
    async (req, res) => {
    try {
      const { email } = req.body;

      // Find salesman by email
      const salesman = await storage.getSalesmanByEmail(email);

      if (!salesman) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this email address. Please register first.',
        });
      }

      if (!salesman.isVerified) {
        return res.status(403).json({
          success: false,
          message: 'Please verify your email address before signing in.',
          needsVerification: true,
          salesman,
        });
      }

      res.json({
        success: true,
        message: 'Welcome back! Redirecting to your dashboard.',
        salesman,
      });
    } catch (error) {
      console.error('Error signing in salesman:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sign in',
      });
    }
  });

  // Get salesman data
  app.get("/api/salesman/:id", 
    [validateUUID, validateRequest],
    async (req, res) => {
    try {
      const salesmanId = req.params.id;
      const salesman = await storage.getSalesman(salesmanId);

      if (!salesman) {
        return res.status(404).json({
          success: false,
          message: 'Salesman not found',
        });
      }

      res.json({
        success: true,
        salesman,
      });
    } catch (error) {
      console.error('Error getting salesman:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get salesman',
      });
    }
  });

  // Get salesman scan history
  app.get("/api/salesman/:id/scans", 
    [validateUUID, validateRequest],
    async (req, res) => {
    try {
      const salesmanId = req.params.id;
      const scans = await storage.getScansBySalesman(salesmanId);

      res.json({
        success: true,
        scans,
      });
    } catch (error) {
      console.error('Error getting salesman scans:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get scan history',
      });
    }
  });

  // Get salesman stats
  app.get("/api/salesman/:id/stats", 
    [validateUUID, validateRequest],
    async (req, res) => {
    try {
      const salesmanId = req.params.id;
      const stats = await storage.getSalesmanStats(salesmanId);

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      console.error('Error getting salesman stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get stats',
      });
    }
  });

  // Track QR code scan
  app.post("/api/scan/:homeownerId", 
    [
      validateUUID,
      body('salesmanId').isUUID().withMessage('Invalid salesman ID'),
      body('location').optional().isLength({ max: 100 }).withMessage('Location too long (max 100 characters)'),
      sanitizeInput,
      validateRequest
    ],
    async (req, res) => {
    try {
      const homeownerId = req.params.homeownerId;
      const { salesmanId, location } = req.body;

      const scanData = {
        homeownerId,
        salesmanId,
        location,
      };

      const validatedData = insertScanTrackingSchema.parse(scanData);
      const scan = await storage.createScanTracking(validatedData);

      res.json({
        success: true,
        message: 'Scan tracked successfully',
        scan,
      });
    } catch (error) {
      console.error('Error tracking scan:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to track scan',
      });
    }
  });

  // API endpoint for getting monitoring stats (hidden admin endpoint)
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = dataMonitor.getStats();
      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      console.error('Error getting monitoring stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get monitoring stats',
      });
    }
  });

  // Enhanced Supabase API routes
  app.get("/api/homeowner/:id/analytics", getHomeownerAnalytics);
  app.get("/api/leaderboard", getSalesmanLeaderboard);
  app.get("/api/realtime/stats", getRealtimeStats);

  // Serve uploaded files
  app.get("/api/uploads/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const fileData = await serveFile(filename);

      if (!fileData) {
        return res.status(404).json({ error: 'File not found' });
      }

      res.setHeader('Content-Type', fileData.mimetype);
      res.send(fileData.buffer);
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Serve demo video with proper streaming
  app.get("/api/demo/video", async (req, res) => {
    try {
      const videoPath = path.join(process.cwd(), 'attached_assets', 'WhatsApp Video 2025-07-09 at 21.09.20_7666dc3b_1752133737311.mp4');
      const stat = await fs.stat(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      // Set proper headers for video streaming
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Cache-Control', 'public, max-age=31536000');

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;

        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        res.setHeader('Content-Length', chunksize);

        // Stream the video chunk
        const fileBuffer = await fs.readFile(videoPath);
        res.end(fileBuffer.slice(start, end + 1));
      } else {
        res.setHeader('Content-Length', fileSize);
        const fileBuffer = await fs.readFile(videoPath);
        res.end(fileBuffer);
      }
    } catch (error) {
      console.error('Error serving demo video:', error);
      res.status(404).json({ error: 'Video not found' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}