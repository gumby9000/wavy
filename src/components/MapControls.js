import React from 'react';

const ControlButton = ({ onClick, label }) => (
  <button
    onClick={onClick}
    className="bg-white px-3 py-2 rounded shadow z-10 hover:bg-gray-100"
  >
    {label}
  </button>
);

const MapControls = ({ 
  visualParam, 
  toggleParameter,
  interpolationMode,
  toggleInterpolationMode,
  dataSource,
  toggleDataSource
}) => {
  
  const getParameterButtonLabel = () => {
    switch(visualParam) {
      case 'height':
        return 'Show Period';
      case 'period':
        return 'Show Energy';
      case 'energy':
        return 'Show Height';
      default:
        return 'Change Parameter';
    }
  };
  return (
    <div className="absolute top-20 pt-10 right-4 flex flex-col gap-2">
      <ControlButton 
        onClick={toggleParameter}
        label={getParameterButtonLabel()}
      />
      <ControlButton 
        onClick={toggleInterpolationMode}
        label={interpolationMode === 'step' ? 'Contours' : 'Smooth'}
      />
      <ControlButton 
        onClick={toggleDataSource}
        label={dataSource === '40' ? '1980-2024' : '2025'}
      />
    </div>
  );
};

export default MapControls;