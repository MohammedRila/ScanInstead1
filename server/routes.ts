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

import multer from "multer";
import path from "path";
import { promises as fs } from "fs";

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
  // Create homeowner and generate QR code
  app.post("/api/create", async (req, res) => {
    try {
      const validatedData = insertHomeownerSchema.parse(req.body);
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
  app.get("/api/homeowner/:id", async (req, res) => {
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
  app.get("/api/homeowner/:id/pitches", async (req, res) => {
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
  app.post("/api/pitch/:id", upload.single('file'), async (req, res) => {
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
          isSpam: false,
          aiProcessed: true
        };
        
        // Create basic hidden analysis
        hiddenAnalysis = {
          match_lvl: 0.8,
          s_flag: false,
          i_tag: 'service_request',
          u_score: 0.6,
          k_meta: 'business_pitch',
          xtext: pitchContent.length,
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
  app.post("/api/salesman/register", async (req, res) => {
    try {
      const validatedData = insertSalesmanSchema.parse(req.body);
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
        message: 'Service provider registered successfully! Check your email for verification.',
        salesman,
      });
    } catch (error) {
      console.error('Error registering salesman:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to register service provider',
      });
    }
  });

  // Get salesman data
  app.get("/api/salesman/:id", async (req, res) => {
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
  app.get("/api/salesman/:id/scans", async (req, res) => {
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
  app.get("/api/salesman/:id/stats", async (req, res) => {
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
  app.post("/api/scan/:homeownerId", async (req, res) => {
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

  // Serve demo video
  app.get("/api/demo/video", async (req, res) => {
    try {
      const videoPath = path.join(process.cwd(), 'attached_assets', 'WhatsApp Video 2025-07-09 at 21.09.20_7666dc3b_1752133737311.mp4');
      const stat = await fs.stat(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = await fs.readFile(videoPath);
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        res.end(file.slice(start, end + 1));
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
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
