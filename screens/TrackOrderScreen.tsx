import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Phone } from 'lucide-react';
import { apiGetOrders } from '../services/api';
import { Order } from '../types';
import LottieAnimation from '../components/LottieAnimation';
import loadingAnimation from '../assets/animations/loading.json';
import AnimatedPage from '../components/AnimatedPage';

const TrackOrderScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // In a real app, you'd fetch a specific order by ID.
                // Here, we'll just grab the first ongoing order.
                const orders = await apiGetOrders();
                const ongoingOrder = orders.find(o => o.status === 'Ongoing');
                setOrder(ongoingOrder || null);
            } catch (error) {
                console.error("Failed to fetch order", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrder();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-dark-bg">
                <LottieAnimation animationData={loadingAnimation} width={100} height={100} />
            </div>
        );
    }
    
    if (!order) {
         return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-dark-bg p-4 text-center">
                <LottieAnimation animationData={loadingAnimation} width={80} height={80} />
                <p className="text-lg font-semibold mt-2">No active order to track.</p>
                 <button onClick={() => navigate('/home')} className="mt-4 text-primary font-semibold">Go Home</button>
            </div>
        );
    }


    return (
        <AnimatedPage>
        <div className="min-h-screen flex flex-col bg-white dark:bg-dark-bg text-light-text dark:text-dark-text">
            <header className="absolute top-0 left-0 right-0 p-4 z-20 flex items-center bg-transparent">
                <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-dark-card rounded-full shadow-md">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-center flex-grow text-light-text dark:text-dark-text -ml-10">Track Your Order</h2>
            </header>
            
            <div className="flex-grow relative">
                <img src="https://i.imgur.com/KzGZf4x.png" className="w-full h-full object-cover" alt="Map of order tracking"/>
            </div>

            <div className="p-4 bg-light-card dark:bg-dark-card rounded-t-3xl shadow-lg flex-shrink-0">
                <div className="flex items-center mb-4">
                    <img src={order.fuelFriend.avatarUrl} alt="Driver" className="w-16 h-16 rounded-full" />
                    <div className="ml-4 flex-grow">
                        <p className="font-bold text-lg">{order.fuelFriend.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{order.fuelFriend.location}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button className="p-3 bg-primary/20 text-primary rounded-full"><MessageSquare /></button>
                        <button className="p-3 bg-primary text-white rounded-full"><Phone /></button>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold mb-2">Your Delivery Time</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Estimated {order.deliveryTime}</p>
                    {/* Progress Bar */}
                    <div className="flex items-center justify-between text-primary mb-4">
                        <span className="text-2xl">🚗</span>
                        <div className="flex-grow h-0.5 bg-gray-200 dark:bg-gray-700 mx-2"><div className="h-full bg-primary w-1/2"></div></div>
                        <span className="text-2xl">⛽</span>
                        <div className="flex-grow h-0.5 bg-gray-200 dark:bg-gray-700 mx-2"></div>
                         <span className="text-2xl">🏠</span>
                    </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="font-bold mb-2">Order</h3>
                    {order.items.map((item, index) => (
                         <div key={index} className="flex justify-between text-sm">
                            <p>{item.name}</p>
                            <p className="font-semibold">${item.price.toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </AnimatedPage>
    );
};

export default TrackOrderScreen;
