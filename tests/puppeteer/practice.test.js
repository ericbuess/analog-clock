/**
 * Puppeteer test for the Practice Mode of the analog clock app
 */
const { chromium } = require('playwright');

describe('Practice Mode', () => {
  let browser;
  let page;
  
  beforeAll(async () => {
    browser = await chromium.launch();
  });
  
  afterAll(async () => {
    await browser.close();
  });
  
  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });
  
  afterEach(async () => {
    await page.close();
  });
  
  test('should load practice mode by default', async () => {
    // Check that practice mode is visible
    const practiceMode = await page.$('[data-testid="practice-mode"]');
    expect(practiceMode).toBeTruthy();
    
    // Verify clock face is rendered
    const clockFace = await page.$('[data-testid="clock-face"]');
    expect(clockFace).toBeTruthy();
    
    // Verify hour and minute hands are rendered
    const hourHand = await page.$('[data-testid="hour-hand"]');
    const minuteHand = await page.$('[data-testid="minute-hand"]');
    expect(hourHand).toBeTruthy();
    expect(minuteHand).toBeTruthy();
  });
  
  test('should show digital time display', async () => {
    // Check that digital display is visible
    const digitalDisplay = await page.$('[data-testid="digital-display"]');
    expect(digitalDisplay).toBeTruthy();
    
    // Toggle digital display off
    await page.click('[data-testid="toggle-digital-button"]');
    
    // Check that digital display is not visible
    const digitalDisplayAfterToggle = await page.$('[data-testid="digital-display"]');
    expect(digitalDisplayAfterToggle).toBeFalsy();
  });
  
  test('should show feedback when reading time', async () => {
    // Click the read time button
    await page.click('[data-testid="read-time-button"]');
    
    // Check that feedback is shown
    const feedback = await page.waitForSelector('.feedback');
    expect(feedback).toBeTruthy();
    
    // Check feedback text contains time information
    const feedbackText = await page.evaluate(el => el.textContent, feedback);
    expect(feedbackText).toContain('That\'s');
  });
  
  test('should set random time when random time button is clicked', async () => {
    // Get initial hour and minute hand angles
    const initialHourAngle = await page.evaluate(() => {
      const hourHand = document.querySelector('[data-testid="hour-hand"]');
      const transform = hourHand.style.transform;
      return parseInt(transform.match(/rotate\((\d+)deg\)/)[1], 10);
    });
    
    const initialMinuteAngle = await page.evaluate(() => {
      const minuteHand = document.querySelector('[data-testid="minute-hand"]');
      const transform = minuteHand.style.transform;
      return parseInt(transform.match(/rotate\((\d+)deg\)/)[1], 10);
    });
    
    // Click the random time button
    await page.click('[data-testid="random-time-button"]');
    
    // Wait for animation to complete
    await page.waitForTimeout(500);
    
    // Get new hour and minute hand angles
    const newHourAngle = await page.evaluate(() => {
      const hourHand = document.querySelector('[data-testid="hour-hand"]');
      const transform = hourHand.style.transform;
      return parseInt(transform.match(/rotate\((\d+)deg\)/)[1], 10);
    });
    
    const newMinuteAngle = await page.evaluate(() => {
      const minuteHand = document.querySelector('[data-testid="minute-hand"]');
      const transform = minuteHand.style.transform;
      return parseInt(transform.match(/rotate\((\d+)deg\)/)[1], 10);
    });
    
    // Either hour or minute hand should have changed
    expect(
      newHourAngle !== initialHourAngle || newMinuteAngle !== initialMinuteAngle
    ).toBe(true);
  });
});