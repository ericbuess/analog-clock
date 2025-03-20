import { useState, useEffect } from 'react';

/**
 * Custom hook for managing accessibility features
 * 
 * @returns {Object} - Accessibility settings and handler functions
 */
const useAccessibility = () => {
  // Accessibility settings
  const [highContrast, setHighContrast] = useState(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('clockAccessibility');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        return settings.highContrast || false;
      } catch (e) {
        return false;
      }
    }
    return false;
  });
  
  const [largeText, setLargeText] = useState(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('clockAccessibility');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        return settings.largeText || false;
      } catch (e) {
        return false;
      }
    }
    return false;
  });
  
  const [audioFeedback, setAudioFeedback] = useState(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('clockAccessibility');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        return settings.audioFeedback !== false; // Default to true
      } catch (e) {
        return true;
      }
    }
    return true;
  });
  
  const [reducedMotion, setReducedMotion] = useState(() => {
    // Check for prefers-reduced-motion media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return true;
    
    // Try to load from localStorage
    const saved = localStorage.getItem('clockAccessibility');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        return settings.reducedMotion || false;
      } catch (e) {
        return false;
      }
    }
    return false;
  });
  
  // Save settings when they change
  useEffect(() => {
    const settings = {
      highContrast,
      largeText,
      audioFeedback,
      reducedMotion
    };
    
    try {
      localStorage.setItem('clockAccessibility', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save accessibility settings', e);
    }
    
    // Apply settings to document
    applyAccessibilitySettings(settings);
  }, [highContrast, largeText, audioFeedback, reducedMotion]);
  
  // Apply settings to document
  const applyAccessibilitySettings = (settings) => {
    const { highContrast, largeText, reducedMotion } = settings;
    
    // Apply high contrast
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Apply large text
    if (largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
    
    // Apply reduced motion
    if (reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  };
  
  // Toggle functions
  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const toggleLargeText = () => setLargeText(prev => !prev);
  const toggleAudioFeedback = () => setAudioFeedback(prev => !prev);
  const toggleReducedMotion = () => setReducedMotion(prev => !prev);
  
  // Reset to defaults
  const resetAccessibilitySettings = () => {
    setHighContrast(false);
    setLargeText(false);
    setAudioFeedback(true);
    setReducedMotion(false);
  };
  
  return {
    // Settings
    highContrast,
    largeText,
    audioFeedback,
    reducedMotion,
    
    // Toggle functions
    toggleHighContrast,
    toggleLargeText,
    toggleAudioFeedback,
    toggleReducedMotion,
    
    // Reset function
    resetAccessibilitySettings,
    
    // Theme getter
    getClockTheme: () => highContrast ? 'highContrast' : 'default'
  };
};

export default useAccessibility;