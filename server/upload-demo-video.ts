import { promises as fs } from 'fs';
import { uploadToSupabase } from './services/supabase-storage';
import path from 'path';

async function uploadDemoVideo() {
  try {
    const videoPath = path.join(process.cwd(), 'attached_assets', 'WhatsApp Video 2025-07-09 at 21.09.20_7666dc3b_1752133737311.mp4');
    
    // Read the video file
    const videoBuffer = await fs.readFile(videoPath);
    
    // Create a mock multer file object
    const mockFile = {
      buffer: videoBuffer,
      originalname: 'scaninstead-demo.mp4',
      mimetype: 'video/mp4',
      size: videoBuffer.length
    } as Express.Multer.File;
    
    // Upload to Supabase Storage
    const videoUrl = await uploadToSupabase(mockFile);
    
    console.log('✅ Demo video uploaded successfully to Supabase!');
    console.log('Video URL:', videoUrl);
    
    return videoUrl;
  } catch (error) {
    console.error('❌ Error uploading demo video:', error);
    throw error;
  }
}

// Run upload if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  uploadDemoVideo().catch(console.error);
}

export { uploadDemoVideo };