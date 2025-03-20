/**
 * Plays a tick sound for the clock hands
 * @param {string} type - 'hour' or 'minute'
 */
export const playTickSound = (type = 'minute') => {
  // For now, we'll use the Web Audio API to generate a simple tick sound
  // In a production app, you would use pre-recorded sounds
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Different frequencies for hour and minute ticks
    oscillator.frequency.value = type === 'hour' ? 800 : 1200;
    oscillator.type = 'sine';
    
    gainNode.gain.value = 0.1;
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.warn('Audio not supported:', error);
  }
};

/**
 * Plays a success sound when the user sets the correct time
 */
export const playSuccessSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Success is a series of ascending notes
    const notes = [
      { frequency: 523.25, duration: 0.1 }, // C5
      { frequency: 659.25, duration: 0.1 }, // E5
      { frequency: 783.99, duration: 0.1 }, // G5
      { frequency: 1046.50, duration: 0.2 }, // C6
    ];
    
    notes.forEach((note, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.frequency.value = note.frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.value = 0.2;
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + index * 0.1 + note.duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime + index * 0.1);
      oscillator.stop(audioContext.currentTime + index * 0.1 + note.duration);
    });
  } catch (error) {
    console.warn('Audio not supported:', error);
  }
};

/**
 * Plays a try again sound when the user sets an incorrect time
 */
export const playTryAgainSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Try again is a descending note
    const notes = [
      { frequency: 659.25, duration: 0.1 }, // E5
      { frequency: 523.25, duration: 0.3 }, // C5
    ];
    
    notes.forEach((note, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.frequency.value = note.frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.value = 0.2;
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + index * 0.1 + note.duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime + index * 0.1);
      oscillator.stop(audioContext.currentTime + index * 0.1 + note.duration);
    });
  } catch (error) {
    console.warn('Audio not supported:', error);
  }
};

/**
 * Speaks the time using the Web Speech API
 * @param {Object} time - Object with hours and minutes
 */
export const speakTime = (time) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }
  
  const { hours, minutes } = time;
  let timeText;
  
  if (minutes === 0) {
    timeText = `${hours} o'clock`;
  } else if (minutes === 15) {
    timeText = `quarter past ${hours}`;
  } else if (minutes === 30) {
    timeText = `half past ${hours}`;
  } else if (minutes === 45) {
    const nextHour = hours === 12 ? 1 : hours + 1;
    timeText = `quarter to ${nextHour}`;
  } else if (minutes < 30) {
    timeText = `${minutes} minute${minutes === 1 ? '' : 's'} past ${hours}`;
  } else {
    const minutesTo = 60 - minutes;
    const nextHour = hours === 12 ? 1 : hours + 1;
    timeText = `${minutesTo} minute${minutesTo === 1 ? '' : 's'} to ${nextHour}`;
  }
  
  const utterance = new SpeechSynthesisUtterance(timeText);
  utterance.rate = 0.8; // Slightly slower for children
  utterance.pitch = 1.2; // Higher pitch for a more friendly voice
  
  speechSynthesis.speak(utterance);
};