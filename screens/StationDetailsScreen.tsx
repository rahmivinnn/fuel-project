import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Star, Minus, Plus, Trash2 } from 'lucide-react';
import { Station, GroceryItem, FuelFriend } from '../types';
import { apiGetStationDetails } from '../services/api';
import LottieAnimation from '../components/LottieAnimation';
import loadingAnimation from '../assets/animations/loading.json';
import AnimatedPage from '../components/AnimatedPage';

const StationDetailsScreen = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [station, setStation] = useState<Station | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOrdering, setIsOrdering] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchDetails = async () => {
            try {
                setIsLoading(true);
                const data = await apiGetStationDetails(id);
                setStation(data);
            } catch (error) {
                console.error("Failed to fetch station details:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-dark-bg">
                <LottieAnimation animationData={loadingAnimation} width={100} height={100} />
            </div>
        );
    }

    if (!station) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-dark-bg">
                <p>Station not found.</p>
                 <button onClick={() => navigate(-1)} className="mt-4 text-primary font-semibold">Go Back</button>
            </div>
        );
    }

    return (
        <AnimatedPage>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-light-text dark:text-dark-text pb-24">
            <div className="relative h-48">
                <img src={station.bannerUrl} alt="Station Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <img src={station.logoUrl} alt="Station Logo" className="w-24 h-24 rounded-full border-4 border-white" />
                </div>
                <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 bg-white/20 text-white rounded-full backdrop-blur-sm">
                    <ArrowLeft size={24} />
                </button>
            </div>

            <div className="p-4 -mt-8 z-10 relative">
                 <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold">{station.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center"><MapPin size={16} className="mr-1" /> {station.address}</p>
                </div>
                
                <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-lg p-4 mb-4">
                    <h2 className="text-lg font-bold mb-2">Fuel Prices</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Regular</span><span>{Number.isNaN(station.fuelPrices.regular) ? 'N/A' : `$${station.fuelPrices.regular.toFixed(2)} per liter`}</span></div>
                        <div className="flex justify-between"><span>Premium</span><span>{Number.isNaN(station.fuelPrices.premium) ? 'N/A' : `$${station.fuelPrices.premium.toFixed(2)} per liter`}</span></div>
                        <div className="flex justify-between"><span>Diesel</span><span>{Number.isNaN(station.fuelPrices.diesel) ? 'N/A' : `$${station.fuelPrices.diesel.toFixed(2)} per liter`}</span></div>
                    </div>
                </div>

                <div className="flex justify-around text-center text-sm mb-4">
                    <div className="flex items-center space-x-1"><MapPin size={16} className="text-primary" /><span>{station.distance}</span></div>
                    <div className="flex items-center space-x-1"><Clock size={16} className="text-primary" /><span>{station.deliveryTime}</span></div>
                    <div className="flex items-center space-x-1"><Star size={16} className="text-yellow-400" /><span>{station.rating} ({station.reviewCount} reviews)</span></div>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-bold">Groceries</h2>
                        <a href="#" className="text-primary font-semibold text-sm">See all</a>
                    </div>
                    {station.groceries.map(item => <GroceryItemCard key={item.id} item={item} />)}
                </div>
                
                <div>
                     <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-bold">Select Fuel friend</h2>
                        <a href="#" className="text-primary font-semibold text-sm">See all</a>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {station.fuelFriends.map(friend => <FuelFriendCard key={friend.id} friend={friend} />)}
                    </div>
                </div>
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm border-t border-light-border dark:border-dark-border">
                <button onClick={async () => { setIsOrdering(true); setTimeout(() => navigate('/checkout'), 600); }} className="w-full bg-primary text-white py-4 rounded-full text-lg font-semibold transition-all active:scale-95 hover:shadow-xl flex items-center justify-center">
                    {isOrdering ? <LottieAnimation animationData={loadingAnimation} width={28} height={28} /> : 'Order Now'}
                </button>
            </div>
        </div>
        </AnimatedPage>
    );
};

// FIX: Added an interface for component props to fix key prop issue.
interface GroceryItemCardProps {
    item: GroceryItem;
}

const GroceryItemCard = ({ item }: GroceryItemCardProps) => (
    <div className="flex items-center bg-light-card dark:bg-dark-card p-2 rounded-xl mb-2">
        <img src={item.imageUrl} className="w-12 h-12 rounded-lg" alt={item.name} />
        <div className="ml-3 flex-grow">
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
        </div>
        <button className="px-4 py-1 bg-primary text-white rounded-lg text-sm">Add</button>
    </div>
);

// FIX: Added an interface for component props to fix key prop issue.
interface FuelFriendCardProps {
    friend: FuelFriend;
}

const FuelFriendCard = ({ friend }: FuelFriendCardProps) => (
    <div className="bg-light-card dark:bg-dark-card p-3 rounded-xl text-center">
        <img src={friend.avatarUrl} className="w-16 h-16 rounded-full mx-auto mb-2" alt={friend.name}/>
        <p className="font-semibold">{friend.name}</p>
        <p className="text-xs text-gray-500">${friend.rate.toFixed(2)}</p>
        <p className="text-xs text-gray-500 flex items-center justify-center"><Star size={12} className="text-yellow-400 mr-1"/>{friend.rating} ({friend.reviewCount} reviews)</p>
        <button className="mt-2 w-full text-sm bg-primary text-white py-1.5 rounded-full">Select</button>
    </div>
);

export default StationDetailsScreen;
