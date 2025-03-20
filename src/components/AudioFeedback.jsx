import React, { useRef, useEffect } from 'react';

/**
 * AudioFeedback component handles audio playback for the clock app
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Type of audio feedback ('success', 'tryAgain', 'tick', 'hourTick')
 * @param {boolean} props.play - Whether to play the sound
 * @param {number} props.volume - Volume level (0-1)
 * @param {Function} props.onEnded - Callback when audio playback ends
 * @returns {JSX.Element} - Rendered component (audio element)
 */
const AudioFeedback = ({ type, play, volume = 0.5, onEnded }) => {
  const audioRef = useRef(null);
  
  // Define sound sources
  const getSoundSource = () => {
    // In a full implementation, these would be actual audio files
    // For now, we'll use procedurally generated Web Audio API sounds in practice/play modes
    switch (type) {
      case 'success':
        return '/sounds/success.mp3';
      case 'tryAgain':
        return '/sounds/try-again.mp3';
      case 'tick':
        return '/sounds/tick.mp3';
      case 'hourTick':
        return '/sounds/hour-tick.mp3';
      default:
        return '';
    }
  };
  
  // Play/pause the audio when the play prop changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.volume = volume;
    
    if (play) {
      // Reset playback position
      audio.currentTime = 0;
      
      // Use a promise to handle autoplay restrictions
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Audio playback was prevented by the browser:', error);
        });
      }
    } else {
      audio.pause();
    }
  }, [play, volume, type]);
  
  return (
    <audio
      ref={audioRef}
      src={getSoundSource()}
      className="hidden"
      onEnded={onEnded}
      preload="auto"
    />
  );
};

export default AudioFeedback;