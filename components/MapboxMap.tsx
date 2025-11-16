import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Station } from '../types';

// Ensure the Mapbox access token is set
const TOKEN = (window as any).VITE_MAPBOX_ACCESS_TOKEN || (import.meta as any).env?.VITE_MAPBOX_ACCESS_TOKEN || '';
(mapboxgl as any).accessToken = TOKEN;

interface MapboxMapProps {
  stations: Omit<Station, 'groceries' | 'fuelFriends'>[];
  userLocation: { lat: number; lon: number } | null;
  onStationSelect?: (station: Omit<Station, 'groceries' | 'fuelFriends'>) => void;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ stations, userLocation, onStationSelect }) => {
  if (!TOKEN) {
    return (
      <div className="w-full h-full rounded-2xl flex items-center justify-center bg-gray-300 dark:bg-gray-700">
        <p className="text-center text-sm md:text-base px-4 md:px-6">Map tidak muncul karena VITE_MAPBOX_ACCESS_TOKEN belum diisi. Tambahkan token Mapbox ke file <code>.env.local</code>, lalu jalankan ulang preview.</p>
      </div>
    );
  }
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const userMarker = useRef<mapboxgl.Marker | null>(null);

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
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add geolocate control
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
        }),
        'top-right'
      );
    } else if (userLocation) {
      map.current.setCenter([userLocation.lon, userLocation.lat]);
    }

    // Clean up markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add or update user location marker
    if (userLocation && map.current) {
      const el = document.createElement('div');
      el.style.width = '16px';
      el.style.height = '16px';
      el.style.borderRadius = '50%';
      el.style.background = '#3b82f6';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.3)';
      if (!userMarker.current) {
        userMarker.current = new mapboxgl.Marker({ element: el })
          .setLngLat([userLocation.lon, userLocation.lat])
          .addTo(map.current);
      } else {
        userMarker.current.setLngLat([userLocation.lon, userLocation.lat]);
      }
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
        el.style.transition = 'transform 150ms ease, box-shadow 300ms ease';
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
          ">
            ${station.name}
          </div>
        `;
        el.appendChild(tooltip);

        // Show tooltip on hover and touch for mobile
        el.addEventListener('mouseenter', () => {
          tooltip.style.display = 'block';
          el.style.transform = 'scale(1.06)';
        });
        
        el.addEventListener('mouseleave', () => {
          tooltip.style.display = 'none';
          el.style.transform = 'scale(1)';
        });
        
        // Add touch events for mobile
        el.addEventListener('touchstart', () => {
          tooltip.style.display = 'block';
          el.style.transform = 'scale(1.06)';
        });
        
        el.addEventListener('touchend', () => {
          setTimeout(() => {
            tooltip.style.display = 'none';
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
      style={{ height: '100%' }}
    />
  );
};

export default MapboxMap;