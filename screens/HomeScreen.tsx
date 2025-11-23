import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// FIX: Added Bell icon to imports.
import { Search, SlidersHorizontal, MapPin, Star, Fuel, Bell } from 'lucide-react';
import { Station } from '../types';
import { apiGetStations, apiGeocode } from '../services/api';
import { useAppContext } from '../App';
import LottieAnimation from '../components/LottieAnimation';
import MapboxMap from '../components/MapboxMap';
import GPSPopupModal from '../components/GPSPopupModal';
import loadingAnimation from '../assets/animations/loading.json';
import AnimatedPage from '../components/AnimatedPage';
import { formatPrice } from '../currency';
import Notification from '../components/Notification';

// FIX: Changed Station prop type to match what apiGetStations returns.
const StationCard = ({ station }: { station: Omit<Station, 'groceries' | 'fuelFriends'> }) => {
  const navigate = useNavigate();
  
  // State for image loading status
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Reset states when station changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [station.id]);

  // Fallback image URL - using a more reliable source
  const fallbackImageUrl = '/screens/gas station.jpg';

  return (
    <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-md p-3 flex space-x-3 transition-all duration-300 active:scale-[0.98] card-hover">
      <div className="relative">
        {/* Image with loading and error handling */}
        <img 
          src={station.imageUrl} 
          alt={station.name} 
          className={`w-20 h-20 object-cover rounded-lg transition-opacity duration-300 flex-shrink-0 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />
        
        {!imageLoaded && (
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {imageError && imageLoaded && (
          <img 
            src={fallbackImageUrl} 
            alt={station.name} 
            className="w-20 h-20 object-cover rounded-lg absolute inset-0"
          />
        )}
      </div>
      <div className="flex-grow flex flex-col justify-between min-w-0">
        <div>
          <h3 className="text-base font-bold truncate">{station.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
            <MapPin size={12} className="mr-1 text-primary flex-shrink-0" />
            <span className="truncate">{station.address}</span>
          </p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Price:</span>
              <span className="font-semibold">{formatPrice(station.fuelPrices.regular)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Distance:</span>
              <span className="font-semibold">{station.distance}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Rating:</span>
              <span className="font-semibold">{station.rating > 0 ? `${station.rating} ⭐` : 'N/A'}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate(`/station/${station.id}`)} 
          className="mt-3 w-full bg-primary text-white py-2 rounded-full text-sm font-semibold transition-all active:scale-95 btn-press"
        >
          Select
        </button>
      </div>
    </div>
  );
};

const HomeScreen = () => {
  const { user } = useAppContext();
  // FIX: Changed stations state to hold the partial station type returned by the api.
  const [stations, setStations] = useState<Omit<Station, 'groceries' | 'fuelFriends'>[]>([
    {
      id: 'default-1',
      name: 'Shell Downtown Chicago',
      address: '123 N Michigan Ave, Chicago, IL',
      distance: '0.8 mi',
      deliveryTime: '5-10 min',
      rating: 4.5,
      reviewCount: 128,
      imageUrl: '/screens/gas station.jpg',
      bannerUrl: '/screens/gas station.jpg',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e8/Shell_logo.svg/200px-Shell_logo.svg.png',
      fuelPrices: { regular: 3.45, premium: 3.85, diesel: 3.25 },
      lat: 41.8781,
      lon: -87.6298
    },
    {
      id: 'default-2',
      name: 'BP Lincoln Park',
      address: '456 N Clark St, Chicago, IL',
      distance: '1.2 mi',
      deliveryTime: '10-15 min',
      rating: 4.2,
      reviewCount: 96,
      imageUrl: '/screens/gas station.jpg',
      bannerUrl: '/screens/gas station.jpg',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/BP_logo.svg/200px-BP_logo.svg.png',
      fuelPrices: { regular: 3.42, premium: 3.82, diesel: 3.22 },
      lat: 41.9278,
      lon: -87.6320
    },
    {
      id: 'default-3',
      name: 'Mobil River North',
      address: '789 W Grand Ave, Chicago, IL',
      distance: '2.1 mi',
      deliveryTime: '15-20 min',
      rating: 4.0,
      reviewCount: 75,
      imageUrl: '/screens/gas station.jpg',
      bannerUrl: '/screens/gas station.jpg',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/ExxonMobil_Logo.svg/200px-ExxonMobil_Logo.svg.png',
      fuelPrices: { regular: 3.48, premium: 3.88, diesel: 3.28 },
      lat: 41.8917,
      lon: -87.6364
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Connecting to server...');
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [showGPSPopup, setShowGPSPopup] = useState(false);
  const [accuracyIssue, setAccuracyIssue] = useState(false);
  
  const [query, setQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();
  
  // Show notification on mount
  useEffect(() => {
    setTimeout(() => setShowNotification(true), 2000);
  }, []);

  useEffect(() => {
    const fetchStations = async () => {
      if (!userLocation) {
        return;
      }
      
      setIsLoading(true);
      setLoadingMessage('Connecting to US server...');
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoadingMessage('Authenticating request...');
        await new Promise(resolve => setTimeout(resolve, 400));
        setLoadingMessage('Fetching nearby stations...');
        
        const startTime = Date.now();
        const data = await apiGetStations(userLocation.lat, userLocation.lon);
        const elapsed = Date.now() - startTime;
        
        setLoadingMessage('Processing data...');
        if (elapsed < 800) {
          await new Promise(resolve => setTimeout(resolve, 800 - elapsed));
        }
        
        if (data && data.length > 0) {
          setStations(data);
        }
      } catch (err: any) {
        // Keep default stations on error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStations();
  }, [userLocation]);

  useEffect(() => {
    // Always use Chicago as default location
    const defaultLocation = { lat: 41.8781, lon: -87.6298 };
    if (!userLocation) {
      setUserLocation(defaultLocation);
    }
  }, []);

  const handleStationSelect = (station: Omit<Station, 'groceries' | 'fuelFriends'>) => {
    navigate(`/station/${station.id}`);
  };

  return (
    <AnimatedPage>
    <div className="h-full w-full flex flex-col bg-gray-50 dark:bg-gray-900">

      
      {/* Header - Fixed at top */}
      <header className="p-3 bg-light-bg dark:bg-dark-bg sticky top-0 z-10 space-y-3 animate-slide-in-left">
        {/* Top row with user avatar on the left, logo centered, and notifications on the right */}
        <div className="flex justify-between items-center">
          <div className="flex items-center justify-start flex-1">
            <img src={user?.avatarUrl || 'https://ui-avatars.com/api/?name=User&background=random'} alt="User Avatar" className="w-10 h-10 rounded-full" />
          </div>
          <div className="flex items-center justify-center flex-1">
            <img src="/assets/images/tulisan fuel.png" alt="FuelFriendly" className="object-contain w-full" style={{maxHeight: '5rem'}} />
          </div>
          <div className="flex items-center justify-end flex-1">
            <button className="p-2 rounded-full active:bg-gray-100 dark:active:bg-dark-card relative ripple">
              <Bell size={24} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
        
        {/* Search bar row */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <LottieAnimation animationData={loadingAnimation} width={24} height={24} />
              </div>
            )}
            <input 
              type="text" 
              placeholder="Search city or place" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && query.trim()) {
                  try {
                    setIsLoading(true);
                    setError('');
                    const data = await apiGeocode(query.trim());
                    let lat: number, lon: number;
                    if (data.lat && data.lon) {
                      lat = data.lat; lon = data.lon;
                    } else {
                      const item = Array.isArray(data) && data.length ? data[0] : null;
                      if (!item) throw new Error('Place not found');
                      lat = parseFloat(item.lat); lon = parseFloat(item.lon);
                    }
                    setUserLocation({ lat, lon });
                    setQuery('');
                  } catch (err: any) {
                    setError(err.message || 'Search failed');
                  }
                }
              }}
              className="w-full pl-10 pr-10 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-all input-focus" 
            />

          </div>
          <button 
            onClick={() => setShowFilter(true)}
            className="p-3 bg-light-card dark:bg-dark-card rounded-full shadow transition-transform active:scale-95 ripple"
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </header>

      {/* Map Section - Always visible and prominent */}
      <div className="p-3 w-full flex-shrink-0 animate-slide-in-right">
        <div className="h-80 w-full bg-gray-300 dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden relative">
          {/* Always show the map, even during loading or errors */}
          <MapboxMap 
            stations={stations} 
            userLocation={userLocation} 
            onStationSelect={handleStationSelect} 
          />
          {/* Show loading indicator on top of map if needed - doesn't hide the map */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-xl z-10 transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <LottieAnimation animationData={loadingAnimation} width={70} height={70} />
            <div className="mt-3 bg-white/95 dark:bg-dark-card/95 px-5 py-2.5 rounded-full shadow-lg">
              <p className="text-xs font-bold text-primary">{loadingMessage}</p>
            </div>
          </div>
          {/* Show error message on map if needed - doesn't hide the map */}
          <div className={`absolute bottom-0 left-0 right-0 bg-red-500/90 text-white p-3 text-center text-base rounded-b-2xl z-10 transition-opacity duration-300 ${error ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {error}
          </div>
        </div>
      </div>

      {/* Scrollable content - Stations List Section */}
      <div className="flex-grow overflow-y-auto pb-20">
        <div className="px-3">
          <div className="flex justify-between items-center mb-4 animate-slide-in-left">
            <h2 className="text-xl font-bold">Fuel Stations Nearby</h2>
            <div className={`flex items-center text-primary transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
              <LottieAnimation animationData={loadingAnimation} width={24} height={24} />
              <span className="ml-2 text-sm font-semibold">{loadingMessage}</span>
            </div>
          </div>
          
          {/* Always show stations list, even during loading - no conditional rendering that causes flickering */}
          <div className="space-y-3">
            {stations.map((station, index) => (
              <div key={station.id} className="animate-slide-in-left" style={{ animationDelay: `${index * 50}ms` }}>
                <StationCard station={station} />
              </div>
            ))}
            {/* Show loading or empty state only when there are no stations */}
            {stations.length === 0 && (
              <div className="flex flex-col items-center py-10">
                <LottieAnimation animationData={loadingAnimation} width={70} height={70} />
                <p className="text-center text-gray-500 mt-3 text-lg">
                  {isLoading ? 'Finding nearby stations...' : 'No nearby stations found'}
                </p>
                {error && (
                  <button 
                    onClick={() => {
                      setIsLoading(true);
                      setError('');
                      // Try to fetch stations again
                      if (userLocation) {
                        apiGetStations(userLocation.lat, userLocation.lon)
                          .then(data => {
                            setStations(data);
                            setIsLoading(false);
                          })
                          .catch(err => {
                            setError(err.message);
                            setIsLoading(false);
                          });
                      }
                    }}
                    className="mt-5 px-5 py-3 bg-primary text-white rounded-full text-base font-bold ripple"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Show additional error message below the list if needed */}
          <div className={`text-center text-red-500 p-5 mt-5 bg-red-50 dark:bg-red-900/20 rounded-lg transition-all duration-300 ${error && stations.length > 0 ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}>
            <p className="text-lg">{error}</p>
            <button 
              onClick={() => {
                setIsLoading(true);
                setError('');
                // Try to fetch stations again
                if (userLocation) {
                  apiGetStations(userLocation.lat, userLocation.lon)
                    .then(data => {
                      setStations(data);
                      setIsLoading(false);
                    })
                    .catch(err => {
                      setError(err.message);
                      setIsLoading(false);
                    });
                }
              }}
              className="mt-3 px-5 py-3 bg-primary text-white rounded-full text-base font-bold ripple"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
      
      {/* Filter Modal */}
      {showFilter && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-dark-card rounded-3xl w-full p-6 shadow-2xl animate-scale-in-smooth" style={{maxWidth: '360px'}}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Filter Stations</h3>
              <button onClick={() => setShowFilter(false)} className="text-2xl">&times;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Distance</label>
                <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent">
                  <option>Within 1 mile</option>
                  <option>Within 5 miles</option>
                  <option>Within 10 miles</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Price Range</label>
                <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent">
                  <option>All Prices</option>
                  <option>Under $3.50</option>
                  <option>$3.50 - $4.00</option>
                  <option>Above $4.00</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Rating</label>
                <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent">
                  <option>All Ratings</option>
                  <option>4+ Stars</option>
                  <option>3+ Stars</option>
                </select>
              </div>
              <button 
                onClick={() => setShowFilter(false)}
                className="w-full bg-primary text-white py-3 rounded-full font-semibold active:scale-95 transition-transform btn-press"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
    {showNotification && (
      <Notification
        title="💰 Fuel Savings Tip"
        message="Regular gas is $0.40 cheaper per gallon than Premium in your area. Save up to $8 per fill-up!"
        onClose={() => setShowNotification(false)}
      />
    )}
    </AnimatedPage>
  );
};

export default HomeScreen;