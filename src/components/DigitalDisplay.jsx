import React from 'react';
import { formatTime, getTimeDescription } from '../utils/timeUtils';

/**
 * DigitalDisplay component renders a digital representation of the analog clock time
 * 
 * @param {Object} props - Component props
 * @param {number} props.hours - Hours (1-12)
 * @param {number} props.minutes - Minutes (0-59)
 * @param {boolean} props.showDescription - Whether to show a text description of the time
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} - Rendered component
 */
const DigitalDisplay = ({ hours, minutes, showDescription = false, className = '' }) => {
  const timeStr = formatTime(hours, minutes);
  const description = showDescription ? getTimeDescription(hours, minutes) : null;
  
  return (
    <div 
      className={`digital-display font-mono text-center ${className}`}
      data-testid="digital-display"
    >
      <div className="text-2xl font-bold" aria-label={`Digital time: ${timeStr}`}>
        {timeStr}
      </div>
      
      {showDescription && (
        <div className="text-sm text-gray-600 mt-1" aria-live="polite">
          {description}
        </div>
      )}
    </div>
  );
};

export default DigitalDisplay;