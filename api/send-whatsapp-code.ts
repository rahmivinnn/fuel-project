import type { VercelRequest, VercelResponse } from '@vercel/node';

const codeStorage = new Map<string, { code: string; expiry: number }>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    codeStorage.set(phoneNumber, {
      code,
      expiry: Date.now() + 5 * 60 * 1000
    });

    // Real Twilio WhatsApp integration
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (accountSid && authToken && twilioWhatsAppNumber) {
      try {
        const twilio = require('twilio');
        const client = twilio(accountSid, authToken);
        
        await client.messages.create({
          from: twilioWhatsAppNumber,
          to: `whatsapp:${phoneNumber}`,
          body: `Your FuelFriendly verification code is: ${code}\n\nThis code will expire in 5 minutes.`
        });
        
        console.log(`WhatsApp code sent to ${phoneNumber}`);
      } catch (twilioError: any) {
        console.error('Twilio error:', twilioError);
        return res.status(500).json({ 
          message: 'Failed to send WhatsApp message',
          error: twilioError.message 
        });
      }
    } else {
      console.log(`Demo mode - Code for ${phoneNumber}: ${code}`);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Code sent successfully'
    });
  } catch (error: any) {
    console.error('Error sending WhatsApp code:', error);
    return res.status(500).json({ message: 'Failed to send code' });
  }
}
