import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, LogOut, User } from 'lucide-react';
import { useAppContext } from '../App';
import { messaging, getToken } from '../firebase';
import { apiRegisterPushToken, apiSendTestPush } from '../services/api';
import AnimatedPage from '../components/AnimatedPage';

const SettingsItem = ({ text, onClick }: { text: string, onClick?: () => void }) => (
    <div 
        onClick={onClick} 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-card rounded-full transition-colors ripple"
    >
        <span className="font-semibold">{text}</span>
        <ChevronRight className="text-gray-400" />
    </div>
);

const SettingsScreen = () => {
    const navigate = useNavigate();
    const { logout, user } = useAppContext();
    const [notifStatus, setNotifStatus] = useState<string>('');

    const handleLogout = () => {
        if (confirm('Are you sure you want to log out?')) {
            logout();
        }
    };

    const enableNotifications = async () => {
        try {
            if (!messaging) return;
            const perm = await Notification.requestPermission();
            if (perm !== 'granted') { setNotifStatus('Permission denied'); return; }
            let swReg: ServiceWorkerRegistration | undefined = undefined;
            try { swReg = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js') || undefined } catch {}
            const vapidKey = (import.meta as any).env?.VITE_FIREBASE_VAPID_KEY || undefined;
            const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg });
            if (!token) { setNotifStatus('Token unavailable'); return; }
            await apiRegisterPushToken(user?.email, token);
            setNotifStatus('Enabled');
        } catch (e: any) {
            setNotifStatus(e?.message || 'Failed');
        }
    };

    const testPush = async () => {
        try {
            const r = await apiSendTestPush();
            if ((r as any)?.ok) setNotifStatus('Test sent'); else setNotifStatus('Server key missing');
        } catch { setNotifStatus('Failed'); }
    };

    return (
        <AnimatedPage>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-light-text dark:text-dark-text">
            <header className="p-4 flex items-center sticky top-0 bg-gray-50 dark:bg-dark-bg z-10">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-center flex-grow -ml-10">Settings</h2>
            </header>

            <div className="p-4 space-y-6">
                 <div className="flex items-center p-4 bg-light-card dark:bg-dark-card rounded-2xl cursor-pointer" onClick={() => navigate('/profile')}>
                    <img src={user?.avatarUrl} alt="User" className="w-16 h-16 rounded-full" />
                    <div className="ml-4 flex-grow">
                        <p className="font-bold text-lg">{user?.fullName || 'User'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View Profile</p>
                    </div>
                    <ChevronRight className="text-gray-400" />
                </div>


                <div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-2 px-4">Account</h3>
                    <div className="bg-light-bg dark:bg-dark-card rounded-2xl">
                        <SettingsItem 
                            text="Manage Passwords" 
                            onClick={() => navigate('/manage-password')} 
                        />
                        <SettingsItem 
                            text="Manage Payment Method" 
                            onClick={() => navigate('/manage-payment')} 
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-2 px-4">App Settings</h3>
                    <div className="bg-light-bg dark:bg-dark-card rounded-2xl">
                        <SettingsItem 
                            text="Fuel Efficiency Calculator" 
                            onClick={() => navigate('/fuel-calculator')} 
                        />
                        <SettingsItem 
                            text="Fuel Price Comparison" 
                            onClick={() => navigate('/fuel-price-comparison')} 
                        />
                        <SettingsItem 
                            text="Themes" 
                            onClick={() => navigate('/themes')} 
                        />
                        <SettingsItem 
                            text="Enable Notifications" 
                            onClick={enableNotifications} 
                        />
                        <div className="px-4 pb-2 text-xs text-gray-500 dark:text-gray-400">{notifStatus}</div>
                        <SettingsItem 
                            text="Test Push" 
                            onClick={testPush} 
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-2 px-4">Customer Care</h3>
                    <div className="bg-light-bg dark:bg-dark-card rounded-2xl">
                        <SettingsItem 
                            text="Help and Support" 
                            onClick={() => navigate('/help')} 
                        />
                        <SettingsItem 
                            text="Terms and Conditions" 
                            onClick={() => navigate('/terms')} 
                        />
                        <SettingsItem 
                            text="Privacy Policy" 
                            onClick={() => navigate('/privacy')} 
                        />
                    </div>
                </div>

                <div>
                     <div className="bg-light-bg dark:bg-dark-card rounded-2xl">
                        <SettingsItem 
                            text="Request Account Deletion" 
                            onClick={() => navigate('/account-deletion')} 
                        />
                    </div>
                </div>

                 <div className="mt-8 px-4">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center py-3 bg-red-500/10 text-red-500 rounded-full font-bold">
                        <LogOut size={20} className="mr-2" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
        </AnimatedPage>
    );
};

export default SettingsScreen;