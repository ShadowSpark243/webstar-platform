const { getRankForVolume, getRankProgress, RANK_TIERS } = require('../rankEngine');

describe('Rank Engine Unit Tests', () => {
      describe('getRankForVolume', () => {
            it('should return Starter rank for 0 volume', () => {
                  const rank = getRankForVolume(0);
                  expect(rank.name).toBe('Starter');
                  expect(rank.minVolume).toBe(0);
            });

            it('should return Manager rank for exactly 1,500,000 volume', () => {
                  const rank = getRankForVolume(1500000);
                  expect(rank.name).toBe('Manager');
            });

            it('should return Senior Manager rank for 5,000,000 volume', () => {
                  const rank = getRankForVolume(5000000);
                  expect(rank.name).toBe('Senior Manager');
            });

            it('should return Director rank for over 10,000,000 volume', () => {
                  const rank = getRankForVolume(15000000);
                  expect(rank.name).toBe('Director');
            });
      });

      describe('getRankProgress', () => {
            it('should calculate 0% progress at exactly minVolume', () => {
                  const progress = getRankProgress(1500000); // Manager (1.5L)
                  expect(progress.current.name).toBe('Manager');
                  expect(progress.next.name).toBe('Senior Manager');
                  expect(progress.progressPercent).toBe(0);
            });

            it('should calculate 50% progress beautifully', () => {
                  // Manager -> Senior Manager range is 1.5M to 5M (3.5M difference)
                  // 50% = 1.5M + 1.75M = 3.25M
                  const progress = getRankProgress(3250000);
                  expect(progress.current.name).toBe('Manager');
                  expect(progress.progressPercent).toBe(50);
            });

            it('should return isMaxRank true for Director', () => {
                  const progress = getRankProgress(10000000);
                  expect(progress.current.name).toBe('Director');
                  expect(progress.next).toBeNull();
                  expect(progress.isMaxRank).toBe(true);
                  expect(progress.progressPercent).toBe(100);
            });
      });
});
