const prisma = require('./db');

// ═══════════════════════════════════════════
// Rank Tiers — matching landing page RanksSection
// ═══════════════════════════════════════════
const RANK_TIERS = [
      { name: 'Starter', minVolume: 0, icon: '🌱', color: '#94a3b8' },
      { name: 'Manager', minVolume: 1500000, icon: '⭐', color: '#60a5fa' },    // ₹15 Lakh
      { name: 'Senior Manager', minVolume: 5000000, icon: '🏆', color: '#c084fc' },    // ₹50 Lakh
      { name: 'Director', minVolume: 10000000, icon: '👑', color: '#facc15' },    // ₹1 Crore
];

/**
 * Determine rank from teamVolume
 */
function getRankForVolume(teamVolume) {
      let currentRank = RANK_TIERS[0];
      for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
            if (teamVolume >= RANK_TIERS[i].minVolume) {
                  currentRank = RANK_TIERS[i];
                  break;
            }
      }
      return currentRank;
}

/**
 * Get rank progress info for a given teamVolume
 */
function getRankProgress(teamVolume) {
      const current = getRankForVolume(teamVolume);
      const currentIdx = RANK_TIERS.findIndex(r => r.name === current.name);
      const nextTier = currentIdx < RANK_TIERS.length - 1 ? RANK_TIERS[currentIdx + 1] : null;

      let progressPercent = 100;
      if (nextTier) {
            const range = nextTier.minVolume - current.minVolume;
            const progress = teamVolume - current.minVolume;
            progressPercent = Math.min((progress / range) * 100, 100);
      }

      // Upcoming ranks (all ranks above current)
      const upcomingRanks = RANK_TIERS.slice(currentIdx + 1).map(r => ({
            name: r.name,
            requiredVolume: r.minVolume,
            icon: r.icon,
            color: r.color
      }));

      return {
            current: {
                  name: current.name,
                  icon: current.icon,
                  color: current.color,
                  minVolume: current.minVolume
            },
            next: nextTier ? {
                  name: nextTier.name,
                  icon: nextTier.icon,
                  color: nextTier.color,
                  minVolume: nextTier.minVolume
            } : null,
            progressPercent: Math.round(progressPercent * 10) / 10,
            teamVolume,
            upcomingRanks,
            isMaxRank: !nextTier
      };
}

/**
 * Calculate and auto-update user's rank in the database
 * Called after teamVolume changes (via updateUpliners)
 */
async function calculateAndUpdateRank(userId) {
      try {
            const user = await prisma.user.findUnique({
                  where: { id: userId },
                  select: { teamVolume: true, rank: true }
            });
            if (!user) return null;

            const newRank = getRankForVolume(user.teamVolume);

            // Only update DB if rank actually changed
            if (newRank.name !== user.rank) {
                  await prisma.user.update({
                        where: { id: userId },
                        data: { rank: newRank.name }
                  });
                  console.log(`🏅 Rank Updated: User #${userId} → ${newRank.name}`);
            }

            return getRankProgress(user.teamVolume);
      } catch (error) {
            console.error('Rank calculation error:', error);
            return null;
      }
}

module.exports = {
      RANK_TIERS,
      getRankForVolume,
      getRankProgress,
      calculateAndUpdateRank
};
