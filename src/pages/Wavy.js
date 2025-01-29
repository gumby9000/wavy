import Map from '../components/Map'
import 'tailwindcss/tailwind.css';
import 'mapbox-gl/dist/mapbox-gl.css';
console.log('Token available:', process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);
export default function Wavy() {
    return (
        
        <div className="flex h-screen w-full">
      {/* Navigation Sidebar - 1/4 width */}
      <nav className="w-[250px] bg-slate-800 text-white p-4 overflow-y-auto">
        <h1 className="text-xl font-bold mb-4">Wavy Weather</h1>
        {/* Add your navigation items here */}
        <div className="space-y-4">
          <div className="p-2 hover:bg-slate-700 rounded cursor-pointer">
            Weather Map
          </div>
          <div className="p-2 hover:bg-slate-700 rounded cursor-pointer">
            Historical Data
          </div>
          <div className="p-2 hover:bg-slate-700 rounded cursor-pointer">
            Settings
          </div>
        </div>
      </nav>

      {/* Map Container - 3/4 width */}
      <div className="flex-1 h-full">
        <Map/>
      </div>
    </div>
    );
}