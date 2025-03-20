import React, { useState, useEffect, useRef } from 'react';
import ClockFace from './ClockFace';
import ClockNumbers from './ClockNumbers';
import HourHand from './HourHand';
import MinuteHand from './MinuteHand';
import DigitalDisplay from './DigitalDisplay';
import SuccessAnimation from './SuccessAnimation';
import { calculateTimeFromAngles, calculateHourAngle, calculateMinuteAngle } from '../utils/angleCalculations';
import { speakTime, playSuccessSound } from '../utils/audioUtils';
import { generateTimesByDifficulty, DIFFICULTY_LEVELS, areTimesEqual } from '../utils/difficultyLevels';

/**
 * PlayMode component provides challenges for kids to set the clock to a specific time
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
  
  // Clock state - just angles, no derived values
  const [hourAngle, setHourAngle] = useState(0);
  const [minuteAngle, setMinuteAngle] = useState(0);
  const [currentTime, setCurrentTime] = useState({ hours: 12, minutes: 0 });
  
  // UI state
  const [showSuccess, setShowSuccess] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  // Debug state
  const [debugInfo, setDebugInfo] = useState({
    lastMinuteChange: null,
    lastHourChange: null,
  });
  
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
  
  // Convert between hour value (1-12) and angle (0-359)
  const hourValueToAngle = (hourValue, minuteValue = 0) => {
    // Ensure hour is in 1-12 range
    const hour12 = ((hourValue - 1) % 12) + 1;
    
    // Convert to angle (30 degrees per hour, plus minute contribution)
    // Adjust by subtracting 1 since 12 o'clock is 0 degrees
    return ((hour12 - 1) * 30) + (minuteValue * 0.5);
  };
  
  const angleToHourValue = (angle) => {
    // Normalize to 0-360
    const normalizedAngle = ((angle % 360) + 360) % 360;
    
    // Convert to 1-12 range
    const hourValue = Math.floor(normalizedAngle / 30) + 1;
    return hourValue > 12 ? hourValue - 12 : hourValue;
  };
  
  // Convert between minute value (0-59) and angle (0-359)
  const minuteValueToAngle = (minuteValue) => {
    // Ensure minute is in 0-59 range
    const minute60 = minuteValue % 60;
    
    // Convert to angle (6 degrees per minute)
    return minute60 * 6;
  };
  
  const angleToMinuteValue = (angle) => {
    // Normalize to 0-360
    const normalizedAngle = ((angle % 360) + 360) % 360;
    
    // Convert to 0-59 range
    return Math.round(normalizedAngle / 6) % 60;
  };
  
  // Handle hour hand dragging
  const handleHourDrag = (newAngle) => {
    console.log(`Hour drag: ${hourAngle.toFixed(1)} → ${newAngle.toFixed(1)}`);
    setDebugInfo(prev => ({
      ...prev,
      lastHourChange: `${hourAngle.toFixed(1)} → ${newAngle.toFixed(1)}`
    }));
    
    setHourAngle(newAngle);
  };
  
  // Handle minute hand dragging with robust rotation detection
  const handleMinuteDrag = (newAngle, options = {}) => {
    // Log incoming values for debugging
    console.log(`Minute drag: ${minuteAngle.toFixed(1)} → ${newAngle.toFixed(1)}, options:`, options);
    
    // Update minute hand angle
    setMinuteAngle(newAngle);
    
    // Get current time values (not angles) for more reliable calculations
    const currentHourValue = angleToHourValue(hourAngle);
    const newMinuteValue = angleToMinuteValue(newAngle);
    
    setDebugInfo(prev => ({
      ...prev,
      lastMinuteChange: `${minuteAngle.toFixed(1)} → ${newAngle.toFixed(1)}`,
      currentHourValue,
      newMinuteValue,
      fullRotation: options.fullRotation
    }));
    
    // Check for full rotations (key part for hour advancement)
    if (options.fullRotation && options.fullRotation !== 0) {
      // Calculate new hour value based on current hour and rotation direction
      let newHourValue = currentHourValue + options.fullRotation;
      
      // Adjust for 12-hour wraparound
      while (newHourValue > 12) newHourValue -= 12;
      while (newHourValue <= 0) newHourValue += 12;
      
      console.log(`Full rotation detected: ${options.fullRotation}, Hour: ${currentHourValue} → ${newHourValue}`);
      
      // Calculate the new hour angle that properly includes minute contribution
      const newHourAngle = hourValueToAngle(newHourValue, newMinuteValue);
      
      // Update hour hand position
      setHourAngle(newHourAngle);
    } else {
      // For regular updates without full rotation, just make sure hour position is consistent with minutes
      // We always update both to maintain their correct relationship
      const newHourAngle = hourValueToAngle(currentHourValue, newMinuteValue);
      
      setHourAngle(newHourAngle);
    }
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
    const correctHourAngle = hourValueToAngle(targetTime.hours, targetTime.minutes);
    const correctMinuteAngle = minuteValueToAngle(targetTime.minutes);
    
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
  
  return (
    <div className="play-mode" data-testid="play-mode">
      <h2 className="text-2xl mb-2 text-center">Play Mode</h2>
      
      {!gameOver ? (
        <>
          <div className="game-info flex justify-between items-center mb-4 px-4">
            <div className="difficulty">
              <label htmlFor="difficulty-select" className="mr-2">Difficulty:</label>
              <select 
                id="difficulty-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="bg-white border border-gray-300 rounded px-2 py-1"
                disabled={currentChallenge > 0} // Can only change difficulty at the start
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            
            <div className="score font-bold">
              Score: {score}
            </div>
            
            <div className="streak text-blue-600">
              Streak: {streak}
            </div>
          </div>
          
          <div className="challenge text-center mb-4">
            <p className="text-xl">
              Set the clock to: <span className="font-bold">{targetTime.hours}:{targetTime.minutes.toString().padStart(2, '0')}</span>
            </p>
            {timeRemaining !== null && (
              <p className={`${timeRemaining < 10 ? 'text-red-500' : ''}`}>
                Time remaining: {timeRemaining}s
              </p>
            )}
          </div>
          
          <div className="clock-container flex flex-col items-center">
            <ClockFace size={300} theme="colorful">
              <ClockNumbers 
                size={300} 
                highlightHour={showHint ? targetTime.hours : null}
                highlightMinute={showHint ? targetTime.minutes : null}
                showMinutes={difficulty !== 'easy'}
              />
              <HourHand 
                angle={hourAngle} 
                isDraggable={true} 
                onDrag={handleHourDrag} 
              />
              <MinuteHand 
                angle={minuteAngle} 
                isDraggable={true} 
                onDrag={handleMinuteDrag}
                snapInterval={difficulty === 'easy' ? 5 : 1} // Easier snapping for easy mode
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
              
              {/* Success animation when correct */}
              {showSuccess && <SuccessAnimation />}
            </ClockFace>
            
            <DigitalDisplay 
              hours={currentTime.hours} 
              minutes={currentTime.minutes}
              showDescription={difficulty === 'easy' || difficulty === 'medium'}
              className="mt-4"
            />
            
            {feedback && (
              <div className={`feedback mt-2 text-xl ${showSuccess ? 'text-green-600' : 'text-red-500'} font-bold`} aria-live="polite">
                {feedback}
              </div>
            )}
            
            <div className="controls mt-6 flex justify-center gap-3">
              <button 
                onClick={checkAnswer}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                data-testid="check-answer-button"
              >
                Check Answer
              </button>
              
              <button 
                onClick={showTimeHint}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                data-testid="hint-button"
              >
                Hint
              </button>
            </div>
          </div>
          
          <div className="challenge-progress mt-4 text-center">
            Challenge {currentChallenge + 1} of {challenges.length}
          </div>
        </>
      ) : (
        // Game over screen
        <div className="game-over flex flex-col items-center justify-center p-8">
          <h3 className="text-3xl mb-4">Game Over!</h3>
          <p className="text-2xl mb-2">Final Score: <span className="font-bold">{score}</span></p>
          <p className="mb-6">Great job! You've completed all the challenges.</p>
          
          <button 
            onClick={restartGame}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
            data-testid="restart-button"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default PlayMode;