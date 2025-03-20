import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SuccessAnimation component displays a celebratory animation when a correct answer is given
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isVisible - Whether the animation is visible
 * @param {string} props.message - Message to display with the animation
 * @param {Function} props.onComplete - Callback when animation completes
 * @returns {JSX.Element} - Rendered component
 */
const SuccessAnimation = ({ isVisible, message = 'Great job!', onComplete }) => {
  const [particles, setParticles] = useState([]);
  
  // Generate confetti particles when visible
  useEffect(() => {
    if (isVisible) {
      const colors = ['#FF5252', '#FFD740', '#64FFDA', '#448AFF', '#B388FF'];
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50, // Random x position (-50 to 50)
        y: Math.random() * -100, // Start above the container
        size: Math.random() * 8 + 4, // Random size (4-12)
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360, // Random rotation
      }));
      
      setParticles(newParticles);
      
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="success-animation fixed inset-0 flex items-center justify-center z-50"
          data-testid="success-animation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative">
            {/* Confetti particles */}
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-sm"
                style={{
                  backgroundColor: particle.color,
                  width: particle.size,
                  height: particle.size,
                }}
                initial={{
                  x: 0,
                  y: 0,
                  rotate: 0,
                }}
                animate={{
                  x: particle.x,
                  y: 100 + particle.y, // Falling down
                  rotate: particle.rotation,
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  ease: 'easeOut',
                }}
              />
            ))}
            
            {/* Success message */}
            <motion.div
              className="bg-white rounded-xl p-6 shadow-lg text-center z-10"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 12 }}
            >
              <motion.h2
                className="text-2xl text-green-600 font-bold mb-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 2, repeatType: 'reverse' }}
              >
                {message}
              </motion.h2>
              
              <motion.div
                className="text-yellow-500 text-5xl"
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                ⭐
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessAnimation;