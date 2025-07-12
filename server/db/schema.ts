import { pgTable, text, timestamp, boolean, integer, real, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const homeowners = pgTable('homeowners', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  password: text('password').notNull(),
  isRegistered: boolean('is_registered').default(false).notNull(),
  notificationPreference: text('notification_preference', { enum: ['email', 'phone', 'both'] }).default('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  qrUrl: text('qr_url').notNull(),
  pitchUrl: text('pitch_url').notNull(),
});

export const salesmen = pgTable('salesmen', {
  id: text('id').primaryKey(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  businessName: text('business_name'),
  businessType: text('business_type'),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  password: text('password').notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  profileCompleted: boolean('profile_completed').default(false).notNull(),
  totalScans: integer('total_scans').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastScanAt: timestamp('last_scan_at'),
});

export const scanTracking = pgTable('scan_tracking', {
  id: text('id').primaryKey(),
  salesmanId: text('salesman_id').notNull().references(() => salesmen.id),
  homeownerId: text('homeowner_id').notNull().references(() => homeowners.id),
  scannedAt: timestamp('scanned_at').defaultNow().notNull(),
  location: text('location'),
});

export const pitches = pgTable('pitches', {
  id: text('id').primaryKey(),
  homeownerId: text('homeowner_id').notNull().references(() => homeowners.id),
  visitorName: text('visitor_name').notNull(),
  company: text('company'),
  offer: text('offer').notNull(),
  reason: text('reason').notNull(),
  visitorEmail: text('visitor_email'),
  visitorPhone: text('visitor_phone'),
  fileUrl: text('file_url'),
  fileName: text('file_name'),
  userType: text('user_type', { enum: ['homeowner', 'service_provider'] }).default('service_provider').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  
  // AI Analysis fields
  sentiment: text('sentiment', { enum: ['positive', 'neutral', 'negative'] }),
  sentimentConfidence: real('sentiment_confidence'),
  aiSummary: text('ai_summary'),
  detectedBusinessType: text('detected_business_type'),
  urgency: text('urgency', { enum: ['low', 'medium', 'high'] }),
  categories: jsonb('categories').$type<string[]>(),
  isSpam: boolean('is_spam'),
  aiProcessed: boolean('ai_processed').default(false).notNull(),
  
  // Hidden AI features with obfuscated field names
  matchLvl: real('match_lvl'), // Duplicate detection score
  sFlag: real('s_flag'), // Sentiment analysis score
  iTag: text('i_tag'), // Intent detection result
  uScore: real('u_score'), // Urgency detection score
  kMeta: text('k_meta'), // Keywords as JSON string
  xtext: text('xtext'), // OCR extracted text
  rscore: real('rscore'), // Repeated pattern match percentage
  clickT: real('click_t'), // Click timing analysis
  bProb: real('b_prob'), // Bot probability score
  nPred: text('n_pred'), // Next action prediction
  cProb: real('c_prob'), // Conversion probability
});

// Insert schemas for validation
export const insertHomeownerSchema = createInsertSchema(homeowners).omit({
  id: true,
  createdAt: true,
  qrUrl: true,
  pitchUrl: true,
});

export const insertSalesmanSchema = createInsertSchema(salesmen).omit({
  id: true,
  createdAt: true,
  totalScans: true,
  lastScanAt: true,
  isVerified: true,
});

export const insertScanTrackingSchema = createInsertSchema(scanTracking).omit({
  id: true,
  scannedAt: true,
});

export const insertPitchSchema = createInsertSchema(pitches).omit({
  id: true,
  createdAt: true,
  sentiment: true,
  sentimentConfidence: true,
  aiSummary: true,
  detectedBusinessType: true,
  urgency: true,
  categories: true,
  isSpam: true,
  aiProcessed: true,
  matchLvl: true,
  sFlag: true,
  iTag: true,
  uScore: true,
  kMeta: true,
  xtext: true,
  rscore: true,
  clickT: true,
  bProb: true,
  nPred: true,
  cProb: true,
});

// Types
export type Homeowner = typeof homeowners.$inferSelect;
export type Salesman = typeof salesmen.$inferSelect;
export type ScanTracking = typeof scanTracking.$inferSelect;
export type Pitch = typeof pitches.$inferSelect;
export type InsertHomeowner = typeof homeowners.$inferInsert;
export type InsertSalesman = typeof salesmen.$inferInsert;
export type InsertScanTracking = typeof scanTracking.$inferInsert;
export type InsertPitch = typeof pitches.$inferInsert;