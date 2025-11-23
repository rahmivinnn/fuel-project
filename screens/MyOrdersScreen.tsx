import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { apiGetOrders } from '../services/api';
import LottieAnimation from '../components/LottieAnimation';
import loadingAnimation from '../assets/animations/loading.json';
import AnimatedPage from '../components/AnimatedPage';
import Notification from '../components/Notification';

type Tab = 'ongoing' | 'history';

// Cache for orders data
const ordersCache = {
  data: null as Order[] | null,
  timestamp: 0,
  ttl: 5 * 60 * 1000 // 5 minutes cache
};

// FIX: Added an interface for component props to fix key prop issue.
interface OrderCardProps {
    order: Order;
    type: Tab;
    onNotification: (message: string) => void;
}

const OrderCard = ({ order, type, onNotification }: OrderCardProps) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showDispute, setShowDispute] = useState(false);
    const [showRating, setShowRating] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [showReceipt, setShowReceipt] = useState(false);
    
    const handleMarkComplete = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsProcessing(false);
        setShowRating(true);
    };
    
    const handleSubmitRating = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsProcessing(false);
        setShowRating(false);
        setShowReceipt(true);
        onNotification(`⭐ Awesome! Your ${rating}-star rating helps other drivers make better choices.`);
    };
    
    const handleDownloadReceipt = () => {
        const receiptElement = document.getElementById(`receipt-${order.id}`);
        if (receiptElement) {
            onNotification('✅ Receipt saved! Check your downloads folder for order details.');
            setTimeout(() => {
                setShowReceipt(false);
                setShowSuccess(true);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }, 500);
        }
    };
    
    const handleDispute = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsProcessing(false);
        setShowDispute(true);
        setTimeout(() => {
            setShowDispute(false);
        }, 3000);
    };
    
    return (
        <div className="bg-light-card dark:bg-dark-card p-4 rounded-xl mb-3 relative">
            {isProcessing && !showRating && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-10">
                    <div className="bg-white dark:bg-dark-card p-4 rounded-lg">
                        <LottieAnimation animationData={loadingAnimation} width={50} height={50} />
                        <p className="text-xs mt-2 text-center">Processing...</p>
                    </div>
                </div>
            )}
            {showRating && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-2xl text-center mx-4 max-w-sm w-full relative animate-scale-in">
                        {isProcessing && (
                            <div className="absolute inset-0 bg-white/90 dark:bg-dark-card/90 rounded-3xl flex flex-col items-center justify-center z-10">
                                <LottieAnimation animationData={loadingAnimation} width={60} height={60} />
                                <p className="text-sm mt-2 font-semibold">Submitting rating...</p>
                            </div>
                        )}
                        <h3 className="text-xl font-bold mb-4">Rate Your Experience</h3>
                        <p className="text-sm text-gray-500 mb-4">How was your service with {order.fuelFriend.name}?</p>
                        
                        <div className="flex justify-center space-x-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className="text-4xl active:scale-95 transition-transform"
                                >
                                    {star <= rating ? '⭐' : '☆'}
                                </button>
                            ))}
                        </div>
                        
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Share your feedback (optional)"
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl mb-4 bg-transparent text-sm"
                            rows={3}
                        />
                        
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setShowRating(false)}
                                className="flex-1 border-2 border-gray-300 dark:border-gray-600 py-2 rounded-full text-sm font-semibold active:scale-95 transition-transform"
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleSubmitRating}
                                disabled={rating === 0}
                                className="flex-1 bg-primary text-white py-2 rounded-full text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showReceipt && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-dark-card rounded-3xl shadow-2xl w-full overflow-hidden animate-scale-in" style={{maxWidth: '360px'}}>
                        <div id={`receipt-${order.id}`} className="p-6">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold mb-1">Order Receipt</h3>
                                <p className="text-sm text-gray-500">#{order.trackingNo}</p>
                            </div>
                            
                            <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">FuelFriend:</span>
                                    <span className="font-semibold">{order.fuelFriend.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Date:</span>
                                    <span className="font-semibold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-500">{item.name}:</span>
                                        <span className="font-semibold">${item.price.toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Fuel Cost:</span>
                                    <span className="font-semibold">${order.fuelCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Delivery Fee:</span>
                                    <span className="font-semibold">${order.deliveryFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-500">Subtotal:</span>
                                    <span className="font-semibold">${(order.fuelCost + order.items.reduce((sum, item) => sum + item.price, 0)).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total Paid:</span>
                                    <span className="text-primary">${order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div className="mt-6 text-center">
                                <p className="text-sm font-semibold text-gray-500 mb-2">Your Rating</p>
                                <div className="text-3xl mb-3">
                                    {[...Array(rating)].map((_, i) => <span key={i}>⭐</span>)}
                                </div>
                                {feedback && (
                                    <p className="text-xs text-gray-500 italic">"{feedback}"</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6 bg-gray-50 dark:bg-gray-900 space-y-3">
                            <button
                                onClick={handleDownloadReceipt}
                                className="w-full bg-primary text-white py-3 rounded-full font-semibold active:scale-95 transition-transform"
                            >
                                Download Receipt
                            </button>
                            <button
                                onClick={() => {
                                    setShowReceipt(false);
                                    setShowSuccess(true);
                                    setTimeout(() => window.location.reload(), 2000);
                                }}
                                className="w-full border-2 border-gray-300 dark:border-gray-600 py-3 rounded-full font-semibold active:scale-95 transition-transform"
                            >
                                Skip
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showSuccess && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-2xl text-center mx-4 max-w-sm w-full animate-scale-in">
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="text-white text-6xl font-bold">✓</div>
                        </div>
                        <p className="font-bold text-2xl mb-2">Order Completed!</p>
                        <p className="text-sm text-gray-500">Refreshing...</p>
                    </div>
                </div>
            )}
            {showDispute && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-2xl text-center mx-4 max-w-sm w-full animate-scale-in">
                        <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="text-white text-6xl font-bold">⚠</div>
                        </div>
                        <p className="font-bold text-2xl mb-2">Dispute Submitted</p>
                        <p className="text-sm text-gray-500">Support team will contact you</p>
                    </div>
                </div>
            )}
            <div className="flex items-center">
                <img src={order.fuelFriend.avatarUrl} alt={order.fuelFriend.name} className="w-12 h-12 rounded-full" />
                <div className="ml-3 flex-grow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-sm">{order.fuelFriend.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center"><MapPin size={10} className="mr-1" />{order.fuelFriend.location}</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">ID: <span className="text-primary">{order.trackingNo}</span></p>
                    </div>
                </div>
            </div>
            <div className="mt-3 flex space-x-2">
                {type === 'ongoing' ? (
                    <>
                        <button 
                            onClick={handleMarkComplete}
                            disabled={isProcessing}
                            className="flex-1 bg-primary text-white py-2 rounded-full text-xs font-semibold active:scale-95 transition-transform disabled:opacity-50"
                        >
                            Mark Complete
                        </button>
                        <button 
                            onClick={handleDispute}
                            disabled={isProcessing}
                            className="flex-1 border-2 border-primary text-primary py-2 rounded-full text-xs font-semibold active:scale-95 transition-transform disabled:opacity-50"
                        >
                            Dispute
                        </button>
                    </>
                ) : (
                    <button className={`w-full py-2 rounded-lg text-xs font-semibold ${order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {order.status}
                    </button>
                )}
            </div>
        </div>
    )
}

const MyOrdersScreen = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('ongoing');
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            // Check if we have cached data that's still valid
            const now = Date.now();
            const isCacheValid = ordersCache.data && (now - ordersCache.timestamp) < ordersCache.ttl;
            
            // If we have valid cache, use it immediately
            if (isCacheValid && ordersCache.data) {
                setOrders(ordersCache.data);
                return; // Don't show loading state since we have data
            }
            
            // Show loading only if we don't have any data
            if (!ordersCache.data) {
                setIsLoading(true);
            }
            
            try {
                // Fetch fresh data
                const data = await apiGetOrders();
                
                // Update cache
                ordersCache.data = data;
                ordersCache.timestamp = now;
                
                setOrders(data);
            } catch (error) {
                setError("Failed to fetch orders");
                // If we have cached data, keep showing it even if fetch fails
                if (!ordersCache.data) {
                    setOrders([]);
                }
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchOrders();
    }, []);

    const ongoingOrders = orders.filter(o => o.status === 'Ongoing');
    const historyOrders = orders.filter(o => o.status !== 'Ongoing');
    
    return (
        <AnimatedPage>
        <div className="min-h-screen flex flex-col bg-white dark:bg-dark-bg text-light-text dark:text-dark-text">
            <header className="p-4 flex items-center sticky top-0 bg-light-bg dark:bg-dark-bg z-10">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-center flex-grow -ml-10">Manage Orders</h2>
            </header>

            <div className="px-4">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={() => setActiveTab('ongoing')}
                        className={`flex-1 py-3 font-semibold transition-colors ${activeTab === 'ongoing' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                    >
                        Ongoing
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-3 font-semibold transition-colors ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                    >
                        History
                    </button>
                </div>
            </div>

            <div className="p-4 flex-grow overflow-y-auto">
                {isLoading && orders.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <LottieAnimation animationData={loadingAnimation} width={100} height={100} />
                    </div>
                ) : (
                    activeTab === 'ongoing' ? 
                        (ongoingOrders.length > 0 ? ongoingOrders.map(order => <OrderCard key={order.id} order={order} type="ongoing" onNotification={(msg) => { setNotificationMessage(msg); setShowNotification(true); }} />) : (
                          <div className="flex flex-col items-center mt-8">
                            <LottieAnimation animationData={loadingAnimation} width={60} height={60} />
                            <p className="text-center text-gray-500 mt-2">No ongoing orders.</p>
                          </div>
                        ))
                        :
                        (historyOrders.length > 0 ? historyOrders.map(order => <OrderCard key={order.id} order={order} type="history" onNotification={(msg) => { setNotificationMessage(msg); setShowNotification(true); }} />) : (
                          <div className="flex flex-col items-center mt-8">
                            <LottieAnimation animationData={loadingAnimation} width={60} height={60} />
                            <p className="text-center text-gray-500 mt-2">No past orders.</p>
                          </div>
                        ))
                )}
            </div>
        </div>
        
        {showNotification && (
            <Notification
                title="FuelFriendly"
                message={notificationMessage}
                onClose={() => setShowNotification(false)}
            />
        )}
        </AnimatedPage>
    );
};

export default MyOrdersScreen;