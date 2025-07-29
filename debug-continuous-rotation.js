import puppeteer from 'puppeteer';

async function runContinuousRotationTest() {
  console.log('Running continuous rotation test...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the app
    console.log('Navigating to app...');
    await page.goto('http://localhost:3000');
    
    // Wait for clock to be visible
    console.log('Waiting for clock to load...');
    await page.waitForSelector('[data-testid="practice-mode"]');
    
    // Set clock to 12:00 using the random time button
    console.log('Setting clock to 12:00...');
    let set12 = false;
    let attempts = 0;
    
    while (!set12 && attempts < 30) {
      // Click random time
      await page.click('[data-testid="random-time-button"]');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get current hour
      const hourHand = await page.$('[data-testid="hour-hand"]');
      const hourStyle = await page.evaluate(el => el.style.transform, hourHand);
      const hourAngle = parseFloat(hourStyle.replace('rotate(', '').replace('deg)', ''));
      const hour = Math.floor(hourAngle / 30) + 1;
      
      console.log(`Current hour: ${hour} (angle: ${hourAngle})`);
      
      // Check if we're at hour 12
      if (hour === 12) {
        set12 = true;
        console.log('Set to 12:00 successfully');
      }
      
      attempts++;
    }
    
    if (!set12) {
      console.log('Could not set to 12:00, proceeding anyway');
    }
    
    // Get the clock center
    const clockFace = await page.$('.clock-face');
    const clockBoundingBox = await clockFace.boundingBox();
    const centerX = clockBoundingBox.x + clockBoundingBox.width / 2;
    const centerY = clockBoundingBox.y + clockBoundingBox.height / 2;
    
    // Radius for minute hand interaction
    const radius = 80;
    
    // Helper function to get current time
    async function getClockState() {
      const hourHand = await page.$('[data-testid="hour-hand"]');
      const minuteHand = await page.$('[data-testid="minute-hand"]');
      
      const hourStyle = await page.evaluate(el => el.style.transform, hourHand);
      const minuteStyle = await page.evaluate(el => el.style.transform, minuteHand);
      
      const hourAngle = parseFloat(hourStyle.replace('rotate(', '').replace('deg)', ''));
      const minuteAngle = parseFloat(minuteStyle.replace('rotate(', '').replace('deg)', ''));
      
      let hourValue = Math.floor(hourAngle / 30) + 1;
      if (hourValue > 12) hourValue = hourValue - 12;
      if (hourValue === 0) hourValue = 12;
      
      const minuteValue = Math.round(minuteAngle / 6) % 60;
      
      return {
        hourAngle,
        minuteAngle,
        hourValue,
        minuteValue,
        time: `${hourValue}:${minuteValue.toString().padStart(2, '0')}`
      };
    }
    
    // Take screenshot before starting
    await page.screenshot({ path: 'continuous-before.png' });
    const initialState = await getClockState();
    console.log(`Initial state: ${initialState.time}`);
    
    // Perform a continuous rotation of 720 degrees (2 full rotations)
    console.log('\n===== STARTING CONTINUOUS ROTATION (720°) =====');
    
    // First click on minute hand to select it
    await page.mouse.move(centerX, centerY - 60);
    await page.mouse.down();
    await page.mouse.up();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Start at 12 o'clock position for minute hand
    await page.mouse.move(centerX, centerY - radius);
    await page.mouse.down();
    
    // Define key points to check during rotation
    const checkpoints = [0, 90, 180, 270, 360, 450, 540, 630, 720];
    
    // Perform the rotation with many small steps
    const totalSteps = 144; // 5 degrees per step
    
    for (let i = 0; i <= totalSteps; i++) {
      const progress = i / totalSteps;
      const angleDegrees = progress * 720; // 2 full rotations
      
      // Check if we're at a checkpoint
      const checkpoint = checkpoints.find(cp => Math.abs(angleDegrees - cp) < 5);
      
      // Convert to radians for position calculation
      const angleRadians = (progress * 720 * Math.PI) / 180;
      
      // Calculate position - use modulo to get angle within 0-360
      const normalizedAngle = angleRadians % (2 * Math.PI);
      const x = centerX + radius * Math.sin(normalizedAngle);
      const y = centerY - radius * Math.cos(normalizedAngle);
      
      // Move to position
      await page.mouse.move(x, y);
      
      // If at checkpoint, log and take screenshot
      if (checkpoint !== undefined) {
        // Small pause to let UI update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get current state
        const state = await getClockState();
        console.log(`Checkpoint ${checkpoint}° - Time: ${state.time} (hour angle: ${state.hourAngle.toFixed(1)}°)`);
        
        // Take screenshot
        await page.screenshot({ path: `continuous-${checkpoint}.png` });
      }
      
      // Small pause between steps
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    
    // Complete the rotation
    await page.mouse.up();
    
    // Wait for state updates to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get final state
    const finalState = await getClockState();
    console.log(`\nFinal state: ${finalState.time} (hour angle: ${finalState.hourAngle.toFixed(1)}°)`);
    
    // Take final screenshot
    await page.screenshot({ path: 'continuous-final.png' });
    
    // Check result
    const expectedHour = 2; // After 2 full rotations from 12
    if (finalState.hourValue === expectedHour) {
      console.log(`✅ PASS: Hour advanced correctly to ${finalState.hourValue} after 2 full rotations`);
    } else {
      console.log(`❌ FAIL: Hour did not advance correctly. Expected ${expectedHour}, got ${finalState.hourValue}`);
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    // Wait before closing
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Close browser
    await browser.close();
  }
}

runContinuousRotationTest();