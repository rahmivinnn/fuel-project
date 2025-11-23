import { User, Station, Order } from '../types';

export const apiLogin = async (email: string, pass: string): Promise<User> => {
    throw new Error('Use Firebase login');
};

export const apiLogout = () => {
    localStorage.removeItem('authToken');
};

export const apiRegister = async (data: any): Promise<User> => {
    const base = (import.meta as any).env.VITE_API_BASE_URL || ((import.meta as any).env.DEV ? 'http://localhost:4000' : '');
    const payload: Partial<User> = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        city: data.city || '',
        avatarUrl: data.avatarUrl || '',
        vehicles: [{
            id: `v-${Date.now()}`,
            brand: data.vehicleBrand,
            color: data.vehicleColor,
            licenseNumber: data.licenseNumber,
            fuelType: data.fuelType
        }]
    } as any;
    const res = await fetch(`${base}/api/user/me?email=${encodeURIComponent(data.email)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to save profile');
    
    // Check if response has content before parsing JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response from server');
    }
    
    const text = await res.text();
    if (!text) {
        throw new Error('Empty response from server');
    }
    
    try {
        return JSON.parse(text);
    } catch (parseError) {
        throw new Error('Invalid JSON response from server');
    }
};

export const apiGetStations = async (lat: number, lon: number): Promise<Omit<Station, 'groceries' | 'fuelFriends'>[]> => {
    const radius = 10000;
    // Use Vercel API endpoints when deployed to Vercel
    const isVercel = typeof process !== 'undefined' && process.env.NOW_REGION;
    const base = isVercel ? '' : ((import.meta as any).env.VITE_API_BASE_URL || (import.meta as any).env.DEV ? 'http://localhost:4000' : '');
    const url = isVercel ? `/api/stations?lat=${lat}&lon=${lon}&radius=${radius}` : 
               base ? `${base}/api/stations?lat=${lat}&lon=${lon}&radius=${radius}` : 
               `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(`[out:json];node[amenity=fuel](around:${radius},${lat},${lon});out;`)}`;
    
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Failed to fetch stations: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        
        const toKm = (aLat: number, aLon: number, bLat: number, bLon: number) => {
            const R = 6371e3;
            const dLat = (bLat - aLat) * Math.PI / 180;
            const dLon = (bLon - aLon) * Math.PI / 180;
            const sa = Math.sin(dLat/2) ** 2 + Math.cos(aLat*Math.PI/180) * Math.cos(bLat*Math.PI/180) * Math.sin(dLon/2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(sa), Math.sqrt(1-sa));
            return (R * c) / 1000;
        };
        
        const stations = (data.elements || []).map((el: any, idx: number) => {
            const name = el.tags?.name || 'Fuel Station';
            const address = [el.tags?.street, el.tags?.city].filter(Boolean).join(', ') || 'Nearby';
            const distKm = el.lat && el.lon ? toKm(lat, lon, el.lat, el.lon) : 0;
            
            // Generate a more reliable image URL
            const imageUrl = `https://placehold.co/300x300/32B768/FFFFFF?text=${encodeURIComponent(name)}`;
            
            // Generate realistic fuel prices based on location and brand
            const basePrice = 3.40; // Base price in USD per gallon
            const variation = Math.random() * 0.30;
            const brandMultiplier = name.toLowerCase().includes('shell') ? 1.05 : 
                                  name.toLowerCase().includes('bp') ? 0.98 : 
                                  name.toLowerCase().includes('mobil') ? 1.02 : 1.0;
            
            const regularPrice = parseFloat(((basePrice + variation) * brandMultiplier).toFixed(2));
            const premiumPrice = parseFloat((regularPrice * 1.12).toFixed(2));
            const dieselPrice = parseFloat((regularPrice * 0.95).toFixed(2));
            
            // Generate realistic ratings
            const rating = Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
            const reviewCount = Math.floor(Math.random() * 200) + 10;
            
            return {
                id: `osm-${el.id || idx}`,
                name,
                address,
                distance: distKm ? `${distKm.toFixed(1)} km` : '',
                deliveryTime: `${Math.floor(distKm * 2) + 5}-${Math.floor(distKm * 2) + 15} min`,
                rating,
                reviewCount,
                imageUrl,
                bannerUrl: `https://placehold.co/600x300/32B768/FFFFFF?text=${encodeURIComponent(name)}`,
                logoUrl: `https://placehold.co/300x300/32B768/FFFFFF?text=Logo`,
                fuelPrices: { regular: regularPrice, premium: premiumPrice, diesel: dieselPrice },
                lat: el.lat || lat,
                lon: el.lon || lon
            } as Omit<Station, 'groceries' | 'fuelFriends'>;
        });
        
        // Sort stations by distance (closest first)
        stations.sort((a, b) => {
            const distA = parseFloat(a.distance) || 0;
            const distB = parseFloat(b.distance) || 0;
            return distA - distB;
        });
        
        return stations;
    } catch (error) {
        return [];
    }
};

export const apiGetStationDetails = async (id: string): Promise<Station> => {
    const stationData: { [key: string]: Station } = {
        'default-1': {
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
            groceries: [
                { id: 'g1', name: 'Starbucks Coffee', price: 4.50, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&h=100&fit=crop' },
                { id: 'g2', name: 'Red Bull', price: 3.99, imageUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=100&h=100&fit=crop' },
                { id: 'g3', name: 'Chicago Hot Dog', price: 5.99, imageUrl: 'https://images.unsplash.com/photo-1612392062798-2dbaa2c2c2d1?w=100&h=100&fit=crop' },
                { id: 'g4', name: 'Deep Dish Pizza Slice', price: 6.50, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop' },
                { id: 'g5', name: 'Garrett Popcorn', price: 8.99, imageUrl: 'https://images.unsplash.com/photo-1578849278619-e2b9527bd08f?w=100&h=100&fit=crop' },
                { id: 'g6', name: 'Doritos', price: 2.99, imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=100&h=100&fit=crop' },
                { id: 'g7', name: 'Gatorade', price: 2.49, imageUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=100&h=100&fit=crop' },
                { id: 'g8', name: 'Snickers Bar', price: 1.79, imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=100&h=100&fit=crop' },
                { id: 'g22', name: 'Mountain Dew', price: 2.29, imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=100&h=100&fit=crop' },
                { id: 'g23', name: 'Reese\'s Peanut Butter Cups', price: 1.99, imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=100&h=100&fit=crop' },
                { id: 'g24', name: 'Beef Jerky', price: 7.99, imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=100&h=100&fit=crop' },
                { id: 'g25', name: 'M&Ms', price: 1.89, imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=100&h=100&fit=crop' },
                { id: 'g26', name: 'Powerade', price: 2.19, imageUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=100&h=100&fit=crop' },
                { id: 'g27', name: 'Fritos', price: 2.49, imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=100&h=100&fit=crop' },
                { id: 'g28', name: 'Kit Kat', price: 1.69, imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=100&h=100&fit=crop' },
                { id: 'g29', name: 'Sprite', price: 1.99, imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=100&h=100&fit=crop' },
                { id: 'g30', name: 'Hostess Donuts', price: 3.49, imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=100&h=100&fit=crop' },
                { id: 'g31', name: 'Combos', price: 2.29, imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=100&h=100&fit=crop' },
                { id: 'g32', name: 'Vitamin Water', price: 2.79, imageUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=100&h=100&fit=crop' },
                { id: 'g33', name: 'Milky Way', price: 1.79, imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=100&h=100&fit=crop' },
                { id: 'g34', name: 'Ruffles', price: 2.99, imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=100&h=100&fit=crop' },
                { id: 'g35', name: 'Rockstar Energy', price: 3.29, imageUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=100&h=100&fit=crop' },
                { id: 'g36', name: 'Skittles', price: 1.89, imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=100&h=100&fit=crop' },
                { id: 'g37', name: 'Tostitos', price: 3.49, imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=100&h=100&fit=crop' },
                { id: 'g38', name: 'Nestle Crunch', price: 1.69, imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=100&h=100&fit=crop' },
                { id: 'g39', name: 'Dr Pepper', price: 2.29, imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=100&h=100&fit=crop' },
                { id: 'g40', name: 'Sour Patch Kids', price: 2.49, imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=100&h=100&fit=crop' },
                { id: 'g41', name: 'Funyuns', price: 2.29, imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=100&h=100&fit=crop' }
            ],
            fuelFriends: [
                { id: 'f1', name: 'Marcus (Premium)', rate: 5.50, rating: 4.8, reviewCount: 45, avatarUrl: 'https://ui-avatars.com/api/?name=Marcus&background=random' }
            ]
        },
        'default-2': {
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
            groceries: [
                { id: 'g9', name: 'Dunkin Coffee', price: 3.99, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&h=100&fit=crop' },
                { id: 'g10', name: 'Monster Energy', price: 3.49, imageUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=100&h=100&fit=crop' },
                { id: 'g11', name: 'Italian Beef Sandwich', price: 7.99, imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=100&h=100&fit=crop' },
                { id: 'g12', name: 'Lays Chips', price: 2.49, imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=100&h=100&fit=crop' },
                { id: 'g13', name: 'Coca-Cola', price: 1.99, imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=100&h=100&fit=crop' },
                { id: 'g14', name: 'Slim Jim', price: 1.29, imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=100&h=100&fit=crop' }
            ],
            fuelFriends: [
                { id: 'f2', name: 'Tyler (Standard)', rate: 4.75, rating: 4.5, reviewCount: 32, avatarUrl: 'https://ui-avatars.com/api/?name=Tyler&background=random' }
            ]
        },
        'default-3': {
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
            groceries: [
                { id: 'g15', name: 'Aquafina Water', price: 1.99, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop' },
                { id: 'g16', name: '5-Hour Energy', price: 4.99, imageUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=100&h=100&fit=crop' },
                { id: 'g17', name: 'Cheetos', price: 2.79, imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=100&h=100&fit=crop' },
                { id: 'g18', name: 'Pepsi', price: 1.99, imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=100&h=100&fit=crop' },
                { id: 'g19', name: 'Twix', price: 1.89, imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=100&h=100&fit=crop' },
                { id: 'g20', name: 'Pringles', price: 3.49, imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=100&h=100&fit=crop' },
                { id: 'g21', name: 'Arizona Iced Tea', price: 0.99, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=100&h=100&fit=crop' }
            ],
            fuelFriends: [
                { id: 'f3', name: 'Jordan (Express)', rate: 6.00, rating: 4.9, reviewCount: 67, avatarUrl: 'https://ui-avatars.com/api/?name=Jordan&background=random' }
            ]
        }
    };
    
    const station = stationData[id];
    if (!station) {
        throw new Error('Station not found');
    }
    
    return station;
};

export const apiGetOrders = async (): Promise<Order[]> => {
    const base = (import.meta as any).env.VITE_API_BASE_URL || ((import.meta as any).env.DEV ? 'http://localhost:4000' : '');
    const res = await fetch(`${base}/api/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    
    // Check if response has content before parsing JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        return []; // Return empty array for invalid responses
    }
    
    const text = await res.text();
    if (!text) {
        return []; // Return empty array for empty responses
    }
    
    try {
        return JSON.parse(text);
    } catch (parseError) {
        return []; // Return empty array for invalid JSON
    }
}

export const apiCreateOrder = async (order: Order): Promise<Order> => {
    const base = (import.meta as any).env.VITE_API_BASE_URL || ((import.meta as any).env.DEV ? 'http://localhost:4000' : '');
    const res = await fetch(`${base}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
    });
    if (!res.ok) throw new Error('Failed to create order');
    
    // Check if response has content before parsing JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response from server');
    }
    
    const text = await res.text();
    if (!text) {
        throw new Error('Empty response from server');
    }
    
    try {
        return JSON.parse(text);
    } catch (parseError) {
        throw new Error('Invalid JSON response from server');
    }
}

export const apiUpdateOrderStatus = async (id: string, status: Order['status']): Promise<Order | null> => {
    const base = (import.meta as any).env.VITE_API_BASE_URL || ((import.meta as any).env.DEV ? 'http://localhost:4000' : '');
    const res = await fetch(`${base}/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    if (!res.ok) return null;
    
    // Check if response has content before parsing JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        return null; // Return null for invalid responses
    }
    
    const text = await res.text();
    if (!text) {
        return null; // Return null for empty responses
    }
    
    try {
        return JSON.parse(text);
    } catch (parseError) {
        return null; // Return null for invalid JSON
    }
}

export const apiUpdateUserProfile = async (userData: User): Promise<User> => {
    const base = (import.meta as any).env.VITE_API_BASE_URL || ((import.meta as any).env.DEV ? 'http://localhost:4000' : '');
    const res = await fetch(`${base}/api/user/me?email=${encodeURIComponent(userData.email)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    
    // Check if response has content before parsing JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response from server');
    }
    
    const text = await res.text();
    if (!text) {
        throw new Error('Empty response from server');
    }
    
    try {
        return JSON.parse(text);
    } catch (parseError) {
        throw new Error('Invalid JSON response from server');
    }
}

export const apiRegisterPushToken = async (email: string | undefined, token: string): Promise<{ ok: boolean }> => {
    const base = (import.meta as any).env.VITE_API_BASE_URL || ((import.meta as any).env.DEV ? 'http://localhost:4000' : '');
    const res = await fetch(`${base}/api/notifications/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token })
    });
    if (!res.ok) throw new Error('Failed to register push token');
    
    // Check if response has content before parsing JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        return { ok: false }; // Return failure for invalid responses
    }
    
    const text = await res.text();
    if (!text) {
        return { ok: false }; // Return failure for empty responses
    }
    
    try {
        return JSON.parse(text);
    } catch (parseError) {
        return { ok: false }; // Return failure for invalid JSON
    }
}

export const apiSendTestPush = async (token?: string): Promise<{ ok: boolean } | { error: string }> => {
    const base = (import.meta as any).env.VITE_API_BASE_URL || ((import.meta as any).env.DEV ? 'http://localhost:4000' : '');
    const res = await fetch(`${base}/api/notifications/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(token ? { token } : {})
    });
    
    // Check if response has content before parsing JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        return { ok: false }; // Return failure for invalid responses
    }
    
    const text = await res.text();
    if (!text) {
        return { ok: false }; // Return failure for empty responses
    }
    
    try {
        return JSON.parse(text);
    } catch (parseError) {
        return { ok: false }; // Return failure for invalid JSON
    }
}

const decodeJwt = (token: string): any => {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(payload).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    try { return JSON.parse(json); } catch { return null; }
};

export const apiLoginWithGoogleCredential = async (credential: string): Promise<User> => {
    const base = (import.meta as any).env.VITE_API_BASE_URL || ((import.meta as any).env.DEV ? 'http://localhost:4000' : '');
    
    try {
        console.log('Making request to:', `${base}/api/auth/firebase`);
        console.log('Request body:', { idToken: credential });
        
        const res = await fetch(`${base}/api/auth/firebase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: credential })
        });
        
        console.log('Response status:', res.status);
        console.log('Response headers:', [...res.headers.entries()]);
        
        if (!res.ok) {
            // Handle specific HTTP errors
            if (res.status === 400) {
                throw new Error('Invalid authentication token. Please try again.');
            } else if (res.status === 500) {
                throw new Error('Server error. Please try again later.');
            } else {
                throw new Error(`Authentication failed with status ${res.status}`);
            }
        }
        
        // Check if response has content before parsing JSON
        const contentType = res.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Invalid response from server');
        }
        
        const text = await res.text();
        console.log('Response text:', text);
        
        if (!text) {
            throw new Error('Empty response from server');
        }
        
        try {
            return JSON.parse(text);
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            throw new Error('Invalid JSON response from server');
        }
    } catch (error) {
        console.error('apiLoginWithGoogleCredential error:', error);
        // Handle network errors specifically
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Failed to connect to the authentication server. Please ensure the backend server is running.');
        }
        // Re-throw other errors
        throw error;
    }
}

export const apiGetFuelPriceHistory = async (stationId?: string, fuelType?: string) => {
    const base = (import.meta as any).env.VITE_API_BASE_URL || ((import.meta as any).env.DEV ? 'http://localhost:4000' : '');
    let url = `${base}/api/fuel-prices/history`;
    
    const params = new URLSearchParams();
    if (stationId) params.append('stationId', stationId);
    if (fuelType) params.append('fuelType', fuelType);
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch fuel price history');
    
    // Check if response has content before parsing JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response from server');
    }
    
    const text = await res.text();
    if (!text) {
        throw new Error('Empty response from server');
    }
    
    try {
        return JSON.parse(text);
    } catch (parseError) {
        throw new Error('Invalid JSON response from server');
    }
};

export const apiAddFuelPrice = async (stationId: string, fuelType: string, price: number) => {
    const base = (import.meta as any).env.VITE_API_BASE_URL || ((import.meta as any).env.DEV ? 'http://localhost:4000' : '');
    const url = `${base}/api/fuel-prices`;
    
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationId, fuelType, price })
    });
    
    if (!res.ok) throw new Error('Failed to add fuel price');
    
    // Check if response has content before parsing JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response from server');
    }
    
    const text = await res.text();
    if (!text) {
        throw new Error('Empty response from server');
    }
    
    try {
        return JSON.parse(text);
    } catch (parseError) {
        throw new Error('Invalid JSON response from server');
    }
};

export const apiGeocode = async (query: string) => {
    // Use Vercel API endpoints when deployed to Vercel
    const isVercel = typeof process !== 'undefined' && process.env.NOW_REGION;
    const base = isVercel ? '' : ((import.meta as any).env.VITE_API_BASE_URL || (import.meta as any).env.DEV ? 'http://localhost:4000' : '');
    const url = isVercel ? `/api/geocode?q=${encodeURIComponent(query)}` : 
               base ? `${base}/api/geocode?q=${encodeURIComponent(query)}` : 
               `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    
    const res = await fetch(url, { headers: base ? {} : { 'User-Agent': 'fuelfriendly' } });
    if (!res.ok) throw new Error('Failed to geocode');
    
    // Check if response has content before parsing JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response from geocoding service');
    }
    
    const text = await res.text();
    if (!text) {
        throw new Error('Empty response from geocoding service');
    }
    
    try {
        const data = JSON.parse(text);
        if (base || isVercel) {
            return data;
        } else {
            const item = Array.isArray(data) && data.length ? data[0] : null;
            if (!item) throw new Error('Place not found');
            return {
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                display_name: item.display_name
            };
        }
    } catch (parseError) {
        throw new Error('Invalid JSON response from geocoding service');
    }
};
