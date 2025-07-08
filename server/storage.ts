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
import { db } from "./services/firebase";
import { v4 as uuidv4 } from "uuid";

export interface IStorage {
  createHomeowner(homeowner: InsertHomeowner): Promise<Homeowner>;
  getHomeowner(id: string): Promise<Homeowner | undefined>;
  registerHomeowner(id: string, data: InsertHomeowner): Promise<Homeowner>;
  createPitch(pitch: InsertPitch & { fileUrl?: string }): Promise<Pitch>;
  getPitchesByHomeowner(homeownerId: string): Promise<Pitch[]>;
  createSalesman(salesman: InsertSalesman): Promise<Salesman>;
  getSalesman(id: string): Promise<Salesman | undefined>;
  updateSalesmanScans(id: string): Promise<void>;
  createScanTracking(scan: InsertScanTracking): Promise<ScanTracking>;
  getScansByHomeowner(homeownerId: string): Promise<ScanTracking[]>;
  getScansBySalesman(salesmanId: string): Promise<ScanTracking[]>;
  getSalesmanStats(salesmanId: string): Promise<{ todayScans: number; weekScans: number; monthScans: number; }>;
}

export class FirebaseStorage implements IStorage {
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
      } else if (process.env.BASE_URL && process.env.BASE_URL !== 'w') {
        // Use BASE_URL only if it's not the malformed "w" value
        baseUrl = process.env.BASE_URL.replace(/^https?:\/\//, '');
      } else {
        // Final fallback to localhost
        baseUrl = 'localhost:5000';
        protocol = 'http';
      }
    }
    
    const pitchUrl = `${protocol}://${baseUrl}/l/${id}`;
    
    // Log the generated URL for debugging
    console.log(`Generated pitch URL: ${pitchUrl}`);
    
    const homeowner: Homeowner = {
      ...insertHomeowner,
      id,
      createdAt: new Date(),
      qrUrl: "", // Will be set after QR generation
      pitchUrl,
      isRegistered: false,
      notificationPreference: "email",
    };

    await db.collection('homeowners').doc(id).set({
      ...homeowner,
      createdAt: homeowner.createdAt.toISOString(),
    });

    return homeowner;
  }

  async getHomeowner(id: string): Promise<Homeowner | undefined> {
    const doc = await db.collection('homeowners').doc(id).get();
    if (!doc.exists) {
      return undefined;
    }

    const data = doc.data();
    if (!data) {
      return undefined;
    }

    return {
      ...data,
      createdAt: new Date(data.createdAt),
    } as Homeowner;
  }

  async createPitch(pitchData: InsertPitch & { fileUrl?: string; aiAnalysis?: any }): Promise<Pitch> {
    const id = uuidv4();
    
    // Create clean data object for Firestore without undefined values
    const firestoreData: any = {
      id,
      homeownerId: pitchData.homeownerId,
      visitorName: pitchData.visitorName,
      offer: pitchData.offer,
      reason: pitchData.reason,
      createdAt: new Date().toISOString(),
    };

    // Only add optional fields if they have values and are not empty strings
    if (pitchData.company && pitchData.company.trim()) {
      firestoreData.company = pitchData.company;
    }
    if (pitchData.visitorEmail && pitchData.visitorEmail.trim()) {
      firestoreData.visitorEmail = pitchData.visitorEmail;
    }
    if (pitchData.visitorPhone && pitchData.visitorPhone.trim()) {
      firestoreData.visitorPhone = pitchData.visitorPhone;
    }
    if (pitchData.fileUrl && pitchData.fileUrl.trim()) {
      firestoreData.fileUrl = pitchData.fileUrl;
    }
    if (pitchData.fileName && pitchData.fileName.trim()) {
      firestoreData.fileName = pitchData.fileName;
    }
    if (pitchData.userType) {
      firestoreData.userType = pitchData.userType;
    }

    // Add AI analysis fields if available
    if (pitchData.aiAnalysis) {
      firestoreData.sentiment = pitchData.aiAnalysis.sentiment;
      firestoreData.sentimentConfidence = pitchData.aiAnalysis.confidence;
      firestoreData.aiSummary = pitchData.aiAnalysis.summary;
      firestoreData.detectedBusinessType = pitchData.aiAnalysis.businessType;
      firestoreData.urgency = pitchData.aiAnalysis.urgency;
      firestoreData.categories = pitchData.aiAnalysis.categories;
      firestoreData.isSpam = pitchData.aiAnalysis.isSpam;
      firestoreData.aiProcessed = true;
    }

    await db.collection('pitches').doc(id).set(firestoreData);

    // Return the pitch object with proper typing
    const pitch: Pitch = {
      id,
      homeownerId: pitchData.homeownerId,
      visitorName: pitchData.visitorName,
      company: pitchData.company,
      offer: pitchData.offer,
      reason: pitchData.reason,
      visitorEmail: pitchData.visitorEmail,
      visitorPhone: pitchData.visitorPhone,
      fileUrl: pitchData.fileUrl,
      fileName: pitchData.fileName,
      userType: pitchData.userType || "service_provider",
      createdAt: new Date(firestoreData.createdAt),
      // AI Analysis fields
      sentiment: pitchData.aiAnalysis?.sentiment,
      sentimentConfidence: pitchData.aiAnalysis?.confidence,
      aiSummary: pitchData.aiAnalysis?.summary,
      detectedBusinessType: pitchData.aiAnalysis?.businessType,
      urgency: pitchData.aiAnalysis?.urgency,
      categories: pitchData.aiAnalysis?.categories,
      isSpam: pitchData.aiAnalysis?.isSpam,
      aiProcessed: !!pitchData.aiAnalysis,
    };

    return pitch;
  }

  async getPitchesByHomeowner(homeownerId: string): Promise<Pitch[]> {
    const snapshot = await db.collection('pitches')
      .where('homeownerId', '==', homeownerId)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: new Date(data.createdAt),
      } as Pitch;
    });
  }

  async registerHomeowner(id: string, data: InsertHomeowner): Promise<Homeowner> {
    const homeownerRef = db.collection('homeowners').doc(id);
    const doc = await homeownerRef.get();
    
    if (!doc.exists) {
      throw new Error('Homeowner not found');
    }

    const existingData = doc.data();
    if (!existingData) {
      throw new Error('Invalid homeowner data');
    }

    const updatedData = {
      ...existingData,
      ...data,
      isRegistered: true,
      updatedAt: new Date(),
    };

    await homeownerRef.update(updatedData);

    // Handle timestamp conversion properly
    let createdAt: Date;
    if (existingData.createdAt && typeof existingData.createdAt.toDate === 'function') {
      createdAt = existingData.createdAt.toDate();
    } else if (existingData.createdAt instanceof Date) {
      createdAt = existingData.createdAt;
    } else {
      createdAt = new Date(existingData.createdAt);
    }

    return {
      id,
      fullName: updatedData.fullName,
      email: updatedData.email,
      phone: updatedData.phone,
      isRegistered: true,
      notificationPreference: updatedData.notificationPreference,
      createdAt,
      qrUrl: existingData.qrUrl,
      pitchUrl: existingData.pitchUrl,
    };
  }

  async createSalesman(insertSalesman: InsertSalesman): Promise<Salesman> {
    const id = uuidv4();
    const createdAt = new Date();
    
    const salesman: Salesman = {
      ...insertSalesman,
      id,
      isVerified: false,
      totalScans: 0,
      createdAt,
    };

    await db.collection('salesmen').doc(id).set({
      ...salesman,
      createdAt,
    });

    return salesman;
  }

  async getSalesman(id: string): Promise<Salesman | undefined> {
    const doc = await db.collection('salesmen').doc(id).get();
    if (!doc.exists) return undefined;
    
    const data = doc.data();
    return {
      id: doc.id,
      firstName: data.firstName,
      lastName: data.lastName,
      businessName: data.businessName,
      businessType: data.businessType,
      email: data.email,
      phone: data.phone,
      isVerified: data.isVerified,
      totalScans: data.totalScans,
      createdAt: data.createdAt.toDate(),
      lastScanAt: data.lastScanAt?.toDate(),
    };
  }

  async updateSalesmanScans(id: string): Promise<void> {
    const { FieldValue } = await import('firebase-admin/firestore');
    await db.collection('salesmen').doc(id).update({
      totalScans: FieldValue.increment(1),
      lastScanAt: new Date(),
    });
  }

  async createScanTracking(insertScan: InsertScanTracking): Promise<ScanTracking> {
    const id = uuidv4();
    const scannedAt = new Date();
    
    const scan: ScanTracking = {
      ...insertScan,
      id,
      scannedAt,
    };

    await db.collection('scan_tracking').doc(id).set({
      ...scan,
      scannedAt,
    });

    // Update salesman's total scans
    await this.updateSalesmanScans(insertScan.salesmanId);

    return scan;
  }

  async getScansByHomeowner(homeownerId: string): Promise<ScanTracking[]> {
    const snapshot = await db.collection('scan_tracking')
      .where('homeownerId', '==', homeownerId)
      .get();

    const scans = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        salesmanId: data.salesmanId,
        homeownerId: data.homeownerId,
        scannedAt: data.scannedAt.toDate(),
        location: data.location,
      };
    });

    // Sort client-side to avoid index requirements
    return scans.sort((a, b) => b.scannedAt.getTime() - a.scannedAt.getTime());
  }

  async getScansBySalesman(salesmanId: string): Promise<ScanTracking[]> {
    const snapshot = await db.collection('scan_tracking')
      .where('salesmanId', '==', salesmanId)
      .get();

    const scans = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        salesmanId: data.salesmanId,
        homeownerId: data.homeownerId,
        scannedAt: data.scannedAt.toDate(),
        location: data.location,
      };
    });

    // Sort client-side to avoid index requirements
    return scans.sort((a, b) => b.scannedAt.getTime() - a.scannedAt.getTime());
  }

  async getSalesmanStats(salesmanId: string): Promise<{ todayScans: number; weekScans: number; monthScans: number; }> {
    // For development, we'll calculate stats from all scans
    // In production, you would set up Firestore composite indexes
    const allScans = await this.getScansBySalesman(salesmanId);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayScans = allScans.filter(scan => scan.scannedAt >= today).length;
    const weekScans = allScans.filter(scan => scan.scannedAt >= weekAgo).length;
    const monthScans = allScans.filter(scan => scan.scannedAt >= monthAgo).length;

    return {
      todayScans,
      weekScans,
      monthScans,
    };
  }
}

export const storage = new FirebaseStorage();
