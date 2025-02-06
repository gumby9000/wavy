import React, { useState, useRef, useEffect } from 'react';

const MonthTimeline = ({ onMonthChange }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const timelineRef = useRef(null);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const handleDragStart = (e) => {
    setIsDragging(true);
    const pageX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
    setStartX(pageX - timelineRef.current.offsetLeft);
    setScrollLeft(timelineRef.current.scrollLeft);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const pageX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
    const x = pageX - timelineRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    timelineRef.current.scrollLeft = scrollLeft - walk;
  };

  const selectMonth = (index) => {
    setSelectedMonth(index);
    if (onMonthChange) {
      onMonthChange(index);
    }
  };

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    timeline.addEventListener('touchstart', handleDragStart);
    timeline.addEventListener('touchend', handleDragEnd);
    timeline.addEventListener('touchmove', handleDragMove);

    return () => {
      timeline.removeEventListener('touchstart', handleDragStart);
      timeline.removeEventListener('touchend', handleDragEnd);
      timeline.removeEventListener('touchmove', handleDragMove);
    };
  }, [isDragging, startX, scrollLeft]);

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-11/12 max-w-2xl rounded-lg">
      <div className="bg-white bg-opacity-50 backdrop-blur-sm shadow-lg rounded-lg">
        <div
          ref={timelineRef}
          className="flex overflow-x-auto scrollbar-hide py-3 px-2 touch-pan-x"
          onMouseDown={handleDragStart}
          onMouseLeave={handleDragEnd}
          onMouseUp={handleDragEnd}
          onMouseMove={handleDragMove}
        >
          <div className="flex space-x-8 px-4 min-w-full justify-between">
            {months.map((month, index) => (
              <div
                key={month}
                onClick={() => selectMonth(index)}
                className={`
                  group flex flex-col items-center cursor-pointer transition-all duration-200
                  ${selectedMonth === index 
                    ? 'text-blue-600 font-bold scale-110' 
                    : 'text-gray-600 hover:text-gray-800'
                  }
                `}
              >
                <span className="text-sm font-medium">{month}</span>
                <div
                  className={`h-1 w-full mt-2 rounded-full transition-all duration-200
                    ${selectedMonth === index 
                      ? 'bg-blue-600' 
                      : 'bg-transparent group-hover:bg-blue-200'
                    }
                  `}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthTimeline;