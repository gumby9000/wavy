import { useState, useEffect } from 'react';

export const useMapData = (initialDataPath) => {
  const [dataPath, setDataPath] = useState(initialDataPath);
  const [dataSource, setDataSource] = useState('2025');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleDataSource = () => {
    const newDataSource = dataSource === '2025' ? '40' : '2025';
    setDataSource(newDataSource);

    const newDataPath = dataPath === '/geojson/scripts/Converters/wave_parameters_grid5.geojson' 
      ? '/geojson/wave_height_grid.geojson' 
      : '/geojson/scripts/Converters/wave_parameters_grid5.geojson';
    
    setDataPath(newDataPath);
  };

  const fetchLayerData = async (layerName, temporalType, timePeriod) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/layers?layer_name=${layerName}&temporal_type=${temporalType}&time_period=${timePeriod}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch layer data');
      }
      
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (error) {
      console.error('Error fetching layer:', error);
      setError('Failed to fetch layer data');
      setIsLoading(false);
      throw error;
    }
  };

  return {
    dataPath,
    dataSource,
    error,
    isLoading,
    toggleDataSource,
    fetchLayerData
  };
};