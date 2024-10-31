import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TradingScreen = ({ 
  isVisible, 
  onClose, 
  collection = [],
  spotifyToken,
  onTrade 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [targetSongs, setTargetSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [pendingTrade, setPendingTrade] = useState(null);
  const [tradeMode, setTradeMode] = useState('selecting');

  // Check if collection is empty
  const hasCollection = collection && collection.length > 0;

  // Add this component to show when collection is empty
  const EmptyCollectionView = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="musical-notes" size={64} color="#1DB954" />
      <Text style={styles.emptyTitle}>No Songs in Collection</Text>
      <Text style={styles.emptyText}>
        You need songs in your collection before you can trade.
      </Text>
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={onClose}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );

  // Function to search Spotify
  const searchSpotify = async (query) => {
    if (!query.trim() || !spotifyToken) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
          },
        }
      );
      const data = await response.json();
      setSearchResults(data.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        image: track.album.images[0]?.url,
        preview_url: track.preview_url
      })));
    } catch (error) {
      console.error('Spotify search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSongSelect = (song) => {
    if (selectedSongs.some(s => s.id === song.id)) {
      setSelectedSongs(selectedSongs.filter(s => s.id !== song.id));
    } else if (selectedSongs.length < 3) {
      setSelectedSongs([...selectedSongs, song]);
    }
  };

  const handleTargetSelect = (song) => {
    if (targetSongs.some(s => s.id === song.id)) {
      setTargetSongs(targetSongs.filter(s => s.id !== song.id));
    } else if (targetSongs.length < 3) {
      setTargetSongs([...targetSongs, song]);
    }
  };

  const renderSongItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.songItem}
      onPress={() => targetSongs ? handleSongSelect(item) : handleTargetSelect(item)}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.songImage}
      />
      <View style={styles.songInfo}>
        <Text style={styles.songName}>{item.name}</Text>
        <Text style={styles.artistName}>{item.artist}</Text>
      </View>
      {selectedSongs.some(s => s.id === item.id) && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={24} color="#1DB954" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSelectedSong = (song, index) => (
    <View style={styles.selectedSong} key={song.id}>
      <Image source={{ uri: song.image }} style={styles.smallSongImage} />
      <View style={styles.selectedSongInfo}>
        <Text style={styles.selectedSongName} numberOfLines={1}>{song.name}</Text>
        <Text style={styles.selectedArtistName} numberOfLines={1}>{song.artist}</Text>
      </View>
      <TouchableOpacity 
        onPress={() => handleSongSelect(song)}
        style={styles.removeButton}
      >
        <Ionicons name="close-circle" size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  const isTradeValid = () => {
    return targetSongs.length > 0 && selectedSongs.length > 0;
  };

  const TradeButton = () => {
    if (!targetSongs.length) {
      return (
        <View style={[styles.tradeButton, styles.tradeButtonDisabled]}>
          <Text style={styles.tradeButtonText}>
            Select songs you want first
          </Text>
        </View>
      );
    }

    if (!selectedSongs.length) {
      return (
        <View style={[styles.tradeButton, styles.tradeButtonDisabled]}>
          <Text style={styles.tradeButtonText}>
            Select songs to offer ({targetSongs.length} wanted)
          </Text>
        </View>
      );
    }

    return (
      <TouchableOpacity 
        style={styles.tradeButton}
        onPress={() => {
          if (isTradeValid()) {
            setIsConfirmationVisible(true);
          }
        }}
      >
        <Text style={styles.tradeButtonText}>
          Review Trade ({selectedSongs.length} for {targetSongs.length})
        </Text>
      </TouchableOpacity>
    );
  };

  const handleConfirmTrade = () => {
    if (!isTradeValid()) {
      Alert.alert(
        'Invalid Trade',
        'Please select at least one song on each side of the trade.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    onTrade(targetSongs, selectedSongs);
    setIsConfirmationVisible(false);
    setTargetSongs([]);
    setSelectedSongs([]);
  };

  const TradeConfirmationModal = () => {
    if (!isTradeValid()) return null;
    
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={isConfirmationVisible}
        onRequestClose={() => setIsConfirmationVisible(false)}
      >
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationCard}>
            <Text style={styles.confirmationTitle}>Confirm Trade</Text>
            
            <View style={styles.tradePreview}>
              <View style={styles.tradeSection}>
                <Text style={styles.tradeSectionTitle}>
                  You'll Get ({targetSongs.length} songs):
                </Text>
                {targetSongs.map(song => (
                  <View key={song.id} style={styles.targetPreview}>
                    <Image 
                      source={{ uri: song.image }} 
                      style={styles.previewImage}
                    />
                    <View style={styles.songInfo}>
                      <Text style={styles.songName}>{song.name}</Text>
                      <Text style={styles.artistName}>{song.artist}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.tradeDivider} />

              <View style={styles.tradeSection}>
                <Text style={styles.tradeSectionTitle}>
                  You'll Trade ({selectedSongs.length} songs):
                </Text>
                {selectedSongs.map(song => (
                  <View key={song.id} style={styles.targetPreview}>
                    <Image 
                      source={{ uri: song.image }} 
                      style={styles.previewImage}
                    />
                    <View style={styles.songInfo}>
                      <Text style={styles.songName}>{song.name}</Text>
                      <Text style={styles.artistName}>{song.artist}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.confirmationButtons}>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setIsConfirmationVisible(false)}
              >
                <Text style={styles.confirmButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmButton, styles.acceptButton]}
                onPress={handleConfirmTrade}
              >
                <Text style={styles.confirmButtonText}>Confirm Trade</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Trading Post</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {!hasCollection ? (
          <EmptyCollectionView />
        ) : (
          // Your existing trading UI
          <View style={styles.content}>
            {tradeMode === 'selecting' ? (
              // Step 1: Select target songs
              <View style={styles.content}>
                <Text style={styles.instructionText}>
                  Search for songs you want (up to 3):
                </Text>
                
                {/* Selected target songs preview */}
                {targetSongs.length > 0 && (
                  <View style={styles.selectedTargetsContainer}>
                    <Text style={styles.subTitle}>Selected Songs:</Text>
                    {targetSongs.map(song => (
                      <View key={song.id} style={styles.selectedTarget}>
                        <Image source={{ uri: song.image }} style={styles.smallSongImage} />
                        <View style={styles.selectedSongInfo}>
                          <Text style={styles.selectedSongName}>{song.name}</Text>
                          <Text style={styles.selectedArtistName}>{song.artist}</Text>
                        </View>
                        <TouchableOpacity 
                          onPress={() => handleTargetSelect(song)}
                          style={styles.removeButton}
                        >
                          <Ionicons name="close-circle" size={20} color="#ff4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.searchBar}>
                  <Ionicons name="search" size={20} color="#666" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search songs you want..."
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={(text) => {
                      setSearchQuery(text);
                      searchSpotify(text);
                    }}
                  />
                </View>

                {/* Search results */}
                {isLoading ? (
                  <ActivityIndicator color="#1DB954" style={styles.loader} />
                ) : (
                  <FlatList
                    data={searchResults}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={[
                          styles.songItem,
                          targetSongs.some(s => s.id === item.id) && styles.selectedSongItem
                        ]}
                        onPress={() => handleTargetSelect(item)}
                      >
                        <Image source={{ uri: item.image }} style={styles.songImage} />
                        <View style={styles.songInfo}>
                          <Text style={styles.songName}>{item.name}</Text>
                          <Text style={styles.artistName}>{item.artist}</Text>
                        </View>
                        {targetSongs.some(s => s.id === item.id) && (
                          <Ionicons name="checkmark-circle" size={24} color="#1DB954" />
                        )}
                      </TouchableOpacity>
                    )}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                  />
                )}

                {targetSongs.length > 0 && (
                  <TouchableOpacity 
                    style={styles.nextButton}
                    onPress={() => setTradeMode('offering')}
                  >
                    <Text style={styles.nextButtonText}>
                      Next: Select Songs to Offer ({targetSongs.length} selected)
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              // Step 2: Select songs to offer
              <View style={styles.content}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => setTradeMode('selecting')}
                >
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                  <Text style={styles.backButtonText}>Back to Selection</Text>
                </TouchableOpacity>

                <View style={styles.tradePreview}>
                  <Text style={styles.subTitle}>You'll Get:</Text>
                  {targetSongs.map(song => (
                    <View key={song.id} style={styles.targetPreview}>
                      <Image source={{ uri: song.image }} style={styles.previewImage} />
                      <View style={styles.songInfo}>
                        <Text style={styles.songName}>{song.name}</Text>
                        <Text style={styles.artistName}>{song.artist}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                <Text style={styles.instructionText}>
                  Select songs to offer from your collection:
                </Text>

                {/* Your collection */}
                <FlatList
                  data={collection}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={[
                        styles.songItem,
                        selectedSongs.some(s => s.id === item.id) && styles.selectedSongItem
                      ]}
                      onPress={() => handleSongSelect(item)}
                    >
                      <Image source={{ uri: item.image }} style={styles.songImage} />
                      <View style={styles.songInfo}>
                        <Text style={styles.songName}>{item.name}</Text>
                        <Text style={styles.artistName}>{item.artist}</Text>
                      </View>
                      {selectedSongs.some(s => s.id === item.id) && (
                        <Ionicons name="checkmark-circle" size={24} color="#1DB954" />
                      )}
                    </TouchableOpacity>
                  )}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.listContent}
                />

                <TradeButton />
              </View>
            )}
          </View>
        )}
      </View>
      <TradeConfirmationModal />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1DB954',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#fff',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  songInfo: {
    flex: 1,
    marginLeft: 10,
  },
  songName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  artistName: {
    color: '#666',
    fontSize: 14,
  },
  selectedIndicator: {
    marginLeft: 10,
  },
  targetSongContainer: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  targetSong: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  targetInfo: {
    flex: 1,
    marginLeft: 15,
  },
  targetName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  targetArtist: {
    color: '#666',
    fontSize: 16,
  },
  selectedSongsContainer: {
    marginBottom: 15,
  },
  selectedSong: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  smallSongImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  selectedSongInfo: {
    flex: 1,
    marginLeft: 10,
  },
  selectedSongName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedArtistName: {
    color: '#666',
    fontSize: 12,
  },
  removeButton: {
    padding: 5,
  },
  tradeButton: {
    backgroundColor: '#1DB954',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  tradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
  confirmationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmationCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1DB954',
    textAlign: 'center',
    marginBottom: 20,
  },
  tradePreview: {
    marginBottom: 20,
  },
  tradeSection: {
    marginBottom: 15,
  },
  tradeSectionTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    fontWeight: '600',
  },
  tradeDivider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 15,
  },
  targetPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  offeredPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  previewImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10,
  },
  previewName: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  acceptButton: {
    backgroundColor: '#1DB954',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tradeButtonDisabled: {
    backgroundColor: '#333',
    opacity: 0.7,
  },
  warningText: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
});

const additionalStyles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  emptyTitle: {
    color: '#1DB954',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  closeButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TradingScreen; 