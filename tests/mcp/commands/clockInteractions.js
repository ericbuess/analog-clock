/**
 * Puppeteer MCP commands for interacting with the clock app
 */

/**
 * Rotates the hour hand to a specific hour/minute position
 * @param {Page} page - Puppeteer page object
 * @param {number} hours - Target hours (1-12)
 * @param {number} minutes - Target minutes (0-59)
 * @returns {Promise<Object>} - Result of the operation
 */
async function rotateHourHand(page, hours, minutes) {
  try {
    // Calculate angle for the hour hand
    // Each hour is 30 degrees, and the minute position affects the hour hand slightly
    const hourAngle = (hours % 12) * 30 + (minutes / 60) * 30;
    
    // Get the position of the clock center
    const clockCenter = await page.evaluate(() => {
      const clock = document.querySelector('[data-testid="clock-face"]');
      if (!clock) return null;
      
      const rect = clock.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    });
    
    if (!clockCenter) {
      return { success: false, error: 'Clock face not found' };
    }
    
    // Calculate target position based on angle
    const radius = 50; // Approximate radius for hour hand
    const angleRad = (hourAngle - 90) * (Math.PI / 180); // Convert to radians, adjust for 0 at top
    const targetX = clockCenter.x + Math.cos(angleRad) * radius;
    const targetY = clockCenter.y + Math.sin(angleRad) * radius;
    
    // Perform the drag operation
    await page.mouse.move(clockCenter.x, clockCenter.y);
    await page.mouse.down();
    await page.mouse.move(targetX, targetY, { steps: 10 });
    await page.mouse.up();
    
    // Take a screenshot for verification
    const screenshotPath = `./tests/puppeteer/screenshots/hour-hand-${hours}-${minutes}.png`;
    await page.screenshot({ path: screenshotPath });
    
    return {
      success: true,
      hourAngle,
      hours,
      minutes,
      screenshotPath
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Rotates the minute hand to a specific minute position
 * @param {Page} page - Puppeteer page object
 * @param {number} minutes - Target minutes (0-59)
 * @returns {Promise<Object>} - Result of the operation
 */
async function rotateMinuteHand(page, minutes) {
  try {
    // Calculate angle for the minute hand
    // Each minute is 6 degrees
    const minuteAngle = minutes * 6;
    
    // Get the position of the clock center
    const clockCenter = await page.evaluate(() => {
      const clock = document.querySelector('[data-testid="clock-face"]');
      if (!clock) return null;
      
      const rect = clock.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    });
    
    if (!clockCenter) {
      return { success: false, error: 'Clock face not found' };
    }
    
    // Calculate target position based on angle
    const radius = 70; // Approximate radius for minute hand (longer than hour hand)
    const angleRad = (minuteAngle - 90) * (Math.PI / 180); // Convert to radians, adjust for 0 at top
    const targetX = clockCenter.x + Math.cos(angleRad) * radius;
    const targetY = clockCenter.y + Math.sin(angleRad) * radius;
    
    // Perform the drag operation
    await page.mouse.move(clockCenter.x, clockCenter.y);
    await page.mouse.down();
    await page.mouse.move(targetX, targetY, { steps: 10 });
    await page.mouse.up();
    
    // Take a screenshot for verification
    const screenshotPath = `./tests/puppeteer/screenshots/minute-hand-${minutes}.png`;
    await page.screenshot({ path: screenshotPath });
    
    return {
      success: true,
      minuteAngle,
      minutes,
      screenshotPath
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  rotateHourHand,
  rotateMinuteHand
};