import React, { useRef, useEffect, useState } from 'react';
import { calculateMouseAngle, calculateTouchAngle } from '../utils/angleCalculations';
import { playTickSound } from '../utils/audioUtils';

/**
 * HourHand component renders the hour hand of the clock
 * 
 * @param {Object} props - Component props
 * @param {number} props.angle - Angle of the hour hand in degrees
 * @param {boolean} props.isDraggable - Whether the hand can be dragged
 * @param {Function} props.onDrag - Callback when hand is dragged (receives new angle)
 * @param {boolean} props.disabled - Whether the hand is disabled (cannot be interacted with)
 * @returns {JSX.Element} - Rendered component
 */
const HourHand = ({ angle, isDraggable, onDrag, disabled = false }) => {
  const handleRef = useRef(null);
  const [displayAngle, setDisplayAngle] = useState(angle);
  const [isDragging, setIsDragging] = useState(false);
  const lastReportedAngle = useRef(angle);
  const lastTickAngle = useRef(Math.floor(angle / 30) * 30);
  
  // Update display angle when the external angle prop changes (not during drag)
  useEffect(() => {
    if (!isDragging) {
      setDisplayAngle(angle);
      lastReportedAngle.current = angle;
      lastTickAngle.current = Math.floor(angle / 30) * 30;
    }
  }, [angle, isDragging]);
  
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
      startRotation = angle;
      setIsDragging(true);
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
    
    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
      const deltaAngle = currentAngle - startAngle;
      
      // Calculate the raw angle for smooth movement
      const rawAngle = startRotation + deltaAngle;
      
      // Calculate the snapped angle for reporting
      const snappedAngle = Math.round(rawAngle / 30) * 30;
      
      // Always update the display angle for smooth visual movement
      setDisplayAngle(snappedAngle);
      
      // Only report angle changes when crossing snap thresholds
      if (snappedAngle !== lastReportedAngle.current) {
        onDrag(snappedAngle);
        lastReportedAngle.current = snappedAngle;
        
        // Play tick sound only when crossing hour markers
        const newTickAngle = Math.floor(snappedAngle / 30) * 30;
        if (newTickAngle !== lastTickAngle.current) {
          playTickSound('hour');
          lastTickAngle.current = newTickAngle;
        }
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    // Touch events for mobile devices with similar improvements
    const handleTouchStart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      startAngle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX) * 180 / Math.PI;
      startRotation = angle;
      setIsDragging(true);
      
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
      
      // Calculate the raw angle for smooth movement
      const rawAngle = startRotation + deltaAngle;
      
      // Calculate the snapped angle for reporting
      const snappedAngle = Math.round(rawAngle / 30) * 30;
      
      // Always update the display angle for smooth visual movement
      setDisplayAngle(snappedAngle);
      
      // Only report angle changes when crossing snap thresholds
      if (snappedAngle !== lastReportedAngle.current) {
        onDrag(snappedAngle);
        lastReportedAngle.current = snappedAngle;
        
        // Play tick sound only when crossing hour markers
        const newTickAngle = Math.floor(snappedAngle / 30) * 30;
        if (newTickAngle !== lastTickAngle.current) {
          playTickSound('hour');
          lastTickAngle.current = newTickAngle;
        }
      }
    };
    
    const handleTouchEnd = () => {
      setIsDragging(false);
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
  }, [angle, isDraggable, onDrag, disabled]);

  // Calculate the hour based on the display angle (0-330 degrees maps to 12, 1, 2, ..., 11)
  const hourValue = Math.round(displayAngle / 30) % 12 || 12;

  return (
    <div 
      ref={handleRef}
      data-testid="hour-hand"
      className={`hour-hand absolute bg-black rounded-full ${
        isDraggable && !disabled ? 'cursor-grab active:cursor-grabbing' : ''
      } ${disabled ? 'opacity-50' : 'opacity-100'}`}
      style={{
        width: '8px',
        height: '70px',
        left: 'calc(50% - 4px)',
        bottom: '50%',
        transformOrigin: 'bottom center',
        transform: `rotate(${displayAngle}deg)`,
        zIndex: 20,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
      }}
      aria-label={`Hour hand at ${hourValue} o'clock`}
      tabIndex={isDraggable && !disabled ? 0 : -1}
      role={isDraggable && !disabled ? "slider" : "presentation"}
      aria-valuemin="1"
      aria-valuemax="12"
      aria-valuenow={hourValue}
    />
  );
};

export default HourHand;