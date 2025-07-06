import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';

// Initialize Firebase Admin
let app;
if (getApps().length === 0) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is required');
  }
  
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  if (!storageBucket) {
    throw new Error('FIREBASE_STORAGE_BUCKET environment variable is required');
  }
  
  try {
    app = initializeApp({
      credential: cert(JSON.parse(serviceAccount)),
      storageBucket,
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export const storage = getStorage(app);

// Configure Firestore to ignore undefined values
db.settings({
  ignoreUndefinedProperties: true,
});

export async function uploadToFirebase(file: Express.Multer.File): Promise<string> {
  const bucket = storage.bucket();
  const fileName = `uploads/${uuidv4()}-${file.originalname}`;
  const fileRef = bucket.file(fileName);
  
  const stream = fileRef.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (error) => {
      reject(error);
    });

    stream.on('finish', async () => {
      try {
        // Make the file publicly accessible
        await fileRef.makePublic();
        
        // Return the public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        resolve(publicUrl);
      } catch (error) {
        reject(error);
      }
    });

    stream.end(file.buffer);
  });
}
