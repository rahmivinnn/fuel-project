import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import LottieAnimation from '../components/LottieAnimation';
import loadingAnimation from '../assets/animations/loading.json';

const ForgotPasswordScreen = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{type: string, text: string} | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        
        // Basic validation
        if (!email) {
            setMessage({type: 'error', text: 'Please enter your email address'});
            return;
        }
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessage({type: 'error', text: 'Please enter a valid email address'});
            return;
        }
        
        setIsLoading(true);
        
        try {
            // In a real application, this would call an API to send a password reset email
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // For demo purposes, we'll just show a success message
            setMessage({type: 'success', text: 'Password reset instructions sent to your email'});
            setIsSubmitted(true);
        } catch (error) {
            setMessage({type: 'error', text: 'Failed to send password reset instructions. Please try again.'});
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatedPage>
        <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-4 pb-20 bg-white dark:bg-dark-bg text-light-text dark:text-dark-text space-y-2 overflow-y-auto">
            <div className="w-full flex items-center justify-between mb-6">
                <button 
                    onClick={() => navigate('/login')} 
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold flex-grow text-center">Forgot Password</h2>
                <div className="w-10"></div> {/* Spacer for alignment */}
            </div>

            {!isSubmitted ? (
                <>
                    <div className="text-center mb-6">
                        <div className="bg-gray-100 dark:bg-dark-card rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Mail size={32} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Reset Your Password</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Enter your email address and we'll send you instructions to reset your password
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
                        <div>
                            <input 
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm mobile-text-sm"
                                required
                            />
                        </div>

                        {message && (
                            <div className={`p-3 rounded-2xl text-sm ${
                                message.type === 'success' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-white py-3 rounded-full text-base font-semibold shadow-lg transition-all active:scale-95 hover:shadow-xl flex items-center justify-center disabled:bg-primary/70 mobile-btn-md ripple overflow-hidden"
                        >
                            {isLoading ? (
                                <LottieAnimation animationData={loadingAnimation} width={24} height={24} />
                            ) : (
                                'Send Reset Instructions'
                            )}
                        </button>
                    </form>
                </>
            ) : (
                <div className="w-full max-w-sm text-center">
                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">Check Your Email</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        We've sent password reset instructions to <span className="font-semibold">{email}</span>
                    </p>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-6 text-left">
                        <h4 className="font-bold mb-2">Didn't receive the email?</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <li>• Check your spam or junk folder</li>
                            <li>• Make sure you entered the correct email</li>
                            <li>• Wait a few minutes for the email to arrive</li>
                        </ul>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/login')}
                        className="w-full bg-primary text-white py-3 rounded-full text-base font-semibold"
                    >
                        Back to Login
                    </button>
                </div>
            )}
        </div>
        </AnimatedPage>
    );
};

export default ForgotPasswordScreen;