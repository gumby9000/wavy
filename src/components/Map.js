
// components/Map.js
import React, { useEffect } from "react";
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapInstance } from '../hooks/useMapInstance';
import { useMapStyles } from '../hooks/useMapStyles';
import { useMapData } from '../hooks/useMapData';
import DataDisplay from './DataDisplay';
import MapControls from './MapControls';

const Map = () => {
    const initialDataPath = '/geojson/scripts/Converters/wave_parameters_grid5.geojson';
    
    const {
        dataPath,
        dataSource,
        toggleDataSource
    } = useMapData(initialDataPath);
    
    const {
        colorMode,
        interpolationMode,
        visualParam,
        toggleParameter,
        toggleInterpolationMode,
        getColorScale
    } = useMapStyles();
    
    const {
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
    } = useMapInstance();

    // Initialize map on component mount
    useEffect(() => {
        initializeMap();
        return () => {
            map.current?.remove();
        };
    }, []);

    // Setup data source after map loads
    useEffect(() => {
        if (!map.current) return;
        
        const onMapLoad = async () => {
            await setupDataSource(getColorScale());
            setupEventListeners();
        };

        if (map.current.loaded()) {
            onMapLoad();
        } else {
            map.current.once('load', onMapLoad);
        }
    }, [map.current]);

    // Update data when dataPath changes
    useEffect(() => {
        updateMapData(dataPath);
    }, [dataPath]);

    // Update styles when visualization parameters change
    useEffect(() => {
        updateStyleProperties(getColorScale());
    }, [visualParam, interpolationMode, colorMode]);

    // Handle parameter toggle
    const handleToggleParameter = () => {
        const newParam = toggleParameter();
        updateStyleProperties(getColorScale());
    };

    // Handle interpolation mode toggle
    const handleToggleInterpolationMode = () => {
        const newMode = toggleInterpolationMode();
        updateStyleProperties(getColorScale());
    };

    return (
        <div className="relative w-full h-full">
            {error && (
                <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-50">
                    {error}
                </div>
            )}
            
            <div 
                ref={mapContainer} 
                className="absolute inset-0"
            />
            
            {centerPoint && (
                <DataDisplay 
                    coords={centerPoint} 
                    waveData={waveData}
                />
            )}
            
            <MapControls 
                visualParam={visualParam}
                toggleParameter={handleToggleParameter}
                interpolationMode={interpolationMode}
                toggleInterpolationMode={handleToggleInterpolationMode}
                dataSource={dataSource}
                toggleDataSource={toggleDataSource}
            />
        </div>
    );
};

export default Map;