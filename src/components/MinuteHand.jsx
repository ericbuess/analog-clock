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
  
  // State for visual display
  const [displayAngle, setDisplayAngle] = useState(angle);
  const [visuallyDragging, setVisuallyDragging] = useState(false);
  
  // Update display angle when the external angle prop changes (not during drag)
  useEffect(() => {
    if (!isDraggingRef.current) {
      setDisplayAngle(angle);
      lastReportedAngleRef.current = angle;
      lastTickAngleRef.current = Math.floor(angle / (snapInterval * 6)) * (snapInterval * 6);
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
    
    // Set dragging state
    isDraggingRef.current = true;
    setVisuallyDragging(true);
    
    // Add global event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Handle mouse move during drag
  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    
    const centerCoords = getClockCenterCoordinates();
    if (!centerCoords) return;
    
    const { centerX, centerY } = centerCoords;
    
    // Calculate current angle
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
    const deltaAngle = currentAngle - startAngleRef.current;
    
    // Calculate raw and snapped angles
    const rawAngle = startRotationRef.current + deltaAngle;
    
    // Normalize angle to 0-360 range
    let normalizedRawAngle = rawAngle % 360;
    if (normalizedRawAngle < 0) normalizedRawAngle += 360;
    
    const snapDegrees = snapInterval * 6;
    const snappedAngle = Math.round(normalizedRawAngle / snapDegrees) * snapDegrees;
    
    // Update display angle immediately for smooth visual feedback
    setDisplayAngle(snappedAngle);
    
    // Report angle changes only when crossing snap thresholds
    if (snappedAngle !== lastReportedAngleRef.current) {
      onDrag(snappedAngle);
      lastReportedAngleRef.current = snappedAngle;
      
      // Play tick sound only when crossing minute markers
      const newTickAngle = Math.floor(snappedAngle / snapDegrees) * snapDegrees;
      if (newTickAngle !== lastTickAngleRef.current) {
        playTickSound('minute');
        lastTickAngleRef.current = newTickAngle;
      }
    }
  };
  
  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setVisuallyDragging(false);
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
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
    
    // Set dragging state
    isDraggingRef.current = true;
    setVisuallyDragging(true);
    
    // Add global event listeners
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };
  
  // Handle touch move during drag
  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDraggingRef.current) return;
    
    const touch = e.touches[0];
    const centerCoords = getClockCenterCoordinates();
    if (!centerCoords) return;
    
    const { centerX, centerY } = centerCoords;
    
    // Calculate current angle
    const currentAngle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX) * 180 / Math.PI;
    const deltaAngle = currentAngle - startAngleRef.current;
    
    // Calculate raw and snapped angles
    const rawAngle = startRotationRef.current + deltaAngle;
    
    // Normalize angle to 0-360 range
    let normalizedRawAngle = rawAngle % 360;
    if (normalizedRawAngle < 0) normalizedRawAngle += 360;
    
    const snapDegrees = snapInterval * 6;
    const snappedAngle = Math.round(normalizedRawAngle / snapDegrees) * snapDegrees;
    
    // Update display angle immediately for smooth visual feedback
    setDisplayAngle(snappedAngle);
    
    // Report angle changes only when crossing snap thresholds
    if (snappedAngle !== lastReportedAngleRef.current) {
      onDrag(snappedAngle);
      lastReportedAngleRef.current = snappedAngle;
      
      // Play tick sound only when crossing minute markers
      const newTickAngle = Math.floor(snappedAngle / snapDegrees) * snapDegrees;
      if (newTickAngle !== lastTickAngleRef.current) {
        playTickSound('minute');
        lastTickAngleRef.current = newTickAngle;
      }
    }
  };
  
  // Handle touch end to stop dragging
  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    setVisuallyDragging(false);
    
    // Remove global event listeners
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
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