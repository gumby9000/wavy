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
    const [colorMode, setColorMode] = useState('absolute');
    const [interpolationMode, setInterpolationMode] = useState('step');

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

    const getColorScale = (colorMode, interpolationMode) => {
        const absoluteColors = interpolationMode === 'step' ? [
            'step',
            ['get', 'wave_height_ft'],
            '#0a1597',  // default color for values < 2
            2, '#1734f9',
            4, '#106dfb',
            6, '#009bfc',
            8, '#00c9fc',
            10, '#00fdcb',
            12, '#00fc9c',
            14, '#00f95c',
            16, '#8cfb38',
            18, '#c9fc3a',
            20, '#fcfa3a'
        ] : [
            'interpolate',
            ['linear'],
            ['get', 'wave_height_ft'],
            0, '#0a1597',
            2, '#1734f9',
            4, '#106dfb',
            6, '#009bfc',
            8, '#00c9fc',
            10, '#00fdcb',
            12, '#00fc9c',
            14, '#00f95c',
            16, '#8cfb38',
            18, '#c9fc3a',
            20, '#fcfa3a'
        ];

        const relativeColors = interpolationMode === 'step' ? [
            'step',
            ['get', 'wave_height_ft'],
            '#0017ff',   // default color for values < 2
            2, '#005bff',
            4, '#00fff4',
            5, '#0fff00',
            6, '#ddff00',
            8, '#ff0000',
            10, '#ff00be',
            12, '#9400d3',
            14, '#4b0082',
            16, '#800080',
            18, '#4a0043',
            20, '#ffffff'
        ] : [
            'interpolate',
            ['linear'],
            ['get', 'wave_height_ft'],
            1, '#0017ff',
            2, '#005bff',
            4, '#00fff4',
            5, '#0fff00',
            6, '#ddff00',
            8, '#ff0000',
            10, '#ff00be',
            12, '#9400d3',
            14, '#4b0082',
            16, '#800080',
            18, '#4a0043',
            20, '#ffffff'
        ];

        return colorMode === 'absolute' ? absoluteColors : relativeColors;
    };

    const toggleColorMode = () => {
        const newMode = colorMode === 'absolute' ? 'relative' : 'absolute';
        setColorMode(newMode);
        if (map.current) {
            map.current.setPaintProperty('wave-height-grid-layer', 'fill-color', getColorScale(newMode, interpolationMode));
        }
    };

    const toggleInterpolationMode = () => {
        const newMode = interpolationMode === 'step' ? 'interpolate' : 'step';
        setInterpolationMode(newMode);
        if (map.current) {
            map.current.setPaintProperty('wave-height-grid-layer', 'fill-color', getColorScale(colorMode, newMode));
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
                            'fill-color': getColorScale('absolute', 'step'),
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

        return () => {
            map.current?.remove();
        };
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
            <div className="absolute top-4 left-4 flex gap-2">
                <button
                    onClick={toggleColorMode}
                    className="bg-white px-3 py-2 rounded shadow z-10 hover:bg-gray-100"
                >
                    {colorMode === 'absolute' ? 'Switch to Relative' : 'Switch to Absolute'}
                </button>
                <button
                    onClick={toggleInterpolationMode}
                    className="bg-white px-3 py-2 rounded shadow z-10 hover:bg-gray-100"
                >
                    {interpolationMode === 'step' ? 'Switch to Smooth' : 'Switch to Steps'}
                </button>
            </div>
        </div>
    );
}

export default Map;