import Map from '../components/Map'
import 'tailwindcss/tailwind.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import Link from 'next/link';
import { useState } from 'react';
import MonthTimeline from '@/components/MonthTimeline';
console.log('Token available:', process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);
export default function Wavy() {

    const [showPopup, setShowPopup] =  useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  
    const handleMonthChange = (monthIndex) => {
      setSelectedMonth(monthIndex);
      console.log("Selected month:",monthIndex);
    };
    
    return (
        
    <div className="flex h-screen w-full">
      {/* Navigation Sidebar - 1/4 width */}
      {/* Map Container - 3/4 width */}
      <div className="flex-1 h-full"
           onClick={() => setShowPopup(false)}>
        <Map/>
        {showPopup && (
          <div
              className='absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg cursor-pointer z-10'
          >
              <p className='text-gray-800 text-center'>
                  Welcome to Wavy!<br/>
                  Click or tap and drag to move around the map
              </p>
          </div>
        )}
            <MonthTimeline onMonthChange={handleMonthChange}/>
      </div>
    </div>
    );
}