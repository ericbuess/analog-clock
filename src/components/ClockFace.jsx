import React from 'react';
import ClockNumbers from './ClockNumbers';

/**
 * ClockFace component renders the base clock face with optional theming
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components (hands, numbers, etc.)
 * @param {number} props.size - Clock size in pixels
 * @param {string} props.theme - Clock theme ('default', 'colorful', 'highContrast')
 * @returns {JSX.Element} - Rendered component
 */
const ClockFace = ({ children, size = 300, theme = 'default' }) => {
  // Theme variants for the clock face
  const themes = {
    default: 'bg-white border-gray-800',
    colorful: 'bg-blue-50 border-blue-500',
    highContrast: 'bg-black border-yellow-400',
  };
  
  return (
    <div 
      data-testid="clock-face"
      className={`clock-face rounded-full ${themes[theme]} border-4 relative`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      }}
      role="img"
      aria-label="Analog clock face"
    >
      {/* Clock ticks for minutes */}
      {Array.from({ length: 60 }).map((_, i) => (
        <div 
          key={`tick-${i}`} 
          className={`absolute w-0.5 origin-bottom ${
            i % 5 === 0 ? 'bg-gray-800 h-3' : 'bg-gray-400 h-1'
          }`}
          style={{
            left: '50%',
            bottom: '50%',
            transform: `translateX(-50%) rotate(${i * 6}deg) translateY(-${size / 2 - 10}px)`
          }}
        />
      ))}
      
      {children}
    </div>
  );
};

export default ClockFace;