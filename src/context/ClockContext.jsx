import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateTimeFromAngles, calculateHourAngle, calculateMinuteAngle } from '../utils/angleCalculations';

// Create context
const ClockContext = createContext();

/**
 * Provider component for global clock state management
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 * @returns {JSX.Element} - Provider component
 */
export const ClockProvider = ({ children }) => {
  // Core clock state
  const [hourAngle, setHourAngle] = useState(0);
  const [minuteAngle, setMinuteAngle] = useState(0);
  const [currentTime, setCurrentTime] = useState({ hours: 12, minutes: 0 });
  
  // Preferences
  const [clockSize, setClockSize] = useState(300);
  const [theme, setTheme] = useState('default');
  const [showNumbers, setShowNumbers] = useState(true);
  const [showMinuteMarkers, setShowMinuteMarkers] = useState(true);
  const [snapInterval, setSnapInterval] = useState(5); // Default to 5-minute intervals
  
  // Accessibility
  const [highContrast, setHighContrast] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  // Update current time whenever angles change
  useEffect(() => {
    const time = calculateTimeFromAngles(hourAngle, minuteAngle);
    setCurrentTime(time);
  }, [hourAngle, minuteAngle]);
  
  // Method to set the clock time
  const setClockTime = (hours, minutes) => {
    const newHourAngle = calculateHourAngle(hours, minutes);
    const newMinuteAngle = calculateMinuteAngle(minutes);
    
    setHourAngle(newHourAngle);
    setMinuteAngle(newMinuteAngle);
  };
  
  // Method to handle hour hand dragging
  const handleHourDrag = (newAngle) => {
    setHourAngle(newAngle);
    
    // Also update minute hand slightly based on hour position
    const hourFraction = (newAngle % 30) / 30; // 0-1 representing how far between hours
    const minuteEffect = hourFraction * 30; // Convert to degrees for minute hand
    
    // Only update minute angle if it's a result of hour hand movement between hours
    if (minuteEffect > 0) {
      setMinuteAngle(Math.round(minuteEffect * 12) % 360);
    }
  };
  
  // Method to handle minute hand dragging
  const handleMinuteDrag = (newAngle) => {
    setMinuteAngle(newAngle);
    
    // Also update hour hand slightly based on minute position
    const minuteFraction = newAngle / 360; // 0-1 representing full circle
    const hourBase = Math.floor(hourAngle / 30) * 30; // Base angle for the hour
    const hourEffect = minuteFraction * 30; // How much to add to hour angle
    
    setHourAngle(hourBase + hourEffect);
  };
  
  // Toggle high contrast mode
  const toggleHighContrast = () => {
    const newHighContrast = !highContrast;
    setHighContrast(newHighContrast);
    setTheme(newHighContrast ? 'highContrast' : 'default');
  };
  
  // Create context value object
  const contextValue = {
    // State
    hourAngle,
    minuteAngle,
    currentTime,
    clockSize,
    theme,
    showNumbers,
    showMinuteMarkers,
    snapInterval,
    highContrast,
    audioEnabled,
    
    // Methods
    setHourAngle,
    setMinuteAngle,
    setClockTime,
    handleHourDrag,
    handleMinuteDrag,
    setClockSize,
    setTheme,
    setShowNumbers,
    setShowMinuteMarkers,
    setSnapInterval,
    toggleHighContrast,
    setAudioEnabled,
  };
  
  return (
    <ClockContext.Provider value={contextValue}>
      {children}
    </ClockContext.Provider>
  );
};

// Custom hook for using clock context
export const useClock = () => {
  const context = useContext(ClockContext);
  if (context === undefined) {
    throw new Error('useClock must be used within a ClockProvider');
  }
  return context;
};

export default ClockContext;