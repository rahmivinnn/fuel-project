import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import LottieAnimation from '../components/LottieAnimation';
import loadingAnimation from '../assets/animations/loading.json';

interface WhatsAppVerificationProps {
  phoneNumber: string;
  onVerificationSuccess: (verificationCode: string) => void;
  onBack: () => void;
}

const WhatsAppVerification: React.FC<WhatsAppVerificationProps> = ({ 
  phoneNumber, 
  onVerificationSuccess,
  onBack
}) => {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isCodeSent, setIsCodeSent] = useState(false);

  useEffect(() => {
    const sendInitialCode = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/send-whatsapp-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber })
        });
        
        if (!response.ok) {
          throw new Error('Failed to send code');
        }
        
        setIsCodeSent(true);
        setCountdown(60);
      } catch (err: any) {
        setError(err.message || 'Failed to send code. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    sendInitialCode();
  }, [phoneNumber]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && isCodeSent) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, isCodeSent]);

  useEffect(() => {
    const inputs = document.querySelectorAll('.code-input');
    const firstInput = inputs[0] as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
    
    if (error) {
      setError('');
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/send-whatsapp-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send code');
      }
      
      setCountdown(60);
      setIsCodeSent(true);
      setVerificationCode(['', '', '', '', '', '']);
      const firstInput = document.getElementById('code-0') as HTMLInputElement;
      if (firstInput) firstInput.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to send code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/verify-whatsapp-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid verification code');
      }
      
      onVerificationSuccess(code);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6 animate-slide-in-right">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white animate-slide-in-left mb-2">WhatsApp Verification</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-300 animate-slide-in-left delay-75">
          We've sent a 6-digit code to your WhatsApp
        </p>
        <p className="mt-1 text-lg font-semibold text-primary animate-slide-in-left delay-100">
          {phoneNumber}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center space-x-2 max-w-xs mx-auto">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="code-input w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl text-center border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-dark-card focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all duration-200 ease-out input-focus"
                disabled={isLoading}
              />
            ))}
          </div>

        {error && (
          <div className="flex items-center justify-center text-red-500 text-sm animate-shake">
            <AlertCircle size={16} className="mr-1" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={handleResendCode}
            disabled={countdown > 0 || isLoading}
            className={`text-sm font-medium transition-all duration-200 ease-out ${
              countdown > 0 || isLoading
                ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'text-primary hover:text-primary-dark active:scale-95'
            }`}
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
          </button>
          
          <button
            onClick={onBack}
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200 ease-out active:scale-95"
          >
            Change Number
          </button>
        </div>

        <button
          onClick={handleVerify}
          disabled={isLoading}
          className="w-full bg-primary text-white py-3 rounded-full text-base font-semibold shadow-lg transition-all duration-300 ease-out active:scale-95 hover:shadow-xl flex items-center justify-center disabled:bg-primary/70 btn-press"
        >
          {isLoading ? (
            <>
              <LottieAnimation animationData={loadingAnimation} width={24} height={24} className="animate-spin-smooth" />
              <span className="ml-2">Verifying...</span>
            </>
          ) : (
            'Verify & Continue'
          )}
        </button>
      </div>

      <div className="text-center text-xs text-gray-500 dark:text-gray-400 animate-slide-in-left delay-150">
        <p>📱 Check your WhatsApp for the verification code</p>
      </div>
    </div>
  );
};

export default WhatsAppVerification;