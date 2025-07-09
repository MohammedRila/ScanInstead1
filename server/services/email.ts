import nodemailer from 'nodemailer';
import { type Homeowner, type Pitch } from '@shared/schema';

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

export async function sendSalesmanVerificationEmail(salesman: any): Promise<void> {
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Welcome to ScanInstead!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your service provider account has been created</p>
      </div>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1f2937; margin-top: 0;">Account Verification</h2>
        
        <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Account Details</h3>
          <p><strong>Name:</strong> ${salesman.firstName} ${salesman.lastName}</p>
          <p><strong>Business:</strong> ${salesman.businessName}</p>
          ${salesman.businessType ? `<p><strong>Business Type:</strong> ${salesman.businessType}</p>` : ''}
          <p><strong>Email:</strong> ${salesman.email}</p>
          ${salesman.phone ? `<p><strong>Phone:</strong> ${salesman.phone}</p>` : ''}
        </div>
        
        <div style="background-color: #dbeafe; padding: 20px; border-radius: 6px; border-left: 4px solid #3B82F6; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">🎉 Registration Successful!</h3>
          <p style="margin: 0; color: #1e40af;">Your service provider account has been successfully created. You can now start using ScanInstead to connect with homeowners in your area.</p>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">What's Next?</h3>
          <ul style="color: #6b7280; line-height: 1.6;">
            <li>Look for ScanInstead QR codes on doors in your service area</li>
            <li>Scan codes to submit professional digital pitches</li>
            <li>Track your scans and engagement in your dashboard</li>
            <li>Build trust with homeowners through our verified platform</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.BASE_URL || 'https://scaninstead.com'}/salesman/${salesman.id}" 
             style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Access Your Dashboard
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #6b7280; font-size: 14px;">
            Account created on ${salesman.createdAt.toLocaleDateString()} at ${salesman.createdAt.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    const result = await transporter.sendMail({
      from: `"ScanInstead" <${process.env.GMAIL_USER}>`,
      to: salesman.email,
      subject: `Welcome to ScanInstead - Account Verified for ${salesman.businessName}`,
      html: emailHtml,
    });
    
    console.log('Verification email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Detailed verification email error:', error);
    throw error;
  }
}

export async function sendPitchEmail(homeowner: Homeowner, pitch: Pitch): Promise<void> {
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">New Pitch Received</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">via ScanInstead</p>
      </div>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1f2937; margin-top: 0;">Pitch Details</h2>
        
        <div style="background-color: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; color: #374151;">Visitor Information</h3>
          <p><strong>Name:</strong> ${pitch.visitorName}</p>
          ${pitch.company ? `<p><strong>Company:</strong> ${pitch.company}</p>` : ''}
          ${pitch.visitorEmail ? `<p><strong>Email:</strong> ${pitch.visitorEmail}</p>` : ''}
          ${pitch.visitorPhone ? `<p><strong>Phone:</strong> ${pitch.visitorPhone}</p>` : ''}
        </div>
        
        <div style="background-color: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; color: #374151;">Offer Details</h3>
          <p><strong>Service:</strong> ${pitch.offer}</p>
          <p><strong>Reason:</strong></p>
          <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; margin: 10px 0;">${pitch.reason}</p>
        </div>
        
        ${pitch.fileUrl ? `
          <div style="background-color: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
            <h3 style="margin: 0 0 10px 0; color: #374151;">Attached File</h3>
            <p><a href="${pitch.fileUrl}" style="color: #3B82F6; text-decoration: none;">${pitch.fileName || 'View Attachment'}</a></p>
          </div>
        ` : ''}
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e;"><strong>Note:</strong> This visitor used your ScanInstead QR code instead of knocking on your door. You can respond directly to them if you're interested in their offer.</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #6b7280; font-size: 14px;">
            Submitted on ${pitch.createdAt.toLocaleDateString()} at ${pitch.createdAt.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    const result = await transporter.sendMail({
      from: `"ScanInstead" <${process.env.GMAIL_USER}>`,
      to: homeowner.email,
      subject: `New Pitch from ${pitch.visitorName}${pitch.company ? ` (${pitch.company})` : ''}`,
      html: emailHtml,
    });
    
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Detailed email error:', error);
    throw error;
  }
}
