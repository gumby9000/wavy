import React, {useEffect, useRef, useState} from "react";
import * as PIXI from 'pixi.js';
import {debounce} from 'lodash';

const PixiOverlay = ({map, waveData, visualParam, colorMode}) => {
    const pixiContainer = useRef(null);
    const pixiApp = useRef(null);
    const graphicsLayer = useRef(null);
    
    const [geoCords] = useState({
        lat: 37.7749,
        lng: -122.4194,
        size: 0.5
    });
    
    const [boundingBox, setBoundingBox] = useState([
        [-87.634896, 31.000888], // Top-left (northwest)
        [-79.974306, 31.000888], // Top-right (northeast)
        [-79.974306, 24.396308], // Bottom-right (southeast)
        [-87.634896, 24.396308]  // Bottom-left (southwest)
    ]);
    useEffect(() => {
        if (!map.current || !pixiContainer.current) return;
        console.log('attempting to init pixi!');
        
        // pixiApp.current = new PIXI.Application();
        const initPixiApp = async () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = map.current.getCanvas().width;
                canvas.height = map.current.getCanvas().height;
                
                const app = new PIXI.Application();

                await app.init({
                    canvas,
                    backgroundAlpha: 0,
                    antialias: true,
                    autoDensity: true,
                    resolution: window.devicePixelRatio || 1,
                    resizeTo: window
                });
                
                pixiApp.current = app;
                
                pixiContainer.current.appendChild(canvas);
                const container = new PIXI.Container();

                app.stage.addChild(container);

                graphicsLayer.current = new PIXI.Graphics();
                app.stage.addChild(graphicsLayer.current);

                const syncCanvasSize = async () => {
                    if(!map.current || !pixiApp.current) return;

                    const mapCanvas = map.current.getCanvas();
                    const width = window.innerWidth;
                    const height = window.innerHeight;
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;

                    console.log('syncing canvas size');
                    pixiApp.current.renderer.view.width = width;
                    pixiApp.current.renderer.view.height = height;
                    
                    container.x = app.screen.width / 2;
                    container.y = app.screen.height / 2;
                    renderWaveData();
                };

                const onMapMove = debounce(() => {
                    renderWaveData();
                }, 0);
                
                const onResize = debounce(syncCanvasSize, 200);
                
                window.addEventListener('resize', onResize);
                map.current.on('move', onMapMove);
                map.current.on('zoom', onMapMove);
                
                const texture = await PIXI.Assets.load('https://pixijs.com/assets/bunny.png');

                // Create a 5x5 grid of bunnies
                for (let i = 0; i < 1; i++)
                {
                    const bunny = new PIXI.Sprite(texture);
            
                    bunny.anchor.set(0);
                    bunny.x = (i % 5) * 40;
                    bunny.y = Math.floor(i / 5) * 40;
                    // container.addChild(bunny);
                }
            
                // Move container to the center
                container.x = app.screen.width / 2;
                container.y = app.screen.height / 2;
            
                // Center bunny sprite in local container coordinates
                container.pivot.x = container.width / 2;
                container.pivot.y = container.height / 2;
            
                // Listen for animate update
                app.ticker.add((time) =>
                {
                    // Rotate the container!
                    // * use delta to create frame-independent transform *
                    container.rotation += 0.01 * time.deltaTime;
                });
                renderWaveData();

                return () => {
                    window.removeEventListener('resize', onResize);
                    map.current?.off('move', onMapMove);
                    map.current?.off('zoom', onMapMove);
                    
                    if(pixiApp.current) {
                        pixiApp.current.destroy(true);
                        pixiApp.current = null;
                    }
                };
            } catch(error) {
                console.error('Error initializing PixiJS:', error);
            }
        };
        initPixiApp();
    }, [map.current]);
    
    const renderWaveData = () => {
        if (!map.current || !pixiApp.current || !graphicsLayer.current || !waveData) return;

        graphicsLayer.current.clear();

        for(let lon=boundingBox[0][0]; lon<= boundingBox[1][0]; lon+=0.5)
        {
            for(let lat=boundingBox[0][1]; lat<= boundingBox[1][1]; lat+=0.5)
            {
               const tempLeftPixel = map.current.project([lon, lat]);
               const tempRightPixel = map.current.project([lon+0.5, lat+0.5]);
               const tempWidth = tempRightPixel.x - tempLeftPixel.x;
               const tempHeight = tempRightPixel.y - tempLeftPixel.y*-1;
                console.log(tempLeftPixel)
                console.log(tempRightPixel)
                
                console.log(tempWidth)
                console.log(tempHeight)
            
                graphicsLayer.current.beginFill(0x338ff, 0.6);
                graphicsLayer.current.lineStyle(2, 0x0066cc, 1);
                graphicsLayer.current.drawRect(tempLeftPixel.x, tempLeftPixel.y, tempWidth, tempHeight);
                graphicsLayer.current.endFill();
            }
        }
        const topLeft = {
            lat: geoCords.lat + geoCords.size/2,
            lng: geoCords.lng - geoCords.size/2
        };
        const bottomRight = {
            lat: geoCords.lat - geoCords.size/2,
            lng: geoCords.lng + geoCords.size/2
        };
        
        const topLeftPixel = map.current.project([topLeft.lng, topLeft.lat]);
        const bottomRightPixel = map.current.project([bottomRight.lng, bottomRight.lat]);
        
        const width = bottomRightPixel.x - topLeftPixel.x;
        const height = bottomRightPixel.y - topLeftPixel.y;
        
        graphicsLayer.current.beginFill(0x338ff, 0.6);
        graphicsLayer.current.lineStyle(2, 0x0066cc, 1);
        graphicsLayer.current.drawRect(topLeftPixel.x, topLeftPixel.y, width, height);
        graphicsLayer.current.endFill();
    };
    
    return (
        <div
            ref={pixiContainer}
            className="absolute inset-0 pointer-events-none z-10"
        />
    );
};

export default PixiOverlay;