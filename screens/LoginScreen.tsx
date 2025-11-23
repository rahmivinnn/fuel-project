import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Phone } from 'lucide-react';
import Logo from '../components/Logo';
import AppleLogo from '../components/AppleLogo';
import { useAppContext } from '../App';
import LottieAnimation from '../components/LottieAnimation';
import WhatsAppVerification from '../components/WhatsAppVerification';

import loadingAnimation from '../assets/animations/loading.json';
import AnimatedPage from '../components/AnimatedPage';

const LoginScreen = () => {
    const navigate = useNavigate();
    const { login, loginWithGoogle, loginWithApple, loginWithWhatsApp } = useAppContext();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [showWhatsAppVerification, setShowWhatsAppVerification] = useState(false);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const dummyUser = {
                id: 'dummy-user-123',
                email: email || 'dummy@example.com',
                fullName: 'Dummy User',
                avatarUrl: '',
                phone: '',
                city: '',
                vehicles: []
            };
            loginWithWhatsApp(dummyUser);
        } catch (err: any) {
            // No error handling needed as we are bypassing backend
        } finally {
            setIsLoading(false);
        }
    };



    if (showWhatsAppVerification) {
        return (
            <AnimatedPage>
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-dark-bg text-light-text dark:text-dark-text space-y-4">
                <div className="scale-75">
                    <Logo />
                </div>
                <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-200 text-center">Verify WhatsApp</h2>
                <WhatsAppVerification 
                    phoneNumber={phoneNumber}
                    onVerificationSuccess={(code) => {
                        const dummyUser = {
                            id: 'whatsapp-user-123',
                            email: `${phoneNumber}@whatsapp.com`,
                            fullName: 'WhatsApp User',
                            avatarUrl: '',
                            phone: phoneNumber,
                            city: '',
                            vehicles: []
                        };
                        loginWithWhatsApp(dummyUser);
                    }}
                    onBack={() => setShowWhatsAppVerification(false)}
                />
            </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
        <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-4 pb-20 bg-white dark:bg-dark-bg text-light-text dark:text-dark-text space-y-2 overflow-y-auto">
            <div className="scale-75">
                <Logo />
            </div>

            <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-200 text-center">Sign In</h2>
            
            <form onSubmit={handleLogin} className="w-full max-w-md space-y-2">
                <div className="w-full px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent text-center text-sm mobile-text-base">
                    Customer
                </div>
                <input 
                    type="email"
                    placeholder="Email or phone number"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm mobile-text-sm"
                    required
                />
                <div className="relative">
                    <input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm mobile-text-sm"
                        required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400">
                        {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div className="text-right">
                    <button 
                        type="button"
                        onClick={() => navigate('/forgot-password')} 
                        className="text-sm text-red-500 hover:underline mobile-text-sm"
                    >
                        Forgotten Password
                    </button>
                </div>
                
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-white py-2.5 rounded-full text-base font-semibold shadow-lg transition-all active:scale-95 hover:shadow-xl flex items-center justify-center disabled:bg-primary/70 mobile-btn-md ripple overflow-hidden"
                >
                    {isLoading ? <LottieAnimation animationData={loadingAnimation} width={20} height={20} /> : 'Log In'}
                </button>
            </form>
            
            <div className="w-full max-w-md space-y-2">
                {/* WhatsApp Login Option */}
                <div className="space-y-2">
                    <input 
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm mobile-text-sm"
                    />
                    <button 
                        type="button"
                        onClick={() => {
                            if (!phoneNumber) {
                                setError('Please enter your phone number');
                                return;
                            }
                            if (!phoneNumber.match(/^[\+]?[0-9]{10,15}$/)) {
                                setError('Please enter a valid phone number');
                                return;
                            }
                            setError('');
                            setShowWhatsAppVerification(true);
                        }}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center bg-green-500 text-white py-2.5 rounded-full text-base font-semibold transition-all active:scale-95 hover:shadow-md mobile-btn-md disabled:opacity-50 ripple overflow-hidden"
                    >
                        {isLoading ? (
                            <LottieAnimation animationData={loadingAnimation} width={20} height={20} />
                        ) : (
                            <>
                                <Phone size={16} className="mr-2" />
                                Sign in with WhatsApp
                            </>
                        )}
                    </button>
                </div>

                 <div className="flex items-center justify-center space-x-2">
                    <hr className="w-1/4 border-gray-300 dark:border-gray-600"/>
                    <span className="text-gray-500 dark:text-gray-400 text-sm mobile-text-sm">Or</span>
                    <hr className="w-1/4 border-gray-300 dark:border-gray-600"/>
                </div>



                <button 
                  type="button" 
                  onClick={async () => { 
                    try { 
                      setError(''); // Clear any previous errors
                      setIsLoading(true); // Show loading state
                      await loginWithGoogle(); 
                    } catch (e: any) { 
                      // Don't show error for cancelled popup requests
                      if (e?.message && !e.message.includes('cancelled-popup-request')) {
                        setError(e?.message || 'Google login failed. Please try again.'); 
                      }
                    } finally {
                      setIsLoading(false); // Hide loading state
                    }
                  }} 
                  disabled={isLoading}
                  className="w-full flex items-center justify-center bg-transparent border-2 border-primary text-light-text dark:text-dark-text py-2.5 rounded-full text-base font-semibold transition-all active:scale-95 hover:shadow-md mobile-btn-md disabled:opacity-50 ripple overflow-hidden"
                >
                  {isLoading ? (
                    <LottieAnimation animationData={loadingAnimation} width={20} height={20} />
                  ) : (
                    <>
                      <img src="https://www.google.com/favicon.ico" alt="Google icon" className="w-4 h-4 mr-2"/>
                      Continue with Google
                    </>
                  )}
                </button>

                <button 
                  type="button" 
                  onClick={async () => { 
                    try { 
                      setError(''); // Clear any previous errors
                      setIsLoading(true); // Show loading state
                      await loginWithApple(); 
                    } catch (e: any) { 
                      // Don't show error for cancelled popup requests
                      if (e?.message && !e.message.includes('cancelled-popup-request')) {
                        setError(e?.message || 'Apple login failed. Please try again.'); 
                      }
                    } finally {
                      setIsLoading(false); // Hide loading state
                    }
                  }} 
                  disabled={isLoading}
                  className="w-full flex items-center justify-center bg-transparent border-2 border-primary text-light-text dark:text-dark-text py-2.5 rounded-full text-base font-semibold transition-all active:scale-95 hover:shadow-md mobile-btn-md disabled:opacity-50 ripple overflow-hidden"
                >
                  {isLoading ? (
                    <LottieAnimation animationData={loadingAnimation} width={20} height={20} />
                  ) : (
                    <>
                      <AppleLogo className="w-4 h-4 mr-2" />
                      Continue with Apple
                    </>
                  )}
                </button>
            </div>



            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mobile-text-sm">
                Don't have an account? <span onClick={() => navigate('/register')} className="text-primary font-semibold cursor-pointer mobile-text-sm">Sign up</span>
            </p>
        </div>
        </AnimatedPage>
    );
};

export default LoginScreen;