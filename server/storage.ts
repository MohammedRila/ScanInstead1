import { 
  type Homeowner, 
  type Pitch, 
  type Salesman, 
  type ScanTracking,
  type InsertHomeowner, 
  type InsertPitch,
  type InsertSalesman,
  type InsertScanTracking 
} from "@shared/schema";
import { db } from "./db";
import { homeowners, pitches, salesmen, scanTracking } from "./db/schema";
import { eq, and, desc, gte, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from "uuid";

export interface IStorage {
  createHomeowner(homeowner: InsertHomeowner): Promise<Homeowner>;
  getHomeowner(id: string): Promise<Homeowner | undefined>;
  getHomeownerByEmail(email: string): Promise<Homeowner | undefined>;
  registerHomeowner(id: string, data: InsertHomeowner): Promise<Homeowner>;
  createHomeownerAuth(auth: { fullName: string; email: string; password: string; phone?: string; notificationPreference?: "email" | "phone" | "both" }): Promise<Homeowner>;
  createPitch(pitch: InsertPitch & { fileUrl?: string }): Promise<Pitch>;
  getPitchesByHomeowner(homeownerId: string): Promise<Pitch[]>;
  createSalesman(salesman: InsertSalesman): Promise<Salesman>;
  createSalesmanAuth(auth: { email: string; password: string }): Promise<Salesman>;
  updateSalesmanProfile(id: string, profile: { firstName: string; lastName: string; businessName: string; businessType?: string; phone?: string }): Promise<Salesman>;
  getSalesman(id: string): Promise<Salesman | undefined>;
  getSalesmanByEmail(email: string): Promise<Salesman | undefined>;
  verifySalesman(id: string): Promise<void>;
  updateSalesmanScans(id: string): Promise<void>;
  createScanTracking(scan: InsertScanTracking): Promise<ScanTracking>;
  getScansByHomeowner(homeownerId: string): Promise<ScanTracking[]>;
  getScansBySalesman(salesmanId: string): Promise<ScanTracking[]>;
  getSalesmanStats(salesmanId: string): Promise<{ todayScans: number; weekScans: number; monthScans: number; }>;
}

export class SupabaseStorage implements IStorage {
  async createHomeowner(insertHomeowner: InsertHomeowner): Promise<Homeowner> {
    const id = uuidv4();
    // Priority: REPLIT_DOMAINS > auto-generated Replit URL > BASE_URL > localhost fallback
    let baseUrl = '';
    let protocol = 'https';
    
    // Check for Replit domains first
    const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
    if (replitDomain) {
      baseUrl = replitDomain;
      protocol = 'https';
    } else {
      // Generate Replit URL based on REPL_SLUG and REPL_OWNER
      const replSlug = process.env.REPL_SLUG;
      const replOwner = process.env.REPL_OWNER;
      if (replSlug && replOwner) {
        baseUrl = `${replSlug}--${replOwner}.replit.app`;
        protocol = 'https';
      } else {
        // Try to detect from request headers or use a hardcoded replit domain
        const replitSubdomain = process.env.REPLIT_SUBDOMAIN;
        const replitCluster = process.env.REPLIT_CLUSTER;
        if (replitSubdomain && replitCluster) {
          baseUrl = `${replitSubdomain}.${replitCluster}.replit.dev`;
          protocol = 'https';
        } else if (process.env.BASE_URL && process.env.BASE_URL !== 'w') {
          // Use BASE_URL only if it's not the malformed "w" value
          baseUrl = process.env.BASE_URL.replace(/^https?:\/\//, '');
        } else {
          // Final fallback to replit.app
          baseUrl = 'replit.app';
          protocol = 'https';
        }
      }
    }
    
    const pitchUrl = `${protocol}://${baseUrl}/v/${id}`;
    
    // Log the generated URL for debugging
    console.log(`Generated pitch URL: ${pitchUrl}`);
    
    const homeowner: Homeowner = {
      ...insertHomeowner,
      id,
      createdAt: new Date(),
      qrUrl: "", // Will be set after QR generation
      pitchUrl,
      isRegistered: false,
      notificationPreference: insertHomeowner.notificationPreference || "email",
    };

    await db.insert(homeowners).values({
      id: homeowner.id,
      fullName: homeowner.fullName,
      email: homeowner.email,
      phone: homeowner.phone,
      isRegistered: homeowner.isRegistered,
      notificationPreference: homeowner.notificationPreference,
      createdAt: homeowner.createdAt,
      qrUrl: homeowner.qrUrl,
      pitchUrl: homeowner.pitchUrl,
    });

    return homeowner;
  }

  async getHomeowner(id: string): Promise<Homeowner | undefined> {
    const result = await db.select().from(homeowners).where(eq(homeowners.id, id)).limit(1);
    const homeowner = result[0];
    if (!homeowner) return undefined;
    
    return {
      ...homeowner,
      phone: homeowner.phone || undefined,
    };
  }

  async getHomeownerByEmail(email: string): Promise<Homeowner | undefined> {
    const result = await db.select().from(homeowners).where(eq(homeowners.email, email)).limit(1);
    const homeowner = result[0];
    if (!homeowner) return undefined;
    
    return {
      ...homeowner,
      phone: homeowner.phone || undefined,
    };
  }

  async createPitch(pitchData: InsertPitch & { fileUrl?: string; aiAnalysis?: any; hiddenAnalysis?: any }): Promise<Pitch> {
    const id = uuidv4();
    const createdAt = new Date();
    
    const pitch: Pitch = {
      ...pitchData,
      id,
      createdAt,
      // AI Analysis fields
      sentiment: pitchData.aiAnalysis?.sentiment,
      sentimentConfidence: pitchData.aiAnalysis?.confidence,
      aiSummary: pitchData.aiAnalysis?.summary,
      detectedBusinessType: pitchData.aiAnalysis?.businessType,
      urgency: pitchData.aiAnalysis?.urgency,
      categories: pitchData.aiAnalysis?.categories,
      isSpam: pitchData.aiAnalysis?.isSpam,
      aiProcessed: !!pitchData.aiAnalysis,
      // Hidden analysis fields with obfuscated names
      match_lvl: pitchData.hiddenAnalysis?.match_lvl,
      s_flag: pitchData.hiddenAnalysis?.s_flag,
      i_tag: pitchData.hiddenAnalysis?.i_tag,
      u_score: pitchData.hiddenAnalysis?.u_score,
      k_meta: pitchData.hiddenAnalysis?.k_meta,
      xtext: pitchData.hiddenAnalysis?.xtext,
      rscore: pitchData.hiddenAnalysis?.rscore,
      clickT: pitchData.hiddenAnalysis?.clickT,
      b_prob: pitchData.hiddenAnalysis?.b_prob,
      n_pred: pitchData.hiddenAnalysis?.n_pred,
      c_prob: pitchData.hiddenAnalysis?.c_prob,
    };

    await db.insert(pitches).values({
      id: pitch.id,
      homeownerId: pitch.homeownerId,
      visitorName: pitch.visitorName,
      company: pitch.company,
      offer: pitch.offer,
      reason: pitch.reason,
      visitorEmail: pitch.visitorEmail,
      visitorPhone: pitch.visitorPhone,
      fileUrl: pitch.fileUrl,
      fileName: pitch.fileName,
      userType: pitch.userType,
      createdAt: pitch.createdAt,
      sentiment: pitch.sentiment,
      sentimentConfidence: pitch.sentimentConfidence,
      aiSummary: pitch.aiSummary,
      detectedBusinessType: pitch.detectedBusinessType,
      urgency: pitch.urgency,
      categories: pitch.categories,
      isSpam: pitch.isSpam,
      aiProcessed: pitch.aiProcessed,
      matchLvl: pitch.match_lvl,
      sFlag: pitch.s_flag,
      iTag: pitch.i_tag,
      uScore: pitch.u_score,
      kMeta: pitch.k_meta,
      xtext: pitch.xtext,
      rscore: pitch.rscore,
      clickT: pitch.clickT,
      bProb: pitch.b_prob,
      nPred: pitch.n_pred,
      cProb: pitch.c_prob,
    });

    return pitch;
  }

  async getPitchesByHomeowner(homeownerId: string): Promise<Pitch[]> {
    const result = await db.select().from(pitches)
      .where(eq(pitches.homeownerId, homeownerId))
      .orderBy(desc(pitches.createdAt));
    
    return result.map(pitch => ({
      ...pitch,
      company: pitch.company || undefined,
      visitorEmail: pitch.visitorEmail || undefined,
      visitorPhone: pitch.visitorPhone || undefined,
      fileUrl: pitch.fileUrl || undefined,
      fileName: pitch.fileName || undefined,
      sentiment: pitch.sentiment || undefined,
      sentimentConfidence: pitch.sentimentConfidence || undefined,
      aiSummary: pitch.aiSummary || undefined,
      detectedBusinessType: pitch.detectedBusinessType || undefined,
      urgency: pitch.urgency || undefined,
      categories: pitch.categories || undefined,
      isSpam: pitch.isSpam || undefined,
      // Map database fields to schema fields
      match_lvl: pitch.matchLvl || undefined,
      s_flag: pitch.sFlag || undefined,
      i_tag: pitch.iTag || undefined,
      u_score: pitch.uScore || undefined,
      k_meta: pitch.kMeta || undefined,
      xtext: pitch.xtext || undefined,
      rscore: pitch.rscore || undefined,
      clickT: pitch.clickT || undefined,
      b_prob: pitch.bProb || undefined,
      n_pred: pitch.nPred || undefined,
      c_prob: pitch.cProb || undefined,
    }));
  }

  async registerHomeowner(id: string, data: InsertHomeowner): Promise<Homeowner> {
    let createdAt: Date;
    
    // Check if homeowner already exists
    const existingHomeowner = await this.getHomeowner(id);
    if (existingHomeowner) {
      // Update existing homeowner
      await db.update(homeowners)
        .set({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          isRegistered: true,
          notificationPreference: data.notificationPreference || "email",
        })
        .where(eq(homeowners.id, id));
      
      createdAt = existingHomeowner.createdAt;
    } else {
      // Create new homeowner if not exists
      const newHomeowner = await this.createHomeowner(data);
      createdAt = newHomeowner.createdAt;
    }

    const updatedHomeowner = await this.getHomeowner(id);
    return updatedHomeowner!;
  }

  async createSalesman(insertSalesman: InsertSalesman): Promise<Salesman> {
    const id = uuidv4();
    const createdAt = new Date();
    
    const salesman: Salesman = {
      ...insertSalesman,
      id,
      createdAt,
      isVerified: false,
      profileCompleted: false,
      totalScans: 0,
      lastScanAt: undefined,
    };

    await db.insert(salesmen).values({
      id: salesman.id,
      firstName: salesman.firstName,
      lastName: salesman.lastName,
      businessName: salesman.businessName,
      businessType: salesman.businessType,
      email: salesman.email,
      phone: salesman.phone,
      password: salesman.password,
      isVerified: salesman.isVerified,
      profileCompleted: salesman.profileCompleted,
      totalScans: salesman.totalScans,
      createdAt: salesman.createdAt,
      lastScanAt: salesman.lastScanAt,
    });

    return salesman;
  }

  async createHomeownerAuth(auth: { fullName: string; email: string; password: string; phone?: string; notificationPreference?: "email" | "phone" | "both" }): Promise<Homeowner> {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(auth.password, 10);
    const id = uuidv4();
    
    // Generate QR code URLs (same logic as createHomeowner)
    let baseUrl = '';
    let protocol = 'https';
    
    const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
    if (replitDomain) {
      baseUrl = replitDomain;
      protocol = 'https';
    } else {
      const replSlug = process.env.REPL_SLUG;
      const replOwner = process.env.REPL_OWNER;
      if (replSlug && replOwner) {
        baseUrl = `${replSlug}--${replOwner}.replit.app`;
        protocol = 'https';
      } else {
        baseUrl = process.env.BASE_URL || 'localhost:5000';
        protocol = baseUrl.includes('localhost') ? 'http' : 'https';
      }
    }

    const qrUrl = `${protocol}://${baseUrl}/v/${id}`;
    const pitchUrl = `${protocol}://${baseUrl}/v/${id}`;

    const homeowner: Homeowner = {
      id,
      fullName: auth.fullName,
      email: auth.email,
      phone: auth.phone,
      password: hashedPassword,
      isRegistered: true,
      notificationPreference: auth.notificationPreference || "email",
      createdAt: new Date(),
      qrUrl,
      pitchUrl,
    };

    await db.insert(homeowners).values(homeowner);
    return homeowner;
  }

  async createSalesmanAuth(auth: { email: string; password: string }): Promise<Salesman> {
    const id = uuidv4();
    const createdAt = new Date();
    
    const salesman: Salesman = {
      id,
      email: auth.email,
      password: auth.password,
      firstName: undefined,
      lastName: undefined,
      businessName: undefined,
      businessType: undefined,
      phone: undefined,
      isVerified: false,
      profileCompleted: false,
      totalScans: 0,
      createdAt,
      lastScanAt: undefined,
    };

    await db.insert(salesmen).values({
      id: salesman.id,
      email: salesman.email,
      password: salesman.password,
      firstName: salesman.firstName,
      lastName: salesman.lastName,
      businessName: salesman.businessName,
      businessType: salesman.businessType,
      phone: salesman.phone,
      isVerified: salesman.isVerified,
      profileCompleted: salesman.profileCompleted,
      totalScans: salesman.totalScans,
      createdAt: salesman.createdAt,
      lastScanAt: salesman.lastScanAt,
    });

    return salesman;
  }

  async updateSalesmanProfile(id: string, profile: { firstName: string; lastName: string; businessName: string; businessType?: string; phone?: string }): Promise<Salesman> {
    await db.update(salesmen)
      .set({
        firstName: profile.firstName,
        lastName: profile.lastName,
        businessName: profile.businessName,
        businessType: profile.businessType,
        phone: profile.phone,
        profileCompleted: true,
      })
      .where(eq(salesmen.id, id));

    const updatedSalesman = await this.getSalesman(id);
    return updatedSalesman!;
  }

  async getSalesman(id: string): Promise<Salesman | undefined> {
    const result = await db.select().from(salesmen).where(eq(salesmen.id, id)).limit(1);
    const salesman = result[0];
    if (!salesman) return undefined;
    
    return {
      ...salesman,
      phone: salesman.phone || undefined,
      businessType: salesman.businessType || undefined,
      lastScanAt: salesman.lastScanAt || undefined,
    };
  }

  async getSalesmanByEmail(email: string): Promise<Salesman | undefined> {
    const result = await db.select().from(salesmen).where(eq(salesmen.email, email)).limit(1);
    const salesman = result[0];
    if (!salesman) return undefined;
    
    return {
      ...salesman,
      phone: salesman.phone || undefined,
      businessType: salesman.businessType || undefined,
      lastScanAt: salesman.lastScanAt || undefined,
    };
  }

  async verifySalesman(id: string): Promise<void> {
    await db.update(salesmen)
      .set({ isVerified: true })
      .where(eq(salesmen.id, id));
  }

  async updateSalesmanScans(id: string): Promise<void> {
    await db.update(salesmen)
      .set({ 
        totalScans: sql`${salesmen.totalScans} + 1`,
        lastScanAt: new Date()
      })
      .where(eq(salesmen.id, id));
  }

  async createScanTracking(insertScan: InsertScanTracking): Promise<ScanTracking> {
    const id = uuidv4();
    const scannedAt = new Date();
    
    const scan: ScanTracking = {
      ...insertScan,
      id,
      scannedAt,
    };

    await db.insert(scanTracking).values({
      id: scan.id,
      salesmanId: scan.salesmanId,
      homeownerId: scan.homeownerId,
      scannedAt: scan.scannedAt,
      location: scan.location,
    });

    return scan;
  }

  async getScansByHomeowner(homeownerId: string): Promise<ScanTracking[]> {
    const result = await db.select().from(scanTracking)
      .where(eq(scanTracking.homeownerId, homeownerId))
      .orderBy(desc(scanTracking.scannedAt));
    
    return result.map(scan => ({
      ...scan,
      location: scan.location || undefined,
    }));
  }

  async getScansBySalesman(salesmanId: string): Promise<ScanTracking[]> {
    const result = await db.select().from(scanTracking)
      .where(eq(scanTracking.salesmanId, salesmanId))
      .orderBy(desc(scanTracking.scannedAt));
    
    return result.map(scan => ({
      ...scan,
      location: scan.location || undefined,
    }));
  }

  async getSalesmanStats(salesmanId: string): Promise<{ todayScans: number; weekScans: number; monthScans: number; }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [todayResult, weekResult, monthResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(scanTracking)
        .where(and(
          eq(scanTracking.salesmanId, salesmanId),
          gte(scanTracking.scannedAt, today)
        )),
      db.select({ count: sql<number>`count(*)` }).from(scanTracking)
        .where(and(
          eq(scanTracking.salesmanId, salesmanId),
          gte(scanTracking.scannedAt, weekAgo)
        )),
      db.select({ count: sql<number>`count(*)` }).from(scanTracking)
        .where(and(
          eq(scanTracking.salesmanId, salesmanId),
          gte(scanTracking.scannedAt, monthAgo)
        ))
    ]);

    return {
      todayScans: todayResult[0]?.count || 0,
      weekScans: weekResult[0]?.count || 0,
      monthScans: monthResult[0]?.count || 0,
    };
  }
}

export const storage = new SupabaseStorage();