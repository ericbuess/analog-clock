import React from 'react';

/**
 * ClockNumbers component renders the hour and minute numbers on the clock face
 * 
 * @param {Object} props - Component props
 * @param {number} props.size - Clock size in pixels
 * @param {number|null} props.highlightHour - Hour to highlight (1-12 or null)
 * @param {number|null} props.highlightMinute - Minute to highlight (multiple of 5, or null)
 * @param {boolean} props.showMinutes - Whether to show minute markers (5, 10, 15, etc.)
 * @returns {JSX.Element} - Rendered component
 */
const ClockNumbers = ({ 
  size = 300, 
  highlightHour = null, 
  highlightMinute = null,
  showMinutes = true
}) => {
  const radius = size / 2 - 30;
  
  return (
    <>
      {/* Hour numbers (1-12) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const number = i === 0 ? 12 : i;
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        const isHighlighted = number === highlightHour;
        
        return (
          <div 
            key={`number-${i}`}
            data-testid={`clock-number-${number}`}
            className={`absolute text-2xl font-bold ${
              isHighlighted ? 'text-red-500 animate-pulse-slow' : 'text-gray-800'
            }`}
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)'
            }}
            aria-label={`${number} o'clock`}
          >
            {number}
          </div>
        );
      })}
      
      {/* Minute markers (by 5) with optional highlighting */}
      {showMinutes && Array.from({ length: 12 }).map((_, i) => {
        const minutes = i * 5;
        const isHighlighted = minutes === highlightMinute;
        
        if (minutes === 0) return null; // Skip 0/60
        
        return (
          <div
            key={`minute-${minutes}`}
            data-testid={`minute-marker-${minutes}`}
            className={`absolute text-sm ${
              isHighlighted ? 'text-blue-500 font-bold' : 'text-gray-500'
            }`}
            style={{
              left: `calc(50% + ${radius * 0.8 * Math.cos((i * 30 - 90) * (Math.PI / 180))}px)`,
              top: `calc(50% + ${radius * 0.8 * Math.sin((i * 30 - 90) * (Math.PI / 180))}px)`,
              transform: 'translate(-50%, -50%)'
            }}
            aria-label={`${minutes} minutes`}
          >
            {minutes}
          </div>
        );
      })}
    </>
  );
};

export default ClockNumbers;