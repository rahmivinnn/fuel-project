import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';

const CallScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { driverName, driverAvatar } = location.state || {};
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaker, setIsSpeaker] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEndCall = () => {
        navigate(-1);
    };

    return (
        <AnimatedPage>
            <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg">
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="mb-8">
                        <img 
                            src={driverAvatar || 'https://ui-avatars.com/api/?name=Driver'} 
                            alt="Driver" 
                            className="w-32 h-32 rounded-full border-4 border-primary/30 shadow-2xl"
                        />
                    </div>
                    
                    <h2 className="text-3xl font-bold mb-2 text-light-text dark:text-dark-text">{driverName || 'Driver'}</h2>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mb-2">Calling...</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">{formatTime(callDuration)}</p>
                    
                    <div className="grid grid-cols-3 gap-6 mb-12 w-full max-w-xs">
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="active:scale-95 transition-all flex flex-col items-center"
                        >
                            {isMuted ? <MicOff size={32} className="text-primary" /> : <Mic size={32} className="text-primary" />}
                        </button>
                        
                        <button
                            onClick={() => setIsSpeaker(!isSpeaker)}
                            className="active:scale-95 transition-all flex flex-col items-center"
                        >
                            {isSpeaker ? <Volume2 size={32} className="text-primary" /> : <VolumeX size={32} className="text-primary" />}
                        </button>
                        
                        <button className="active:scale-95 transition-all flex flex-col items-center">
                            <div className="text-primary text-4xl">📹</div>
                        </button>
                        
                        <button className="active:scale-95 transition-all flex flex-col items-center">
                            <div className="text-primary text-4xl">➕</div>
                        </button>
                        
                        <button className="active:scale-95 transition-all flex flex-col items-center">
                            <div className="text-primary text-4xl">⏸️</div>
                        </button>
                        
                        <button className="active:scale-95 transition-all flex flex-col items-center">
                            <div className="text-primary text-4xl">🔊</div>
                        </button>
                    </div>
                    
                    <button
                        onClick={handleEndCall}
                        className="p-6 bg-red-500 rounded-full active:scale-95 transition-transform shadow-2xl"
                    >
                        <PhoneOff size={32} className="text-white" />
                    </button>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default CallScreen;
