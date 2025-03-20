import { useState, useEffect, useRef } from 'react';
import useClockState from './useClockState';
import { generateTimesByDifficulty, areTimesEqual } from '../utils/timeUtils';
import { playSuccessSound, playTryAgainSound, speakTime } from '../utils/audioUtils';
import { DIFFICULTY_LEVELS, calculateScore } from '../utils/difficultyLevels';

/**
 * Custom hook for play mode functionality
 * 
 * @param {Object} options - Hook options
 * @param {string} options.initialDifficulty - Initial difficulty level (default: 'easy')
 * @param {number} options.challengeCount - Number of challenges per game (default: 5)
 * @returns {Object} - Play mode state and handlers
 */
const usePlayMode = ({ 
  initialDifficulty = 'easy',
  challengeCount = 5
} = {}) => {
  // Use clock state for hand positions
  const clockState = useClockState({
    snapToMinutes: DIFFICULTY_LEVELS[initialDifficulty].clockSnapInterval,
    syncHands: true
  });
  
  // Game state
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    // Try to load high scores from localStorage
    try {
      const saved = localStorage.getItem('clockAppHighScores');
      return saved ? JSON.parse(saved) : {
        easy: 0,
        medium: 0,
        hard: 0,
        expert: 0
      };
    } catch (e) {
      return {
        easy: 0,
        medium: 0,
        hard: 0,
        expert: 0
      };
    }
  });
  
  // Challenge state
  const [challenges, setChallenges] = useState([]);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [targetTime, setTargetTime] = useState({ hours: 12, minutes: 0 });
  const [timeRemaining, setTimeRemaining] = useState(null);
  const timerRef = useRef(null);
  
  // UI state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  
  // Update snap interval when difficulty changes
  useEffect(() => {
    clockState.setClockTime(12, 0);
  }, [difficulty]);
  
  // Generate challenges when difficulty changes or game starts
  useEffect(() => {
    generateNewChallenges(challengeCount);
  }, [difficulty, challengeCount]);
  
  // Handle timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || !gameStarted || gameOver) return;
    
    timerRef.current = setTimeout(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeRemaining, gameStarted, gameOver]);
  
  // When time runs out
  useEffect(() => {
    if (timeRemaining === 0 && gameStarted && !gameOver) {
      handleWrongAnswer();
    }
  }, [timeRemaining, gameStarted, gameOver]);
  
  // Save high scores when they change
  useEffect(() => {
    try {
      localStorage.setItem('clockAppHighScores', JSON.stringify(highScore));
    } catch (e) {
      console.warn('Failed to save high scores', e);
    }
  }, [highScore]);
  
  // Clear feedback after timeout
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);
  
  // Generate new challenges
  const generateNewChallenges = (count = 5) => {
    const newChallenges = generateTimesByDifficulty(difficulty, count);
    setChallenges(newChallenges);
    setCurrentChallenge(0);
    
    if (newChallenges.length > 0) {
      setTargetTime(newChallenges[0]);
    }
    
    resetGameState();
  };
  
  // Reset game state for a new game
  const resetGameState = () => {
    setScore(0);
    setStreak(0);
    setGameStarted(false);
    setGameOver(false);
    setShowSuccess(false);
    setFeedback(null);
    
    // Reset timer if applicable
    const { timeLimit } = DIFFICULTY_LEVELS[difficulty];
    if (timeLimit) {
      setTimeRemaining(timeLimit);
    } else {
      setTimeRemaining(null);
    }
    
    // Reset clock
    clockState.setClockTime(12, 0);
  };
  
  // Start a new game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    
    // Start timer if applicable
    const { timeLimit } = DIFFICULTY_LEVELS[difficulty];
    if (timeLimit) {
      setTimeRemaining(timeLimit);
    }
  };
  
  // Check if the current time matches the target time
  const checkAnswer = () => {
    if (!gameStarted) {
      startGame();
      return;
    }
    
    if (areTimesEqual(clockState.time, targetTime)) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  };
  
  // Handle correct answer
  const handleCorrectAnswer = () => {
    // Stop timer
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Play success sound
    playSuccessSound();
    
    // Update score and streak
    const newStreak = streak + 1;
    setStreak(newStreak);
    
    // Calculate points
    const difficultySettings = DIFFICULTY_LEVELS[difficulty];
    const streakBonus = Math.min(newStreak - 1, 4) * 5; // Up to 20 bonus points
    const timeBonus = timeRemaining || 0;
    
    const pointsEarned = calculateScore(difficulty, 1, timeRemaining);
    
    setScore(prev => prev + pointsEarned);
    
    // Show success animation
    setShowSuccess(true);
    setFeedback(`+${pointsEarned} points! Great job!`);
    
    // Proceed to next challenge after delay
    setTimeout(() => {
      nextChallenge();
    }, 2000);
  };
  
  // Handle wrong answer
  const handleWrongAnswer = () => {
    // Stop timer
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Play try again sound
    playTryAgainSound();
    
    // Reset streak
    setStreak(0);
    
    // Show feedback
    setFeedback('Not quite right. Try again!');
    
    // Reset timer if applicable
    const { timeLimit } = DIFFICULTY_LEVELS[difficulty];
    if (timeLimit) {
      setTimeRemaining(timeLimit);
    }
  };
  
  // Move to next challenge
  const nextChallenge = () => {
    // Hide success animation
    setShowSuccess(false);
    setFeedback(null);
    setShowHint(false);
    
    // Check if there are more challenges
    if (currentChallenge < challenges.length - 1) {
      // Move to next challenge
      const nextIndex = currentChallenge + 1;
      setCurrentChallenge(nextIndex);
      setTargetTime(challenges[nextIndex]);
      
      // Reset timer if applicable
      const { timeLimit } = DIFFICULTY_LEVELS[difficulty];
      if (timeLimit) {
        setTimeRemaining(timeLimit);
      }
    } else {
      // Game over - show final score
      endGame();
    }
  };
  
  // End the game and update high score
  const endGame = () => {
    setGameOver(true);
    
    // Update high score if necessary
    if (score > highScore[difficulty]) {
      setHighScore(prev => ({
        ...prev,
        [difficulty]: score
      }));
    }
  };
  
  // Show a hint by briefly setting the hands to the correct position
  const showTimeHint = () => {
    // Remember current position
    const prevHourAngle = clockState.hourAngle;
    const prevMinuteAngle = clockState.minuteAngle;
    
    // Set hands to correct position
    clockState.setClockTime(targetTime.hours, targetTime.minutes);
    setShowHint(true);
    
    // Speak the time
    speakTime(targetTime);
    
    // Return to original position after 2 seconds
    setTimeout(() => {
      clockState.setHourAngle(prevHourAngle);
      clockState.setMinuteAngle(prevMinuteAngle);
      setShowHint(false);
    }, 2000);
  };
  
  // Change difficulty level
  const changeDifficulty = (newDifficulty) => {
    if (newDifficulty === difficulty) return;
    
    setDifficulty(newDifficulty);
    // A new game with new challenges will be started due to the useEffect
  };
  
  return {
    // Clock state and handlers
    ...clockState,
    
    // Game settings
    difficulty,
    difficultySettings: DIFFICULTY_LEVELS[difficulty],
    challengeCount,
    
    // Game progress
    score,
    streak,
    highScore,
    currentChallenge,
    challengesTotal: challenges.length,
    targetTime,
    timeRemaining,
    
    // Game state
    gameStarted,
    gameOver,
    showSuccess,
    feedback,
    showHint,
    
    // Game controls
    startGame,
    checkAnswer,
    showTimeHint,
    generateNewChallenges,
    changeDifficulty,
    resetGameState
  };
};

export default usePlayMode;