/**
 * Puppeteer MCP commands for verifying clock time
 */

/**
 * Verifies if the clock is showing the expected time
 * @param {Page} page - Puppeteer page object
 * @param {number} expectedHours - Expected hours (1-12)
 * @param {number} expectedMinutes - Expected minutes (0-59)
 * @returns {Promise<Object>} - Result of the verification
 */
async function verifyClockTime(page, expectedHours, expectedMinutes) {
  try {
    // Get digital time if available
    const digitalTime = await page.evaluate(() => {
      const digitalDisplay = document.querySelector('[data-testid="digital-display"]');
      if (!digitalDisplay) return null;
      
      const timeText = digitalDisplay.textContent.trim();
      const [hours, minutes] = timeText.split(':').map(part => parseInt(part, 10));
      
      return { hours, minutes };
    });
    
    // Get clock hand angles
    const handAngles = await page.evaluate(() => {
      const hourHand = document.querySelector('[data-testid="hour-hand"]');
      const minuteHand = document.querySelector('[data-testid="minute-hand"]');
      
      if (!hourHand || !minuteHand) return null;
      
      const getAngle = (element) => {
        const transform = element.style.transform || '';
        const match = transform.match(/rotate\(([0-9.-]+)deg\)/);
        return match ? parseFloat(match[1]) : 0;
      };
      
      return {
        hourAngle: getAngle(hourHand),
        minuteAngle: getAngle(minuteHand)
      };
    });
    
    if (!handAngles) {
      return { success: false, error: 'Clock hands not found' };
    }
    
    // Calculate expected angles
    const expectedHourAngle = ((expectedHours % 12) * 30) + (expectedMinutes / 60) * 30;
    const expectedMinuteAngle = expectedMinutes * 6;
    
    // Check if angles match (with some tolerance)
    const hourAngleMatches = Math.abs(handAngles.hourAngle - expectedHourAngle) < 15; // 15 degrees tolerance
    const minuteAngleMatches = Math.abs(handAngles.minuteAngle - expectedMinuteAngle) < 15; // 15 degrees tolerance
    
    // Take a screenshot for verification
    const screenshotPath = `./tests/puppeteer/screenshots/verify-time-${expectedHours}-${expectedMinutes}.png`;
    await page.screenshot({ path: screenshotPath });
    
    return {
      success: hourAngleMatches && minuteAngleMatches,
      expected: {
        hours: expectedHours,
        minutes: expectedMinutes,
        hourAngle: expectedHourAngle,
        minuteAngle: expectedMinuteAngle
      },
      actual: {
        hours: digitalTime?.hours,
        minutes: digitalTime?.minutes,
        hourAngle: handAngles.hourAngle,
        minuteAngle: handAngles.minuteAngle
      },
      hourAngleMatches,
      minuteAngleMatches,
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
  verifyClockTime
};