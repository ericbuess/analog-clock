/**
 * Difficulty level configurations for the play mode
 */
export const DIFFICULTY_LEVELS = {
  easy: {
    name: 'Easy',
    description: 'Practice with whole hours and half hours only',
    minuteOptions: [0, 30],
    clockSnapInterval: 30, // Snap minute hand to half-hour increments
    showHelpers: true, // Show minute markers and hour highlighting
    showDigitalHint: true, // Show digital time as hint
    timeLimit: null, // No time limit
  },
  
  medium: {
    name: 'Medium',
    description: 'Practice with quarter hours (15, 30, 45 minutes)',
    minuteOptions: [0, 15, 30, 45],
    clockSnapInterval: 15, // Snap minute hand to quarter-hour increments
    showHelpers: true, // Show minute markers and hour highlighting
    showDigitalHint: false, // No digital time hint
    timeLimit: null, // No time limit
  },
  
  hard: {
    name: 'Hard',
    description: 'Practice with 5-minute intervals',
    minuteOptions: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
    clockSnapInterval: 5, // Snap minute hand to 5-minute increments
    showHelpers: false, // No helpers
    showDigitalHint: false, // No digital time hint
    timeLimit: 60, // 60 seconds per challenge
  },
  
  expert: {
    name: 'Expert',
    description: 'Practice with any time',
    minuteOptions: null, // Any minute value
    clockSnapInterval: 1, // Snap minute hand to 1-minute increments
    showHelpers: false, // No helpers
    showDigitalHint: false, // No digital time hint
    timeLimit: 45, // 45 seconds per challenge
  },
};

/**
 * Gets the current score based on difficulty level
 * @param {string} difficulty - Difficulty level ('easy', 'medium', 'hard', 'expert')
 * @param {number} correctAnswers - Number of correct answers
 * @param {number} timeRemaining - Time remaining in seconds (if applicable)
 * @returns {number} - Calculated score
 */
export const calculateScore = (difficulty, correctAnswers, timeRemaining = 0) => {
  const difficultyMultiplier = {
    easy: 10,
    medium: 20,
    hard: 30,
    expert: 50,
  };
  
  const baseScore = correctAnswers * difficultyMultiplier[difficulty];
  
  // Add bonus points for time remaining (for timed levels)
  const timeBonus = (DIFFICULTY_LEVELS[difficulty].timeLimit) 
    ? Math.floor(timeRemaining * 0.5) 
    : 0;
  
  return baseScore + timeBonus;
};

/**
 * Gets a friendly message based on score and age level
 * @param {number} score - Player's score
 * @param {string} difficulty - Difficulty level
 * @returns {string} - Encouragement message
 */
export const getScoreMessage = (score, difficulty) => {
  const thresholds = {
    easy: { low: 30, medium: 60, high: 100 },
    medium: { low: 50, medium: 100, high: 180 },
    hard: { low: 80, medium: 150, high: 250 },
    expert: { low: 120, medium: 220, high: 350 },
  };
  
  const level = thresholds[difficulty];
  
  if (score >= level.high) {
    return 'Amazing job! You\'re a clock master! 🌟';
  } else if (score >= level.medium) {
    return 'Great work! You\'re getting really good at telling time! 🎉';
  } else if (score >= level.low) {
    return 'Good job! Keep practicing to get even better! 👏';
  } else {
    return 'Nice try! Let\'s practice some more! 🙂';
  }
};