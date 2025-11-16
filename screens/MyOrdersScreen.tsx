import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { apiGetOrders } from '../services/api';
import LottieAnimation from '../components/LottieAnimation';
import loadingAnimation from '../assets/animations/loading.json';
import AnimatedPage from '../components/AnimatedPage';

type Tab = 'ongoing' | 'history';

// FIX: Added an interface for component props to fix key prop issue.
interface OrderCardProps {
    order: Order;
    type: Tab;
}

const OrderCard = ({ order, type }: OrderCardProps) => {
    return (
        <div className="bg-light-card dark:bg-dark-card p-4 rounded-2xl mb-4">
            <div className="flex items-center">
                <img src={order.fuelFriend.avatarUrl} alt={order.fuelFriend.name} className="w-16 h-16 rounded-full" />
                <div className="ml-4 flex-grow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold">{order.fuelFriend.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center"><MapPin size={12} className="mr-1" />{order.fuelFriend.location}</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Tracking no: <span className="text-primary">{order.trackingNo}</span></p>
                    </div>
                </div>
            </div>
            <div className="mt-4 flex space-x-2">
                {type === 'ongoing' ? (
                    <>
                        <button className="flex-1 bg-primary text-white py-2 rounded-full text-sm font-semibold">Request Completed</button>
                        <button className="flex-1 border-2 border-primary text-primary py-2 rounded-full text-sm font-semibold">Dispute</button>
                    </>
                ) : (
                    <button className={`w-full py-2 rounded-full text-sm font-semibold ${order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true);
                const data = await apiGetOrders();
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
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
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <LottieAnimation animationData={loadingAnimation} width={100} height={100} />
                    </div>
                ) : (
                    activeTab === 'ongoing' ? 
                        (ongoingOrders.length > 0 ? ongoingOrders.map(order => <OrderCard key={order.id} order={order} type="ongoing" />) : (
                          <div className="flex flex-col items-center mt-8">
                            <LottieAnimation animationData={loadingAnimation} width={60} height={60} />
                            <p className="text-center text-gray-500 mt-2">No ongoing orders.</p>
                          </div>
                        ))
                        :
                        (historyOrders.length > 0 ? historyOrders.map(order => <OrderCard key={order.id} order={order} type="history" />) : (
                          <div className="flex flex-col items-center mt-8">
                            <LottieAnimation animationData={loadingAnimation} width={60} height={60} />
                            <p className="text-center text-gray-500 mt-2">No past orders.</p>
                          </div>
                        ))
                )}
            </div>
        </div>
        </AnimatedPage>
    );
};

export default MyOrdersScreen;
