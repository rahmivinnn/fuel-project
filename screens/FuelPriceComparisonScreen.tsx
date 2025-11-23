import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Fuel, MapPin, BarChart } from 'lucide-react';
import { Station, FuelPriceHistory } from '../types';
import { apiGetStations, apiGetFuelPriceHistory } from '../services/api';
import { useAppContext } from '../App';
import AnimatedPage from '../components/AnimatedPage';
import { formatPrice } from '../currency';

const FuelPriceComparisonScreen = () => {
    const navigate = useNavigate();
    const { user } = useAppContext();
    const [stations, setStations] = useState<Omit<Station, 'groceries' | 'fuelFriends'>[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
    const [sortBy, setSortBy] = useState<'price' | 'distance' | 'rating'>('price');
    const [fuelType, setFuelType] = useState<'regular' | 'premium' | 'diesel'>('regular');
    const [priceHistory, setPriceHistory] = useState<FuelPriceHistory[]>([]);
    const [selectedStation, setSelectedStation] = useState<string | null>(null);

    useEffect(() => {
        // Set default location to Chicago
        setUserLocation({ lat: 41.8781, lon: -87.6298 });
    }, []);

    useEffect(() => {
        const fetchStations = async () => {
            if (!userLocation) return;
            
            setIsLoading(true);
            try {
                const data = await apiGetStations(userLocation.lat, userLocation.lon);
                setStations(data);
            } catch (error) {
                console.error('Failed to fetch stations:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchStations();
    }, [userLocation]);

    useEffect(() => {
        const fetchPriceHistory = async () => {
            if (!selectedStation) return;
            
            try {
                const history = await apiGetFuelPriceHistory(selectedStation, fuelType);
                setPriceHistory(history);
            } catch (error) {
                console.error('Failed to fetch price history:', error);
            }
        };
        
        fetchPriceHistory();
    }, [selectedStation, fuelType]);

    const sortedStations = [...stations].sort((a, b) => {
        if (sortBy === 'price') {
            return (a.fuelPrices[fuelType] || 0) - (b.fuelPrices[fuelType] || 0);
        } else if (sortBy === 'distance') {
            const distA = parseFloat(a.distance) || 0;
            const distB = parseFloat(b.distance) || 0;
            return distA - distB;
        } else {
            return (b.rating || 0) - (a.rating || 0);
        }
    });

    const getCheapestStation = () => {
        if (sortedStations.length === 0) return null;
        return sortedStations[0];
    };

    const getAveragePrice = () => {
        if (stations.length === 0) return 0;
        const sum = stations.reduce((acc, station) => acc + (station.fuelPrices[fuelType] || 0), 0);
        return sum / stations.length;
    };

    const getPriceDifference = () => {
        const cheapest = getCheapestStation();
        if (!cheapest) return 0;
        const avg = getAveragePrice();
        return avg - cheapest.fuelPrices[fuelType];
    };

    // Simple chart component for price history
    const PriceChart = ({ data }: { data: FuelPriceHistory[] }) => {
        if (data.length === 0) return null;
        
        // Get min and max prices for scaling
        const prices = data.map(d => d.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice || 1; // Avoid division by zero
        
        // Chart dimensions
        const width = 300;
        const height = 150;
        const padding = 20;
        
        // Calculate points
        const points = data.map((d, i) => {
            const x = padding + (i * (width - 2 * padding) / (data.length - 1));
            const y = height - padding - ((d.price - minPrice) / priceRange) * (height - 2 * padding);
            return { x, y, price: d.price, date: d.date };
        });
        
        // Create path for the line
        let path = '';
        if (points.length > 0) {
            path = `M ${points[0].x},${points[0].y}`;
            for (let i = 1; i < points.length; i++) {
                path += ` L ${points[i].x},${points[i].y}`;
            }
        }
        
        return (
            <div className="mt-3">
                <h4 className="font-bold mb-2 text-sm">Price Trend</h4>
                <svg width="100%" height="120" viewBox={`0 0 ${width} ${height}`} className="w-full">
                    {/* Grid lines */}
                    <line 
                        x1={padding} 
                        y1={height - padding} 
                        x2={width - padding} 
                        y2={height - padding} 
                        stroke="#e5e7eb" 
                        strokeWidth="1" 
                    />
                    <line 
                        x1={padding} 
                        y1={padding} 
                        x2={width - padding} 
                        y2={padding} 
                        stroke="#e5e7eb" 
                        strokeWidth="1" 
                    />
                    
                    {/* Line chart */}
                    <path 
                        d={path} 
                        fill="none" 
                        stroke="#32B768" 
                        strokeWidth="2" 
                    />
                    
                    {/* Points */}
                    {points.map((point, i) => (
                        <circle 
                            key={i}
                            cx={point.x} 
                            cy={point.y} 
                            r="3" 
                            fill="#32B768" 
                        />
                    ))}
                    
                    {/* Price labels */}
                    <text 
                        x={padding - 8} 
                        y={padding + 4} 
                        textAnchor="end" 
                        fontSize="8" 
                        fill="#6b7280"
                    >
                        {formatPrice(maxPrice)}
                    </text>
                    <text 
                        x={padding - 8} 
                        y={height - padding + 4} 
                        textAnchor="end" 
                        fontSize="8" 
                        fill="#6b7280"
                    >
                        {formatPrice(minPrice)}
                    </text>
                </svg>
                
                {/* Date labels */}
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span className="text-xs">{new Date(data[0]?.date).toLocaleDateString()}</span>
                    <span className="text-xs">{new Date(data[data.length - 1]?.date).toLocaleDateString()}</span>
                </div>
            </div>
        );
    };

    return (
        <AnimatedPage>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-light-text dark:text-dark-text max-w-md mx-auto w-full mobile-container mobile-scroll">
            <header className="p-3 flex items-center sticky top-0 bg-gray-50 dark:bg-dark-bg z-10 border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => navigate('/settings')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card touch-target">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-lg font-bold text-center flex-grow -ml-8 mobile-text-lg">Fuel Price Comparison</h2>
            </header>

            <div className="p-3">
                {/* Fuel Type Selector */}
                <div className="bg-light-card dark:bg-dark-card rounded-2xl p-3 mb-3">
                    <h3 className="font-bold text-base mb-2">Select Fuel Type</h3>
                    <div className="grid grid-cols-3 gap-2">
                        <button 
                            onClick={() => setFuelType('regular')}
                            className={`py-2 rounded-lg text-sm font-medium ${
                                fuelType === 'regular' 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-100 dark:bg-dark-bg'
                            }`}
                        >
                            Regular
                        </button>
                        <button 
                            onClick={() => setFuelType('premium')}
                            className={`py-2 rounded-lg text-sm font-medium ${
                                fuelType === 'premium' 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-100 dark:bg-dark-bg'
                            }`}
                        >
                            Premium
                        </button>
                        <button 
                            onClick={() => setFuelType('diesel')}
                            className={`py-2 rounded-lg text-sm font-medium ${
                                fuelType === 'diesel' 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-100 dark:bg-dark-bg'
                            }`}
                        >
                            Diesel
                        </button>
                    </div>
                </div>

                {/* Stats Summary */}
                {stations.length > 0 && (
                    <div className="bg-light-card dark:bg-dark-card rounded-2xl p-3 mb-3">
                        <h3 className="font-bold text-base mb-2">Price Insights</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-primary/10 rounded-lg p-2">
                                <div className="text-primary flex items-center">
                                    <Fuel size={16} className="mr-1" />
                                    <span className="font-semibold text-sm">Cheapest</span>
                                </div>
                                <div className="mt-1">
                                    <p className="text-xl font-bold">
                                        {formatPrice(getCheapestStation()?.fuelPrices[fuelType] || 0)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {getCheapestStation()?.name}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-primary/10 rounded-lg p-2">
                                <div className="text-primary flex items-center">
                                    <TrendingUp size={16} className="mr-1" />
                                    <span className="font-semibold text-sm">Avg Price</span>
                                </div>
                                <div className="mt-1">
                                    <p className="text-xl font-bold">
                                        {formatPrice(getAveragePrice())}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Save {formatPrice(getPriceDifference())}/gal
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sorting Options */}
                <div className="bg-light-card dark:bg-dark-card rounded-2xl p-3 mb-3">
                    <h3 className="font-bold text-base mb-2">Sort By</h3>
                    <div className="grid grid-cols-3 gap-2">
                        <button 
                            onClick={() => setSortBy('price')}
                            className={`py-2 rounded-lg text-sm font-medium ${
                                sortBy === 'price' 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-100 dark:bg-dark-bg'
                            }`}
                        >
                            Price
                        </button>
                        <button 
                            onClick={() => setSortBy('distance')}
                            className={`py-2 rounded-lg text-sm font-medium ${
                                sortBy === 'distance' 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-100 dark:bg-dark-bg'
                            }`}
                        >
                            Distance
                        </button>
                        <button 
                            onClick={() => setSortBy('rating')}
                            className={`py-2 rounded-lg text-sm font-medium ${
                                sortBy === 'rating' 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-100 dark:bg-dark-bg'
                            }`}
                        >
                            Rating
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Stations List */}
                {!isLoading && (
                    <div className="space-y-3">
                        {sortedStations.map((station, index) => (
                            <div 
                                key={station.id} 
                                className="bg-light-card dark:bg-dark-card rounded-xl p-3 flex items-start"
                            >
                                <div className="mr-2 text-base font-bold text-primary">
                                    #{index + 1}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <h3 className="font-bold text-sm truncate">{station.name}</h3>
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <MapPin size={12} className="mr-1 flex-shrink-0" />
                                        <span className="truncate">{station.distance}</span>
                                    </div>
                                    <div className="flex items-center mt-2">
                                        <div className="bg-primary/10 px-2 py-1 rounded text-xs font-semibold">
                                            {formatPrice(station.fuelPrices[fuelType])}
                                        </div>
                                        <div className="ml-2 flex items-center">
                                            <span className="text-yellow-500 text-xs">★</span>
                                            <span className="ml-1 text-xs">
                                                {station.rating > 0 ? station.rating.toFixed(1) : 'N/A'}
                                                <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">
                                                    ({station.reviewCount})
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-1 ml-2">
                                    <button 
                                        onClick={() => navigate(`/station/${station.id}`)}
                                        className="bg-primary text-white px-3 py-1.5 rounded-full text-xs font-semibold"
                                    >
                                        View
                                    </button>
                                    <button 
                                        onClick={() => setSelectedStation(station.id)}
                                        className="flex items-center justify-center bg-gray-100 dark:bg-dark-bg px-3 py-1.5 rounded-full text-xs font-semibold"
                                    >
                                        <BarChart size={12} className="mr-1" />
                                        History
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {sortedStations.length === 0 && !isLoading && (
                            <div className="text-center py-10">
                                <p className="text-gray-500 dark:text-gray-400">No stations found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Price History Modal */}
            {selectedStation && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 animate-fade-in">
                    <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto animate-scale-in-smooth">
                        <div className="p-3 sticky top-0 bg-white dark:bg-dark-card z-10 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold">Price History</h3>
                            <button 
                                onClick={() => setSelectedStation(null)}
                                className="text-xl"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="p-3">
                            <div className="bg-primary/10 rounded-lg p-2 mb-3">
                                <p className="font-bold text-sm">
                                    {stations.find(s => s.id === selectedStation)?.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                    {fuelType} fuel
                                </p>
                            </div>
                            
                            {priceHistory.length > 0 ? (
                                <PriceChart data={priceHistory} />
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">No price history available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
        </AnimatedPage>
    );
};

export default FuelPriceComparisonScreen;