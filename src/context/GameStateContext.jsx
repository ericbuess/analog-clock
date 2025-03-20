import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateTimesByDifficulty } from '../utils/timeUtils';
import { DIFFICULTY_LEVELS } from '../utils/difficultyLevels';

// Create context
const GameStateContext = createContext();

/**
 * Provider component for global game state management
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 * @returns {JSX.Element} - Provider component
 */
export const GameStateProvider = ({ children }) => {
  // Game state
  const [mode, setMode] = useState('practice'); // 'practice' or 'play'
  const [difficulty, setDifficulty] = useState('easy');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
    expert: 0
  });
  
  // Challenge state
  const [challenges, setChallenges] = useState([]);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [targetTime, setTargetTime] = useState({ hours: 12, minutes: 0 });
  
  // Game progress
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  
  // Load high scores from localStorage on initial render
  useEffect(() => {
    try {
      const savedHighScores = localStorage.getItem('clockAppHighScores');
      if (savedHighScores) {
        setHighScore(JSON.parse(savedHighScores));
      }
    } catch (error) {
      console.warn('Failed to load high scores:', error);
    }
  }, []);
  
  // Save high scores to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('clockAppHighScores', JSON.stringify(highScore));
    } catch (error) {
      console.warn('Failed to save high scores:', error);
    }
  }, [highScore]);
  
  // Generate new challenges when difficulty changes
  useEffect(() => {
    if (mode === 'play') {
      generateNewChallenges();
    }
  }, [difficulty, mode]);
  
  // Generate new set of challenges
  const generateNewChallenges = (count = 5) => {
    const newChallenges = generateTimesByDifficulty(difficulty, count);
    setChallenges(newChallenges);
    setCurrentChallenge(0);
    
    if (newChallenges.length > 0) {
      setTargetTime(newChallenges[0]);
    }
    
    setGameStarted(false);
    setGameCompleted(false);
  };
  
  // Start a new game
  const startGame = () => {
    setScore(0);
    setStreak(0);
    setGameStarted(true);
    setGameCompleted(false);
  };
  
  // Move to the next challenge
  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      const nextIndex = currentChallenge + 1;
      setCurrentChallenge(nextIndex);
      setTargetTime(challenges[nextIndex]);
    } else {
      completeGame();
    }
  };
  
  // Complete the game and update high score if needed
  const completeGame = () => {
    setGameCompleted(true);
    
    // Update high score if current score is higher
    if (score > highScore[difficulty]) {
      setHighScore(prev => ({
        ...prev,
        [difficulty]: score
      }));
    }
  };
  
  // Add points to the current score
  const addPoints = (points) => {
    setScore(prev => prev + points);
  };
  
  // Increment streak counter
  const incrementStreak = () => {
    setStreak(prev => prev + 1);
  };
  
  // Reset streak counter
  const resetStreak = () => {
    setStreak(0);
  };
  
  // Context value
  const contextValue = {
    // Game settings
    mode,
    setMode,
    difficulty,
    setDifficulty,
    
    // Score and progress
    score,
    setScore,
    addPoints,
    streak,
    incrementStreak,
    resetStreak,
    highScore,
    
    // Challenge state
    challenges,
    currentChallenge,
    targetTime,
    
    // Game flow control
    gameStarted,
    gameCompleted,
    startGame,
    generateNewChallenges,
    nextChallenge,
    completeGame,
    
    // Difficulty settings
    difficultySettings: DIFFICULTY_LEVELS[difficulty]
  };
  
  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
    </GameStateContext.Provider>
  );
};

// Custom hook for using game state context
export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};

export default GameStateContext;