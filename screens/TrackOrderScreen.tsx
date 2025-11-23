import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Phone } from 'lucide-react';
import { apiGetOrders } from '../services/api';
import { Order } from '../types';
import LottieAnimation from '../components/LottieAnimation';
import loadingAnimation from '../assets/animations/loading.json';
import AnimatedPage from '../components/AnimatedPage';
import MapboxMap from '../components/MapboxMap';

// Cache for orders data
const ordersCache = {
  data: null as Order[] | null,
  timestamp: 0,
  ttl: 5 * 60 * 1000 // 5 minutes cache
};

const TrackOrderScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            const now = Date.now();
            const isCacheValid = ordersCache.data && (now - ordersCache.timestamp) < ordersCache.ttl;
            
            if (isCacheValid && ordersCache.data) {
                const ongoingOrder = ordersCache.data.find(o => o.status === 'Ongoing');
                if (ongoingOrder) {
                    setOrder(ongoingOrder);
                    return;
                }
            }
            
            if (!ordersCache.data) {
                setIsLoading(true);
            }
            
            try {
                const orders = await apiGetOrders();
                ordersCache.data = orders;
                ordersCache.timestamp = now;
                const ongoingOrder = orders.find(o => o.status === 'Ongoing');
                setOrder(ongoingOrder || null);
            } catch (error) {
                setError("Failed to fetch order data");
                if (!ordersCache.data) {
                    setOrder(null);
                }
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchOrder();
    }, []);

    // Show loading only if we have no data at all
    if (isLoading && !order) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-dark-bg">
                <LottieAnimation animationData={loadingAnimation} width={100} height={100} />
            </div>
        );
    }
    
    if (!order && !isLoading) {
         return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-dark-bg p-4 text-center">
                <LottieAnimation animationData={loadingAnimation} width={80} height={80} />
                <p className="text-lg font-semibold mt-2">No active order to track.</p>
                 <button onClick={() => navigate('/home')} className="mt-4 text-primary font-semibold">Go Home</button>
            </div>
        );
    }

    // If we have an order, show it even if we're still fetching updated data
    if (order) {
        return (
            <AnimatedPage>
            <div className="min-h-screen flex flex-col bg-white dark:bg-dark-bg text-light-text dark:text-dark-text">
                <header className="p-4 z-20 flex items-center bg-light-bg dark:bg-dark-bg border-b border-gray-200 dark:border-gray-700">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-xl font-bold text-center flex-grow -ml-10">Track Your Order</h2>
                </header>
                
                <div className="h-96 relative">
                    <MapboxMap 
                        stations={[]} 
                        userLocation={{ lat: 41.8781, lon: -87.6298 }} 
                        onStationSelect={() => {}}
                        key="track-map-static"
                    />
                </div>

                <div className="flex-1 p-4 bg-light-bg dark:bg-dark-bg overflow-y-auto">
                    <div className="flex items-center mb-4">
                        <img src={order.fuelFriend.avatarUrl} alt="Driver" className="w-16 h-16 rounded-full" />
                        <div className="ml-4 flex-grow">
                            <p className="font-bold text-lg">{order.fuelFriend.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{order.fuelFriend.location}</p>
                        </div>
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => navigate('/message', { state: { driverName: order.fuelFriend.name, driverAvatar: order.fuelFriend.avatarUrl, orderId: order.trackingNo } })}
                                className="p-3 bg-primary/20 text-primary rounded-full active:scale-95 transition-transform"
                            >
                                <MessageSquare />
                            </button>
                            <button 
                                onClick={() => navigate('/call', { state: { driverName: order.fuelFriend.name, driverAvatar: order.fuelFriend.avatarUrl } })}
                                className="p-3 bg-primary text-white rounded-full active:scale-95 transition-transform"
                            >
                                <Phone />
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold mb-2">Delivery Status</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Estimated arrival: {new Date(Date.now() + 15 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Approximately 15 minutes</p>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{width: '60%'}}></div>
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
    }

    // Fallback loading state
    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-dark-bg">
            <LottieAnimation animationData={loadingAnimation} width={100} height={100} />
        </div>
    );
};

export default TrackOrderScreen;