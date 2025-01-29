import React, { useEffect, useRef } from "react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const Map = () => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    const mapContainer = useRef(null);
    const map = useRef(null);

    useEffect(() => {
        if (map.current) return;
        
        // Add console logs to debug
        console.log('Initializing map...');
        console.log('Access token:', mapboxgl.accessToken);
        console.log('Container:', mapContainer.current);

        try {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [-80, 26.96],
                zoom: 5
            });

            map.current.on('load', () => {
                console.log('Map loaded successfully');
            });

            map.current.on('error', (e) => {
                console.error('Map error:', e);
            });

        } catch (error) {
            console.error('Error initializing map:', error);
        }

        return () => map.current?.remove();
    }, []);

    return (
        <div ref={mapContainer} className="w-full h-full bg-gray-100" style={{ minHeight: '400px' }}>
            {!map.current && <div className="p-4">Loading map...</div>}
        </div>
    );
}

export default Map;