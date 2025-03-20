import React, { useState, useEffect, useRef } from 'react';
import ClockFace from './ClockFace';
import ClockNumbers from './ClockNumbers';
import HourHand from './HourHand';
import MinuteHand from './MinuteHand';
import DigitalDisplay from './DigitalDisplay';
import { calculateTimeFromAngles } from '../utils/angleCalculations';
import { speakTime, playTickSound } from '../utils/audioUtils';

/**
 * PracticeMode component provides a free-form environment for kids to explore clock hands
 * and learn to tell time
 * 
 * @returns {JSX.Element} - Rendered component
 */
const PracticeMode = () => {
  // State for clock hands angles
  const [hourAngle, setHourAngle] = useState(0); // 0 degrees is 12 o'clock
  const [minuteAngle, setMinuteAngle] = useState(0); // 0 degrees is 12 o'clock
  
  // State for current time (derived from angles)
  const [digitalTime, setDigitalTime] = useState({ hours: 12, minutes: 0 });
  
  // UI state
  const [showDigital, setShowDigital] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [feedback, setFeedback] = useState(null);
  
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
  
  // Handle hour hand dragging
  const handleHourDrag = (newAngle) => {
    setHourAngle(newAngle);
    
    // Also update minute hand slightly based on hour position
    // This creates a more realistic clock behavior
    const hourFraction = (newAngle % 30) / 30; // 0-1 representing how far between hours
    const minuteEffect = hourFraction * 30; // Convert to degrees for minute hand
    
    // Only update minute angle if it's a result of hour hand movement between hours
    if (minuteEffect > 0) {
      setMinuteAngle(Math.round(minuteEffect * 12) % 360);
    }
  };
  
  // Handle minute hand dragging
  const handleMinuteDrag = (newAngle) => {
    setMinuteAngle(newAngle);
    
    // Also update hour hand slightly based on minute position
    // Hour hand moves 30 degrees per hour, so minute position affects it slightly
    const minuteFraction = newAngle / 360; // 0-1 representing full circle
    const hourBase = Math.floor(hourAngle / 30) * 30; // Base angle for the hour
    const hourEffect = minuteFraction * 30; // How much to add to hour angle
    
    setHourAngle(hourBase + hourEffect);
  };
  
  // Read the time aloud using speech synthesis
  const readTimeAloud = () => {
    speakTime(digitalTime);
    
    setFeedback(`That's ${digitalTime.hours}:${digitalTime.minutes.toString().padStart(2, '0')}!`);
  };
  
  // Set a random time
  const setRandomTime = () => {
    // Generate random hour (0-11) and convert to degrees
    const randomHour = Math.floor(Math.random() * 12);
    const newHourAngle = randomHour * 30;
    
    // Generate random minute (0-59) and convert to degrees
    // For young learners, round to 5-minute intervals
    const randomMinute = Math.round(Math.floor(Math.random() * 12) * 5);
    const newMinuteAngle = randomMinute * 6;
    
    setHourAngle(newHourAngle + (newMinuteAngle / 12)); // Hour hand moves slightly based on minutes
    setMinuteAngle(newMinuteAngle);
    
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