import { 
  formatTime,
  getTimeDescription,
  generateRandomTime,
  generateTimesByDifficulty,
  areTimesEqual
} from '../../src/utils/timeUtils';

describe('timeUtils', () => {
  describe('formatTime', () => {
    it('should format hours and minutes correctly', () => {
      expect(formatTime(1, 0)).toBe('1:00');
      expect(formatTime(12, 30)).toBe('12:30');
      expect(formatTime(3, 45)).toBe('3:45');
      expect(formatTime(10, 5)).toBe('10:05');
    });
  });
  
  describe('getTimeDescription', () => {
    it('should describe o\'clock times correctly', () => {
      expect(getTimeDescription(1, 0)).toBe('1 o\'clock');
      expect(getTimeDescription(12, 0)).toBe('12 o\'clock');
    });
    
    it('should describe quarter past times correctly', () => {
      expect(getTimeDescription(3, 15)).toBe('quarter past 3');
      expect(getTimeDescription(7, 15)).toBe('quarter past 7');
    });
    
    it('should describe half past times correctly', () => {
      expect(getTimeDescription(2, 30)).toBe('half past 2');
      expect(getTimeDescription(9, 30)).toBe('half past 9');
    });
    
    it('should describe quarter to times correctly', () => {
      expect(getTimeDescription(6, 45)).toBe('quarter to 7');
      expect(getTimeDescription(12, 45)).toBe('quarter to 1');
    });
    
    it('should describe minutes past times correctly', () => {
      expect(getTimeDescription(4, 5)).toBe('5 minutes past 4');
      expect(getTimeDescription(8, 1)).toBe('1 minute past 8');
      expect(getTimeDescription(10, 20)).toBe('20 minutes past 10');
    });
    
    it('should describe minutes to times correctly', () => {
      expect(getTimeDescription(5, 50)).toBe('10 minutes to 6');
      expect(getTimeDescription(11, 59)).toBe('1 minute to 12');
      expect(getTimeDescription(12, 40)).toBe('20 minutes to 1');
    });
  });
  
  describe('generateRandomTime', () => {
    it('should generate time with hours between 1 and 12', () => {
      for (let i = 0; i < 100; i++) {
        const time = generateRandomTime();
        expect(time.hours).toBeGreaterThanOrEqual(1);
        expect(time.hours).toBeLessThanOrEqual(12);
      }
    });
    
    it('should generate time with minutes between 0 and 59', () => {
      for (let i = 0; i < 100; i++) {
        const time = generateRandomTime();
        expect(time.minutes).toBeGreaterThanOrEqual(0);
        expect(time.minutes).toBeLessThanOrEqual(59);
      }
    });
    
    it('should round minutes to 5 when roundTo5Minutes is true', () => {
      for (let i = 0; i < 100; i++) {
        const time = generateRandomTime(true);
        expect(time.minutes % 5).toBe(0);
      }
    });
  });
  
  describe('generateTimesByDifficulty', () => {
    it('should generate easy times with only 0 or 30 minutes', () => {
      const times = generateTimesByDifficulty('easy', 20);
      expect(times.length).toBe(20);
      
      times.forEach(time => {
        expect(time.hours).toBeGreaterThanOrEqual(1);
        expect(time.hours).toBeLessThanOrEqual(12);
        expect([0, 30]).toContain(time.minutes);
      });
    });
    
    it('should generate medium times with only 0, 15, 30, or 45 minutes', () => {
      const times = generateTimesByDifficulty('medium', 20);
      expect(times.length).toBe(20);
      
      times.forEach(time => {
        expect(time.hours).toBeGreaterThanOrEqual(1);
        expect(time.hours).toBeLessThanOrEqual(12);
        expect([0, 15, 30, 45]).toContain(time.minutes);
      });
    });
    
    it('should generate hard times with minutes divisible by 5', () => {
      const times = generateTimesByDifficulty('hard', 20);
      expect(times.length).toBe(20);
      
      times.forEach(time => {
        expect(time.hours).toBeGreaterThanOrEqual(1);
        expect(time.hours).toBeLessThanOrEqual(12);
        expect(time.minutes % 5).toBe(0);
      });
    });
  });
  
  describe('areTimesEqual', () => {
    it('should correctly identify equal times', () => {
      expect(areTimesEqual({ hours: 1, minutes: 30 }, { hours: 1, minutes: 30 })).toBe(true);
      expect(areTimesEqual({ hours: 12, minutes: 0 }, { hours: 12, minutes: 0 })).toBe(true);
    });
    
    it('should correctly identify different times', () => {
      expect(areTimesEqual({ hours: 1, minutes: 30 }, { hours: 2, minutes: 30 })).toBe(false);
      expect(areTimesEqual({ hours: 12, minutes: 0 }, { hours: 12, minutes: 1 })).toBe(false);
      expect(areTimesEqual({ hours: 3, minutes: 15 }, { hours: 4, minutes: 15 })).toBe(false);
    });
  });
});