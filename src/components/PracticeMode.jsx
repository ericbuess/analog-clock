import React, { useState, useEffect } from 'react';
import ClockFace from './ClockFace';
import ClockNumbers from './ClockNumbers';
import HourHand from './HourHand';
import MinuteHand from './MinuteHand';
import DigitalDisplay from './DigitalDisplay';
import { calculateTimeFromAngles } from '../utils/angleCalculations';
import { speakTime } from '../utils/audioUtils';

/**
 * PracticeMode component provides a free-form environment for kids to explore clock hands
 * and learn to tell time
 * 
 * @returns {JSX.Element} - Rendered component
 */
const PracticeMode = () => {
  // State for hand positions (pure angles, not derived from anything)
  const [hourAngle, setHourAngle] = useState(0);   // 0 degrees is 12 o'clock 
  const [minuteAngle, setMinuteAngle] = useState(0); // 0 degrees is 12 o'clock
  
  // Current time derived from angles
  const [digitalTime, setDigitalTime] = useState({ hours: 12, minutes: 0 });
  
  // UI state
  const [showDigital, setShowDigital] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [feedback, setFeedback] = useState(null);
  
  // Debug state
  const [debugInfo, setDebugInfo] = useState({
    lastMinuteChange: null,
    lastHourChange: null,
  });
  
  // Update digital time whenever angles change
  useEffect(() => {
    const time = calculateTimeFromAngles(hourAngle, minuteAngle);
    setDigitalTime(time);
    
    // Clear any previous feedback after 3 seconds
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [hourAngle, minuteAngle, feedback]);
  
  // Convert between hour value (1-12) and angle (0-359)
  const hourValueToAngle = (hourValue, minuteValue = 0) => {
    // Ensure hour is in 1-12 range
    const hour12 = ((hourValue - 1) % 12) + 1;
    
    // Convert to angle (30 degrees per hour, plus minute contribution)
    // Adjust by subtracting 1 since 12 o'clock is 0 degrees
    return ((hour12 - 1) * 30) + (minuteValue * 0.5);
  };
  
  const angleToHourValue = (angle) => {
    // Normalize to 0-360
    const normalizedAngle = ((angle % 360) + 360) % 360;
    
    // Convert to 1-12 range
    const hourValue = Math.floor(normalizedAngle / 30) + 1;
    return hourValue > 12 ? hourValue - 12 : hourValue;
  };
  
  // Convert between minute value (0-59) and angle (0-359)
  const minuteValueToAngle = (minuteValue) => {
    // Ensure minute is in 0-59 range
    const minute60 = minuteValue % 60;
    
    // Convert to angle (6 degrees per minute)
    return minute60 * 6;
  };
  
  const angleToMinuteValue = (angle) => {
    // Normalize to 0-360
    const normalizedAngle = ((angle % 360) + 360) % 360;
    
    // Convert to 0-59 range
    return Math.round(normalizedAngle / 6) % 60;
  };
  
  // Handle hour hand dragging
  const handleHourDrag = (newAngle) => {
    console.log(`Hour drag: ${hourAngle.toFixed(1)} → ${newAngle.toFixed(1)}`);
    setDebugInfo(prev => ({
      ...prev,
      lastHourChange: `${hourAngle.toFixed(1)} → ${newAngle.toFixed(1)}`
    }));
    
    setHourAngle(newAngle);
  };
  
  // Enhanced minute hand drag handler with direct approach for processing multiple rotations
  const handleMinuteDrag = (newAngle, options = {}) => {
    // Log incoming values for debugging
    console.log(`Minute drag: ${minuteAngle.toFixed(1)} → ${newAngle.toFixed(1)}, options:`, options);
    
    // Store the old angle for reference
    const oldMinuteAngle = minuteAngle;
    
    // Update minute hand angle
    setMinuteAngle(newAngle);
    
    // Get current time values (not angles) for more reliable calculations
    const currentHourValue = angleToHourValue(hourAngle);
    const newMinuteValue = angleToMinuteValue(newAngle);
    
    // Track rotation count and status in debug info
    setDebugInfo(prev => ({
      ...prev,
      lastMinuteChange: `${oldMinuteAngle.toFixed(1)} → ${newAngle.toFixed(1)}`,
      currentHourValue,
      newMinuteValue,
      fullRotation: options.fullRotation
    }));
    
    // Check for full rotations (key part for hour advancement)
    if (options.fullRotation && options.fullRotation !== 0) {
      // Calculate new hour value based on current hour and rotation direction
      let newHourValue = currentHourValue + options.fullRotation;
      
      // Adjust for 12-hour wraparound
      while (newHourValue > 12) newHourValue -= 12;
      while (newHourValue <= 0) newHourValue += 12;
      
      console.log(`Full rotation detected: ${options.fullRotation}, Hour: ${currentHourValue} → ${newHourValue}`);
      
      // Calculate the new hour angle that properly includes minute contribution
      const newHourAngle = hourValueToAngle(newHourValue, newMinuteValue);
      
      // Update hour hand position
      setHourAngle(newHourAngle);
      
      // Log prominently for debugging
      console.log(`🔄 HOUR ADVANCED: ${currentHourValue} → ${newHourValue} (${options.fullRotation} rotations)`);
    } else {
      // For regular updates without full rotation, just make sure hour position is consistent with minutes
      // We maintain the current hour but update the minute contribution to hour angle
      const newHourAngle = hourValueToAngle(currentHourValue, newMinuteValue);
      
      // Only update hour angle if it's different enough to avoid jitter
      // This helps prevent the hour hand from "jumping" during minute hand dragging
      const hourAngleDiff = Math.abs(hourAngle - newHourAngle);
      if (hourAngleDiff > 0.1) {
        setHourAngle(newHourAngle);
      }
    }
  };
  
  // Special handler for testing directly - exposes a way to simulate rotations without UI interaction
  useEffect(() => {
    // Add a custom event listener for testing hour rotation
    const handleTestRotation = (event) => {
      // Handle direct rotation events for testing
      const { fullRotation } = event.detail;
      
      if (fullRotation) {
        // Calculate new hour value
        const currentHourValue = angleToHourValue(hourAngle);
        let newHourValue = currentHourValue + fullRotation;
        
        // Adjust for 12-hour wraparound
        while (newHourValue > 12) newHourValue -= 12;
        while (newHourValue <= 0) newHourValue += 12;
        
        console.log(`Test rotation: ${fullRotation}, Hour: ${currentHourValue} → ${newHourValue}`);
        
        // Get current minute value for proper hour positioning
        const minuteValue = angleToMinuteValue(minuteAngle);
        
        // Update hour hand
        const newHourAngle = hourValueToAngle(newHourValue, minuteValue);
        setHourAngle(newHourAngle);
      }
    };
    
    // Add test event listeners for direct DOM testing
    document.addEventListener('test-minute-rotation', handleTestRotation);
    
    return () => {
      document.removeEventListener('test-minute-rotation', handleTestRotation);
    };
  }, [hourAngle, minuteAngle]);
  
  // Read the time aloud using speech synthesis
  const readTimeAloud = () => {
    speakTime(digitalTime);
    setFeedback(`That's ${digitalTime.hours}:${digitalTime.minutes.toString().padStart(2, '0')}!`);
  };
  
  // Set a random time
  const setRandomTime = () => {
    // Generate random hour (1-12)
    const randomHour = Math.floor(Math.random() * 12) + 1;
    
    // Generate random minute (0-59)
    // For young learners, round to 5-minute intervals
    const randomMinute = Math.round(Math.floor(Math.random() * 12) * 5);
    
    // Convert to angles
    const newHourAngle = hourValueToAngle(randomHour, randomMinute);
    const newMinuteAngle = minuteValueToAngle(randomMinute);
    
    // Update the angles directly
    setHourAngle(newHourAngle);
    setMinuteAngle(newMinuteAngle);
    
    console.log(`Set random time: ${randomHour}:${randomMinute.toString().padStart(2, '0')} (hourAngle: ${newHourAngle.toFixed(1)}, minuteAngle: ${newMinuteAngle.toFixed(1)})`);
    
    // Give feedback after a small delay to allow state to update
    setTimeout(() => {
      setFeedback('Try reading this time!');
    }, 100);
  };
  
  return (
    <div className="practice-mode" data-testid="practice-mode">
      <h2 className="text-2xl mb-4 text-center">Practice Mode</h2>
      
      <div className="clock-container flex flex-col items-center">
        <ClockFace size={300} theme="colorful">
          <ClockNumbers 
            size={300} 
            highlightHour={null} // No highlighting in practice mode
            highlightMinute={null}
            showMinutes={true}
          />
          <HourHand 
            angle={hourAngle} 
            isDraggable={true} 
            onDrag={handleHourDrag} 
          />
          <MinuteHand 
            angle={minuteAngle} 
            isDraggable={true} 
            onDrag={handleMinuteDrag}
            snapInterval={5} // Snap to 5-minute intervals for easier learning
          />
          
          {/* Center dot */}
          <div 
            className="absolute w-3 h-3 bg-black rounded-full" 
            style={{ 
              left: 'calc(50% - 1.5px)', 
              top: 'calc(50% - 1.5px)',
              zIndex: 30
            }}
          />
        </ClockFace>
        
        {showDigital && (
          <DigitalDisplay 
            hours={digitalTime.hours} 
            minutes={digitalTime.minutes}
            showDescription={showDescription}
            className="mt-4"
          />
        )}
        
        {feedback && (
          <div className="feedback mt-4 text-xl text-green-600 font-bold" aria-live="polite">
            {feedback}
          </div>
        )}
        
        <div className="controls mt-6 flex flex-wrap justify-center gap-3">
          <button 
            onClick={readTimeAloud}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            data-testid="read-time-button"
          >
            Read Time
          </button>
          
          <button 
            onClick={() => setShowDigital(!showDigital)}
            className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            data-testid="toggle-digital-button"
          >
            {showDigital ? 'Hide Digital' : 'Show Digital'}
          </button>
          
          <button 
            onClick={setRandomTime}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
            data-testid="random-time-button"
          >
            Random Time
          </button>
          
          {showDigital && (
            <button 
              onClick={() => setShowDescription(!showDescription)}
              className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              data-testid="toggle-description-button"
            >
              {showDescription ? 'Hide Words' : 'Show Words'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeMode;