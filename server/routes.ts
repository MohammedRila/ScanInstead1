import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHomeownerSchema, insertPitchSchema, insertSalesmanSchema, insertScanTrackingSchema } from "@shared/schema";
import { generateQRCode } from "./services/qr";
import { sendPitchEmail } from "./services/email";
import { sendPitchSMS } from "./services/sms";
import { uploadToFirebase } from "./services/firebase";
import { analyzePitch } from "./services/ai";
import { convertSpeechToText, isAudioFile } from "./services/speech";
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
      // Audio (for voice pitches)
      'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mpeg'
    ];
    
    const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|bmp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|mp4|avi|mov|wmv|mp3|wav|m4a)$/i;
    
    const hasValidMimeType = allowedMimeTypes.includes(file.mimetype);
    const hasValidExtension = allowedExtensions.test(file.originalname);
    
    if (hasValidMimeType && hasValidExtension) {
      return cb(null, true);
    } else {
      cb(new Error('File type not supported. Please upload images, documents (PDF, Word, Excel, PowerPoint), videos, or audio files.'));
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

  // Get pitches for homeowner
  app.get("/api/homeowner/:id/pitches", async (req, res) => {
    try {
      const pitches = await storage.getPitchesByHomeowner(req.params.id);
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
      let audioUrl: string | undefined;
      let audioFileName: string | undefined;
      let audioTranscript: string | undefined;
      let audioConfidence: number | undefined;
      let audioLanguage: string | undefined;

      // Upload file to Firebase Storage if provided
      if (req.file) {
        try {
          fileUrl = await uploadToFirebase(req.file);
          fileName = req.file.originalname;
          
          // Check if the uploaded file is an audio file
          if (isAudioFile(req.file.mimetype)) {
            audioUrl = fileUrl;
            audioFileName = fileName;
            
            // Convert speech to text
            try {
              console.log('Converting audio to text...');
              const speechResult = await convertSpeechToText(req.file);
              audioTranscript = speechResult.transcript;
              audioConfidence = speechResult.confidence;
              audioLanguage = speechResult.languageCode;
              
              console.log('Speech-to-text conversion successful:', {
                transcript: audioTranscript,
                confidence: audioConfidence,
                language: audioLanguage
              });
            } catch (speechError) {
              console.error('Speech-to-text conversion failed:', speechError);
              // Continue without speech-to-text if it fails
            }
          }
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
        audioFileName: audioFileName || "",
      };

      const validatedData = insertPitchSchema.parse(pitchData);
      
      // Perform AI analysis on the pitch content
      let aiAnalysis;
      try {
        // Include audio transcript in the analysis if available
        const pitchContent = `${validatedData.offer} ${validatedData.reason}${audioTranscript ? ` Audio: ${audioTranscript}` : ''}`;
        const businessName = validatedData.company || 'Unknown Business';
        aiAnalysis = await analyzePitch(pitchContent, businessName);
        console.log('AI Analysis completed:', aiAnalysis);
      } catch (aiError) {
        console.error('AI Analysis failed:', aiError);
        // Continue without AI analysis if it fails
      }
      
      // Build pitch object with all data
      const pitchWithData = {
        ...validatedData,
        ...(fileUrl && { fileUrl }),
        ...(audioUrl && { audioUrl }),
        ...(audioTranscript && { audioTranscript }),
        ...(audioConfidence && { audioConfidence }),
        ...(audioLanguage && { audioLanguage }),
        aiAnalysis
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
      
      res.json({
        success: true,
        message: 'Homeowner registered successfully',
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
      
      res.json({
        success: true,
        message: 'Salesman registered successfully',
        salesman,
      });
    } catch (error) {
      console.error('Error registering salesman:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to register salesman',
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

  const httpServer = createServer(app);
  return httpServer;
}
