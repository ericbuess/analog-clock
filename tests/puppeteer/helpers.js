/**
 * Helper functions for Puppeteer tests
 */

/**
 * Gets the current angle of a clock hand
 * @param {Page} page - Puppeteer page
 * @param {string} handSelector - Selector for the hand element
 * @returns {Promise<number>} - Current angle in degrees
 */
async function getHandAngle(page, handSelector) {
  return page.evaluate((selector) => {
    const hand = document.querySelector(selector);
    if (!hand) return null;
    
    const transform = hand.style.transform || '';
    const match = transform.match(/rotate\(([0-9.-]+)deg\)/);
    return match ? parseFloat(match[1]) : 0;
  }, handSelector);
}

/**
 * Simulates dragging a clock hand to a specific angle
 * @param {Page} page - Puppeteer page
 * @param {string} handSelector - Selector for the hand element
 * @param {number} targetAngle - Target angle in degrees
 */
async function dragHandToAngle(page, handSelector, targetAngle) {
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
  
  if (!clockCenter) throw new Error('Clock face not found');
  
  // Calculate target position based on angle
  const radius = 100; // Approximate radius to drag to
  const angleRad = (targetAngle - 90) * (Math.PI / 180); // Convert to radians, adjust for 0 at top
  const targetX = clockCenter.x + Math.cos(angleRad) * radius;
  const targetY = clockCenter.y + Math.sin(angleRad) * radius;
  
  // Perform the drag operation
  await page.mouse.move(clockCenter.x, clockCenter.y);
  await page.mouse.down();
  await page.mouse.move(targetX, targetY, { steps: 10 });
  await page.mouse.up();
}

/**
 * Gets the current digital time displayed
 * @param {Page} page - Puppeteer page
 * @returns {Promise<{hours: number, minutes: number}>} - Current time object
 */
async function getDigitalTime(page) {
  return page.evaluate(() => {
    const digitalDisplay = document.querySelector('[data-testid="digital-display"]');
    if (!digitalDisplay) return null;
    
    const timeText = digitalDisplay.textContent.trim();
    const [hours, minutes] = timeText.split(':').map(part => parseInt(part, 10));
    
    return { hours, minutes };
  });
}

/**
 * Waits for clock hands to stop moving
 * @param {Page} page - Puppeteer page
 * @param {number} timeout - Maximum wait time in milliseconds
 */
async function waitForHandsToStabilize(page, timeout = 2000) {
  const startTime = Date.now();
  let lastHourAngle = await getHandAngle(page, '[data-testid="hour-hand"]');
  let lastMinuteAngle = await getHandAngle(page, '[data-testid="minute-hand"]');
  
  while (Date.now() - startTime < timeout) {
    await page.waitForTimeout(100);
    
    const currentHourAngle = await getHandAngle(page, '[data-testid="hour-hand"]');
    const currentMinuteAngle = await getHandAngle(page, '[data-testid="minute-hand"]');
    
    if (currentHourAngle === lastHourAngle && currentMinuteAngle === lastMinuteAngle) {
      return; // Hands have stabilized
    }
    
    lastHourAngle = currentHourAngle;
    lastMinuteAngle = currentMinuteAngle;
  }
}

module.exports = {
  getHandAngle,
  dragHandToAngle,
  getDigitalTime,
  waitForHandsToStabilize
};