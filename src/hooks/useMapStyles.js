import { useState } from 'react';

export const useMapStyles = () => {
  const [colorMode, setColorMode] = useState('relative');
  const [interpolationMode, setInterpolationMode] = useState('interpolate');
  const [visualParam, setVisualParam] = useState('energy');

  const toggleParameter = () => {
    
    let newParam;
    if (visualParam === 'height') {
      newParam = 'period';
    } else if (visualParam === 'period') {
      newParam = 'energy';
    } else {
      newParam = 'height';
    }
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
  
  const getEnergyScale = (iMode) => {
    // const energyColors = iMode === 'step' ? [
    //   'step',
    //   ['log10', ['+', ['get', 'wave_energy_j'], 1]],
    //   0, '#0a1597',    // log10(1) = 0
    //   0.52, '#1734f9', // log10(3.3) ≈ 0.52
    //   1.04, '#106dfb', // log10(11) ≈ 1.04
    //   1.56, '#009bfc', // log10(36) ≈ 1.56
    //   2.08, '#00c9fc', // log10(120) ≈ 2.08
    //   2.6, '#00fdcb',  // log10(400) ≈ 2.6
    //   3.12, '#00fc9c', // log10(1,300) ≈ 3.12
    //   3.64, '#00f95c', // log10(4,400) ≈ 3.64
    //   4.16, '#8cfb38', // log10(14,500) ≈ 4.16
    //   4.68, '#c9fc3a', // log10(48,000) ≈ 4.68
    //   5.15, '#fcfa3a'  // log10(140,000) ≈ 5.15
    // ] : [
    //   'interpolate',
    //   ['linear'],
    //   ['log10', ['+', ['get', 'wave_energy_j'], 1]],
    //   0, '#0a1597',    // log10(1) = 0
    //   0.52, '#1734f9', // log10(3.3) ≈ 0.52
    //   1.04, '#106dfb', // log10(11) ≈ 1.04
    //   1.56, '#009bfc', // log10(36) ≈ 1.56
    //   2.08, '#00c9fc', // log10(120) ≈ 2.08
    //   2.6, '#00fdcb',  // log10(400) ≈ 2.6
    //   3.12, '#00fc9c', // log10(1,300) ≈ 3.12
    //   3.64, '#00f95c', // log10(4,400) ≈ 3.64
    //   4.16, '#8cfb38', // log10(14,500) ≈ 4.16
    //   4.68, '#c9fc3a', // log10(48,000) ≈ 4.68
    //   5.15, '#fcfa3a'  // log10(140,000) ≈ 5.15
    // ];
    const energyColors = iMode === 'step' ? [
      'step',
      ['log10', ['+', ['get', 'wave_energy_j'], 1]],
      0, '#0017ff',    // log10(1) = 0
      2.6, '#005bff', // log10(400) ≈ 0.52
      3.12, '#00fff4', // log10(1,300) ≈ 3.12
      3.64, '#0fff00', // log10(4,400) ≈ 3.64
      4.16, '#ddff00', // log10(14,500) ≈ 4.16
      4.68, '#ff7300', // log10(48,000) ≈ 4.68
      5.15, '#ff0000'  // log10(140,000) ≈ 5.15
    ] : [
      'interpolate',
      ['linear'],
      ['log10', ['+', ['get', 'wave_energy_j'], 1]],
      0, '#0017ff',    // log10(1) = 0
      2.6, '#005bff', // log10(400) ≈ 0.52
      3.12, '#00fff4', // log10(1,300) ≈ 3.12
      3.64, '#0fff00', // log10(4,400) ≈ 3.64
      3.8, '#ddff00', // log10(4,400) ≈ 3.64
      4.0, '#ff7300', // log10(10,000) ≈ 4.16
      4.3, '#ff0000', // log10(14,500) ≈ 4.16
      4.6, '#ff00be', // log10(48,000) ≈ 4.68
      4.9, '#9400d3', // log10(48,000) ≈ 4.68
      5.07, '#4b0082'  // log10(140,000) ≈ 5.15
    ];
    return energyColors;
  };

  const getColorScale = () => {
    if (visualParam === 'period') {
      return getPeriodColorScale(interpolationMode);
    } else if (visualParam === 'height') {
      return getHeightColorScale(colorMode, interpolationMode);
    } else {
      return getEnergyScale(interpolationMode);
    }
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