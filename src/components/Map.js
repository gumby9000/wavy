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
        if (!map.current || !centerPoint) return;

        const point = map.current.project(centerPoint);
        const features = map.current.queryRenderedFeatures(point, {
            layers: ['wave-height-grid-layer']
        });

        const lng = roundToHundredth(centerPoint.lng);
        const lat = roundToHundredth(centerPoint.lat);
        let wvht = 'N/A';

        if (features.length > 0) {
            wvht = roundToHundredth(features[0].properties.wave_height_ft);
        }

        if (dataDisplay.current) {
            const tileX = Math.floor((lng + 180) / 0.5);
            const tileY = Math.floor((lat + 90) / 0.5);
            dataDisplay.current.innerHTML = `
                <div class="text-sm">
                    <div class="font-medium">Coordinates: ${lng}, ${lat}</div>
                    <div>Wave Height: ${wvht} ft</div>
                    <div class="text-gray-500">Tile: [${tileX}, ${tileY}]</div>
                </div>
            `;
        }
    }
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

            // Mouse move event for coordinates display
            // map.current.on('mousemove', (e) => {
            //     const lng = roundToHundredth(e.lngLat.lng);
            //     const lat = roundToHundredth(e.lngLat.lat);
                
            //     const wvFeatures = map.current.queryRenderedFeatures(e.point, {
            //         layers: ['wave-height-grid-layer']
            //     });

            //     let wvht = 'N/A';
            //     if(wvFeatures.length > 0) {
            //         wvht = roundToHundredth(wvFeatures[0].properties.wave_height_ft);
            //     }
            //     if (coordinatesDisplay.current) {
                    
            //         const tileX = Math.floor((lng + 180) / 0.5);
            //         const tileY = Math.floor((lat + 90) / 0.5);
            //         const tileRef = `Tile: [${tileX}, ${tileY}]`;

            //         coordinatesDisplay.current.innerHTML = `${lng}, ${lat}<br/> ${wvht} ft`;
            //     }
            // });

            // Add Florida outline when map loads
            map.current.on('load', async () => {
                console.log('Map loaded successfully');
                
                console.log('Map loaded successfully');
                
                // Calculate center point in upper third of viewport
                const bounds = map.current.getBounds();
                const center = map.current.getCenter();
                setCenterPoint(center);

                // Add cursor point marker
                const cursorElement = document.createElement('div');
                cursorElement.className = 'cursor-point';
                cursorElement.innerHTML = `
                    <div class="w-4 h-4 relative">
                        <div class="absolute w-4 h-4 bg-blue-500 rounded-full opacity-25 animate-ping"></div>
                        <div class="absolute w-3 h-3 bg-white rounded-full left-0.5 top-0.5"></div>
                        <div class="absolute w-2 h-2 bg-blue-500 rounded-full left-1 top-1"></div>
                    </div>
                `;

                new mapboxgl.Marker({
                    element: cursorElement,
                    anchor: 'center'
                })
                .setLngLat(center)
                .addTo(map.current);

                try {
                    // Wave height grid

                    const waveResponse = await fetch('/geojson/wave_height_grid.geojson');
                    if (!waveResponse.ok) throw new Error('Failed to load wave height data');
                    
                    // const waveData = await waveResponse.json();
                    //const waveData = await fetchLayerData('wave_height', 'current', 'jan24');

                    map.current.addSource('wave-height-grid', {
                        'type': 'geojson',
                        'data': '/geojson/wave_height_grid.geojson'
                    });

                    map.current.addLayer({
                        'id': 'wave-height-grid-layer',
                        'type': 'fill',
                        'source': 'wave-height-grid',
                        'paint': {
                            'fill-color': [
                                'interpolate',
                                ['linear'],
                                ['get', 'wave_height_ft'],
                                1, '#0017ff',    // Deep Blue (1ft)
                                2, '#005bff',    // Lighter Blue
                                4, '#00fff4',    // Blue-Green
                                5, '#0fff00',    // Green
                                6, '#ddff00',    // Yellow-Green
                                8, '#ff0000',    // Red
                                10, '#ff00be',   // Pink
                                12, '#520091',   // Purple
                                14, '#70617b',   // Light Purple
                                18, '#757575',   // Gray
                                20, '#ffffff'    // White
                            ],
                            'fill-opacity': 0.8
                        }
                    });

                } catch (err) {
                    console.error('Error loading map data:', err);
                    setError('Failed to load map data. Please check the console for details.');
                }
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
            >
            </div>
        </div>
    );
}

export default Map;