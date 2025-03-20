/**
 * Calculates the hour hand angle based on hours and minutes
 * @param {number} hours - Hours (1-12 or 0-23)
 * @param {number} minutes - Minutes (0-59)
 * @returns {number} - Angle in degrees
 */
export const calculateHourAngle = (hours, minutes) => {
  // Convert any format to 1-12 hour format
  let hour12;
  if (hours === 0 || hours === 24) {
    hour12 = 12; // 0:00 or 24:00 becomes 12 o'clock
  } else {
    hour12 = ((hours - 1) % 12) + 1; // Ensures we get 1-12 range
  }
  
  // Each hour represents 30 degrees (360 / 12)
  // Adjust for 12 o'clock being at 0 degrees by subtracting 1
  // Each minute contributes 0.5 degrees to the hour hand (30 / 60)
  return ((hour12 - 1) * 30) + (minutes * 0.5);
};

/**
 * Calculates the minute hand angle based on minutes
 * @param {number} minutes - Minutes (0-59)
 * @returns {number} - Angle in degrees
 */
export const calculateMinuteAngle = (minutes) => {
  // Each minute represents 6 degrees (360 / 60)
  return minutes * 6;
};

/**
 * Calculates hours and minutes from hour and minute hand angles
 * @param {number} hourAngle - Hour hand angle in degrees
 * @param {number} minuteAngle - Minute hand angle in degrees
 * @returns {Object} - Object with hours and minutes
 */
export const calculateTimeFromAngles = (hourAngle, minuteAngle) => {
  // Normalize angles to 0-360 range
  const normalizeAngle = (angle) => {
    // Ensure positive angle
    let normalized = angle % 360;
    if (normalized < 0) normalized += 360;
    return normalized;
  };
  
  const normalizedMinuteAngle = normalizeAngle(minuteAngle);
  const normalizedHourAngle = normalizeAngle(hourAngle);
  
  // Calculate minutes from minute angle
  // 6 degrees per minute (360 / 60)
  const minutes = Math.round(normalizedMinuteAngle / 6) % 60;
  
  // Calculate hours from hour angle (1-12 range)
  // 30 degrees per hour (360 / 12)
  // Add 1 because 0 degrees corresponds to 12 o'clock
  let hours = Math.floor(normalizedHourAngle / 30) + 1;
  
  // Adjust for 12-hour wraparound
  if (hours > 12) hours = hours - 12;
  
  // Adjust for minute effect - if we're very close to the next hour
  // due to minute hand position, we might need to bump the hour
  const minuteEffect = minutes * 0.5;
  const hourWithMinuteEffect = normalizedHourAngle - minuteEffect;
  const adjustedHours = Math.round(hourWithMinuteEffect / 30) + 1;
  
  // Only apply the hour adjustment if it's significant
  // This avoids "jumping" behavior with small minute changes
  if (Math.abs(hours - adjustedHours) === 1 || 
      (hours === 12 && adjustedHours === 1) || 
      (hours === 1 && adjustedHours === 12)) {
    hours = adjustedHours > 12 ? adjustedHours - 12 : adjustedHours;
  }
  
  // Double-check we're in valid 1-12 range
  hours = ((hours - 1) % 12) + 1;
  
  return { hours, minutes };
};

/**
 * Converts a mouse event position relative to an element's center to an angle in degrees
 * @param {MouseEvent} event - Mouse event
 * @param {Element} element - Element reference
 * @returns {number} - Angle in degrees (0-360)
 */
export const calculateMouseAngle = (event, element) => {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Calculate angle using arctangent
  let angle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180 / Math.PI;
  
  // Convert from -180..180 to 0..360
  angle = (angle + 90) % 360;
  if (angle < 0) angle += 360;
  
  return angle;
};

/**
 * Converts a touch event position relative to an element's center to an angle in degrees
 * @param {TouchEvent} event - Touch event
 * @param {Element} element - Element reference
 * @returns {number} - Angle in degrees (0-360)
 */
export const calculateTouchAngle = (event, element) => {
  const touch = event.touches[0] || event.changedTouches[0];
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Calculate angle using arctangent
  let angle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX) * 180 / Math.PI;
  
  // Convert from -180..180 to 0..360
  angle = (angle + 90) % 360;
  if (angle < 0) angle += 360;
  
  return angle;
};