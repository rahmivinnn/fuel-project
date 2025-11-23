import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../App';
import AnimatedPage from '../components/AnimatedPage';

const ManagePasswordScreen = () => {
    const navigate = useNavigate();
    const { user } = useAppContext();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState<{type: string, text: string} | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({type: 'error', text: 'New passwords do not match'});
            return;
        }
        
        if (formData.newPassword.length < 6) {
            setMessage({type: 'error', text: 'Password must be at least 6 characters'});
            return;
        }
        
        // In a real app, this would call an API to update the password
        // For now, we'll just show a success message
        setMessage({type: 'success', text: 'Password updated successfully!'});
        
        // Reset form
        setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        
        // Hide message after 3 seconds
        setTimeout(() => {
            setMessage(null);
        }, 3000);
    };

    return (
        <AnimatedPage>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-light-text dark:text-dark-text">
            <header className="p-4 flex items-center sticky top-0 bg-gray-50 dark:bg-dark-bg z-10">
                <button onClick={() => navigate('/settings')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-center flex-grow -ml-10">Manage Password</h2>
            </header>

            <div className="p-4">
                <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 mb-6">
                    <h3 className="font-bold text-lg mb-2">Change Your Password</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Enter your current password and choose a new one
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 mb-6">
                        <div className="relative">
                            <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Current Password</label>
                            <input 
                                type={showCurrentPassword ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                placeholder="Enter current password"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent pr-12"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-4 top-9 text-gray-500 dark:text-gray-400"
                            >
                                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        
                        <div className="relative">
                            <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">New Password</label>
                            <input 
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent pr-12"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-9 text-gray-500 dark:text-gray-400"
                            >
                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        
                        <div className="relative">
                            <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Confirm New Password</label>
                            <input 
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent pr-12"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-9 text-gray-500 dark:text-gray-400"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-2xl mb-6 ${
                            message.type === 'success' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-primary text-white py-4 rounded-full font-bold"
                    >
                        Update Password
                    </button>
                </form>

                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                    <h4 className="font-bold mb-2 flex items-center">
                        <Lock size={20} className="mr-2" />
                        Password Requirements
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>• At least 6 characters long</li>
                        <li>• Include both letters and numbers</li>
                        <li>• Avoid using common words or phrases</li>
                    </ul>
                </div>
            </div>
        </div>
        </AnimatedPage>
    );
};

export default ManagePasswordScreen;