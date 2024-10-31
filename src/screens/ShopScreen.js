import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const ShopScreen = ({
  isVisible,
  onClose,
  coins,
  gems,
  onPurchase,
  spotifyToken,
  collection = []
}) => {
  const [shopItems, setShopItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sound, setSound] = useState(null);
  const [playingId, setPlayingId] = useState(null);

  // Predefined genres for shop items
  const SHOP_GENRES = [
    'pop', 'rock', 'hip-hop', 'electronic', 'jazz', 
    'classical', 'country', 'r-n-b'
  ];

  // Function to get random songs from Spotify
  const fetchShopItems = async () => {
    setIsLoading(true);
    try {
      const randomGenre = SHOP_GENRES[Math.floor(Math.random() * SHOP_GENRES.length)];
      
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=genre:${randomGenre}&type=track&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
          },
        }
      );
      
      const data = await response.json();
      
      // Filter out owned songs and transform the remaining ones
      const items = data.tracks.items
        .filter(track => !collection.some(song => song.id === track.id))
        .slice(0, 20)
        .map(track => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          image: track.album.images[0]?.url,
          preview_url: track.preview_url,
          currency: Math.random() > 0.8 ? 'gems' : 'coins',
          price: Math.random() > 0.8 ? 
            Math.floor(Math.random() * 3) + 1 : 
            Math.floor(Math.random() * 900) + 100,
          rarity: determineRarity()
        }));

      setShopItems(items);
    } catch (error) {
      console.error('Error fetching shop items:', error);
      Alert.alert('Error', 'Failed to load shop items');
    } finally {
      setIsLoading(false);
    }
  };

  // Determine rarity of the song
  const determineRarity = () => {
    const rand = Math.random();
    if (rand > 0.98) return 'Legendary';
    if (rand > 0.90) return 'Epic';
    if (rand > 0.75) return 'Rare';
    return 'Common';
  };

  // Refresh shop items every hour
  useEffect(() => {
    fetchShopItems();
    const interval = setInterval(fetchShopItems, 3600000); // 1 hour
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handlePurchase = async (item) => {
    const userCurrency = item.currency === 'gems' ? gems : coins;
    
    if (userCurrency < item.price) {
      Alert.alert(
        'Insufficient Funds',
        `You need ${item.price} ${item.currency} to purchase this song.`
      );
      return;
    }

    if (collection.some(song => song.id === item.id)) {
      Alert.alert('Already Owned', 'You already have this song in your collection.');
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Purchase "${item.name}" for ${item.price} ${item.currency}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Buy', 
          onPress: async () => {
            await onPurchase(item);
            // Remove the purchased item from the shop
            setShopItems(current => current.filter(song => song.id !== item.id));
          }
        }
      ]
    );
  };

  const handlePreview = async (item) => {
    if (!item.preview_url) {
      Alert.alert('Preview Unavailable', 'No preview available for this song');
      return;
    }

    try {
      // Stop current playing sound
      if (sound) {
        await sound.unloadAsync();
        if (playingId === item.id) {
          setPlayingId(null);
          setSound(null);
          return;
        }
      }

      // Load and play new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: item.preview_url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      
      setSound(newSound);
      setPlayingId(item.id);
    } catch (error) {
      console.error('Error playing preview:', error);
      Alert.alert('Error', 'Failed to play preview');
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      setPlayingId(null);
      setSound(null);
    }
  };

  const renderShopItem = ({ item }) => (
    <View style={styles.shopItem}>
      <TouchableOpacity 
        style={styles.previewButton}
        onPress={() => handlePreview(item)}
      >
        <Image source={{ uri: item.image }} style={styles.songImage} />
        <View style={styles.playOverlay}>
          <Ionicons 
            name={playingId === item.id ? "pause" : "play"} 
            size={24} 
            color="#fff" 
          />
        </View>
      </TouchableOpacity>
      
      <View style={styles.songInfo}>
        <Text style={styles.songName}>{item.name}</Text>
        <Text style={styles.artistName}>{item.artist}</Text>
        <View style={[styles.rarityBadge, styles[`${item.rarity.toLowerCase()}Badge`]]}>
          <Text style={styles.rarityText}>{item.rarity}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.buyButton}
        onPress={() => handlePurchase(item)}
      >
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{item.price}</Text>
          <Ionicons 
            name={item.currency === 'gems' ? 'diamond' : 'cash-outline'} 
            size={20} 
            color={item.currency === 'gems' ? '#E752FF' : '#FFD700'} 
          />
        </View>
        <Text style={styles.buyText}>BUY</Text>
      </TouchableOpacity>
    </View>
  );

  const EmptyShop = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={64} color="#1DB954" />
      <Text style={styles.emptyTitle}>Shop is Empty!</Text>
      <Text style={styles.emptyText}>
        Check back later for new songs or pull down to refresh
      </Text>
    </View>
  );

  // Add this function to handle clean exit
  const handleClose = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setPlayingId(null);
    }
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleClose}
          >
            <Ionicons name="chevron-back" size={28} color="#1DB954" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Song Shop</Text>

          <View style={styles.headerRight} />
        </View>

        <View style={styles.currencyContainer}>
          <View style={styles.currency}>
            <Ionicons name="cash-outline" size={24} color="#FFD700" />
            <Text style={styles.currencyText}>{coins}</Text>
          </View>
          <View style={styles.currency}>
            <Ionicons name="diamond" size={24} color="#E752FF" />
            <Text style={styles.currencyText}>{gems}</Text>
          </View>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={styles.filterText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter === 'coins' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('coins')}
          >
            <Text style={styles.filterText}>Coins</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter === 'gems' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('gems')}
          >
            <Text style={styles.filterText}>Gems</Text>
          </TouchableOpacity>
        </View>

        {shopItems.length === 0 && !isLoading ? (
          <EmptyShop />
        ) : (
          <FlatList
            data={shopItems.filter(item => 
              selectedFilter === 'all' || item.currency === selectedFilter
            )}
            renderItem={renderShopItem}
            keyExtractor={item => item.id}
            contentContainerStyle={[
              styles.listContent,
              shopItems.length === 0 && styles.emptyList
            ]}
            refreshing={isLoading}
            onRefresh={fetchShopItems}
          />
        )}
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#000',
  },
  backText: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerRight: {
    width: 80,
  },
  currencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#1a1a1a',
    marginBottom: 10,
  },
  currency: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'center',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
  },
  filterButtonActive: {
    backgroundColor: '#1DB954',
  },
  filterText: {
    color: '#fff',
    fontWeight: '600',
  },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 2,
  },
  commonBorder: {
    borderColor: '#666',
  },
  rareBorder: {
    borderColor: '#4287f5',
  },
  epicBorder: {
    borderColor: '#9932CC',
  },
  legendaryBorder: {
    borderColor: '#FFD700',
  },
  songImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  songInfo: {
    flex: 1,
    marginLeft: 15,
  },
  songName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  artistName: {
    color: '#666',
    fontSize: 14,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
  },
  commonBadge: {
    backgroundColor: '#666',
  },
  rareBadge: {
    backgroundColor: '#4287f5',
  },
  epicBadge: {
    backgroundColor: '#9932CC',
  },
  legendaryBadge: {
    backgroundColor: '#FFD700',
  },
  rarityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    opacity: 0.8,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewButton: {
    position: 'relative',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buyButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default ShopScreen; 