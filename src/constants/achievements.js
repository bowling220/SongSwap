// Simple achievements list
export const ACHIEVEMENTS = [
  {
    id: 'songs_10',
    title: 'Novice Collector',
    description: 'Collect 10 songs',
    requirement: (stats, collection) => collection.length >= 10,
    xp: 50
  },
  {
    id: 'songs_50',
    title: 'Song Enthusiast',
    description: 'Collect 50 songs',
    requirement: (stats, collection) => collection.length >= 50,
    xp: 200
  },
  {
    id: 'legendary_1',
    title: 'First Legend',
    description: 'Obtain your first Legendary song',
    requirement: (stats, collection) => 
      collection.filter(song => song.rarity === 'Legendary').length >= 1,
    xp: 150
  },
  {
    id: 'trades_5',
    title: 'Trading Beginner',
    description: 'Complete 5 trades',
    requirement: (stats) => stats.trades >= 5,
    xp: 100
  }
]; 