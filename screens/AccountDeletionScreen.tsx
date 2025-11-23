import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Trash2 } from 'lucide-react';
import { useAppContext } from '../App';
import AnimatedPage from '../components/AnimatedPage';

const AccountDeletionScreen = () => {
    const navigate = useNavigate();
    const { user, logout } = useAppContext();
    const [step, setStep] = useState(1); // 1: warning, 2: confirmation, 3: success
    const [confirmationText, setConfirmationText] = useState('');

    const handleDeleteAccount = () => {
        if (confirmationText !== 'DELETE MY ACCOUNT') {
            alert('Please type "DELETE MY ACCOUNT" to confirm');
            return;
        }
        
        // In a real app, this would call an API to delete the account
        // For now, we'll just simulate the process
        setStep(3);
        
        // Automatically log out after a short delay
        setTimeout(() => {
            logout();
            navigate('/login');
        }, 3000);
    };

    return (
        <AnimatedPage>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-light-text dark:text-dark-text">
            <header className="p-4 flex items-center sticky top-0 bg-gray-50 dark:bg-dark-bg z-10">
                <button onClick={() => navigate('/settings')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-center flex-grow -ml-10">Delete Account</h2>
            </header>

            <div className="p-4">
                <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 mb-6">
                    <h3 className="font-bold text-lg mb-2">Account Deletion</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Permanently remove your FuelFriendly account
                    </p>
                </div>

                {step === 1 && (
                    <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <AlertTriangle className="text-red-500" size={48} />
                            </div>
                        </div>
                        
                        <h3 className="font-bold text-xl text-center mb-4">Before You Proceed</h3>
                        
                        <div className="space-y-4 mb-6">
                            <div className="flex items-start">
                                <AlertTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" size={20} />
                                <p className="text-gray-600 dark:text-gray-300">
                                    All your account data will be permanently deleted
                                </p>
                            </div>
                            
                            <div className="flex items-start">
                                <AlertTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" size={20} />
                                <p className="text-gray-600 dark:text-gray-300">
                                    Your order history will be removed
                                </p>
                            </div>
                            
                            <div className="flex items-start">
                                <AlertTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" size={20} />
                                <p className="text-gray-600 dark:text-gray-300">
                                    Saved payment methods will be deleted
                                </p>
                            </div>
                            
                            <div className="flex items-start">
                                <AlertTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" size={20} />
                                <p className="text-gray-600 dark:text-gray-300">
                                    This action cannot be undone
                                </p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setStep(2)}
                            className="w-full bg-red-500 text-white py-4 rounded-full font-bold"
                        >
                            I Understand, Continue
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <Trash2 className="text-red-500" size={48} />
                            </div>
                        </div>
                        
                        <h3 className="font-bold text-xl text-center mb-4">Final Confirmation</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                            To confirm account deletion, please type the following phrase:
                        </p>
                        
                        <div className="bg-gray-100 dark:bg-dark-bg p-4 rounded-xl mb-6 text-center font-mono">
                            DELETE MY ACCOUNT
                        </div>
                        
                        <input 
                            type="text"
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            placeholder="Type the phrase above"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent mb-6"
                        />
                        
                        <div className="flex space-x-3">
                            <button 
                                onClick={() => setStep(1)}
                                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-full font-semibold"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteAccount}
                                className="flex-1 bg-red-500 text-white py-3 rounded-full font-bold"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                                <Trash2 className="text-green-500" size={48} />
                            </div>
                        </div>
                        
                        <h3 className="font-bold text-xl text-center mb-4">Account Deleted</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                            Your account has been successfully deleted. You will be logged out shortly.
                        </p>
                        
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full w-full animate-pulse"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </AnimatedPage>
    );
};

export default AccountDeletionScreen;