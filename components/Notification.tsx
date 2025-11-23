import React, { useEffect, useState } from 'react';

interface NotificationProps {
    title: string;
    message: string;
    icon?: string;
    duration?: number;
    onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({ title, message, icon, duration = 4000, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // Slide in with enhanced animation
        const slideInTimer = setTimeout(() => setIsVisible(true), 10);

        // Auto dismiss with longer duration for better UX
        const dismissTimer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            clearTimeout(slideInTimer);
            clearTimeout(dismissTimer);
        };
    }, [duration]);

    const handleClose = () => {
        setIsLeaving(true);
        // Longer timeout for smoother exit animation
        setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, 400);
    };

    return (
        <div 
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-400 ease-out ${
                isVisible && !isLeaving ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}
            style={{ maxWidth: '380px', width: 'calc(100% - 32px)' }}
        >
            <div 
                onClick={handleClose}
                className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 flex items-start space-x-3 cursor-pointer active:scale-95 transition-all duration-200 ease-out hover:shadow-lg"
            >
                {icon && (
                    <img src={icon} alt="" className="w-10 h-10 rounded-lg flex-shrink-0 animate-bounce-in" />
                )}
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-light-text dark:text-dark-text truncate">{title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{message}</p>
                </div>
            </div>
        </div>
    );
};

export default Notification;