import type { VercelRequest, VercelResponse } from '@vercel/node';

const codeStorage = new Map<string, { code: string; expiry: number }>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { phoneNumber, code } = req.body;

  if (!phoneNumber || !code) {
    return res.status(400).json({ message: 'Phone number and code are required' });
  }

  try {
    const stored = codeStorage.get(phoneNumber);
    
    if (!stored) {
      return res.status(400).json({ 
        success: false, 
        message: 'No verification code found. Please request a new code.' 
      });
    }
    
    if (Date.now() > stored.expiry) {
      codeStorage.delete(phoneNumber);
      return res.status(400).json({ 
        success: false, 
        message: 'Verification code expired. Please request a new code.' 
      });
    }
    
    if (stored.code !== code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification code' 
      });
    }
    
    codeStorage.delete(phoneNumber);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Verification successful' 
    });
  } catch (error: any) {
    console.error('Error verifying WhatsApp code:', error);
    return res.status(500).json({ message: 'Verification failed' });
  }
}
