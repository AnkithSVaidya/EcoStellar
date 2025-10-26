// Mock Tree NFT data
// Each NFT represents a tree certificate minted by the player

export const mockNFTs = [
  {
    id: 'NFT-001-A7B2C9',
    tokenId: 1,
    species: 'Giant Sequoia',
    scientificName: 'Sequoiadendron giganteum',
    location: 'Sierra Nevada, California, USA',
    continent: 'North America',
    coordinates: { lat: 36.4864, lng: -118.5658 },
    plantedDate: '2024-03-15',
    mintedDate: '2024-03-16',
    imageUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=600',
    description: 'Majestic ancient redwood planted in protected conservation area',
    carbonOffset: 0.05, // tons per year
    height: '2.5m',
    age: '8 months'
  },
  {
    id: 'NFT-002-K3M8P1',
    tokenId: 2,
    species: 'Mangrove',
    scientificName: 'Rhizophora mangle',
    location: 'Sundarbans Delta, Bangladesh',
    continent: 'Asia',
    coordinates: { lat: 21.9497, lng: 89.1833 },
    plantedDate: '2024-01-22',
    mintedDate: '2024-01-23',
    imageUrl: 'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=600',
    description: 'Coastal mangrove protecting shoreline and marine ecosystems',
    carbonOffset: 0.08,
    height: '3.2m',
    age: '10 months'
  },
  {
    id: 'NFT-003-R5T9W7',
    tokenId: 3,
    species: 'Baobab',
    scientificName: 'Adansonia digitata',
    location: 'Madagascar Highlands',
    continent: 'Africa',
    coordinates: { lat: -18.8792, lng: 47.5079 },
    plantedDate: '2023-11-08',
    mintedDate: '2023-11-09',
    imageUrl: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600',
    description: 'Iconic African tree known for longevity and water storage',
    carbonOffset: 0.12,
    height: '4.1m',
    age: '1 year'
  },
  {
    id: 'NFT-004-D2F6J8',
    tokenId: 4,
    species: 'Japanese Cherry Blossom',
    scientificName: 'Prunus serrulata',
    location: 'Mount Yoshino, Japan',
    continent: 'Asia',
    coordinates: { lat: 34.3680, lng: 135.8590 },
    plantedDate: '2024-04-05',
    mintedDate: '2024-04-06',
    imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600',
    description: 'Beautiful ornamental tree symbolizing renewal and spring',
    carbonOffset: 0.03,
    height: '2.8m',
    age: '7 months'
  },
  {
    id: 'NFT-005-L8N3Q4',
    tokenId: 5,
    species: 'Norway Spruce',
    scientificName: 'Picea abies',
    location: 'Boreal Forest, Norway',
    continent: 'Europe',
    coordinates: { lat: 61.9241, lng: 25.7482 },
    plantedDate: '2023-09-12',
    mintedDate: '2023-09-13',
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600',
    description: 'Hardy evergreen thriving in northern boreal forests',
    carbonOffset: 0.06,
    height: '3.5m',
    age: '1 year 2 months'
  },
  {
    id: 'NFT-006-V1X7Z2',
    tokenId: 6,
    species: 'Amazon Rainforest Tree',
    scientificName: 'Bertholletia excelsa',
    location: 'Amazon Rainforest, Brazil',
    continent: 'South America',
    coordinates: { lat: -3.4653, lng: -62.2159 },
    plantedDate: '2024-02-20',
    mintedDate: '2024-02-21',
    imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600',
    description: 'Vital rainforest species producing Brazil nuts and supporting biodiversity',
    carbonOffset: 0.10,
    height: '5.2m',
    age: '9 months'
  }
]

// Tree species available for minting
export const availableSpecies = [
  { id: 'sequoia', name: 'Giant Sequoia', scientificName: 'Sequoiadendron giganteum', cost: 100, carbonOffset: 0.05 },
  { id: 'mangrove', name: 'Mangrove', scientificName: 'Rhizophora mangle', cost: 80, carbonOffset: 0.08 },
  { id: 'baobab', name: 'Baobab', scientificName: 'Adansonia digitata', cost: 120, carbonOffset: 0.12 },
  { id: 'cherry', name: 'Japanese Cherry Blossom', scientificName: 'Prunus serrulata', cost: 90, carbonOffset: 0.03 },
  { id: 'spruce', name: 'Norway Spruce', scientificName: 'Picea abies', cost: 70, carbonOffset: 0.06 },
  { id: 'rainforest', name: 'Amazon Rainforest Tree', scientificName: 'Bertholletia excelsa', cost: 110, carbonOffset: 0.10 },
  { id: 'oak', name: 'English Oak', scientificName: 'Quercus robur', cost: 85, carbonOffset: 0.07 },
  { id: 'pine', name: 'Scots Pine', scientificName: 'Pinus sylvestris', cost: 75, carbonOffset: 0.05 }
]

// Location options for minting
export const mintLocations = [
  { id: 'california', name: 'Sierra Nevada, California', continent: 'North America', coords: { lat: 36.4864, lng: -118.5658 } },
  { id: 'bangladesh', name: 'Sundarbans Delta, Bangladesh', continent: 'Asia', coords: { lat: 21.9497, lng: 89.1833 } },
  { id: 'madagascar', name: 'Madagascar Highlands', continent: 'Africa', coords: { lat: -18.8792, lng: 47.5079 } },
  { id: 'japan', name: 'Mount Yoshino, Japan', continent: 'Asia', coords: { lat: 34.3680, lng: 135.8590 } },
  { id: 'norway', name: 'Boreal Forest, Norway', continent: 'Europe', coords: { lat: 61.9241, lng: 25.7482 } },
  { id: 'amazon', name: 'Amazon Rainforest, Brazil', continent: 'South America', coords: { lat: -3.4653, lng: -62.2159 } },
  { id: 'congo', name: 'Congo Basin, DRC', continent: 'Africa', coords: { lat: -0.2280, lng: 22.8784 } },
  { id: 'borneo', name: 'Borneo Rainforest, Malaysia', continent: 'Asia', coords: { lat: 0.9619, lng: 114.5548 } }
]

// Filter and sort functions
export const filterNFTs = (nfts, filters) => {
  let filtered = [...nfts]

  if (filters.species) {
    filtered = filtered.filter(nft => nft.species.toLowerCase().includes(filters.species.toLowerCase()))
  }

  if (filters.continent) {
    filtered = filtered.filter(nft => nft.continent === filters.continent)
  }

  if (filters.dateFrom) {
    filtered = filtered.filter(nft => new Date(nft.plantedDate) >= new Date(filters.dateFrom))
  }

  if (filters.dateTo) {
    filtered = filtered.filter(nft => new Date(nft.plantedDate) <= new Date(filters.dateTo))
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(nft =>
      nft.species.toLowerCase().includes(searchLower) ||
      nft.location.toLowerCase().includes(searchLower) ||
      nft.id.toLowerCase().includes(searchLower)
    )
  }

  return filtered
}

export const sortNFTs = (nfts, sortBy) => {
  const sorted = [...nfts]

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.mintedDate) - new Date(a.mintedDate))
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.mintedDate) - new Date(b.mintedDate))
    case 'alphabetical':
      return sorted.sort((a, b) => a.species.localeCompare(b.species))
    case 'carbonOffset':
      return sorted.sort((a, b) => b.carbonOffset - a.carbonOffset)
    default:
      return sorted
  }
}

// Format date helper
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Format coordinates helper
export const formatCoordinates = (coords) => {
  const latDirection = coords.lat >= 0 ? 'N' : 'S'
  const lngDirection = coords.lng >= 0 ? 'E' : 'W'
  return `${Math.abs(coords.lat).toFixed(4)}°${latDirection}, ${Math.abs(coords.lng).toFixed(4)}°${lngDirection}`
}

// Get unique continents for filter
export const getContinents = (nfts) => {
  return [...new Set(nfts.map(nft => nft.continent))].sort()
}

// Get unique species for filter
export const getSpeciesList = (nfts) => {
  return [...new Set(nfts.map(nft => nft.species))].sort()
}
