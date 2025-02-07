import React, { useEffect, useRef, useState } from "react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
const Map = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const coordinatesDisplay = useRef(null);
    const dataDisplay = useRef(null);
    const [error, setError] = useState(null);
    const [currentLayer, setCurrentLayer] = useState(null);
    const [centerPoint, setCenterPoint] = useState(null);

    const fetchLayerData = async (layerName, temporalType, timePeriod) => {
        try {
            const response = await fetch(
                `/api/layers?layer_name=${layerName}&temporal_type=${temporalType}&time_period=${timePeriod}`
            );

            if(!response.ok){
                throw new Error('Failed to fetch layer data');
            }
            
            const data = await response.json();
            return data;
        } catch(error) {
            console.error('Error fetching layer:', error);
            throw error;
        }
    };

    const roundToHundredth = (num) => Math.round(num * 100) / 100;

    const updateDataAtCursor = () => {
        if (!map.current) {
            console.log('Map not ready');
            return;
        }

        // Get current center directly from map instead of relying on state
        const currentCenter = map.current.getCenter();
        
        // Query features at the center point
        const features = map.current.queryRenderedFeatures(
            map.current.project(currentCenter),
            { layers: ['wave-height-grid-layer'] }
        );

        console.log('Features at cursor:', features); // Debug log

        const lng = roundToHundredth(currentCenter.lng);
        const lat = roundToHundredth(currentCenter.lat);
        let wvht = 'N/A';

        if (features.length > 0 && features[0].properties) {
            wvht = roundToHundredth(features[0].properties.wave_height_ft);
            console.log('Wave height found:', wvht); // Debug log
        }

        if (dataDisplay.current) {
            dataDisplay.current.innerHTML = `
                <div class="text-sm">
                    <div class="font-medium">Coordinates: ${lng}, ${lat}</div>
                    <div>Wave Height: ${wvht} ft</div>
                </div>
            `;
        }
    };

    useEffect(() => {
        if (map.current) return;

        try {
            mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
            
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [-81.79, 26.14],
                zoom: 4
            });

            map.current.on('load', async () => {
                console.log('Map loaded successfully');
                
                // Initial center point
                const center = map.current.getCenter();
                setCenterPoint(center);
                updateDataAtCursor();

                // Add cursor point marker - position it in the center
                const cursorElement = document.createElement('div');
                cursorElement.className = 'cursor-point';
                cursorElement.innerHTML = `
                    <div class="w-4 h-4 relative">
                        <div class="absolute w-4 h-4 bg-blue-500 rounded-full opacity-25 animate-ping"></div>
                        <div class="absolute w-3 h-3 bg-white rounded-full left-0.5 top-0.5"></div>
                        <div class="absolute w-2 h-2 bg-blue-500 rounded-full left-1 top-1"></div>
                    </div>
                `;

                const marker = new mapboxgl.Marker({
                    element: cursorElement,
                    anchor: 'center'
                })
                .setLngLat(center)
                .addTo(map.current);

                const loadingElement = document.createElement('div');
                mapContainer.current.appendChild(loadingElement);

                try {
                    // Add source first
                    map.current.addSource('wave-height-grid', {
                        'type': 'geojson',
                        'data': {
                            'type': 'FeatureCollection',
                            'features': []
                        }
                    });

                    // Add layer and wait for it to be added
                    map.current.addLayer({
                        'id': 'wave-height-grid-layer',
                        'type': 'fill',
                        'source': 'wave-height-grid',
                        'paint': {
                            'fill-color': [
                                'interpolate',
                                ['linear'],
                                ['get', 'wave_height_ft'],
                                1, '#0017ff',   // Deep blue
                                2, '#005bff',   // Medium blue
                                4, '#00fff4',   // Cyan
                                5, '#0fff00',   // Bright green
                                6, '#ddff00',   // Yellow
                                8, '#ff0000',   // Red
                                10, '#ff00be',  // Pink
                                12, '#9400d3',  // Purple
                                14, '#4b0082',  // Indigo
                                16, '#800080',  // Deep purple
                                18, '#4a0043',  // Very dark purple
                                20, '#ffffff'   // White
                            ],
                            'fill-opacity': 0.8
                        }
                    });

                    // Load the wave data
                    const waveResponse = await fetch('/geojson/wave_height_grid.geojson');
                    if (!waveResponse.ok) {
                        throw new Error('Failed to load wave height data');
                    }
                    
                    const waveData = await waveResponse.json();
                    console.log('Wave data loaded:', waveData.features.length, 'features');
                    
                    // Update the source with the loaded data
                    map.current.getSource('wave-height-grid').setData(waveData);

                    // Update marker position and data when map moves
                    map.current.on('move', () => {
                        const newCenter = map.current.getCenter();
                        marker.setLngLat(newCenter);
                        setCenterPoint(newCenter);
                        updateDataAtCursor();
                    });

                    // Initial data update
                    updateDataAtCursor();

                } catch (err) {
                    console.error('Error loading map data:', err);
                    setError('Failed to load map data. Please check the console for details.');
                }
                loadingElement.remove();
            });

            map.current.on('error', (e) => {
                console.error('Map error:', e);
                setError('An error occurred with the map.');
            });

        } catch (err) {
            console.error('Error initializing map:', err);
            setError('Failed to initialize map.');
        }

        return () => map.current?.remove();
    }, []);

    
    return (
        <div className="relative w-full h-full">
            <div 
                ref={mapContainer} 
                className="absolute inset-0"
            />
            <div 
                ref={dataDisplay}
                className="absolute top-4 right-4 bg-white p-2 rounded shadow z-10"
            />
        </div>
    );
}

export default Map;