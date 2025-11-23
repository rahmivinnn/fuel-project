import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Star, Minus, Plus, ShoppingCart, Package, Fuel, MapPinned, Zap } from 'lucide-react';
import { Station, GroceryItem, FuelFriend } from '../types';
// Using Lucide icons for better performance and theming
import { apiGetStationDetails } from '../services/api';
import LottieAnimation from '../components/LottieAnimation';
import loadingAnimation from '../assets/animations/loading.json';
import AnimatedPage from '../components/AnimatedPage';
import { formatPrice } from '../currency';

const StationDetailsScreen = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [station, setStation] = useState<Station | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOrdering, setIsOrdering] = useState(false);
    const [cartItems, setCartItems] = useState<{item: GroceryItem, quantity: number}[]>([]);
    const [activeTab, setActiveTab] = useState<'groceries' | 'fuelFriends'>('groceries');

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

    const addToCart = (item: GroceryItem) => {
        setCartItems(prev => {
            const existing = prev.find(cartItem => cartItem.item.id === item.id);
            if (existing) {
                return prev.map(cartItem => 
                    cartItem.item.id === item.id 
                        ? {...cartItem, quantity: cartItem.quantity + 1} 
                        : cartItem
                );
            } else {
                return [...prev, {item, quantity: 1}];
            }
        });
    };

    const removeFromCart = (itemId: string) => {
        setCartItems(prev => {
            const existing = prev.find(cartItem => cartItem.item.id === itemId);
            if (existing && existing.quantity > 1) {
                return prev.map(cartItem => 
                    cartItem.item.id === itemId 
                        ? {...cartItem, quantity: cartItem.quantity - 1} 
                        : cartItem
                );
            } else {
                return prev.filter(cartItem => cartItem.item.id !== itemId);
            }
        });
    };

    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.item.price * item.quantity), 0);
    };

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
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white relative">
            {/* Header with Banner */}
            <div className="relative w-full" style={{ paddingTop: '40%' }}>
                <div className="absolute inset-0 w-full h-full">
                    {/* Fallback background color */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900">
                        <img 
                            src={station.bannerUrl || 'https://images.unsplash.com/photo-1601001815894-4cd69caf8a2b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80'} 
                            alt="Station Banner" 
                            className="w-full h-full object-cover opacity-90"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement?.classList.add('bg-gradient-to-br', 'from-blue-600', 'to-blue-800');
                            }}
                        />
                    </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h1 className="text-2xl font-bold mb-2 drop-shadow-md">{station.name}</h1>
                        <div className="flex items-start mb-2">
                            <Star size={16} className="flex-shrink-0 mt-0.5 mr-1 text-amber-400" fill="currentColor" />
                            <span className="text-sm font-medium">{station.rating} ({station.reviewCount})</span>
                        </div>
                        <div className="flex items-start">
                            <MapPin size={16} className="flex-shrink-0 mt-0.5 mr-1" />
                            <p className="text-sm leading-tight line-clamp-2">{station.address}</p>
                        </div>
                    </div>
                </div>
                
                    {/* Back Button */}
                    <button 
                        onClick={() => navigate(-1)} 
                        className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center bg-black/40 text-white rounded-full backdrop-blur-sm z-10"
                        aria-label="Kembali"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    
                    {/* Cart Indicator */}
                    {cartItems.length > 0 && (
                        <button 
                            onClick={() => navigate('/checkout', { state: { cartItems, station } })}
                            className="absolute top-4 right-4 p-2 bg-primary text-white rounded-full flex items-center shadow-lg z-10"
                            aria-label="Keranjang"
                        >
                            <ShoppingCart size={18} />
                            <span className="ml-1 text-sm font-medium">{getTotalItems()}</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="px-4 -mt-6 relative z-10">
                {/* Fuel Prices Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 mb-4 mx-auto w-full border border-gray-100 dark:border-gray-700">
                    <h2 className="text-base font-bold mb-3 text-gray-800 dark:text-white">Harga Bahan Bakar</h2>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-center">
                            <div className="text-blue-600 dark:text-blue-400 font-medium">Premium</div>
                            <div className="font-bold text-gray-800 dark:text-white">{formatPrice(station.fuelPrices.regular)}</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-center">
                            <div className="text-green-600 dark:text-green-400 font-medium">Pertalite</div>
                            <div className="font-bold text-gray-800 dark:text-white">{formatPrice(station.fuelPrices.premium)}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg text-center">
                            <div className="text-gray-600 dark:text-gray-300 font-medium">Solar</div>
                            <div className="font-bold text-gray-800 dark:text-white">{formatPrice(station.fuelPrices.diesel)}</div>
                        </div>
                    </div>
                </div>

                {/* Station Info Bar */}
                <div className="flex justify-between items-center text-sm mb-4 bg-white dark:bg-dark-card p-3 rounded-xl shadow-sm">
                    <div className="flex flex-col items-center flex-1">
                        <div className="w-10 h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-full mb-1">
                            <Fuel size={16} className="text-blue-500" />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300 text-center">Harga Terbaik</span>
                    </div>
                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-600"></div>
                    <div className="flex flex-col items-center flex-1">
                        <div className="w-10 h-10 flex items-center justify-center bg-green-50 dark:bg-green-900/20 rounded-full mb-1">
                            <MapPin size={16} className="text-green-500" />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300 text-center">{station.distance}</span>
                    </div>
                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-600"></div>
                    <div className="flex flex-col items-center flex-1">
                        <div className="w-10 h-10 flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 rounded-full mb-1">
                            <Star size={16} className="text-amber-400" fill="currentColor" />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300 text-center">{station.rating} ({station.reviewCount})</span>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="sticky top-0 z-10 bg-white dark:bg-dark-bg pt-2 pb-1 mb-3">
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button 
                            className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center ${
                                activeTab === 'groceries' 
                                    ? 'text-primary border-b-2 border-primary font-semibold' 
                                    : 'text-gray-500 dark:text-gray-400'
                            }`}
                            onClick={() => setActiveTab('groceries')}
                        >
                            <Package size={16} className="mr-1.5" />
                            Produk
                        </button>
                        <button 
                            className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center ${
                                activeTab === 'fuelFriends' 
                                    ? 'text-primary border-b-2 border-primary font-semibold' 
                                    : 'text-gray-500 dark:text-gray-400'
                            }`}
                            onClick={() => setActiveTab('fuelFriends')}
                        >
                            <Zap size={16} className="mr-1.5" />
                            Layanan
                        </button>
                    </div>
                </div>

                {/* Tab content */}
                {activeTab === 'groceries' && (
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-3 px-1">
                            <h2 className="text-base font-bold text-gray-800 dark:text-white">Daftar Produk</h2>
                            <span className="text-primary text-sm font-medium">{station.groceries.length} produk tersedia</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {station.groceries.map(item => (
                                <GroceryItemCard 
                                    key={item.id} 
                                    item={item} 
                                    onAdd={() => addToCart(item)}
                                    onRemove={() => removeFromCart(item.id)}
                                    quantity={cartItems.find(cartItem => cartItem.item.id === item.id)?.quantity || 0}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'fuelFriends' && (
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-3 px-1">
                            <h2 className="text-base font-bold text-gray-800 dark:text-white">Layanan Tersedia</h2>
                        </div>
                        <div className="space-y-3">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-bold">Select Fuel Friend</h2>
                            <span className="text-primary font-semibold text-sm">{station.fuelFriends.length} available</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {station.fuelFriends.map(friend => <FuelFriendCard key={friend.id} friend={friend} />)}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Fixed bottom bar for cart */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-700 p-3 shadow-2xl">
                    <div className="flex justify-between items-center max-w-2xl mx-auto">
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Belanja</p>
                            <p className="font-bold text-lg text-gray-800 dark:text-white">{formatPrice(getTotalPrice())}</p>
                        </div>
                        <button 
                            onClick={() => navigate('/checkout', { state: { cartItems, station } })}
                            className="bg-primary hover:bg-primary/90 transition-colors text-white px-5 py-3 rounded-xl font-semibold text-sm flex items-center shadow-lg shadow-primary/20"
                        >
                            <ShoppingCart size={18} className="mr-2" />
                            Checkout ({getTotalItems()})
                        </button>
                    </div>
                </div>
            )}
            
            <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto p-4 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm border-t border-light-border dark:border-dark-border z-40">
                <button onClick={async () => { setIsOrdering(true); setTimeout(() => navigate('/checkout'), 600); }} className="w-full bg-primary text-white py-4 rounded-full text-lg font-semibold transition-all active:scale-95 hover:shadow-xl flex items-center justify-center">
                    {isOrdering ? <LottieAnimation animationData={loadingAnimation} width={28} height={28} /> : 'Order Fuel Now'}
                </button>
            </div>
        </div>
        </AnimatedPage>
    );
};

interface GroceryItemCardProps {
    item: GroceryItem;
    onAdd: () => void;
    onRemove: () => void;
    quantity: number;
}

const GroceryItemCard = ({ item, onAdd, onRemove, quantity }: GroceryItemCardProps) => {
    return (
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="relative pb-[100%] bg-gray-50 dark:bg-gray-800">
                <img 
                    src={item.imageUrl || 'https://via.placeholder.com/150'} 
                    alt={item.name} 
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {item.discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        -{item.discount}%
                    </div>
                )}
            </div>
            <div className="p-3">
                <h3 className="font-semibold text-sm text-gray-800 dark:text-white line-clamp-2 h-10">{item.name}</h3>
                <p className="text-primary font-bold mt-1 text-sm">{formatPrice(item.price)}</p>
                {item.originalPrice > item.price && (
                    <p className="text-xs text-gray-400 line-through">{formatPrice(item.originalPrice)}</p>
                )}
                
                {quantity > 0 ? (
                    <div className="flex items-center justify-between mt-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onRemove(); }} 
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="font-medium text-sm">{quantity}</span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onAdd(); }} 
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAdd(); }} 
                        className="w-full mt-2 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        + Tambah
                    </button>
                )}
            </div>
        </div>
    );
};
interface FuelFriendCardProps {
    friend: FuelFriend;
}

const FuelFriendCard = ({ friend }: FuelFriendCardProps) => {
    const navigate = useNavigate();
    
    return (
        <div className="bg-light-card dark:bg-dark-card p-3 rounded-xl text-center">
            <img src={friend.avatarUrl} className="w-16 h-16 rounded-full mx-auto mb-2" alt={friend.name}/>
            <p className="font-semibold text-sm">{friend.name.split(' (')[0]}</p>
            <p className="text-xs text-gray-500 mb-1">{friend.name.split(' (')[1]?.replace(')', '') || ''}</p>
            <p className="text-primary font-bold text-sm">{formatPrice(friend.rate)}</p>
            <p className="text-xs text-gray-500 flex items-center justify-center"><Star size={12} className="text-yellow-400 mr-1"/>{friend.rating} ({friend.reviewCount} reviews)</p>
            <button 
                onClick={() => navigate('/checkout')}
                className="mt-2 w-full text-sm bg-primary text-white py-1.5 rounded-full"
            >
                Select
            </button>
        </div>
    );
};

export default StationDetailsScreen;