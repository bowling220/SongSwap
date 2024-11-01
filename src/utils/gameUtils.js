// Calculate the cost of a song based on its popularity and rarity
export const calculateCost = (popularity) => {
  const baseCost = 100;
  return Math.round(baseCost * (1 + (popularity / 100)));
};

// Determine song rarity based on popularity
export const determineRarity = (popularity) => {
  if (popularity >= 80) return 'Legendary';
  if (popularity >= 60) return 'Epic';
  if (popularity >= 40) return 'Rare';
  return 'Common';
};

// Calculate XP gained from collecting a song
export const calculateXP = (songRarity) => {
  switch (songRarity) {
    case 'Legendary':
      return 1000;
    case 'Epic':
      return 500;
    case 'Rare':
      return 250;
    default:
      return 100;
  }
};

// Calculate level based on XP
export const calculateLevel = (xp) => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

// Calculate coins generated by generators
export const calculateGeneratorCoins = (generators, elapsedTime) => {
  return Object.entries(generators).reduce((total, [generatorId, count]) => {
    const generator = GENERATOR_TYPES.find(g => g.id === generatorId);
    if (generator) {
      const hourlyRate = generator.coinsPerHour * count;
      const hoursElapsed = elapsedTime / (60 * 60 * 1000); // Convert ms to hours
      return total + (hourlyRate * hoursElapsed);
    }
    return total;
  }, 0);
};

// Get random coordinates for song placement
export const getRandomPosition = (screenWidth, screenHeight) => {
  const margin = 80; // Keep songs away from edges
  return {
    x: Math.random() * (screenWidth - margin),
    y: Math.random() * (screenHeight - margin - 150) + 150, // Keep above bottom nav
  };
};

// Generator types and their properties
export const GENERATOR_TYPES = [
  {
    id: 'basic_generator',
    name: 'Basic Generator',
    description: 'A simple coin generator',
    icon: 'lightning-bolt',
    coinsPerHour: 100,
    cost: 10
  },
  {
    id: 'advanced_generator',
    name: 'Advanced Generator',
    description: 'Generates coins faster',
    icon: 'lightning-bolt-circle',
    coinsPerHour: 300,
    cost: 25
  },
  {
    id: 'super_generator',
    name: 'Super Generator',
    description: 'Generates coins faster',
    icon: 'lightning-bolt-circle',
    coinsPerHour: 500,
    cost: 50
  }
]; 