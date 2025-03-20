import {
  calculateHourAngle,
  calculateMinuteAngle,
  calculateTimeFromAngles
} from '../../src/utils/angleCalculations';

describe('angleCalculations', () => {
  describe('calculateHourAngle', () => {
    it('should calculate the correct angle for whole hours', () => {
      expect(calculateHourAngle(12, 0)).toBe(0);
      expect(calculateHourAngle(3, 0)).toBe(90);
      expect(calculateHourAngle(6, 0)).toBe(180);
      expect(calculateHourAngle(9, 0)).toBe(270);
    });
    
    it('should adjust angle for minutes within an hour', () => {
      expect(calculateHourAngle(12, 15)).toBe(7.5);  // 15 min = 1/4 hour = 7.5 degrees
      expect(calculateHourAngle(3, 30)).toBe(105);   // 3 hours (90) + 30 min (15) = 105
      expect(calculateHourAngle(6, 45)).toBe(202.5); // 6 hours (180) + 45 min (22.5) = 202.5
    });
    
    it('should handle 24-hour format correctly', () => {
      expect(calculateHourAngle(0, 0)).toBe(0);     // 0:00 = 12:00 AM = 0 degrees
      expect(calculateHourAngle(13, 0)).toBe(30);   // 13:00 = 1:00 PM = 30 degrees
      expect(calculateHourAngle(23, 30)).toBe(345); // 23:30 = 11:30 PM = 345 degrees
    });
  });
  
  describe('calculateMinuteAngle', () => {
    it('should calculate the correct angle for minutes', () => {
      expect(calculateMinuteAngle(0)).toBe(0);    // 12:00 = 0 degrees
      expect(calculateMinuteAngle(15)).toBe(90);  // 12:15 = 90 degrees
      expect(calculateMinuteAngle(30)).toBe(180); // 12:30 = 180 degrees
      expect(calculateMinuteAngle(45)).toBe(270); // 12:45 = 270 degrees
      expect(calculateMinuteAngle(60)).toBe(360); // 1:00 = 360 degrees
    });
  });
  
  describe('calculateTimeFromAngles', () => {
    it('should calculate the correct time from hour and minute angles', () => {
      // 12:00 - Hour hand at 0°, minute hand at 0°
      expect(calculateTimeFromAngles(0, 0)).toEqual({ hours: 12, minutes: 0 });
      
      // 3:00 - Hour hand at 90°, minute hand at 0°
      expect(calculateTimeFromAngles(90, 0)).toEqual({ hours: 3, minutes: 0 });
      
      // 6:30 - Hour hand at 195° (180° for 6:00 + 15° for half hour), minute hand at 180°
      expect(calculateTimeFromAngles(195, 180)).toEqual({ hours: 6, minutes: 30 });
      
      // 9:45 - Hour hand at 292.5° (270° for 9:00 + 22.5° for 45 min), minute hand at 270°
      expect(calculateTimeFromAngles(292.5, 270)).toEqual({ hours: 9, minutes: 45 });
    });
    
    it('should handle edge cases correctly', () => {
      // 12:00 with slight variation in angle
      expect(calculateTimeFromAngles(1, 2)).toEqual({ hours: 12, minutes: 0 });
      
      // Angles beyond 360°
      expect(calculateTimeFromAngles(450, 390)).toEqual({ hours: 3, minutes: 5 });
      
      // Hour hand slightly off but minute hand at correct position
      expect(calculateTimeFromAngles(182, 180)).toEqual({ hours: 6, minutes: 30 });
    });
  });
});