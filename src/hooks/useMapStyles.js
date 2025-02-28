import { useState } from 'react';

export const useMapStyles = () => {
  const [colorMode, setColorMode] = useState('relative');
  const [interpolationMode, setInterpolationMode] = useState('interpolate');
  const [visualParam, setVisualParam] = useState('height');

  const toggleParameter = () => {
    const newParam = visualParam === 'height' ? 'period' : 'height';
    setVisualParam(newParam);
    return newParam;
  };
  
  const toggleInterpolationMode = () => {
    const newMode = interpolationMode === 'interpolate' ? 'step' : 'interpolate';
    setInterpolationMode(newMode);
    return newMode;
  };

  const toggleColorMode = () => {
    const newMode = colorMode === 'absolute' ? 'relative' : 'absolute';
    setColorMode(newMode);
    return newMode;
  };

  const getPeriodColorScale = (mode) => {
    return mode === 'step' ? [
      'step',
      ['get', 'wave_period_s'],
      '#000645',  // default color for values < 2
      2, '#0017ff',
      3, '#005bff',
      4, '#00fff4',
      5, '#0fff00',
      6, '#ddff00',
      7, '#ff7300',
      8, '#ff0000',
      9, '#ff00be',
      10, '#9400d3'
    ] : [
      'interpolate',
      ['linear'],
      ['get', 'wave_period_s'],
      2, '#0017ff',
      3, '#005bff',
      4, '#00fff4',
      5, '#0fff00',
      6, '#ddff00',
      7, '#ff7300',
      8, '#ff0000',
      9, '#ff00be',
      10, '#9400d3'
    ];
  };
  
  const getHeightColorScale = (cMode, iMode) => {
    const absoluteColors = iMode === 'step' ? [
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

    const relativeColors = iMode === 'step' ? [
      'step',
      ['get', 'wave_height_ft'],
      '#0017ff',   // default color for values < 2
      2, '#005bff',
      4, '#00fff4',
      5, '#0fff00',
      6, '#ddff00',
      7, '#ff7300',
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
      7, '#ff7300',
      8, '#ff0000',
      10, '#ff00be',
      12, '#9400d3',
      14, '#4b0082',
      16, '#800080',
      18, '#4a0043',
      20, '#ffffff'
    ];

    return cMode === 'absolute' ? absoluteColors : relativeColors;
  };

  const getColorScale = () => {
    if (visualParam === 'period') {
      return getPeriodColorScale(interpolationMode);
    }
    return getHeightColorScale(colorMode, interpolationMode);
  };

  return {
    colorMode,
    interpolationMode,
    visualParam,
    toggleParameter,
    toggleInterpolationMode,
    toggleColorMode,
    getColorScale
  };
};