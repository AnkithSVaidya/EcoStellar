import { useState } from 'react'
import { useWallet } from '../../contexts/WalletContext'
import styles from './Gallery.module.css'

const Gallery = () => {
  const { isConnected, address } = useWallet()
  const [selectedNFT, setSelectedNFT] = useState(null)

  // Mock NFT data (will be replaced with blockchain data)
  const mockNFTs = [
    {
      id: 1,
      species: 'Oak',
      location: 'San Francisco, CA',
      latitude: 37.7749,
      longitude: -122.4194,
      plantDate: '2025-10-20',
      image: 'https://via.placeholder.com/400x300/2E7D32/FFFFFF?text=Oak+Tree',
      owner: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
    },
    {
      id: 2,
      species: 'Pine',
      location: 'New York City, NY',
      latitude: 40.7128,
      longitude: -74.0060,
      plantDate: '2025-10-21',
      image: 'https://via.placeholder.com/400x300/00C853/FFFFFF?text=Pine+Tree',
      owner: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
    },
    {
      id: 3,
      species: 'Cherry Blossom',
      location: 'Tokyo, Japan',
      latitude: 35.6762,
      longitude: 139.6503,
      plantDate: '2025-10-22',
      image: 'https://via.placeholder.com/400x300/81C784/FFFFFF?text=Cherry+Blossom',
      owner: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
    },
  ]

  return (
    <div className={styles.galleryPage}>
      <div className="container">
        <h1>🌳 Tree NFT Gallery</h1>
        <p className={styles.subtitle}>
          Explore soulbound NFT certificates representing real trees planted around the world
        </p>

        {!isConnected && (
          <div className={styles.connectPrompt}>
            <p>🔗 Connect your wallet to view your personal tree collection</p>
          </div>
        )}

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{mockNFTs.length}</span>
            <span className={styles.statLabel}>Total Trees Minted</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>15</span>
            <span className={styles.statLabel}>Countries</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>42</span>
            <span className={styles.statLabel}>Species</span>
          </div>
        </div>

        {/* NFT Grid */}
        <div className={styles.nftGrid}>
          {mockNFTs.map((nft) => (
            <div 
              key={nft.id} 
              className={styles.nftCard}
              onClick={() => setSelectedNFT(nft)}
            >
              <div className={styles.nftImage}>
                <img src={nft.image} alt={`${nft.species} tree`} />
                <div className={styles.nftId}>#{nft.id}</div>
              </div>
              <div className={styles.nftInfo}>
                <h3>{nft.species}</h3>
                <p className={styles.nftLocation}>
                  📍 {nft.location}
                </p>
                <p className={styles.nftDate}>
                  🗓️ Planted: {nft.plantDate}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {mockNFTs.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>🌱</p>
            <h3>No Tree NFTs Yet</h3>
            <p>Play Carbon Dash and unlock achievements to mint your first Tree NFT!</p>
          </div>
        )}

        {/* Modal */}
        {selectedNFT && (
          <div className={styles.modal} onClick={() => setSelectedNFT(null)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <button 
                className={styles.modalClose}
                onClick={() => setSelectedNFT(null)}
              >
                ✕
              </button>
              
              <div className={styles.modalBody}>
                <img 
                  src={selectedNFT.image} 
                  alt={`${selectedNFT.species} tree`}
                  className={styles.modalImage}
                />
                
                <div className={styles.modalInfo}>
                  <h2>🌳 {selectedNFT.species}</h2>
                  
                  <div className={styles.modalDetails}>
                    <div className={styles.modalDetail}>
                      <span className={styles.modalLabel}>NFT ID:</span>
                      <span className={styles.modalValue}>#{selectedNFT.id}</span>
                    </div>
                    
                    <div className={styles.modalDetail}>
                      <span className={styles.modalLabel}>Location:</span>
                      <span className={styles.modalValue}>{selectedNFT.location}</span>
                    </div>
                    
                    <div className={styles.modalDetail}>
                      <span className={styles.modalLabel}>Coordinates:</span>
                      <span className={styles.modalValue}>
                        {selectedNFT.latitude}°N, {Math.abs(selectedNFT.longitude)}°W
                      </span>
                    </div>
                    
                    <div className={styles.modalDetail}>
                      <span className={styles.modalLabel}>Plant Date:</span>
                      <span className={styles.modalValue}>{selectedNFT.plantDate}</span>
                    </div>
                    
                    <div className={styles.modalDetail}>
                      <span className={styles.modalLabel}>Owner:</span>
                      <code className={styles.modalAddress}>
                        {selectedNFT.owner.slice(0, 8)}...{selectedNFT.owner.slice(-8)}
                      </code>
                    </div>
                  </div>
                  
                  <div className={styles.modalActions}>
                    <a 
                      href={`https://stellar.expert/explorer/testnet/contract/CB5IMOHL25QQWVJA3WHUQVUD7KUD7XLTQK3CQOZLXN7QKHANB3KPLAZL`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      View on Explorer →
                    </a>
                  </div>
                  
                  <div className={styles.soulboundBadge}>
                    🔒 Soulbound NFT - Non-Transferable
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`card ${styles.infoCard}`}>
          <h3>About Tree NFTs</h3>
          <p>
            Each Tree NFT is a <strong>soulbound certificate</strong> permanently linked to your wallet.
            These NFTs cannot be transferred or sold - they're a permanent record of your environmental impact!
          </p>
          <ul className={styles.features}>
            <li>🔒 Soulbound (non-transferable)</li>
            <li>📍 GPS coordinates stored on-chain</li>
            <li>🌍 Verifiable real-world impact</li>
            <li>🎮 Unlocked through gameplay achievements</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Gallery
