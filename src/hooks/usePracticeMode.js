import { useState, useEffect, useRef } from 'react';
import useClockState from './useClockState';
import { speakTime, playTickSound } from '../utils/audioUtils';

/**
 * Custom hook for practice mode functionality
 * 
 * @param {Object} options - Hook options
 * @param {number} options.snapToMinutes - Minute interval to snap to (default: 5)
 * @returns {Object} - Practice mode state and handlers
 */
const usePracticeMode = ({ snapToMinutes = 5 } = {}) => {
  // Use clock state hook for hand position and time
  const clockState = useClockState({ snapToMinutes });
  
  // UI state
  const [showDigital, setShowDigital] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  // Clear feedback after timeout
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);
  
  // Read the time aloud using speech synthesis
  const readTimeAloud = () => {
    if (!audioEnabled) return;
    
    speakTime(clockState.time);
    
    const { hours, minutes } = clockState.time;
    setFeedback(`That's ${hours}:${minutes.toString().padStart(2, '0')}!`);
  };
  
  // Toggle digital display
  const toggleDigitalDisplay = () => {
    setShowDigital(prev => !prev);
  };
  
  // Toggle time description
  const toggleDescription = () => {
    setShowDescription(prev => !prev);
  };
  
  // Toggle audio
  const toggleAudio = () => {
    setAudioEnabled(prev => !prev);
  };
  
  return {
    // Forwarded clock state and handlers
    ...clockState,
    
    // Additional UI state
    showDigital,
    showDescription,
    feedback,
    audioEnabled,
    
    // Additional handlers
    readTimeAloud,
    toggleDigitalDisplay,
    toggleDescription,
    toggleAudio,
    setFeedback
  };
};

export default usePracticeMode;