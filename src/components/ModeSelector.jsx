import React from 'react';

/**
 * ModeSelector component allows the user to toggle between practice and play modes
 * 
 * @param {Object} props - Component props
 * @param {string} props.currentMode - Current mode ('practice' or 'play')
 * @param {Function} props.onModeChange - Callback when mode changes
 * @returns {JSX.Element} - Rendered component
 */
const ModeSelector = ({ currentMode, onModeChange }) => {
  return (
    <div className="mode-selector flex justify-center space-x-4">
      <button
        data-testid="practice-mode-button"
        className={`px-4 py-2 rounded-full ${
          currentMode === 'practice'
            ? 'bg-blue-500 text-white font-bold'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300`}
        onClick={() => onModeChange('practice')}
        aria-pressed={currentMode === 'practice'}
      >
        Practice Mode
      </button>
      
      <button
        data-testid="play-mode-button"
        className={`px-4 py-2 rounded-full ${
          currentMode === 'play'
            ? 'bg-green-500 text-white font-bold'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        } transition-colors focus:outline-none focus:ring-2 focus:ring-green-300`}
        onClick={() => onModeChange('play')}
        aria-pressed={currentMode === 'play'}
      >
        Play Mode
      </button>
    </div>
  );
};

export default ModeSelector;