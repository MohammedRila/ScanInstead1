import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHomeownerSchema, insertPitchSchema } from "@shared/schema";
import { generateQRCode } from "./services/qr";
import { sendPitchEmail } from "./services/email";
import { sendPitchSMS } from "./services/sms";
import { uploadToFirebase } from "./services/firebase";
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

      // Upload file to Firebase Storage if provided
      if (req.file) {
        try {
          fileUrl = await uploadToFirebase(req.file);
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
      
      // Only include fileUrl if it exists
      const pitchWithFile = fileUrl ? { ...validatedData, fileUrl } : validatedData;
      const pitch = await storage.createPitch(pitchWithFile);

      // Send email notification
      try {
        await sendPitchEmail(homeowner, pitch);
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

  const httpServer = createServer(app);
  return httpServer;
}
