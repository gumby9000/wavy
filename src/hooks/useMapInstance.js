import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { roundToHundredth } from '../utils/directionUtils';

export const useMapInstance = (initialCenter, initialZoom) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [error, setError] = useState(null);
  const [centerPoint, setCenterPoint] = useState(null);
  const [waveData, setWaveData] = useState({
    height: 'N/A',
    period: 'N/A',
    direction: 'N/A',
    energy: 'N/A'
  });

  const initializeMap = () => {
    if (map.current) return;

    try {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: initialCenter || [-81.79, 26.14],
        zoom: initialZoom || 4
      });

      // Create center point marker
      const cursorElement = document.createElement('div');
      cursorElement.className = 'cursor-point';
      cursorElement.innerHTML = `
        <div class="w-4 h-4 relative">
          <div class="absolute w-4 h-4 bg-blue-500 rounded-full opacity-25 animate-ping"></div>
          <div class="absolute w-3 h-3 bg-white rounded-full left-0.5 top-0.5"></div>
          <div class="absolute w-2 h-2 bg-blue-500 rounded-full left-1 top-1"></div>
        </div>
      `;

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        
        // Initial center point
        const center = map.current.getCenter();
        setCenterPoint(center);
        
        marker.current = new mapboxgl.Marker({
          element: cursorElement,
          anchor: 'center'
        })
        .setLngLat(center)
        .addTo(map.current);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setError('An error occurred with the map.');
      });

    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map.');
    }
  };

  const setupDataSource = async (colorScale) => {
    if (!map.current || !map.current.loaded()) return;

    // Check if the source already exists and remove it if it does
    console.log('setting up data source!')
    if (map.current.getSource('wave-height-grid')) {
      if (map.current.getLayer('wave-height-grid-layer')) {
        map.current.removeLayer('wave-height-grid-layer');
      }
      map.current.removeSource('wave-height-grid');
    }

    // Add source
    console.log('inside setup data source!')
    map.current.addSource('wave-height-grid', {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': []
      }
    });

    const waveResponse = await fetch('/geojson/scripts/Converters/wave_parameters_grid6.geojson');
    const waveData = await waveResponse.json();
    map.current.getSource('wave-height-grid').setData(waveData);

    map.current.addLayer({
      'id': 'wave-height-grid-layer',
      'type': 'fill',
      'source': 'wave-height-grid',
      'paint': {
        'fill-color': colorScale,
        'fill-opacity': 0.8
      }
    });
    console.log('Data source setup complete!')
  };

  const updateMapData = async (dataPath) => {
    console.log('trying to load!')
    if (!map.current || !map.current.loaded()) return;
    //safest to do updates after loading

    console.log('did not return')
    try {
      // Load the wave data
      const waveResponse = await fetch(dataPath);
      if (!waveResponse.ok) {
        throw new Error('Failed to load wave height data');
      }
      
      const waveData = await waveResponse.json();
      console.log('Wave data loaded:', waveData.features.length, 'features');
      
      // Update the source with the loaded data
      if (map.current.getSource('wave-height-grid')) {
        map.current.getSource('wave-height-grid').setData(waveData);
      } else {
        console.warn('Source does not exist yet, cannot update data');
      }
    } catch (err) {
      console.error('Error loading map data:', err);
      setError('Failed to load map data');
    }
  };

  const updateStyleProperties = (colorScale) => {
    if (!map.current || !map.current.getLayer('wave-height-grid-layer')) return;
    
    map.current.setPaintProperty(
      'wave-height-grid-layer', 
      'fill-color', 
      colorScale
    );
  };

  const updateDataAtCursor = () => {
    if (!map.current) return;

    // Get current center directly from map
    const currentCenter = map.current.getCenter();
    
    // Query features at the center point
    const features = map.current.queryRenderedFeatures(
      map.current.project(currentCenter),
      { layers: ['wave-height-grid-layer'] }
    );

    const lng = roundToHundredth(currentCenter.lng);
    const lat = roundToHundredth(currentCenter.lat);
    let height = 'N/A';
    let period = 'N/A';
    let direction = 'N/A';
    let energy = 'N/A';

    if (features.length > 0 && features[0].properties) {
      height = roundToHundredth(features[0].properties.wave_height_ft);
      period = roundToHundredth(features[0].properties.wave_period_s);
      direction = roundToHundredth(features[0].properties.wave_direction_deg);
      energy = roundToHundredth(features[0].properties.wave_energy_j);
    }

    setWaveData({ height, period, direction, energy });
    setCenterPoint({ lng, lat });
    
    // Update marker position
    if (marker.current) {
      marker.current.setLngLat(currentCenter);
    }
  };

  const setupEventListeners = () => {
    if (!map.current) return;

    map.current.on('move', updateDataAtCursor);
    
    return () => {
      map.current?.off('move', updateDataAtCursor);
    };
  };

  return {
    mapContainer,
    map,
    error,
    centerPoint,
    waveData,
    initializeMap,
    setupDataSource,
    updateMapData,
    updateStyleProperties,
    setupEventListeners
  };
};