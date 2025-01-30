import Map from '../components/Map'
import 'tailwindcss/tailwind.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import Link from 'next/link';
console.log('Token available:', process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);
export default function Wavy() {
    return (
        
    <div className="flex h-screen w-full">
      {/* Navigation Sidebar - 1/4 width */}


      {/* Map Container - 3/4 width */}
      <div className="flex-1 h-full">
        <Map/>
      </div>
    </div>
    );
}