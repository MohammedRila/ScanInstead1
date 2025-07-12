import nodemailer from 'nodemailer';
import { type Homeowner, type Pitch } from '@shared/schema';
import xss from 'xss';

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  },
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  }
});

// Security helper functions
function sanitizeEmailContent(content: string): string {
  return xss(content, {
    whiteList: {
      div: ['style'],
      p: ['style'],
      h1: ['style'],
      h2: ['style'],
      h3: ['style'],
      strong: [],
      ul: ['style'],
      li: [],
      a: ['href', 'style'],
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  });
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

function sanitizeUserData(data: any): any {
  const sanitized = { ...data };
  
  // Sanitize string fields
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = xss(sanitized[key]);
    }
  }
  
  return sanitized;
}

export async function sendHomeownerWelcomeEmail(homeowner: any): Promise<void> {
  // Validate and sanitize homeowner data
  if (!homeowner.email || !validateEmail(homeowner.email)) {
    throw new Error('Invalid email address');
  }
  
  const sanitizedHomeowner = sanitizeUserData(homeowner);
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #8B5CF6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Welcome to ScanInstead!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your QR code is ready to use</p>
      </div>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1f2937; margin-top: 0;">Your Digital Door Setup Complete</h2>
        
        <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Account Details</h3>
          <p><strong>Name:</strong> ${sanitizedHomeowner.fullName}</p>
          <p><strong>Email:</strong> ${sanitizedHomeowner.email}</p>
          ${sanitizedHomeowner.phone ? `<p><strong>Phone:</strong> ${sanitizedHomeowner.phone}</p>` : ''}
          <p><strong>Notification Preference:</strong> ${sanitizedHomeowner.notificationPreference || 'Email'}</p>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 6px; border-left: 4px solid #8B5CF6; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #7c3aed;">🎉 Setup Complete!</h3>
          <p style="margin: 0; color: #7c3aed;">Your ScanInstead QR code has been generated and is ready to use. Print it out and place it where visitors can easily scan it instead of knocking.</p>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">How It Works</h3>
          <ul style="color: #6b7280; line-height: 1.6;">
            <li>Print your unique QR code and display it on your door or window</li>
            <li>Service providers scan the code to submit digital pitches</li>
            <li>Receive email notifications when new pitches arrive</li>
            <li>Review and respond to offers from your dashboard</li>
            <li>AI analyzes each pitch for spam and legitimacy</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${sanitizedHomeowner.pitchUrl}" 
             style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
            View Your QR Code
          </a>
          <a href="${process.env.BASE_URL || process.env.REPLIT_DOMAINS?.split(',')[0] || 'https://replit.app'}/homeowner/dashboard/${sanitizedHomeowner.id}" 
             style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Access Dashboard
          </a>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
          <p style="margin: 0; color: #92400e;"><strong>Pro Tip:</strong> Place your QR code in a weatherproof holder or laminate it for outdoor use. The bigger the better for easy scanning!</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #6b7280; font-size: 14px;">
            Account created on ${sanitizedHomeowner.createdAt.toLocaleDateString()} at ${sanitizedHomeowner.createdAt.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    const result = await transporter.sendMail({
      from: `"ScanInstead" <${process.env.GMAIL_USER}>`,
      to: sanitizedHomeowner.email,
      subject: `Welcome to ScanInstead - Your QR Code is Ready!`,
      html: sanitizeEmailContent(emailHtml),
    });
    
    console.log('Homeowner welcome email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Detailed homeowner email error:', error);
    throw error;
  }
}

export async function sendSalesmanWelcomeEmail(salesman: any): Promise<void> {
  // Validate and sanitize salesman data
  if (!salesman.email || !validateEmail(salesman.email)) {
    throw new Error('Invalid email address');
  }
  
  const sanitizedSalesman = sanitizeUserData(salesman);
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #EA580C; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Welcome to ScanInstead!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your service provider account has been created</p>
      </div>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1f2937; margin-top: 0;">Account Created Successfully!</h2>
        
        <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Account Details</h3>
          <p><strong>Email:</strong> ${sanitizedSalesman.email}</p>
          <p><strong>Account Type:</strong> Service Provider</p>
          <p><strong>Status:</strong> ${sanitizedSalesman.isVerified ? 'Verified' : 'Pending Verification'}</p>
        </div>
        
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 6px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #92400e;">🎉 Next Steps</h3>
          <p style="margin: 0; color: #92400e;">
            ${sanitizedSalesman.isVerified ? 
              'Complete your profile to start scanning QR codes in your neighborhood.' : 
              'Please verify your email address first, then complete your profile to get started.'
            }
          </p>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">What's Next?</h3>
          <ul style="color: #6b7280; line-height: 1.6;">
            <li>Complete your business profile with your legal name and business details</li>
            <li>Look for ScanInstead QR codes on doors in your service area</li>
            <li>Scan codes to submit professional digital pitches</li>
            <li>Track your scans and engagement in your dashboard</li>
            <li>Build trust with homeowners through our verified platform</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://${process.env.REPLIT_DOMAINS?.split(',')[0] || process.env.BASE_URL?.replace(/^https?:\/\//, '') || 'replit.app'}/salesman/register" 
             style="background-color: #EA580C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px; margin-bottom: 15px;">
            ${sanitizedSalesman.isVerified ? 'Complete Your Profile' : 'Verify Email'}
          </a>
        </div>
        
        <div style="background-color: #e0f2fe; padding: 15px; border-radius: 6px; border-left: 4px solid #0288d1; margin-bottom: 20px;">
          <p style="margin: 0; color: #01579b; font-size: 14px;"><strong>Security Notice:</strong> Keep your login credentials secure. Never share your password with anyone.</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #6b7280; font-size: 14px;">
            Account created on ${sanitizedSalesman.createdAt.toLocaleDateString()} at ${sanitizedSalesman.createdAt.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    const result = await transporter.sendMail({
      from: `"ScanInstead" <${process.env.GMAIL_USER}>`,
      to: sanitizedSalesman.email,
      subject: `Welcome to ScanInstead - Account Created Successfully!`,
      html: sanitizeEmailContent(emailHtml),
    });
    
    console.log('Welcome email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Detailed welcome email error:', error);
    throw error;
  }
}

export async function sendSalesmanVerificationEmail(salesman: any): Promise<void> {
  // Validate and sanitize salesman data
  if (!salesman.email || !validateEmail(salesman.email)) {
    throw new Error('Invalid email address');
  }
  
  const sanitizedSalesman = sanitizeUserData(salesman);
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
          <p><strong>Name:</strong> ${sanitizedSalesman.firstName} ${sanitizedSalesman.lastName}</p>
          <p><strong>Business:</strong> ${sanitizedSalesman.businessName}</p>
          ${sanitizedSalesman.businessType ? `<p><strong>Business Type:</strong> ${sanitizedSalesman.businessType}</p>` : ''}
          <p><strong>Email:</strong> ${sanitizedSalesman.email}</p>
          ${sanitizedSalesman.phone ? `<p><strong>Phone:</strong> ${sanitizedSalesman.phone}</p>` : ''}
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
        
        <div style="background-color: #e0f2fe; padding: 20px; border-radius: 6px; border-left: 4px solid #0288d1; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #01579b;">📧 Action Required: Verify Your Email</h3>
          <p style="margin: 0; color: #01579b;">Click the button below to verify your email address and activate your account:</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://${process.env.REPLIT_DOMAINS?.split(',')[0] || process.env.BASE_URL?.replace(/^https?:\/\//, '') || 'replit.app'}/salesman/verify?email=${encodeURIComponent(sanitizedSalesman.email)}" 
             style="background-color: #0288d1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px; margin-bottom: 15px;">
            ✅ Verify My Email Address
          </a>
          <br>
          <a href="https://${process.env.REPLIT_DOMAINS?.split(',')[0] || process.env.BASE_URL?.replace(/^https?:\/\//, '') || 'replit.app'}/salesman/dashboard/${sanitizedSalesman.id}" 
             style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Access Your Dashboard
          </a>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
          <p style="margin: 0; color: #856404; font-size: 14px;"><strong>Note:</strong> You must verify your email before you can sign in and start scanning QR codes. If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="margin: 10px 0 0 0; word-break: break-all; font-family: monospace; background-color: #f8f9fa; padding: 8px; border-radius: 4px; font-size: 12px;">https://${process.env.REPLIT_DOMAINS?.split(',')[0] || process.env.BASE_URL?.replace(/^https?:\/\//, '') || 'replit.app'}/salesman/verify?email=${encodeURIComponent(sanitizedSalesman.email)}</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #6b7280; font-size: 14px;">
            Account created on ${sanitizedSalesman.createdAt.toLocaleDateString()} at ${sanitizedSalesman.createdAt.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    const result = await transporter.sendMail({
      from: `"ScanInstead" <${process.env.GMAIL_USER}>`,
      to: sanitizedSalesman.email,
      subject: `Welcome to ScanInstead - Account Verified for ${sanitizedSalesman.businessName}`,
      html: sanitizeEmailContent(emailHtml),
    });
    
    console.log('Verification email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Detailed verification email error:', error);
    throw error;
  }
}

export async function sendPitchEmail(homeowner: Homeowner, pitch: Pitch): Promise<void> {
  // Validate and sanitize data
  if (!homeowner.email || !validateEmail(homeowner.email)) {
    throw new Error('Invalid homeowner email address');
  }
  
  const sanitizedHomeowner = sanitizeUserData(homeowner);
  const sanitizedPitch = sanitizeUserData(pitch);
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
          <p><strong>Name:</strong> ${sanitizedPitch.visitorName}</p>
          ${sanitizedPitch.company ? `<p><strong>Company:</strong> ${sanitizedPitch.company}</p>` : ''}
          ${sanitizedPitch.visitorEmail ? `<p><strong>Email:</strong> ${sanitizedPitch.visitorEmail}</p>` : ''}
          ${sanitizedPitch.visitorPhone ? `<p><strong>Phone:</strong> ${sanitizedPitch.visitorPhone}</p>` : ''}
        </div>
        
        <div style="background-color: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; color: #374151;">Offer Details</h3>
          <p><strong>Service:</strong> ${sanitizedPitch.offer}</p>
          <p><strong>Reason:</strong></p>
          <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; margin: 10px 0;">${sanitizedPitch.reason}</p>
        </div>
        
        ${sanitizedPitch.fileUrl ? `
          <div style="background-color: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
            <h3 style="margin: 0 0 10px 0; color: #374151;">Attached File</h3>
            <p><a href="${sanitizedPitch.fileUrl}" style="color: #3B82F6; text-decoration: none;">${sanitizedPitch.fileName || 'View Attachment'}</a></p>
          </div>
        ` : ''}
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e;"><strong>Note:</strong> This visitor used your ScanInstead QR code instead of knocking on your door. You can respond directly to them if you're interested in their offer.</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #6b7280; font-size: 14px;">
            Submitted on ${sanitizedPitch.createdAt.toLocaleDateString()} at ${sanitizedPitch.createdAt.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    const result = await transporter.sendMail({
      from: `"ScanInstead" <${process.env.GMAIL_USER}>`,
      to: sanitizedHomeowner.email,
      subject: `New Pitch from ${sanitizedPitch.visitorName}${sanitizedPitch.company ? ` (${sanitizedPitch.company})` : ''}`,
      html: sanitizeEmailContent(emailHtml),
    });
    
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Detailed email error:', error);
    throw error;
  }
}
