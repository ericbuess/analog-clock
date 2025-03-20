/**
 * Calculates the hour hand angle based on hours and minutes
 * @param {number} hours - Hours (0-23)
 * @param {number} minutes - Minutes (0-59)
 * @returns {number} - Angle in degrees
 */
export const calculateHourAngle = (hours, minutes) => {
  // Convert 24-hour format to 12-hour format
  const hour12 = hours % 12;
  
  // Each hour represents 30 degrees (360 / 12)
  // Each minute contributes 0.5 degrees to the hour hand (30 / 60)
  return (hour12 * 30) + (minutes * 0.5);
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
  // Calculate minutes from minute angle
  // 6 degrees per minute (360 / 60)
  const minutes = Math.round(minuteAngle / 6) % 60;
  
  // Calculate hours from hour angle
  // 30 degrees per hour (360 / 12)
  // Normalize hourAngle to 0-360 range
  const normalizedHourAngle = hourAngle % 360;
  let hours = Math.floor(normalizedHourAngle / 30);
  
  // Adjust hours based on minutes
  // Each minute contributes 0.5 degrees to the hour hand
  // If the hour hand is close to the next hour, round up
  const minuteEffect = minutes * 0.5;
  const hourWithMinuteEffect = normalizedHourAngle - minuteEffect;
  hours = Math.round(hourWithMinuteEffect / 30) % 12;
  
  // Convert 0 to 12 for display purposes
  if (hours === 0) hours = 12;
  
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