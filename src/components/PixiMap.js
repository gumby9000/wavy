// components/PixiMap.js
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from 'mapbox-gl';
import * as PIXI from 'pixi.js';
import 'mapbox-gl/dist/mapbox-gl.css';

const PixiMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const pixiOverlay = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [error, setError] = useState(null);
  
  // Safely initialize the map
  useEffect(() => {
    if (map.current) return;
    
    // Make sure we have the token
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      setError("Mapbox token is missing. Check your environment variables.");
      return;
    }
    
    console.log('Initializing map in PixiMap component');
    
    try {
      mapboxgl.accessToken = token;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v10',
        center: [-81.79, 26.14],
        zoom: 6,
        antialias: true // Enable antialiasing for smoother rendering
      });
      
      map.current.on('load', () => {
        console.log('Map loaded successfully in PixiMap');
        setMapInitialized(true);
      });
      
      map.current.on('error', (err) => {
        console.error('Mapbox error:', err);
        setError(`Map error: ${err.error?.message || 'Unknown error'}`);
      });
    } catch (err) {
      console.error('Error creating map:', err);
      setError(`Failed to initialize map: ${err.message}`);
    }
    
    return () => {
      if (map.current) {
        console.log('Removing map...');
        map.current.remove();
      }
    };
  }, []);
  
  // Add PixiJS overlay layer after map is initialized
  useEffect(() => {
    if (!mapInitialized || !map.current) return;
    
    try {
      console.log('Adding PixiJS layer to map');
      
      // Create a custom layer with PixiJS
      const pixiLayer = {
        id: 'pixi-visualization-layer',
        type: 'custom',
        renderingMode: '2d',
        
        onAdd: function(map, gl) {
          // Create PIXI Application
          const canvas = document.createElement('canvas');
          const pixiApp = new PIXI.Application({
            width: gl.canvas.width,
            height: gl.canvas.height,
            view: canvas,
            context: gl,
            backgroundAlpha: 0, 
            antialias: true,
            autoDensity: true
          });
          
          this.pixiApp = pixiApp;
          
          // Create a container for all PIXI objects
          this.container = new PIXI.Container();
          pixiApp.stage.addChild(this.container);
          
          // Create test visualization - a red square at the map center
          const mapCenter = map.getCenter();
          const centerPoint = map.project(mapCenter);
          
          const square = new PIXI.Graphics();
          square.beginFill(0xFF0000, 0.5);
          square.drawRect(-50, -50, 100, 100);
          square.endFill();
          square.position.set(centerPoint.x, centerPoint.y);
          
          this.container.addChild(square);
          this.square = square;
          
          // Save references for use in render
          this.map = map;
          this.gl = gl;
        },
        
        render: function(gl, matrix) {
          // Update square position if map moves
          const mapCenter = this.map.getCenter();
          const centerPoint = this.map.project(mapCenter);
          this.square.position.set(centerPoint.x, centerPoint.y);
          
          // Render the PIXI application
          this.pixiApp.renderer.reset();
          this.pixiApp.renderer.render(this.pixiApp.stage);
          this.map.triggerRepaint();
        }
      };
      
      // Add custom layer to map
      map.current.addLayer(pixiLayer);
      pixiOverlay.current = pixiLayer;
      
      console.log('PixiJS layer added to map');
    } catch (err) {
      console.error('Error adding PixiJS layer:', err);
      setError(`Failed to initialize PixiJS overlay: ${err.message}`);
    }
  }, [mapInitialized]);
  
  return (
    <div className="relative w-full h-screen">
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-50">
          {error}
        </div>
      )}
      
      <div 
        ref={mapContainer} 
        className="absolute inset-0 w-full h-full"
      />
      
      <div className="absolute top-4 left-4 bg-white p-3 rounded shadow z-10">
        <h3 className="font-bold">PixiJS Visualization Demo</h3>
        <p>Red square rendered with PixiJS overlay</p>
      </div>
    </div>
  );
};

export default PixiMap;