import { SpeechClient } from '@google-cloud/speech';
import { uploadToFirebase } from './firebase';

// Initialize the Google Cloud Speech client
const speechClient = new SpeechClient();

export interface SpeechToTextResult {
  transcript: string;
  confidence: number;
  languageCode: string;
}

export async function convertSpeechToText(audioFile: Express.Multer.File): Promise<SpeechToTextResult> {
  try {
    // Upload audio file to Firebase Storage first
    const audioUrl = await uploadToFirebase(audioFile);
    
    // Prepare the audio content
    const audioBytes = audioFile.buffer.toString('base64');
    
    // Configure the speech recognition request
    const request = {
      audio: {
        content: audioBytes,
      },
      config: {
        encoding: getAudioEncoding(audioFile.mimetype),
        sampleRateHertz: 16000,
        languageCode: 'en-US',
        alternativeLanguageCodes: ['es-US', 'fr-FR'], // Support multiple languages
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: false,
        model: 'latest_long', // Use latest model for better accuracy
      },
    };

    // Perform the speech recognition
    const [response] = await speechClient.recognize(request);
    
    if (!response.results || response.results.length === 0) {
      throw new Error('No speech detected in the audio file');
    }

    // Get the best result
    const result = response.results[0];
    const alternative = result.alternatives?.[0];
    
    if (!alternative || !alternative.transcript) {
      throw new Error('Unable to transcribe audio');
    }

    return {
      transcript: alternative.transcript,
      confidence: alternative.confidence || 0,
      languageCode: result.languageCode || 'en-US',
    };
  } catch (error) {
    console.error('Speech-to-text conversion error:', error);
    throw new Error(`Failed to convert speech to text: ${error.message}`);
  }
}

function getAudioEncoding(mimeType: string): string {
  switch (mimeType) {
    case 'audio/wav':
      return 'LINEAR16';
    case 'audio/mp3':
    case 'audio/mpeg':
      return 'MP3';
    case 'audio/flac':
      return 'FLAC';
    case 'audio/ogg':
      return 'OGG_OPUS';
    case 'audio/webm':
      return 'WEBM_OPUS';
    default:
      return 'LINEAR16'; // Default to LINEAR16 for unknown types
  }
}

export function isAudioFile(mimeType: string): boolean {
  const supportedAudioTypes = [
    'audio/wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/flac',
    'audio/ogg',
    'audio/webm',
    'audio/x-wav',
    'audio/wave'
  ];
  return supportedAudioTypes.includes(mimeType);
}