import React, { useState, useRef, useEffect } from 'react';

const MonthTimeline = ({ onMonthChange }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const timelineRef = useRef(null);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const handleDragStart = (e) => {
    setIsDragging(true);
    const pageY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
    setStartY(pageY - timelineRef.current.offsetTop);
    setScrollTop(timelineRef.current.scrollTop);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const pageY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
    const y = pageY - timelineRef.current.offsetTop;
    const walk = (y - startY) * 2;
    timelineRef.current.scrollTop = scrollTop - walk;
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
  }, [isDragging, startY, scrollTop]);

  return (
    <div className="absolute left-0 top-0 bottom-0 z-10">
      <div className="h-full bg-white bg-opacity-10 backdrop-blur-sm shadow-lg">
        <div
          ref={timelineRef}
          className="flex flex-col h-full overflow-y-auto scrollbar-hide py-2 px-4 touch-pan-y"
          onMouseDown={handleDragStart}
          onMouseLeave={handleDragEnd}
          onMouseUp={handleDragEnd}
          onMouseMove={handleDragMove}
        >
          <div className="flex flex-col space-y-6 py-4 min-h-full justify-between">
            {months.map((month, index) => (
              <div
                key={month}
                onClick={() => selectMonth(index)}
                className={`
                  flex flex-col items-center cursor-pointer transition-all duration-200 px-2
                  ${selectedMonth === index 
                    ? 'text-blue-600 font-bold scale-110' 
                    : 'text-gray-600 hover:text-gray-800'
                  }
                `}
              >
                <span className="text-sm">{month}</span>
                <div
                  className={`w-1 h-4 mt-1 rounded transition-all duration-200
                    ${selectedMonth === index ? 'bg-blue-600' : 'bg-transparent'}
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