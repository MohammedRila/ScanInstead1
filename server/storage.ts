import { type Homeowner, type Pitch, type InsertHomeowner, type InsertPitch } from "@shared/schema";
import { db } from "./services/firebase";
import { v4 as uuidv4 } from "uuid";

export interface IStorage {
  createHomeowner(homeowner: InsertHomeowner): Promise<Homeowner>;
  getHomeowner(id: string): Promise<Homeowner | undefined>;
  createPitch(pitch: InsertPitch & { fileUrl?: string }): Promise<Pitch>;
  getPitchesByHomeowner(homeownerId: string): Promise<Pitch[]>;
}

export class FirebaseStorage implements IStorage {
  async createHomeowner(insertHomeowner: InsertHomeowner): Promise<Homeowner> {
    const id = uuidv4();
    // Priority: BASE_URL > REPLIT_DOMAINS > localhost fallback
    let baseUrl = process.env.BASE_URL;
    let protocol = 'https';
    
    if (!baseUrl) {
      // Fallback to Replit domains or localhost
      const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
      baseUrl = replitDomain;
      protocol = baseUrl.includes('localhost') ? 'http' : 'https';
    } else {
      // Remove protocol from BASE_URL if it's included
      baseUrl = baseUrl.replace(/^https?:\/\//, '');
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

  async createPitch(pitchData: InsertPitch & { fileUrl?: string }): Promise<Pitch> {
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
    };

    return pitch;
  }

  async getPitchesByHomeowner(homeownerId: string): Promise<Pitch[]> {
    const snapshot = await db.collection('pitches')
      .where('homeownerId', '==', homeownerId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: new Date(data.createdAt),
      } as Pitch;
    });
  }
}

export const storage = new FirebaseStorage();
