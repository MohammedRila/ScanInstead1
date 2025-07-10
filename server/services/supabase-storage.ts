import { supabaseClient } from '../db/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function uploadToSupabase(file: Express.Multer.File): Promise<string> {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized');
  }
  
  const fileName = `${uuidv4()}-${file.originalname}`;
  const filePath = `uploads/${fileName}`;
  
  // Upload file to Supabase Storage
  const { data, error } = await supabaseClient.storage
    .from('attachments')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      duplex: 'half'
    });
  
  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
  
  // Get public URL
  const { data: publicData } = supabaseClient.storage
    .from('attachments')
    .getPublicUrl(filePath);
  
  return publicData.publicUrl;
}

export async function serveFile(fileName: string): Promise<{ buffer: Buffer; mimetype: string } | null> {
  if (!supabaseClient) {
    return null;
  }
  
  try {
    const filePath = `uploads/${fileName}`;
    
    // Download file from Supabase Storage
    const { data, error } = await supabaseClient.storage
      .from('attachments')
      .download(filePath);
    
    if (error || !data) {
      console.error('Supabase download error:', error);
      return null;
    }
    
    // Convert blob to buffer
    const buffer = Buffer.from(await data.arrayBuffer());
    
    // Determine mimetype based on file extension
    const ext = fileName.toLowerCase().split('.').pop() || '';
    const mimetypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'mp4': 'video/mp4',
      'avi': 'video/avi',
      'mov': 'video/quicktime',
      'wmv': 'video/x-ms-wmv',
    };
    
    const mimetype = mimetypes[ext] || 'application/octet-stream';
    
    return { buffer, mimetype };
  } catch (error) {
    console.error('Error serving file:', error);
    return null;
  }
}