import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';

const TestNavigationScreen = () => {
    const navigate = useNavigate();

    return (
        <AnimatedPage>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-light-text dark:text-dark-text">
            <header className="p-4 flex items-center sticky top-0 bg-gray-50 dark:bg-dark-bg z-10">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-center flex-grow -ml-10">Test Navigation</h2>
            </header>

            <div className="p-4">
                <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 mb-6">
                    <h3 className="font-bold text-lg mb-4">Navigation Test</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Click the buttons below to test navigation to different screens
                    </p>
                    
                    <div className="space-y-4">
                        <button 
                            onClick={() => navigate('/home')}
                            className="w-full bg-primary text-white py-3 rounded-full font-semibold"
                        >
                            Go to Home
                        </button>
                        
                        <button 
                            onClick={() => navigate('/track')}
                            className="w-full bg-primary text-white py-3 rounded-full font-semibold"
                        >
                            Go to Track Orders
                        </button>
                        
                        <button 
                            onClick={() => navigate('/orders')}
                            className="w-full bg-primary text-white py-3 rounded-full font-semibold"
                        >
                            Go to My Orders
                        </button>
                        
                        <button 
                            onClick={() => navigate('/settings')}
                            className="w-full bg-primary text-white py-3 rounded-full font-semibold"
                        >
                            Go to Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </AnimatedPage>
    );
};

export default TestNavigationScreen;