import React, { useRef, useEffect } from 'react';
import { calculateMouseAngle, calculateTouchAngle } from '../utils/angleCalculations';
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
  const handleRef = useRef(null);
  
  // Handle drag functionality
  useEffect(() => {
    if (!isDraggable || !handleRef.current || disabled) return;
    
    const element = handleRef.current;
    let startAngle = 0;
    let startRotation = angle;
    
    const handleMouseDown = (e) => {
      e.preventDefault();
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
    
    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
      const deltaAngle = currentAngle - startAngle;
      
      // Calculate snap angle based on the snapInterval (in minutes)
      // There are 6 degrees per minute (360 / 60)
      const snapDegrees = snapInterval * 6;
      const snappedAngle = Math.round((startRotation + deltaAngle) / snapDegrees) * snapDegrees;
      
      if (snappedAngle !== angle) {
        onDrag(snappedAngle);
        playTickSound('minute');
      }
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    // Touch events for mobile devices
    const handleTouchStart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      startAngle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX) * 180 / Math.PI;
      
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    };
    
    const handleTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const currentAngle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX) * 180 / Math.PI;
      const deltaAngle = currentAngle - startAngle;
      
      // Calculate snap angle based on the snapInterval (in minutes)
      const snapDegrees = snapInterval * 6;
      const snappedAngle = Math.round((startRotation + deltaAngle) / snapDegrees) * snapDegrees;
      
      if (snappedAngle !== angle) {
        onDrag(snappedAngle);
        playTickSound('minute');
      }
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [angle, isDraggable, onDrag, disabled, snapInterval]);

  // Calculate the minute based on the angle (0-354 degrees maps to 0-59 minutes)
  const minuteValue = Math.round(angle / 6) % 60;

  return (
    <div 
      ref={handleRef}
      data-testid="minute-hand"
      className={`minute-hand absolute bg-black rounded-full ${
        isDraggable && !disabled ? 'cursor-grab active:cursor-grabbing' : ''
      } ${disabled ? 'opacity-50' : 'opacity-100'}`}
      style={{
        width: '4px',
        height: '90px',
        left: 'calc(50% - 2px)',
        bottom: '50%',
        transformOrigin: 'bottom center',
        transform: `rotate(${angle}deg)`,
        zIndex: 10
      }}
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