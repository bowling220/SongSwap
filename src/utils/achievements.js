export const ACHIEVEMENTS = {
  COLLECTOR: {
    id: 'collector',
    tiers: [
      { songs: 10, title: 'Novice Collector', description: 'Collect 10 songs', xp: 50 },
      { songs: 50, title: 'Song Enthusiast', description: 'Collect 50 songs', xp: 200 },
      { songs: 100, title: 'Music Maven', description: 'Collect 100 songs', xp: 500 },
    ]
  },
  TRADER: {
    id: 'trader',
    tiers: [
      { trades: 5, title: 'Trading Beginner', description: 'Complete 5 trades', xp: 100 },
      { trades: 20, title: 'Trading Pro', description: 'Complete 20 trades', xp: 300 },
      { trades: 50, title: 'Trading Master', description: 'Complete 50 trades', xp: 700 },
    ]
  },
  RARITY: {
    id: 'rarity',
    tiers: [
      { legendary: 1, title: 'First Legend', description: 'Obtain your first Legendary song', xp: 150 },
      { legendary: 5, title: 'Legend Hunter', description: 'Collect 5 Legendary songs', xp: 400 },
      { legendary: 10, title: 'Legendary Collector', description: 'Collect 10 Legendary songs', xp: 800 },
    ]
  },
  SPENDER: {
    id: 'spender',
    tiers: [
      { spent: 1000, title: 'Big Spender', description: 'Spend 1,000 coins', xp: 100 },
      { spent: 5000, title: 'Money Maker', description: 'Spend 5,000 coins', xp: 300 },
      { spent: 10000, title: 'Whale', description: 'Spend 10,000 coins', xp: 600 },
    ]
  }
};

export const checkAchievements = (stats, collection) => {
  const newAchievements = [];
  
  // Check collection achievements
  ACHIEVEMENTS.COLLECTOR.tiers.forEach(tier => {
    if (collection.length >= tier.songs && 
        !stats.achievements?.includes(`${ACHIEVEMENTS.COLLECTOR.id}_${tier.songs}`)) {
      newAchievements.push({
        id: `${ACHIEVEMENTS.COLLECTOR.id}_${tier.songs}`,
        ...tier
      });
    }
  });

  // Check trading achievements
  ACHIEVEMENTS.TRADER.tiers.forEach(tier => {
    if (stats.trades >= tier.trades && 
        !stats.achievements?.includes(`${ACHIEVEMENTS.TRADER.id}_${tier.trades}`)) {
      newAchievements.push({
        id: `${ACHIEVEMENTS.TRADER.id}_${tier.trades}`,
        ...tier
      });
    }
  });

  // Check rarity achievements
  const legendaryCount = collection.filter(song => song.rarity === 'Legendary').length;
  ACHIEVEMENTS.RARITY.tiers.forEach(tier => {
    if (legendaryCount >= tier.legendary && 
        !stats.achievements?.includes(`${ACHIEVEMENTS.RARITY.id}_${tier.legendary}`)) {
      newAchievements.push({
        id: `${ACHIEVEMENTS.RARITY.id}_${tier.legendary}`,
        ...tier
      });
    }
  });

  return newAchievements;
}; 