import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ClockFace from './ClockFace';
import ClockNumbers from './ClockNumbers';
import HourHand from './HourHand';
import MinuteHand from './MinuteHand';
import DigitalDisplay from './DigitalDisplay';
import SuccessAnimation from './SuccessAnimation';
import { calculateTimeFromAngles, calculateHourAngle, calculateMinuteAngle } from '../utils/angleCalculations';
import { formatTime, generateTimesByDifficulty, areTimesEqual } from '../utils/timeUtils';
import { playSuccessSound, playTryAgainSound, speakTime } from '../utils/audioUtils';
import { DIFFICULTY_LEVELS, calculateScore, getScoreMessage } from '../utils/difficultyLevels';

/**
 * PlayMode component provides a game environment where kids can practice setting 
 * the clock to match a given time
 * 
 * @returns {JSX.Element} - Rendered component
 */
const PlayMode = () => {
  // Game state
  const [difficulty, setDifficulty] = useState('easy');
  const [targetTime, setTargetTime] = useState({ hours: 3, minutes: 0 });
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [challenges, setChallenges] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const timerRef = useRef(null);
  
  // Clock state
  const [hourAngle, setHourAngle] = useState(0);
  const [minuteAngle, setMinuteAngle] = useState(0);
  const [currentTime, setCurrentTime] = useState({ hours: 12, minutes: 0 });
  
  // UI state
  const [showSuccess, setShowSuccess] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  // Setup initial challenges when difficulty changes
  useEffect(() => {
    // Generate 5 challenges based on difficulty
    const newChallenges = generateTimesByDifficulty(difficulty, 5);
    setChallenges(newChallenges);
    setCurrentChallenge(0);
    setScore(0);
    setStreak(0);
    setGameOver(false);
    
    // Set first challenge
    if (newChallenges.length > 0) {
      setTargetTime(newChallenges[0]);
    }
    
    // Reset clock
    setHourAngle(0);
    setMinuteAngle(0);
    
    // Setup timer if needed
    const { timeLimit } = DIFFICULTY_LEVELS[difficulty];
    if (timeLimit) {
      setTimeRemaining(timeLimit);
    } else {
      setTimeRemaining(null);
    }
  }, [difficulty]);
  
  // Handle timer countdown
  useEffect(() => {
    if (timeRemaining === null) return;
    
    if (timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else {
      // Time's up for this challenge
      handleWrongAnswer();
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeRemaining]);
  
  // Update current time whenever angles change
  useEffect(() => {
    const time = calculateTimeFromAngles(hourAngle, minuteAngle);
    setCurrentTime(time);
  }, [hourAngle, minuteAngle]);
  
  // Handle dragging the hour hand
  const handleHourDrag = (newAngle) => {
    setHourAngle(newAngle);
  };
  
  // Handle dragging the minute hand
  const handleMinuteDrag = (newAngle) => {
    setMinuteAngle(newAngle);
    
    // Update hour hand slightly based on minute position
    const minuteFraction = newAngle / 360;
    const hourBase = Math.floor(hourAngle / 30) * 30;
    setHourAngle(hourBase + (minuteFraction * 30));
  };
  
  // Check if the current time matches the target time
  const checkAnswer = () => {
    if (areTimesEqual(currentTime, targetTime)) {
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
    
    // Calculate points (more points for higher streak)
    const streakBonus = Math.min(newStreak - 1, 4) * 5; // Up to 20 bonus points
    const timeBonus = timeRemaining || 0;
    const difficultyMultiplier = {
      easy: 10,
      medium: 20,
      hard: 30,
      expert: 50
    }[difficulty];
    
    const pointsEarned = difficultyMultiplier + streakBonus + Math.floor(timeBonus * 0.5);
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
    
    // Clear feedback after 3 seconds
    setTimeout(() => {
      setFeedback(null);
    }, 3000);
    
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
      setGameOver(true);
    }
  };
  
  // Show a hint by briefly setting the hands to the correct position
  const showTimeHint = () => {
    // Remember current position
    const prevHourAngle = hourAngle;
    const prevMinuteAngle = minuteAngle;
    
    // Calculate correct angles
    const correctHourAngle = calculateHourAngle(targetTime.hours, targetTime.minutes);
    const correctMinuteAngle = calculateMinuteAngle(targetTime.minutes);
    
    // Set hands to correct position
    setHourAngle(correctHourAngle);
    setMinuteAngle(correctMinuteAngle);
    setShowHint(true);
    
    // Speak the time
    speakTime(targetTime);
    
    // Return to original position after 2 seconds
    setTimeout(() => {
      setHourAngle(prevHourAngle);
      setMinuteAngle(prevMinuteAngle);
      setShowHint(false);
    }, 2000);
  };
  
  // Reset the game with the same difficulty
  const restartGame = () => {
    const newChallenges = generateTimesByDifficulty(difficulty, 5);
    setChallenges(newChallenges);
    setCurrentChallenge(0);
    setScore(0);
    setStreak(0);
    setGameOver(false);
    
    // Set first challenge
    if (newChallenges.length > 0) {
      setTargetTime(newChallenges[0]);
    }
    
    // Reset timer if applicable
    const { timeLimit } = DIFFICULTY_LEVELS[difficulty];
    if (timeLimit) {
      setTimeRemaining(timeLimit);
    }
  };
  
  // Get current difficulty settings
  const difficultySettings = DIFFICULTY_LEVELS[difficulty];
  
  return (
    <div className="play-mode" data-testid="play-mode">
      <h2 className="text-2xl mb-4 text-center">Play Mode</h2>
      
      {/* Difficulty selection */}
      {!gameOver && (
        <div className="difficulty-selector mb-6 flex flex-wrap justify-center gap-2">
          {Object.entries(DIFFICULTY_LEVELS).map(([key, value]) => (
            <button
              key={key}
              data-testid={`${key}-button`}
              className={`px-3 py-1 rounded-lg text-sm ${
                difficulty === key
                  ? 'bg-green-500 text-white font-bold'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition-colors focus:outline-none focus:ring-2 focus:ring-green-300`}
              onClick={() => setDifficulty(key)}
              disabled={gameOver}
            >
              {value.name}
            </button>
          ))}
        </div>
      )}
      
      {/* Game progress */}
      {!gameOver && (
        <div className="game-progress mb-4 flex justify-between items-center">
          <div className="challenge-counter">
            Challenge: {currentChallenge + 1}/{challenges.length}
          </div>
          
          <div className="score font-bold">
            Score: {score}
          </div>
          
          {streak > 1 && (
            <div className="streak text-orange-500 font-bold">
              🔥 {streak}
            </div>
          )}
        </div>
      )}
      
      {/* Timer if applicable */}
      {timeRemaining !== null && !gameOver && (
        <div className="timer-bar mb-4">
          <div className="text-sm mb-1 flex justify-between">
            <span>Time remaining:</span>
            <span>{timeRemaining}s</span>
          </div>
          <div className="h-2 bg-gray-200 rounded overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: '100%' }}
              animate={{
                width: `${(timeRemaining / difficultySettings.timeLimit) * 100}%`
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}
      
      {/* Target time display */}
      {!gameOver && (
        <div className="target-time mb-4 p-2 bg-yellow-100 rounded-lg text-center">
          <div className="text-sm text-gray-600">Set the clock to:</div>
          <div className="text-2xl font-bold">{formatTime(targetTime.hours, targetTime.minutes)}</div>
        </div>
      )}
      
      {/* Clock */}
      {!gameOver && (
        <div className="clock-container flex flex-col items-center mb-6">
          <ClockFace size={300} theme={showHint ? "colorful" : "default"}>
            <ClockNumbers 
              size={300} 
              highlightHour={difficultySettings.showHelpers ? targetTime.hours : null}
              highlightMinute={difficultySettings.showHelpers ? targetTime.minutes : null}
              showMinutes={difficultySettings.showHelpers}
            />
            <HourHand 
              angle={hourAngle} 
              isDraggable={true} 
              onDrag={handleHourDrag} 
              disabled={showHint}
            />
            <MinuteHand 
              angle={minuteAngle} 
              isDraggable={true} 
              onDrag={handleMinuteDrag}
              snapInterval={difficultySettings.clockSnapInterval}
              disabled={showHint}
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
          
          {/* Current time */}
          {difficultySettings.showDigitalHint && (
            <DigitalDisplay 
              hours={currentTime.hours} 
              minutes={currentTime.minutes}
              className="mt-4"
            />
          )}
        </div>
      )}
      
      {/* Game controls */}
      {!gameOver ? (
        <>
          {/* Feedback message */}
          {feedback && (
            <div className="feedback mb-4 text-center text-xl font-bold" 
                style={{ color: feedback.includes('Great') ? '#16a34a' : '#ef4444' }}
                aria-live="polite">
              {feedback}
            </div>
          )}
          
          <div className="game-controls flex flex-wrap justify-center gap-3">
            <button 
              onClick={checkAnswer}
              className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 font-bold"
              data-testid="check-answer-button"
            >
              Check Answer
            </button>
            
            <button 
              onClick={showTimeHint}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
              data-testid="hint-button"
            >
              Show Hint
            </button>
            
            <button 
              onClick={restartGame}
              className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              data-testid="restart-button"
            >
              Restart
            </button>
          </div>
        </>
      ) : (
        /* Game over screen */
        <div className="game-over text-center p-6 bg-blue-50 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold mb-2">Game Complete!</h3>
          <p className="text-lg mb-4">Your final score: <span className="font-bold text-green-600">{score}</span></p>
          
          <div className="message text-xl font-bold mb-6 text-purple-600">
            {getScoreMessage(score, difficulty)}
          </div>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={restartGame}
              className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              Play Again
            </button>
            
            <button
              onClick={() => {
                setGameOver(false);
                setDifficulty('easy');
              }}
              className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Change Difficulty
            </button>
          </div>
        </div>
      )}
      
      {/* Success animation overlay */}
      <SuccessAnimation 
        isVisible={showSuccess} 
        message={streak > 1 ? `Great job! 🔥 ${streak} streak!` : 'Great job!'}
        onComplete={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default PlayMode;