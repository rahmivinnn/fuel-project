import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';

const MessageScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { driverName, driverAvatar, orderId } = location.state || {};
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, text: 'Hello! I\'m on my way to deliver your fuel.', sender: 'driver', time: new Date(Date.now() - 300000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
        { id: 2, text: 'Great! How long will it take?', sender: 'user', time: new Date(Date.now() - 240000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
        { id: 3, text: 'Approximately 10 minutes. I\'ll be there soon!', sender: 'driver', time: new Date(Date.now() - 180000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
    ]);

    const handleSend = () => {
        if (message.trim()) {
            const newMessage = {
                id: messages.length + 1,
                text: message,
                sender: 'user',
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages([...messages, newMessage]);
            setMessage('');
            
            // Simulate driver response after 2-3 seconds
            setTimeout(() => {
                const responses = [
                    'Got it, thanks!',
                    'Okay, I\'ll be there shortly.',
                    'Understood!',
                    'No problem!',
                    'Sure thing!'
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                const driverMessage = {
                    id: messages.length + 2,
                    text: randomResponse,
                    sender: 'driver',
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, driverMessage]);
            }, 2000 + Math.random() * 1000);
        }
    };

    return (
        <AnimatedPage>
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg">
                <header className="p-4 bg-light-bg dark:bg-dark-bg border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full active:bg-gray-100 dark:active:bg-dark-card">
                        <ArrowLeft size={24} />
                    </button>
                    <img src={driverAvatar || 'https://ui-avatars.com/api/?name=Driver'} alt="Driver" className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                        <h2 className="font-bold">{driverName || 'Driver'}</h2>
                        <p className="text-xs text-gray-500">Order #{orderId || 'N/A'}</p>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-light-card dark:bg-dark-card'} rounded-2xl px-4 py-2`}>
                                <p className="text-sm">{msg.text}</p>
                                <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>{msg.time}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-light-bg dark:bg-dark-bg border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                            onClick={handleSend}
                            className="p-3 bg-primary text-white rounded-full active:scale-95 transition-transform"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default MessageScreen;
