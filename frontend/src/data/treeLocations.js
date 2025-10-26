// Tree planting locations around the world
// Each location has coordinates, biome type, trees planted, and partner organization

export const treeLocations = [
  {
    id: 1,
    name: "Amazon Rainforest",
    country: "Brazil",
    lat: -3.4653,
    lng: -62.2159,
    trees: 15420,
    biome: "Tropical Rainforest",
    biomeColor: "#00C853", // Vibrant green
    partner: "Amazon Conservation Team",
    description: "Restoring vital rainforest habitat in the heart of the Amazon basin",
    imageUrl: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400",
    dateStarted: "2023-01-15"
  },
  {
    id: 2,
    name: "Congo Basin",
    country: "Democratic Republic of Congo",
    lat: -0.2280,
    lng: 22.8784,
    trees: 12850,
    biome: "Tropical Rainforest",
    biomeColor: "#00C853",
    partner: "Congo Basin Forest Partnership",
    description: "Protecting Africa's largest tropical rainforest and critical wildlife habitat",
    imageUrl: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400",
    dateStarted: "2023-02-20"
  },
  {
    id: 3,
    name: "Great Green Wall",
    country: "Sahel Region, Africa",
    lat: 13.4549,
    lng: 2.1111,
    trees: 9240,
    biome: "Savanna/Drylands",
    biomeColor: "#FFB300", // Golden yellow
    partner: "Great Green Wall Initiative",
    description: "Building a living wall across Africa to combat desertification",
    imageUrl: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400",
    dateStarted: "2023-03-10"
  },
  {
    id: 4,
    name: "Mangrove Restoration",
    country: "Indonesia",
    lat: -6.2088,
    lng: 106.8456,
    trees: 18650,
    biome: "Coastal Mangrove",
    biomeColor: "#00ACC1", // Cyan blue
    partner: "Mangrove Action Project",
    description: "Restoring coastal mangrove forests to protect against climate change",
    imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
    dateStarted: "2023-01-25"
  },
  {
    id: 5,
    name: "Atlantic Forest",
    country: "Brazil",
    lat: -22.9068,
    lng: -43.1729,
    trees: 11200,
    biome: "Tropical Rainforest",
    biomeColor: "#00C853",
    partner: "SOS Mata Atlântica",
    description: "Restoring one of the world's most biodiverse and threatened forests",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400",
    dateStarted: "2023-04-05"
  },
  {
    id: 6,
    name: "Sundarbans Delta",
    country: "Bangladesh",
    lat: 21.9497,
    lng: 89.1833,
    trees: 14300,
    biome: "Coastal Mangrove",
    biomeColor: "#00ACC1",
    partner: "Bangladesh Forest Department",
    description: "Largest mangrove forest in the world, home to Bengal tigers",
    imageUrl: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=400",
    dateStarted: "2023-02-15"
  },
  {
    id: 7,
    name: "Boreal Forest",
    country: "Canada",
    lat: 54.0000,
    lng: -105.0000,
    trees: 8900,
    biome: "Boreal/Taiga",
    biomeColor: "#2E7D32", // Dark green
    partner: "Boreal Forest Conservation Framework",
    description: "Protecting and restoring Canada's vast northern forests",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400",
    dateStarted: "2023-03-20"
  },
  {
    id: 8,
    name: "Madagascar Highlands",
    country: "Madagascar",
    lat: -18.8792,
    lng: 47.5079,
    trees: 10500,
    biome: "Tropical Dry Forest",
    biomeColor: "#7CB342", // Light green
    partner: "Madagascar National Parks",
    description: "Restoring unique biodiversity hotspot with endemic species",
    imageUrl: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400",
    dateStarted: "2023-01-30"
  },
  {
    id: 9,
    name: "Western Ghats",
    country: "India",
    lat: 15.2993,
    lng: 74.1240,
    trees: 13400,
    biome: "Tropical Rainforest",
    biomeColor: "#00C853",
    partner: "Western Ghats Ecology Expert Panel",
    description: "UNESCO World Heritage Site with exceptional biodiversity",
    imageUrl: "https://images.unsplash.com/photo-1563406652-d07e3287c610?w=400",
    dateStarted: "2023-02-10"
  },
  {
    id: 10,
    name: "Great Barrier Reef Coastline",
    country: "Australia",
    lat: -16.9186,
    lng: 145.7781,
    trees: 7800,
    biome: "Coastal Forest",
    biomeColor: "#1976D2", // Blue
    partner: "Reef Restoration Foundation",
    description: "Coastal reforestation to reduce runoff into the reef",
    imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400",
    dateStarted: "2023-04-01"
  },
  {
    id: 11,
    name: "Appalachian Mountains",
    country: "United States",
    lat: 37.5407,
    lng: -82.4013,
    trees: 9600,
    biome: "Temperate Forest",
    biomeColor: "#43A047", // Medium green
    partner: "Appalachian Regional Reforestation Initiative",
    description: "Restoring forest ecosystems in former mining areas",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    dateStarted: "2023-03-15"
  },
  {
    id: 12,
    name: "Borneo Rainforest",
    country: "Malaysia",
    lat: 0.9619,
    lng: 114.5548,
    trees: 16200,
    biome: "Tropical Rainforest",
    biomeColor: "#00C853",
    partner: "Borneo Conservation Trust",
    description: "Critical habitat for orangutans and other endangered species",
    imageUrl: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400",
    dateStarted: "2023-01-20"
  }
]

// Calculate totals
export const getTotalTrees = () => {
  return treeLocations.reduce((sum, location) => sum + location.trees, 0)
}

export const getTotalCountries = () => {
  const countries = new Set(treeLocations.map(loc => loc.country))
  return countries.size
}

export const getLocationsByBiome = () => {
  const biomes = {}
  treeLocations.forEach(loc => {
    if (!biomes[loc.biome]) {
      biomes[loc.biome] = []
    }
    biomes[loc.biome].push(loc)
  })
  return biomes
}

// Recent activity mock data
export const recentActivity = [
  {
    id: 1,
    type: 'tree_planted',
    player: 'EcoWarrior#4521',
    location: 'Amazon Rainforest',
    trees: 5,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: 2,
    type: 'nft_minted',
    player: 'TreeLover#8932',
    location: 'Congo Basin',
    trees: 10,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
  },
  {
    id: 3,
    type: 'tree_planted',
    player: 'GreenGamer#1203',
    location: 'Mangrove Restoration',
    trees: 3,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
  },
  {
    id: 4,
    type: 'milestone',
    player: 'EcoChampion#5674',
    location: 'Great Green Wall',
    trees: 100,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
  },
  {
    id: 5,
    type: 'tree_planted',
    player: 'NatureFan#3421',
    location: 'Western Ghats',
    trees: 7,
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
  },
  {
    id: 6,
    type: 'nft_minted',
    player: 'ForestGuard#9087',
    location: 'Borneo Rainforest',
    trees: 15,
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000) // 18 hours ago
  },
  {
    id: 7,
    type: 'tree_planted',
    player: 'ClimateHero#2156',
    location: 'Boreal Forest',
    trees: 4,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    id: 8,
    type: 'milestone',
    player: 'TreePlanter#7890',
    location: 'Atlantic Forest',
    trees: 50,
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000) // 1.5 days ago
  }
]

// Helper to format time ago
export const getTimeAgo = (timestamp) => {
  const seconds = Math.floor((new Date() - timestamp) / 1000)
  
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + " years ago"
  
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + " months ago"
  
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + " days ago"
  
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + " hours ago"
  
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + " minutes ago"
  
  return Math.floor(seconds) + " seconds ago"
}
