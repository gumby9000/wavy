// pages/pixi-demo.js
import PixiMap from '../components/PixiMap';
import Head from 'next/head';
import Link from 'next/link';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function PixiDemo() {
  return (
    <>
      <Head>
        <title>Map Visualization Demo</title>
      </Head>
      
      {/* Full screen container with explicit height */}
      <div className="w-full h-screen">
        <PixiMap />
        
        {/* Navigation link */}
        <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow z-10">
          <Link href="/">
            <span className="text-blue-500 hover:text-blue-700">
              Return to Wave Map
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}