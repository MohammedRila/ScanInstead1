import twilio from 'twilio';
import { type Homeowner, type Pitch } from '@shared/schema';

const client = process.env.TWILIO_ENABLED === 'true' 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function sendPitchSMS(homeowner: Homeowner, pitch: Pitch): Promise<void> {
  if (!client || process.env.TWILIO_ENABLED !== 'true') {
    console.log('SMS disabled - would send:', {
      to: homeowner.email, // In real app, would need phone number
      message: `New pitch from ${pitch.visitorName}${pitch.company ? ` (${pitch.company})` : ''}: ${pitch.offer}`,
    });
    return;
  }

  // In a real implementation, you'd need to store phone numbers for homeowners
  // For now, this is just a placeholder
  console.log('SMS functionality ready but no phone number stored for homeowner');
}
