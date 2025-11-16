import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import { useAppContext } from '../App';
import LottieAnimation from '../components/LottieAnimation';
import loadingAnimation from '../assets/animations/loading.json';
import AnimatedPage from '../components/AnimatedPage';

const LoginScreen = () => {
    const navigate = useNavigate();
    const { login, loginWithGoogle } = useAppContext();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            // Navigation will be handled by the App component's useEffect
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatedPage>
        <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-6 bg-white dark:bg-dark-bg text-light-text dark:text-dark-text space-y-4">
            <Logo />

            <h2 className="text-4xl md:text-5xl font-bold text-gray-700 dark:text-gray-200 text-center">Sign In</h2>
            
            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-3">
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
                    <a href="#" className="text-sm text-red-500 hover:underline mobile-text-sm">Forgotten Password</a>
                </div>
                
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-white py-2.5 rounded-full text-base font-semibold shadow-lg transition-all active:scale-95 hover:shadow-xl flex items-center justify-center disabled:bg-primary/70 mobile-btn-md ripple"
                >
                    {isLoading ? <LottieAnimation animationData={loadingAnimation} width={20} height={20} /> : 'Log In'}
                </button>
            </form>
            
            <div className="w-full max-w-sm space-y-3">
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
                      console.error('Google login error:', e);
                      // Don't show error for cancelled popup requests
                      if (e?.message && !e.message.includes('cancelled-popup-request')) {
                        setError(e?.message || 'Google login failed. Please try again.'); 
                      }
                    } finally {
                      setIsLoading(false); // Hide loading state
                    }
                  }} 
                  disabled={isLoading}
                  className="w-full flex items-center justify-center bg-transparent border-2 border-primary text-light-text dark:text-dark-text py-2.5 rounded-full text-base font-semibold transition-all active:scale-95 hover:shadow-md mobile-btn-md disabled:opacity-50 ripple"
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
            </div>

            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mobile-text-sm">
                Don't have an account? <span onClick={() => navigate('/register')} className="text-primary font-semibold cursor-pointer mobile-text-sm">Sign up</span>
            </p>
        </div>
        </AnimatedPage>
    );
};

export default LoginScreen;
