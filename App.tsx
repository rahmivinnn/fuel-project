import React, { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import HomeScreen from './screens/HomeScreen';
import StationDetailsScreen from './screens/StationDetailsScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import TrackOrderScreen from './screens/TrackOrderScreen';
import MyOrdersScreen from './screens/MyOrdersScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileScreen from './screens/ProfileScreen';
import FuelCalculatorScreen from './screens/FuelCalculatorScreen';
import FuelPriceComparisonScreen from './screens/FuelPriceComparisonScreen';
import ThemesScreen from './screens/ThemesScreen';
import HelpSupportScreen from './screens/HelpSupportScreen';
import TermsScreen from './screens/TermsScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import ManagePasswordScreen from './screens/ManagePasswordScreen';
import ManagePaymentScreen from './screens/ManagePaymentScreen';
import AccountDeletionScreen from './screens/AccountDeletionScreen';
import TestNavigationScreen from './screens/TestNavigationScreen';
import MessageScreen from './screens/MessageScreen';
import CallScreen from './screens/CallScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import BottomNav from './components/BottomNav';
import CountryRestriction from './components/CountryRestriction'; // Added import
import { Theme, User } from './types';
import { apiLogin, apiLogout, apiLoginWithGoogleCredential, apiRegisterPushToken } from './services/api';
// Firebase imports
import { auth, googleProvider, appleProvider, signInWithPopup, signOut, onAuthStateChanged, messaging, getToken, onMessage, signInWithEmailAndPassword } from './firebase';

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  loginWithWhatsApp: (user: User) => void;
  isWhatsAppAuthenticated: boolean;
  logout: () => void;
  updateUser: (user: User) => void;
  isInitializing: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

const AppNavigator = () => {
    const { isAuthenticated, isInitializing } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Enable auto demo


    // Routing effect
    useEffect(() => {
        const currentPath = location.pathname;
        if (!isAuthenticated && currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/forgot-password') {
            navigate('/login');
        } else if (isAuthenticated && (currentPath === '/' || currentPath === '/login')) {
            navigate('/home');
        }
    }, [navigate, location.pathname, isAuthenticated]);

    const hideBottomNavPaths = ['/login', '/register', '/checkout'];
    const showBottomNav = isAuthenticated && !hideBottomNavPaths.includes(location.pathname);

    return (
      <div className="h-full w-full flex flex-col mobile-scroll">
        <main className="flex-grow overflow-y-auto mobile-scroll">
          <Routes>
              <Route path="/" element={<LoginScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
              <Route path="/register" element={<RegistrationScreen />} />
              <Route path="/home" element={<HomeScreen />} />
              <Route path="/station/:id" element={<StationDetailsScreen />} />
              <Route path="/checkout" element={<CheckoutScreen />} />
              <Route path="/track" element={<TrackOrderScreen />} />
              <Route path="/orders" element={<MyOrdersScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
              <Route path="/fuel-calculator" element={<FuelCalculatorScreen />} />
              <Route path="/fuel-price-comparison" element={<FuelPriceComparisonScreen />} />
              <Route path="/themes" element={<ThemesScreen />} />
              <Route path="/help" element={<HelpSupportScreen />} />
              <Route path="/terms" element={<TermsScreen />} />
              <Route path="/privacy" element={<PrivacyScreen />} />
              <Route path="/manage-password" element={<ManagePasswordScreen />} />
              <Route path="/manage-payment" element={<ManagePaymentScreen />} />
              <Route path="/account-deletion" element={<AccountDeletionScreen />} />
              <Route path="/test-nav" element={<TestNavigationScreen />} />
              <Route path="/message" element={<MessageScreen />} />
              <Route path="/call" element={<CallScreen />} />
              {/* Redirect all other routes to home */}
              <Route path="*" element={<HomeScreen />} />
          </Routes>
        </main>
        {showBottomNav && <BottomNav />}
      </div>
    )
}

const App = () => {
    const [theme, setThemeState] = useState<Theme>(Theme.LIGHT);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isWhatsAppAuthenticated, setIsWhatsAppAuthenticated] = useState(true);
    const [user, setUser] = useState<User | null>({
        id: 'default-user',
        fullName: 'Demo User',
        email: 'demo@example.com',
        phone: '081234567890',
        city: 'Jakarta, Indonesia',
        avatarUrl: 'https://picsum.photos/seed/demo/120/120',
        vehicles: []
    });
    const [isInitializing, setIsInitializing] = useState(false);

    const loginWithWhatsApp = useCallback((userData: User) => {
        setUser(userData);
        setIsAuthenticated(true);
        setIsWhatsAppAuthenticated(true);
    }, []);

    const setTheme = (newTheme: Theme) => {
        if(newTheme === Theme.DEFAULT){
             const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
             setThemeState(prefersDark ? Theme.DARK : Theme.LIGHT);
        } else {
            setThemeState(newTheme);
        }
    };
    
    const login = async (email: string, pass: string) => {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const idToken = await cred.user.getIdToken(true);
      const userData = await apiLoginWithGoogleCredential(idToken);
      setUser(userData);
      setIsAuthenticated(true);
    };

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;
            
            // Get the ID token
            const idToken = await firebaseUser.getIdToken(true); // Force refresh token
            
            // Use the existing API function to handle the credential
            console.log('Attempting to login with Google credential:', idToken);
            const userData = await apiLoginWithGoogleCredential(idToken);
            console.log('Received user data:', userData);
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error: any) {
            console.error('Firebase Google login error:', error);
            
            // Provide more specific error messages
            let errorMessage = 'Google login failed. Please try again.';
            
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Login popup was closed. Please try again.';
            } else if (error.code === 'auth/cancelled-popup-request') {
                errorMessage = 'Login was cancelled. Please try again.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.code === 'auth/internal-error') {
                errorMessage = 'Internal error occurred. Please try again later.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            // Check if it's a fetch error (backend not running)
            if (errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch')) {
                errorMessage = 'Failed to connect to the server. Please make sure the backend server is running on port 4000.';
            }
            
            // Show error to user
            alert(errorMessage);
        }
    };

    const loginWithApple = async () => {
        try {
            const result = await signInWithPopup(auth, appleProvider);
            const firebaseUser = result.user;
            
            // Get the ID token
            const idToken = await firebaseUser.getIdToken(true); // Force refresh token
            
            // Use the existing API function to handle the credential
            const userData = await apiLoginWithGoogleCredential(idToken);
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error: any) {
            console.error('Firebase Apple login error:', error);
            
            // Provide more specific error messages
            let errorMessage = 'Apple login failed. Please try again.';
            
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Login popup was closed. Please try again.';
            } else if (error.code === 'auth/cancelled-popup-request') {
                errorMessage = 'Login was cancelled. Please try again.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.code === 'auth/internal-error') {
                errorMessage = 'Internal error occurred. Please try again later.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            // Check if it's a fetch error (backend not running)
            if (errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch')) {
                errorMessage = 'Failed to connect to the server. Please make sure the backend server is running on port 4000.';
            }
            
            // Show error to user
            alert(errorMessage);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            apiLogout();
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
    }

    const appContextValue = {
        theme,
        setTheme: setThemeState,
        isAuthenticated,
        user,
        login,
        loginWithGoogle,
        loginWithApple,
        logout,
        updateUser,
        isInitializing,
        loginWithWhatsApp,
        isWhatsAppAuthenticated
    };

    // App initialization effect
    useEffect(() => {
    }, [isInitializing]);

    // Add this useEffect to check if environment variables are loaded
    useEffect(() => {
        // Only run this in development mode
        // @ts-ignore
        if (import.meta.env && import.meta.env.MODE === 'development') {
            // Environment variables check - silent in production
        }
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === Theme.DARK) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);
    
    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            
            if (firebaseUser) {
                // User is signed in
                try {
                    // Get the ID token
                    const idToken = await firebaseUser.getIdToken(true); // Force refresh token
                    console.log('Firebase user signed in, ID token:', idToken);
                    
                    // Use the existing API function to handle the credential
                    const userData = await apiLoginWithGoogleCredential(idToken);
                    console.log('User data from API:', userData);
                    setUser(userData);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Error in onAuthStateChanged:', error);
                    // Silent error handling to avoid console logs
                    // Keep user authenticated for demo purposes
                }
            } else {
                // User is signed out
                console.log('Firebase user signed out');
                // Keep user authenticated for demo purposes
            }
            setIsInitializing(false);
        });
        
        // Cleanup subscription on unmount
        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        const registerSw = async () => {
            const isNative = (window as any).Capacitor && (window as any).Capacitor.isNativePlatform;
            if (isNative) return;
            if ('serviceWorker' in navigator) {
                try {
                    await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                } catch {}
            }
        };
        registerSw();
    }, []);

    useEffect(() => {
        const setupMessaging = async () => {
            try {
                const isNative = (window as any).Capacitor && (window as any).Capacitor.isNativePlatform;
                if (isNative) return;
                if (!messaging || !(import.meta as any).env.VITE_API_BASE_URL) return;
                const perm = await Notification.requestPermission();
                if (perm !== 'granted') return;
                let swReg: ServiceWorkerRegistration | undefined = undefined;
                try { swReg = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js') || undefined } catch {}
                const vapidKey = (import.meta as any).env?.VITE_FIREBASE_VAPID_KEY || undefined;
                const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg });
                if (token && user?.email) {
                    await apiRegisterPushToken(user.email, token);
                }
                onMessage(messaging, (payload) => {
                    // Handle push message silently
                });
            } catch (e) {
                console.warn('Messaging setup failed', e);
            }
        };
        setupMessaging();
    }, [user]);
    
    // Show a loading screen while initializing auth state
    if (isInitializing) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <AppContext.Provider value={appContextValue}>
            <div className="w-full h-full font-sans bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text" style={{ height: '100dvh', maxHeight: '100dvh', maxWidth: '100vw', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <div className="w-full h-full">
                    <CountryRestriction> {/* Wrap the entire app with CountryRestriction */}
                        <HashRouter>
                           <AppNavigator />
                        </HashRouter>
                    </CountryRestriction>
                </div>
            </div>
        </AppContext.Provider>
    );
}

export default App;
