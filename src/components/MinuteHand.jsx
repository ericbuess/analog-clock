import React, { useRef, useEffect, useState } from 'react';
import { playTickSound } from '../utils/audioUtils';

/**
 * MinuteHand component renders the minute hand of the clock
 * 
 * @param {Object} props - Component props
 * @param {number} props.angle - Angle of the minute hand in degrees
 * @param {boolean} props.isDraggable - Whether the hand can be dragged
 * @param {Function} props.onDrag - Callback when hand is dragged (receives new angle)
 * @param {boolean} props.disabled - Whether the hand is disabled (cannot be interacted with)
 * @param {number} props.snapInterval - Interval to snap angles to (e.g., 30 for half-hours, 15 for quarter-hours)
 * @returns {JSX.Element} - Rendered component
 */
const MinuteHand = ({ 
  angle, 
  isDraggable, 
  onDrag, 
  disabled = false,
  snapInterval = 5 // Default to 5-minute intervals
}) => {
  // We're using refs for these values to avoid re-renders during drag
  const handleRef = useRef(null);
  const clockFaceRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startAngleRef = useRef(0);
  const startRotationRef = useRef(angle);
  const lastReportedAngleRef = useRef(angle);
  const lastTickAngleRef = useRef(Math.floor(angle / (snapInterval * 6)) * (snapInterval * 6));
  
  // Important: Track the total accumulated angle during a drag session
  // This allows us to detect multiple full rotations in a single drag
  const totalDragAngleRef = useRef(0);
  const previousTouchAngleRef = useRef(null);
  const rotationCountRef = useRef(0);
  
  // Track the last direction of movement (clockwise or counter-clockwise)
  const lastDirectionRef = useRef(0); // 0 = not set, 1 = clockwise, -1 = counter-clockwise
  
  // State for visual display
  const [displayAngle, setDisplayAngle] = useState(angle);
  const [visuallyDragging, setVisuallyDragging] = useState(false);
  
  // Debug state to log values without affecting performance
  const [debugInfo, setDebugInfo] = useState({
    lastAngle: angle,
    rotationCount: 0,
    crossing: false
  });
  
  // Update display angle when the external angle prop changes (not during drag)
  useEffect(() => {
    if (!isDraggingRef.current) {
      setDisplayAngle(angle);
      lastReportedAngleRef.current = angle;
      lastTickAngleRef.current = Math.floor(angle / (snapInterval * 6)) * (snapInterval * 6);
      
      // Reset rotation tracking
      totalDragAngleRef.current = 0;
      rotationCountRef.current = 0;
      previousTouchAngleRef.current = null;
      lastDirectionRef.current = 0;
    }
  }, [angle, snapInterval]);
  
  // Find clock face element for calculating center coordinates
  useEffect(() => {
    if (handleRef.current && !clockFaceRef.current) {
      let parentElement = handleRef.current.parentElement;
      while (parentElement && !parentElement.classList.contains('clock-face')) {
        parentElement = parentElement.parentElement;
      }
      clockFaceRef.current = parentElement;
    }
  }, []);

  // Handle mouse down to start dragging
  const handleMouseDown = (e) => {
    e.preventDefault();
    if (disabled || !isDraggable) return;
    
    const centerCoords = getClockCenterCoordinates();
    if (!centerCoords) return;
    
    const { centerX, centerY } = centerCoords;
    
    // Calculate starting angle
    startAngleRef.current = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
    startRotationRef.current = angle;
    
    // Reset rotation tracking
    totalDragAngleRef.current = 0;
    rotationCountRef.current = 0;
    previousTouchAngleRef.current = startAngleRef.current;
    lastDirectionRef.current = 0;
    
    // Set dragging state
    isDraggingRef.current = true;
    setVisuallyDragging(true);
    
    // Add global event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Enhanced boundary crossing detection with improved debugging and reliability
  const detectBoundaryCrossing = (prevAngle, currentAngle) => {
    // Normalize both angles to 0-360 range
    const normPrev = ((prevAngle % 360) + 360) % 360;
    const normCurrent = ((currentAngle % 360) + 360) % 360;
    
    // Calculate direct angle difference (this may be > 180 if we cross the boundary)
    const rawDiff = normCurrent - normPrev;
    
    // Calculate the shortest distance between angles
    const shortestDiff = ((rawDiff + 180) % 360) - 180;
    const angleDiff = Math.abs(shortestDiff);
    
    // Get the current direction based on the shortest path
    const currentDirection = Math.sign(shortestDiff);
    
    // If the angle difference is large (greater than 180 degrees),
    // we likely crossed the 0/360 boundary
    if (angleDiff > 120) { // Use 120-degree threshold for more reliable detection
      // Direction based on where angles are positioned
      // If we moved from high angle to low angle (e.g., 350 -> 10),
      // it's a clockwise crossing
      if (normPrev > 270 && normCurrent < 90) {
        console.log(`===== BOUNDARY CROSSING DETECTED =====`);
        console.log(`CROSSING: ${normPrev.toFixed(1)}° → ${normCurrent.toFixed(1)}° (CLOCKWISE)`);
        setDebugInfo(prev => ({ ...prev, crossing: true, direction: 'clockwise' }));
        return 1; // Clockwise crossing
      } 
      // If we moved from low angle to high angle (e.g., 10 -> 350),
      // it's a counter-clockwise crossing
      else if (normPrev < 90 && normCurrent > 270) {
        console.log(`===== BOUNDARY CROSSING DETECTED =====`);
        console.log(`CROSSING: ${normPrev.toFixed(1)}° → ${normCurrent.toFixed(1)}° (COUNTER-CLOCKWISE)`);
        setDebugInfo(prev => ({ ...prev, crossing: true, direction: 'counter-clockwise' }));
        return -1; // Counter-clockwise crossing
      }
    }
    
    // Additional checks based on total accumulated angle for more robust detection
    // This can catch some boundary crossings that the above logic might miss
    if (totalDragAngleRef.current !== 0) {
      // If we've accumulated a large enough angle (positive or negative),
      // we may have completed a full rotation - use a lower threshold for more reliability
      const absAccumulated = Math.abs(totalDragAngleRef.current);
      if (absAccumulated >= 330) { // Lower threshold for better detection
        const rotationDirection = Math.sign(totalDragAngleRef.current);
        const fullRotations = Math.floor(absAccumulated / 360);
        const adjustedDirection = rotationDirection * fullRotations;
        
        // Reset the accumulated angle to prevent detecting the same rotation multiple times
        // But keep the remainder so we don't lose partial rotations
        totalDragAngleRef.current = totalDragAngleRef.current % 360;
        
        console.log(`===== ROTATION DETECTED BY ACCUMULATED ANGLE =====`);
        console.log(`Total angle: ${absAccumulated.toFixed(1)}° / Full rotations: ${fullRotations} (${rotationDirection > 0 ? 'CLOCKWISE' : 'COUNTER-CLOCKWISE'})`);
        
        // Return the number of full rotations, preserving direction
        return adjustedDirection; 
      }
    }
    
    return 0; // No crossing
  };
  
  // Completely rewritten mouse move handler with enhanced rotation and boundary detection
  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    
    const centerCoords = getClockCenterCoordinates();
    if (!centerCoords) return;
    
    const { centerX, centerY } = centerCoords;
    
    // Calculate current mouse angle in radians first for accuracy
    const mouseRadians = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    
    // Convert to degrees and normalize to 0-360 range
    let currentMouseAngle = mouseRadians * 180 / Math.PI;
    const normalizedMouseAngle = ((currentMouseAngle % 360) + 360) % 360;
    
    // Get previous angle
    const prevAngle = previousTouchAngleRef.current !== null ? 
                     previousTouchAngleRef.current : 
                     startAngleRef.current;
    
    // Normalize previous angle to 0-360 range
    const normalizedPrevAngle = ((prevAngle % 360) + 360) % 360;
    
    // Calculate direct angle difference (this may be > 180 if we cross the boundary)
    const rawAngleDiff = normalizedMouseAngle - normalizedPrevAngle;
    
    // Determine the shortest path angle difference (-180 to +180 degrees)
    let angleDelta = rawAngleDiff;
    if (rawAngleDiff > 180) {
      angleDelta = rawAngleDiff - 360; // Adjust for counter-clockwise crossing
    } else if (rawAngleDiff < -180) {
      angleDelta = rawAngleDiff + 360; // Adjust for clockwise crossing
    }
    
    // Determine current direction of movement for tracking
    const currentDirection = angleDelta > 0 ? 1 : (angleDelta < 0 ? -1 : lastDirectionRef.current);
    
    // Log direction changes for debugging
    if (lastDirectionRef.current !== 0 && 
        currentDirection !== 0 && 
        currentDirection !== lastDirectionRef.current) {
      console.log(`Direction changed: ${lastDirectionRef.current > 0 ? 'clockwise' : 'counter-clockwise'} → ${currentDirection > 0 ? 'clockwise' : 'counter-clockwise'}`);
    }
    
    // Update direction reference
    lastDirectionRef.current = currentDirection;
    
    // Accumulate the angle delta to track total rotation regardless of boundary crossings
    totalDragAngleRef.current += angleDelta;
    
    console.log(`Mouse angle: ${normalizedMouseAngle.toFixed(1)}° | Prev: ${normalizedPrevAngle.toFixed(1)}° | Delta: ${angleDelta.toFixed(1)}° | Total: ${totalDragAngleRef.current.toFixed(1)}°`);
    
    // Detect boundary crossings using enhanced detection
    const crossing = detectBoundaryCrossing(normalizedPrevAngle, normalizedMouseAngle);
    if (crossing !== 0) {
      rotationCountRef.current += crossing;
      console.log(`FULL ROTATION DETECTED: ${crossing > 0 ? 'clockwise' : 'counter-clockwise'}, total rotations: ${rotationCountRef.current}`);
      
      // Immediately report rotation to ensure parent components update correctly
      // This helps when rotations happen in rapid succession
      onDrag(snappedAngle, { fullRotation: crossing });
    }
    
    // Calculate the new angle for the hand based on the accumulated rotation
    const newRawAngle = startRotationRef.current + totalDragAngleRef.current;
    
    // Normalize to 0-360 range
    let normalizedAngle = ((newRawAngle % 360) + 360) % 360;
    
    // Snap to intervals
    const snapDegrees = snapInterval * 6;
    const snappedAngle = Math.round(normalizedAngle / snapDegrees) * snapDegrees % 360;
    
    // Update display
    setDisplayAngle(snappedAngle);
    setDebugInfo({
      lastAngle: normalizedAngle.toFixed(1),
      currentMouseAngle: currentMouseAngle.toFixed(1),
      totalDragAngle: totalDragAngleRef.current.toFixed(1),
      rotationCount: rotationCountRef.current,
      currentDirection: currentDirection === 1 ? 'clockwise' : 'counter-clockwise'
    });
    
    // Store the normalized angle for next comparison to ensure consistent angle tracking
    previousTouchAngleRef.current = normalizedMouseAngle;
    
    // Check for accumulated rotation without crossing boundary
    // This is critical for continuous dragging through multiple rotations
    if (Math.abs(totalDragAngleRef.current) >= 330) {
      const rotationDirection = Math.sign(totalDragAngleRef.current);
      const fullRotations = Math.floor(Math.abs(totalDragAngleRef.current) / 360);
      const adjustedRotations = rotationDirection * fullRotations;
      
      // Only reset the angle if we detected rotations to avoid losing progress
      if (fullRotations > 0) {
        // Reset accumulated angle but keep remainder
        totalDragAngleRef.current = totalDragAngleRef.current % 360;
        
        console.log(`ACCUMULATED ROTATION: ${adjustedRotations} full rotations (${Math.abs(totalDragAngleRef.current).toFixed(1)}° accumulated)`);
        
        // Report rotation immediately
        onDrag(snappedAngle, { fullRotation: adjustedRotations });
        
        // Also update the rotation count for proper tracking
        rotationCountRef.current += adjustedRotations;
      }
    }
    
    // Report changes to parent
    if (snappedAngle !== lastReportedAngleRef.current) {
      // We don't check rotationCount here since we're already handling it separately above
      
      // Send angle update to parent component without rotation info
      // We're specifically NOT including the rotation here since we already reported it above
      onDrag(snappedAngle, { fullRotation: 0 });
      lastReportedAngleRef.current = snappedAngle;
      
      // Play tick sound
      playTickSound('minute');
      lastTickAngleRef.current = snappedAngle;
    }
  };
  
  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setVisuallyDragging(false);
    
    // Calculate accumulated angle one final time
    // This is a safety measure to catch rotations that might have been missed
    if (Math.abs(totalDragAngleRef.current) >= 330) {
      const rotationDirection = Math.sign(totalDragAngleRef.current);
      const fullRotations = Math.floor(Math.abs(totalDragAngleRef.current) / 360);
      const adjustedRotations = rotationDirection * fullRotations;
      
      if (fullRotations > 0) {
        console.log(`FINAL ACCUMULATED ROTATION ON MOUSE UP: ${adjustedRotations} full rotations`);
        
        // Update rotation count before reporting
        rotationCountRef.current += adjustedRotations;
        
        // Report one last time before resetting
        onDrag(lastReportedAngleRef.current, { fullRotation: adjustedRotations });
      }
    }
    
    // Get the final rotationCount value before we reset it
    const finalRotationCount = rotationCountRef.current;
    
    // We're no longer accumulating rotations to report at the end since we're reporting each
    // boundary crossing immediately when it happens. This ensures more reliable updates.
    // However, we'll still log the final count for debugging purposes.
    if (finalRotationCount !== 0) {
      console.log(`Final rotation count at end of drag: ${finalRotationCount}`);
      // We don't need to call onDrag here anymore since we call it for each crossing immediately
    }
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Reset tracking for next drag
    previousTouchAngleRef.current = null;
    totalDragAngleRef.current = 0;
    rotationCountRef.current = 0;
    lastDirectionRef.current = 0;
  };
  
  // Handle touch start (mobile equivalent of mouse down)
  const handleTouchStart = (e) => {
    e.preventDefault();
    if (disabled || !isDraggable) return;
    
    const touch = e.touches[0];
    const centerCoords = getClockCenterCoordinates();
    if (!centerCoords) return;
    
    const { centerX, centerY } = centerCoords;
    
    // Calculate starting angle
    startAngleRef.current = Math.atan2(touch.clientY - centerY, touch.clientX - centerX) * 180 / Math.PI;
    startRotationRef.current = angle;
    
    // Reset rotation tracking
    totalDragAngleRef.current = 0;
    rotationCountRef.current = 0;
    previousTouchAngleRef.current = startAngleRef.current;
    lastDirectionRef.current = 0;
    
    // Set dragging state
    isDraggingRef.current = true;
    setVisuallyDragging(true);
    
    // Add global event listeners
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };
  
  // Completely rewritten touch move handler with enhanced rotation detection
  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDraggingRef.current) return;
    
    const touch = e.touches[0];
    const centerCoords = getClockCenterCoordinates();
    if (!centerCoords) return;
    
    const { centerX, centerY } = centerCoords;
    
    // Calculate current touch angle in radians first for accuracy
    const touchRadians = Math.atan2(touch.clientY - centerY, touch.clientX - centerX);
    
    // Convert to degrees and normalize to 0-360 range
    let currentTouchAngle = touchRadians * 180 / Math.PI;
    const normalizedTouchAngle = ((currentTouchAngle % 360) + 360) % 360;
    
    // Get previous angle
    const prevAngle = previousTouchAngleRef.current !== null ? 
                     previousTouchAngleRef.current : 
                     startAngleRef.current;
    
    // Normalize previous angle to 0-360 range
    const normalizedPrevAngle = ((prevAngle % 360) + 360) % 360;
    
    // Calculate direct angle difference (this may be > 180 if we cross the boundary)
    const rawAngleDiff = normalizedTouchAngle - normalizedPrevAngle;
    
    // Determine the shortest path angle difference (-180 to +180 degrees)
    let angleDelta = rawAngleDiff;
    if (rawAngleDiff > 180) {
      angleDelta = rawAngleDiff - 360; // Adjust for counter-clockwise crossing
    } else if (rawAngleDiff < -180) {
      angleDelta = rawAngleDiff + 360; // Adjust for clockwise crossing
    }
    
    // Determine current direction of movement for tracking
    const currentDirection = angleDelta > 0 ? 1 : (angleDelta < 0 ? -1 : lastDirectionRef.current);
    
    // Log direction changes for debugging
    if (lastDirectionRef.current !== 0 && 
        currentDirection !== 0 && 
        currentDirection !== lastDirectionRef.current) {
      console.log(`Direction changed: ${lastDirectionRef.current > 0 ? 'clockwise' : 'counter-clockwise'} → ${currentDirection > 0 ? 'clockwise' : 'counter-clockwise'}`);
    }
    
    // Update direction reference
    lastDirectionRef.current = currentDirection;
    
    // Accumulate the angle delta to track total rotation regardless of boundary crossings
    totalDragAngleRef.current += angleDelta;
    
    console.log(`Touch angle: ${normalizedTouchAngle.toFixed(1)}° | Prev: ${normalizedPrevAngle.toFixed(1)}° | Delta: ${angleDelta.toFixed(1)}° | Total: ${totalDragAngleRef.current.toFixed(1)}°`);
    
    // Detect boundary crossings using enhanced detection
    const crossing = detectBoundaryCrossing(normalizedPrevAngle, normalizedTouchAngle);
    if (crossing !== 0) {
      rotationCountRef.current += crossing;
      console.log(`TOUCH FULL ROTATION DETECTED: ${crossing > 0 ? 'clockwise' : 'counter-clockwise'}, total rotations: ${rotationCountRef.current}`);
      
      // Immediately report rotation to ensure parent components update correctly
      // This helps when rotations happen in rapid succession
      onDrag(snappedAngle, { fullRotation: crossing });
    }
    
    // Calculate the new angle for the hand based on the accumulated rotation
    const newRawAngle = startRotationRef.current + totalDragAngleRef.current;
    
    // Normalize to 0-360 range
    let normalizedAngle = ((newRawAngle % 360) + 360) % 360;
    
    // Snap to intervals
    const snapDegrees = snapInterval * 6;
    const snappedAngle = Math.round(normalizedAngle / snapDegrees) * snapDegrees % 360;
    
    // Update display
    setDisplayAngle(snappedAngle);
    setDebugInfo({
      lastAngle: normalizedAngle.toFixed(1),
      currentTouchAngle: currentTouchAngle.toFixed(1),
      totalDragAngle: totalDragAngleRef.current.toFixed(1),
      rotationCount: rotationCountRef.current,
      currentDirection: currentDirection === 1 ? 'clockwise' : 'counter-clockwise'
    });
    
    // Store the normalized angle for next comparison to ensure consistent angle tracking
    previousTouchAngleRef.current = normalizedTouchAngle;
    
    // Check for accumulated rotation without crossing boundary
    // This is critical for continuous dragging through multiple rotations
    if (Math.abs(totalDragAngleRef.current) >= 330) {
      const rotationDirection = Math.sign(totalDragAngleRef.current);
      const fullRotations = Math.floor(Math.abs(totalDragAngleRef.current) / 360);
      const adjustedRotations = rotationDirection * fullRotations;
      
      // Only reset the angle if we detected rotations to avoid losing progress
      if (fullRotations > 0) {
        // Reset accumulated angle but keep remainder
        totalDragAngleRef.current = totalDragAngleRef.current % 360;
        
        console.log(`TOUCH ACCUMULATED ROTATION: ${adjustedRotations} full rotations (${Math.abs(totalDragAngleRef.current).toFixed(1)}° accumulated)`);
        
        // Report rotation immediately
        onDrag(snappedAngle, { fullRotation: adjustedRotations });
        
        // Also update the rotation count for proper tracking
        rotationCountRef.current += adjustedRotations;
      }
    }
    
    // Report changes to parent
    if (snappedAngle !== lastReportedAngleRef.current) {
      // Send update to parent component without rotation info (we handled that separately above)
      onDrag(snappedAngle, { fullRotation: 0 });
      lastReportedAngleRef.current = snappedAngle;
      
      // Play tick sound
      playTickSound('minute');
      lastTickAngleRef.current = snappedAngle;
    }
  };
  
  // Handle touch end to stop dragging
  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    setVisuallyDragging(false);
    
    // Calculate accumulated angle one final time
    // This is a safety measure to catch rotations that might have been missed
    if (Math.abs(totalDragAngleRef.current) >= 330) {
      const rotationDirection = Math.sign(totalDragAngleRef.current);
      const fullRotations = Math.floor(Math.abs(totalDragAngleRef.current) / 360);
      const adjustedRotations = rotationDirection * fullRotations;
      
      if (fullRotations > 0) {
        console.log(`FINAL ACCUMULATED ROTATION ON TOUCH END: ${adjustedRotations} full rotations`);
        
        // Update rotation count before reporting
        rotationCountRef.current += adjustedRotations;
        
        // Report one last time before resetting
        onDrag(lastReportedAngleRef.current, { fullRotation: adjustedRotations });
      }
    }
    
    // Get the final rotationCount value before we reset it
    const finalRotationCount = rotationCountRef.current;
    
    // We're no longer accumulating rotations to report at the end since we're reporting each
    // boundary crossing immediately when it happens. This ensures more reliable updates.
    // However, we'll still log the final count for debugging purposes.
    if (finalRotationCount !== 0) {
      console.log(`Final touch rotation count at end of drag: ${finalRotationCount}`);
      // We don't need to call onDrag here anymore since we call it for each crossing immediately
    }
    
    // Remove global event listeners
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    
    // Reset tracking for next drag
    previousTouchAngleRef.current = null;
    totalDragAngleRef.current = 0;
    rotationCountRef.current = 0;
    lastDirectionRef.current = 0;
  };
  
  // Helper function to get clock center coordinates
  const getClockCenterCoordinates = () => {
    if (!clockFaceRef.current) {
      let parentElement = handleRef.current?.parentElement;
      while (parentElement && !parentElement.classList.contains('clock-face')) {
        parentElement = parentElement.parentElement;
      }
      clockFaceRef.current = parentElement;
    }
    
    if (!clockFaceRef.current) return null;
    
    const rect = clockFaceRef.current.getBoundingClientRect();
    return {
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2
    };
  };

  // Calculate the minute based on the display angle (0-354 degrees maps to 0-59 minutes)
  const minuteValue = Math.round(displayAngle / 6) % 60;

  return (
    <div 
      ref={handleRef}
      data-testid="minute-hand"
      className={`minute-hand absolute bg-black rounded-full ${
        disabled ? 'opacity-50' : 'opacity-100'
      }`}
      style={{
        width: '4px',
        height: '90px',
        left: 'calc(50% - 2px)',
        bottom: '50%',
        transformOrigin: 'bottom center',
        transform: `rotate(${displayAngle}deg)`,
        zIndex: 10,
        transition: visuallyDragging ? 'none' : 'transform 0.1s ease-out',
        cursor: isDraggable && !disabled ? (visuallyDragging ? 'grabbing' : 'grab') : 'default'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      aria-label={`Minute hand at ${minuteValue} minutes`}
      tabIndex={isDraggable && !disabled ? 0 : -1}
      role={isDraggable && !disabled ? "slider" : "presentation"}
      aria-valuemin="0"
      aria-valuemax="59"
      aria-valuenow={minuteValue}
    />
  );
};

export default MinuteHand;