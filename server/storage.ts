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
    const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
    const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
    
    const homeowner: Homeowner = {
      ...insertHomeowner,
      id,
      createdAt: new Date(),
      qrUrl: "", // Will be set after QR generation
      pitchUrl: `${protocol}://${baseUrl}/v/${id}`,
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
    const pitch: Pitch = {
      ...pitchData,
      id,
      createdAt: new Date(),
      fileUrl: pitchData.fileUrl,
    };

    await db.collection('pitches').doc(id).set({
      ...pitch,
      createdAt: pitch.createdAt.toISOString(),
    });

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
