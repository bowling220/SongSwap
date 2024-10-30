import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/Header';
import SongPreviewModal from '../components/SongPreviewModal';
import CollectionScreen from './CollectionScreen';
import ProfileScreen from './ProfileScreen';

const HomeScreen = ({
  spotifyProfile,
  level,
  xp,
  coins,
  gems,
  songEncounters,
  collection,
  onShowProfile,
  onShowSettings,
  onRefreshSongs,
  onSongPress,
  onUpdateCoins,
  onUpdateCollection,
}) => {
  const [selectedSong, setSelectedSong] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isCollectionVisible, setIsCollectionVisible] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);

  // Create stats object from props
  const stats = {
    level: level || 1,
    xp: xp || 0,
    coins: coins || 0,
    gems: gems || 0,
    songsCollected: collection?.length || 0,
    playTime: 0, // You can track this separately if needed
  };

  const handleSongPress = (song) => {
    const isOwned = collection.some(item => item.id === song.id);
    setSelectedSong({ ...song, isOwned });
    setIsPreviewVisible(true);
    onSongPress?.(song);
  };

  const handlePurchaseSong = (song) => {
    // Check if song is already in collection
    const isOwned = collection.some(item => item.id === song.id);
    if (isOwned) {
      Alert.alert(
        "Already Owned",
        "You already have this song in your collection!",
        [{ text: "OK" }]
      );
      return;
    }

    // Check if user has enough coins
    if (coins < song.cost) {
      Alert.alert(
        "Insufficient Coins",
        "You don't have enough coins to purchase this song.",
        [{ text: "OK" }]
      );
      return;
    }

    // Confirm purchase
    Alert.alert(
      "Confirm Purchase",
      `Do you want to purchase "${song.name}" for ${song.cost} coins?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Purchase",
          onPress: () => {
            // Update coins
            onUpdateCoins(coins - song.cost);

            // Add to collection with timestamp
            const newSong = {
              ...song,
              purchasedAt: new Date().toISOString(),
              isOwned: true
            };
            
            const newCollection = [...collection, newSong];
            onUpdateCollection(newCollection);

            // Update the selected song to show as owned
            setSelectedSong({ ...song, isOwned: true });

            // Show success message
            Alert.alert(
              "Success!",
              "Song added to your collection!",
              [{ 
                text: "OK",
                onPress: () => setIsPreviewVisible(false)
              }]
            );
          }
        }
      ]
    );
  };

  const handleClosePreview = () => {
    setIsPreviewVisible(false);
    setSelectedSong(null);
  };

  const handleViewCollection = () => {
    setIsProfileVisible(false);
    // Small delay to allow profile modal to close
    setTimeout(() => setIsCollectionVisible(true), 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        spotifyProfile={spotifyProfile}
        level={level}
        xp={xp}
        coins={coins}
        gems={gems}
      />

      {/* Refresh Button */}
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={onRefreshSongs}
      >
        <View style={styles.refreshContent}>
          <Ionicons name="refresh" size={24} color="white" />
          <Text style={styles.refreshText}>New Songs</Text>
        </View>
      </TouchableOpacity>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {songEncounters?.map((song) => (
          <TouchableOpacity
            key={song.id}
            style={[styles.songBubble, { left: song.x, top: song.y }]}
            onPress={() => handleSongPress(song)}
          >
            <Image 
              source={{ uri: song.image }} 
              style={styles.songImage}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setIsCollectionVisible(true)}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="music-box-multiple" size={24} color="white" />
          </View>
          <Text style={styles.navText}>Collection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={onShowProfile}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="person" size={24} color="white" />
          </View>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={onShowSettings}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="settings-outline" size={24} color="white" />
          </View>
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <ProfileScreen
        isVisible={isProfileVisible}
        onClose={() => setIsProfileVisible(false)}
        profile={spotifyProfile}
        stats={stats}
        collection={collection}
        onViewCollection={handleViewCollection}
      />

      <CollectionScreen
        isVisible={isCollectionVisible}
        onClose={() => setIsCollectionVisible(false)}
        collection={collection}
        onSongPress={handleSongPress}
      />

      {/* Song Preview Modal */}
      <SongPreviewModal
        isVisible={isPreviewVisible}
        song={selectedSong}
        onClose={handleClosePreview}
        onPurchase={handlePurchaseSong}
        coins={coins}
        isOwned={selectedSong ? collection.some(item => item.id === selectedSong.id) : false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191414',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  refreshButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: '#1DB954',
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 2,
  },
  refreshContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  refreshText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  songBubble: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  songImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#282828',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  navButton: {
    alignItems: 'center',
    minWidth: 80,
  },
  iconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#1DB954',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 2,
    borderColor: '#23e066',
  },
  navText: {
    color: 'white',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default HomeScreen;