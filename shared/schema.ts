import { z } from "zod";

export const homeownerSchema = z.object({
  id: z.string(),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  isRegistered: z.boolean().default(false),
  notificationPreference: z.enum(["email", "phone", "both"]).default("email"),
  createdAt: z.date(),
  qrUrl: z.string(),
  pitchUrl: z.string(),
});

// New schema for salesman accounts
export const salesmanSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().optional(),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  isVerified: z.boolean().default(false),
  totalScans: z.number().default(0),
  createdAt: z.date(),
  lastScanAt: z.date().optional(),
});

// Schema for tracking scans
export const scanTrackingSchema = z.object({
  id: z.string(),
  salesmanId: z.string(),
  homeownerId: z.string(),
  scannedAt: z.date(),
  location: z.string().optional(),
});

export const pitchSchema = z.object({
  id: z.string(),
  homeownerId: z.string(),
  visitorName: z.string().min(1, "Visitor name is required"),
  company: z.string().optional(),
  offer: z.string().min(1, "Offer is required"),
  reason: z.string().min(1, "Reason is required"),
  visitorEmail: z.string().email().optional().or(z.literal("")),
  visitorPhone: z.string().optional(),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  userType: z.enum(["homeowner", "service_provider"]).default("service_provider"),
  createdAt: z.date(),
  // Audio/Speech fields
  audioUrl: z.string().optional(),
  audioFileName: z.string().optional(),
  audioTranscript: z.string().optional(),
  audioConfidence: z.number().optional(),
  audioLanguage: z.string().optional(),
  // AI Analysis fields
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
  sentimentConfidence: z.number().optional(),
  aiSummary: z.string().optional(),
  detectedBusinessType: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high']).optional(),
  categories: z.array(z.string()).optional(),
  isSpam: z.boolean().optional(),
  aiProcessed: z.boolean().default(false),
});

export const insertHomeownerSchema = homeownerSchema.pick({
  fullName: true,
  email: true,
  phone: true,
  notificationPreference: true,
});

export const insertSalesmanSchema = salesmanSchema.pick({
  firstName: true,
  lastName: true,
  businessName: true,
  businessType: true,
  email: true,
  phone: true,
});

export const insertScanTrackingSchema = scanTrackingSchema.pick({
  salesmanId: true,
  homeownerId: true,
  location: true,
});

export const insertPitchSchema = pitchSchema.pick({
  homeownerId: true,
  visitorName: true,
  company: true,
  offer: true,
  reason: true,
  visitorEmail: true,
  visitorPhone: true,
  fileName: true,
  audioFileName: true,
  userType: true,
});

export type Homeowner = z.infer<typeof homeownerSchema>;
export type Pitch = z.infer<typeof pitchSchema>;
export type Salesman = z.infer<typeof salesmanSchema>;
export type ScanTracking = z.infer<typeof scanTrackingSchema>;
export type InsertHomeowner = z.infer<typeof insertHomeownerSchema>;
export type InsertPitch = z.infer<typeof insertPitchSchema>;
export type InsertSalesman = z.infer<typeof insertSalesmanSchema>;
export type InsertScanTracking = z.infer<typeof insertScanTrackingSchema>;
