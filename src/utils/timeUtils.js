/**
 * Formats time in hours and minutes for display
 * @param {number} hours - Hours (1-12)
 * @param {number} minutes - Minutes (0-59)
 * @returns {string} - Formatted time string (e.g., "3:15")
 */
export const formatTime = (hours, minutes) => {
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Generates a human-readable time description
 * @param {number} hours - Hours (1-12)
 * @param {number} minutes - Minutes (0-59)
 * @returns {string} - Human-readable time description
 */
export const getTimeDescription = (hours, minutes) => {
  if (minutes === 0) {
    return `${hours} o'clock`;
  } else if (minutes === 15) {
    return `quarter past ${hours}`;
  } else if (minutes === 30) {
    return `half past ${hours}`;
  } else if (minutes === 45) {
    const nextHour = hours === 12 ? 1 : hours + 1;
    return `quarter to ${nextHour}`;
  } else if (minutes < 30) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} past ${hours}`;
  } else {
    const minutesTo = 60 - minutes;
    const nextHour = hours === 12 ? 1 : hours + 1;
    return `${minutesTo} ${minutesTo === 1 ? 'minute' : 'minutes'} to ${nextHour}`;
  }
};

/**
 * Generates a random time for practice or play
 * @param {boolean} roundTo5Minutes - Whether to round minutes to the nearest 5
 * @returns {Object} - Object with hours (1-12) and minutes (0-59)
 */
export const generateRandomTime = (roundTo5Minutes = true) => {
  const hours = Math.floor(Math.random() * 12) + 1; // 1-12
  let minutes = Math.floor(Math.random() * 60); // 0-59
  
  if (roundTo5Minutes) {
    // Round to the nearest 5 minutes
    minutes = Math.round(minutes / 5) * 5;
    if (minutes === 60) minutes = 0;
  }
  
  return { hours, minutes };
};

/**
 * Generates a list of times based on difficulty level
 * @param {string} difficulty - Difficulty level: 'easy', 'medium', 'hard'
 * @param {number} count - Number of times to generate
 * @returns {Array} - Array of time objects with hours and minutes
 */
export const generateTimesByDifficulty = (difficulty, count = 5) => {
  const times = [];
  
  for (let i = 0; i < count; i++) {
    let time;
    
    switch (difficulty) {
      case 'easy':
        // Easy: Only hours and half hours
        time = {
          hours: Math.floor(Math.random() * 12) + 1,
          minutes: Math.random() < 0.5 ? 0 : 30
        };
        break;
        
      case 'medium':
        // Medium: Hours and quarters (0, 15, 30, 45)
        time = {
          hours: Math.floor(Math.random() * 12) + 1,
          minutes: [0, 15, 30, 45][Math.floor(Math.random() * 4)]
        };
        break;
        
      case 'hard':
      default:
        // Hard: Any time, rounded to 5 minutes
        time = generateRandomTime(true);
        break;
    }
    
    times.push(time);
  }
  
  return times;
};

/**
 * Compares two times to check if they are equal
 * @param {Object} time1 - First time object with hours and minutes
 * @param {Object} time2 - Second time object with hours and minutes
 * @returns {boolean} - Whether the times are equal
 */
export const areTimesEqual = (time1, time2) => {
  return time1.hours === time2.hours && time1.minutes === time2.minutes;
};