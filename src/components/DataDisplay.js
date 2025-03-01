import React from 'react';
import { roundToHundredth, dirToWord } from '../utils/directionUtils';

const DataDisplay = ({ coords, waveData }) => {
  const { lng, lat } = coords || { lng: 'N/A', lat: 'N/A' };
  const { height, period, direction, energy } = waveData || { 
    height: 'N/A', 
    period: 'N/A', 
    direction: 'N/A',
    energy: 'N/A'
  };

  return (
    <div className="absolute top-4 right-4 bg-white p-2 rounded shadow z-10">
      <div className="text-sm">
        <div className="font-medium">Coordinates: {lng}, {lat}</div>
        <div>Wave Height: {height} ft</div>
        <div>Period: {period}s </div>
        <div>Direction: {direction} {dirToWord(direction)} </div>
        <div>Energy: {energy}j </div>
      </div>
    </div>
  );
};

export default DataDisplay;