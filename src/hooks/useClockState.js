import { useState, useEffect } from 'react';
import { calculateTimeFromAngles, calculateHourAngle, calculateMinuteAngle } from '../utils/angleCalculations';

/**
 * Custom hook for managing clock hand state and derived time
 * 
 * @param {Object} options - Hook options
 * @param {number} options.snapToMinutes - Minute interval to snap to (default: 5)
 * @param {boolean} options.syncHands - Whether to sync hour hand with minute position (default: true)
 * @returns {Object} - Clock state and handler methods
 */
const useClockState = ({ snapToMinutes = 5, syncHands = true } = {}) => {
  // State for clock hand angles
  const [hourAngle, setHourAngle] = useState(0);
  const [minuteAngle, setMinuteAngle] = useState(0);
  
  // State for time derived from angles
  const [time, setTime] = useState({ hours: 12, minutes: 0 });
  
  // Update time whenever angles change
  useEffect(() => {
    const newTime = calculateTimeFromAngles(hourAngle, minuteAngle);
    setTime(newTime);
  }, [hourAngle, minuteAngle]);
  
  // Handler for hour hand drag
  const handleHourDrag = (newAngle) => {
    setHourAngle(newAngle);
    
    // Optionally update minute position based on hour
    if (syncHands) {
      const hourFraction = (newAngle % 30) / 30;
      const minuteEffect = hourFraction * 30 * 12;
      if (hourFraction > 0) {
        setMinuteAngle(Math.round(minuteEffect / (snapToMinutes * 6)) * (snapToMinutes * 6));
      }
    }
  };
  
  // Handler for minute hand drag
  const handleMinuteDrag = (newAngle) => {
    // Snap to intervals if specified
    const snappedAngle = Math.round(newAngle / (snapToMinutes * 6)) * (snapToMinutes * 6);
    setMinuteAngle(snappedAngle);
    
    // Optionally update hour position based on minutes
    if (syncHands) {
      const minuteFraction = snappedAngle / 360;
      const hourBase = Math.floor(hourAngle / 30) * 30;
      setHourAngle(hourBase + (minuteFraction * 30));
    }
  };
  
  // Set time directly (in hours and minutes)
  const setClockTime = (hours, minutes) => {
    const newHourAngle = calculateHourAngle(hours, minutes);
    const newMinuteAngle = calculateMinuteAngle(minutes);
    
    setHourAngle(newHourAngle);
    setMinuteAngle(newMinuteAngle);
  };
  
  // Set random time
  const setRandomTime = (roundTo5Minutes = true) => {
    const randomHour = Math.floor(Math.random() * 12) + 1; // 1-12
    let randomMinute = Math.floor(Math.random() * 60); // 0-59
    
    if (roundTo5Minutes) {
      randomMinute = Math.round(randomMinute / 5) * 5;
      if (randomMinute === 60) randomMinute = 0;
    }
    
    setClockTime(randomHour, randomMinute);
  };
  
  return {
    // State
    hourAngle,
    minuteAngle,
    time,
    
    // Handlers
    handleHourDrag,
    handleMinuteDrag,
    setHourAngle,
    setMinuteAngle,
    
    // Methods
    setClockTime,
    setRandomTime
  };
};

export default useClockState;