import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Station } from '../types';
import driverIcon from '../screens/Driver Icon.png';
import locationIcon from '../screens/logo.png';

// Ensure the Mapbox access token is set
const TOKEN = (window as any).VITE_MAPBOX_ACCESS_TOKEN || (import.meta as any).env.VITE_MAPBOX_ACCESS_TOKEN || '';
(mapboxgl as any).accessToken = TOKEN;

// Check if token is available
const isTokenAvailable = !!TOKEN && TOKEN !== '';

interface MapboxMapProps {
  stations: Omit<Station, 'groceries' | 'fuelFriends'>[];
  userLocation: { lat: number; lon: number } | null;
  onStationSelect?: (station: Omit<Station, 'groceries' | 'fuelFriends'>) => void;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ stations, userLocation, onStationSelect }) => {
  // Always render the map container, even if token is missing
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const driverMarkers = useRef<mapboxgl.Marker[]>([]);

  // Show message when token is missing
  if (!isTokenAvailable) {
    return (
      <div className="w-full h-full rounded-2xl flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="text-center p-4">
          <p className="text-gray-600 dark:text-gray-300 mb-2">Mapbox token not configured</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Please check environment variables</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map only once
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: userLocation ? [userLocation.lon, userLocation.lat] : [0, 0],
        zoom: 12,
        // Optimize for mobile
        interactive: true,
        touchZoomRotate: true,
        dragRotate: false,
        pitchWithRotate: false,
        // Smoother transitions
        fadeDuration: 300,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add geolocate control to trigger native location popup
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        'top-right'
      );
    } else if (userLocation) {
      // Smooth transition to new location
      map.current.flyTo({
        center: [userLocation.lon, userLocation.lat],
        zoom: 12,
        duration: 1000,
        animate: true
      });
    }

    // Clean up markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    
    // Clean up driver markers
    driverMarkers.current.forEach(marker => marker.remove());
    driverMarkers.current = [];

    // Add or update user location marker with custom icon
    if (userLocation && map.current) {
      // Remove existing user marker if it exists
      if (userMarker.current) {
        userMarker.current.remove();
      }
      
      // Create custom element for user location marker
      const userEl = document.createElement('div');
      userEl.className = 'user-marker';
      userEl.style.width = '32px';
      userEl.style.height = '32px';
      userEl.style.backgroundImage = `url(${locationIcon})`;
      userEl.style.backgroundSize = 'contain';
      userEl.style.backgroundRepeat = 'no-repeat';
      userEl.style.backgroundPosition = 'center';
      userEl.style.cursor = 'pointer';
      userEl.style.transition = 'transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)';
      
      // Add pulse animation for user location
      userEl.innerHTML = `
        <div style="
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.3);
          animation: pulse 2s infinite cubic-bezier(0.22, 0.61, 0.36, 1);
          z-index: -1;
        "></div>
      `;
      
      // Add CSS for pulse animation
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.7;
          }
          70% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            transform: scale(0.8);
            opacity: 0.7;
          }
        }
      `;
      document.head.appendChild(style);

      userMarker.current = new mapboxgl.Marker({ element: userEl })
        .setLngLat([userLocation.lon, userLocation.lat])
        .addTo(map.current);
    }

    // Add multiple driver markers with custom icons
    if (userLocation && map.current) {
      // Define multiple driver positions around the user location
      const driverPositions = [
        { lon: userLocation.lon + 0.005, lat: userLocation.lat + 0.005 },
        { lon: userLocation.lon - 0.007, lat: userLocation.lat + 0.003 },
        { lon: userLocation.lon + 0.002, lat: userLocation.lat - 0.006 },
        { lon: userLocation.lon - 0.004, lat: userLocation.lat - 0.002 },
        { lon: userLocation.lon + 0.008, lat: userLocation.lat - 0.001 },
      ];
      
      // Create driver markers
      driverPositions.forEach((position, index) => {
        // Create custom element for driver marker
        const driverEl = document.createElement('div');
        driverEl.className = 'driver-marker';
        driverEl.style.width = '40px';
        driverEl.style.height = '40px';
        driverEl.style.backgroundImage = `url(${driverIcon})`;
        driverEl.style.backgroundSize = 'contain';
        driverEl.style.backgroundRepeat = 'no-repeat';
        driverEl.style.backgroundPosition = 'center';
        driverEl.style.cursor = 'pointer';
        driverEl.style.transition = 'transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)';
        
        // Add a subtle bounce animation to make drivers more interactive
        driverEl.style.animation = `bounce 2s infinite ${index * 0.2}s cubic-bezier(0.22, 0.61, 0.36, 1)`;
        
        // Add CSS for bounce animation
        if (index === 0) {
          const style = document.createElement('style');
          style.innerHTML = `
            @keyframes bounce {
              0%, 100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-5px);
              }
            }
          `;
          document.head.appendChild(style);
        }
        
        // Add hover effect
        driverEl.addEventListener('mouseenter', () => {
          driverEl.style.transform = 'scale(1.1)';
        });
        
        driverEl.addEventListener('mouseleave', () => {
          driverEl.style.transform = 'scale(1)';
        });
        
        const driverMarker = new mapboxgl.Marker({ element: driverEl })
          .setLngLat([position.lon, position.lat])
          .addTo(map.current!);
          
        driverMarkers.current.push(driverMarker);
      });
    }

    // Add markers for stations
    stations.forEach(station => {
      // Only add markers for stations with valid coordinates
      if (station.lat && station.lon) {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.background = '#32B768';
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 0 6px rgba(50, 183, 104, 0.25)';
        el.style.position = 'relative';
        el.style.transition = 'transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)';
        // Improve touch targets for mobile
        el.style.touchAction = 'manipulation';

        // Add station name as tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'marker-tooltip';
        tooltip.innerHTML = `
          <div style="
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            color: black;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            margin-bottom: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            display: none;
            transition: opacity 0.2s ease-out;
          ">
            ${station.name}
          </div>
        `;
        el.appendChild(tooltip);

        // Show tooltip on hover and touch for mobile
        el.addEventListener('mouseenter', () => {
          tooltip.style.display = 'block';
          tooltip.style.opacity = '1';
          el.style.transform = 'scale(1.1)';
        });
        
        el.addEventListener('mouseleave', () => {
          tooltip.style.opacity = '0';
          setTimeout(() => {
            tooltip.style.display = 'none';
          }, 200);
          el.style.transform = 'scale(1)';
        });
        
        // Add touch events for mobile
        el.addEventListener('touchstart', () => {
          tooltip.style.display = 'block';
          tooltip.style.opacity = '1';
          el.style.transform = 'scale(1.1)';
        });
        
        el.addEventListener('touchend', () => {
          setTimeout(() => {
            tooltip.style.opacity = '0';
            setTimeout(() => {
              tooltip.style.display = 'none';
            }, 200);
          }, 2000);
          el.style.transform = 'scale(1)';
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([station.lon, station.lat])
          .addTo(map.current!);

        // Add click and touch events for better mobile support
        el.addEventListener('click', () => {
          if (onStationSelect) {
            onStationSelect(station);
          }
        });
        
        el.addEventListener('touchend', (e) => {
          e.preventDefault();
          if (onStationSelect) {
            onStationSelect(station);
          }
        });

        markers.current.push(marker);
      }
    });

    // Cleanup function
    return () => {
      markers.current.forEach(marker => marker.remove());
      if (userMarker.current) { userMarker.current.remove(); userMarker.current = null }
      driverMarkers.current.forEach(marker => marker.remove());
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [stations, userLocation, onStationSelect]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full rounded-2xl"
      style={{ height: '100%', minHeight: '384px' }}
    />
  );
};

export default MapboxMap;