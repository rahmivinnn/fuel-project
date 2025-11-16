import React, { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import HomeScreen from './screens/HomeScreen';
import StationDetailsScreen from './screens/StationDetailsScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import TrackOrderScreen from './screens/TrackOrderScreen';
import MyOrdersScreen from './screens/MyOrdersScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileScreen from './screens/ProfileScreen';
import BottomNav from './components/BottomNav';
import { Theme, User } from './types';
import { apiLogin, apiLogout, apiLoginWithGoogleCredential, apiRegisterPushToken } from './services/api';
// Firebase imports
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, messaging, getToken, onMessage, signInWithEmailAndPassword } from './firebase';

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
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
    const { isAuthenticated } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const publicRoutes = ['/', '/login', '/register'];
        const currentPath = location.pathname;

        if (isAuthenticated && publicRoutes.includes(currentPath)) {
            navigate('/home');
        } else if (!isAuthenticated && !publicRoutes.includes(currentPath)) {
             navigate('/');
        }
    }, [isAuthenticated, navigate, location.pathname]);


    const showBottomNav = isAuthenticated && ['/home', '/orders', '/track', '/settings'].includes(location.pathname);

    return (
      <div className="h-full w-full flex flex-col min-h-0">
        <main className="flex-grow pb-20 md:pb-24">
          <Routes>
              <Route path="/" element={<WelcomeScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/register" element={<RegistrationScreen />} />
              <Route path="/home" element={<HomeScreen />} />
              <Route path="/station/:id" element={<StationDetailsScreen />} />
              <Route path="/checkout" element={<CheckoutScreen />} />
              <Route path="/track" element={<TrackOrderScreen />} />
              <Route path="/orders" element={<MyOrdersScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
          </Routes>
        </main>
        {showBottomNav && <BottomNav />}
      </div>
    )
}

const App = () => {
    const [theme, setThemeState] = useState<Theme>(Theme.LIGHT);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);

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
                    
                    // Use the existing API function to handle the credential
                    const userData = await apiLoginWithGoogleCredential(idToken);
                    setUser(userData);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Error during Firebase auth state change:', error);
                    // More detailed error logging
                    if (error instanceof Error) {
                        console.error('Error name:', error.name);
                        console.error('Error message:', error.message);
                        console.error('Error stack:', error.stack);
                    }
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } else {
                // User is signed out
                setUser(null);
                setIsAuthenticated(false);
            }
        });
        
        // Cleanup subscription on unmount
        return () => unsubscribe();
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
                if (!messaging || !import.meta.env.VITE_API_BASE_URL) return;
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
                    console.log('Push message', payload);
                });
            } catch (e) {
                console.warn('Messaging setup failed', e);
            }
        };
        setupMessaging();
    }, [user]);
    
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
            // Add scope to request email and profile information
            googleProvider.setCustomParameters({
                prompt: 'select_account'
            });
            
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;
            
            // Get the ID token
            const idToken = await firebaseUser.getIdToken(true); // Force refresh token
            
            // Use the existing API function to handle the credential
            const userData = await apiLoginWithGoogleCredential(idToken);
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error: any) {
            console.error('Firebase Google login error:', error);
            // Handle specific Firebase errors
            if (error.code === 'auth/popup-closed-by-user') {
                throw new Error('Login popup was closed. Please try again.');
            } else if (error.code === 'auth/cancelled-popup-request') {
                // This can happen when multiple popups are opened
                // We can ignore this error as the latest popup should handle the login
                return;
            } else if (error.code === 'auth/invalid-api-key') {
                throw new Error('Invalid Firebase API key. Please check your configuration.');
            } else if (error.code === 'auth/invalid-project-id') {
                throw new Error('Invalid Firebase Project ID. Please check your configuration.');
            } else if (error.code === 'auth/network-request-failed') {
                throw new Error('Network error. Please check your internet connection.');
            } else if (error.code === 'auth/unauthorized-domain') {
                throw new Error('Unauthorized domain. Please add your domain to Firebase authorized domains.');
            } else {
                // For configuration errors, provide a more helpful message
                if (error.message && error.message.includes('API key not valid')) {
                    throw new Error('Firebase configuration error. Please check your .env.local file for correct Firebase values.');
                }
                throw new Error(error?.message || 'Failed to login with Google. Please check console for details.');
            }
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

    return (
        <AppContext.Provider value={{ theme, setTheme, isAuthenticated, user, login, loginWithGoogle, logout, updateUser }}>
            <div className="w-full h-full font-sans bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text" style={{ height: '100dvh', maxHeight: '100dvh', maxWidth: '100vw', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)', overflow: 'hidden' }}>
                <div className="w-full h-full bg-light-bg dark:bg-dark-bg overflow-hidden" style={{ height: '100dvh', maxHeight: '100dvh' }}>
                    <HashRouter>
                       <AppNavigator />
                    </HashRouter>
                </div>
            </div>
        </AppContext.Provider>
    );
}

export default App;
