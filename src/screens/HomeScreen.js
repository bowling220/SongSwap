import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, SafeAreaView, Alert, Animated, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/Header';
import SongPreviewModal from '../components/SongPreviewModal';
import CollectionScreen from './CollectionScreen';
import ProfileScreen from './ProfileScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define ParticleBackground component
const ParticleBackground = () => {
  const particles = Array(20).fill(0).map(() => ({
    id: Math.random(),
    x: new Animated.Value(Math.random() * Dimensions.get('window').width),
    y: new Animated.Value(Math.random() * Dimensions.get('window').height),
    scale: new Animated.Value(Math.random()),
  }));

  useEffect(() => {
    particles.forEach(particle => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(particle.y, {
              toValue: -50,
              duration: 10000 + Math.random() * 10000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.y, {
              toValue: Dimensions.get('window').height,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(particle.scale, {
              toValue: Math.random(),
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: Math.random(),
              duration: 3000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      {particles.map(particle => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

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

  // Add function to save state changes
  const saveGameState = async (updates) => {
    try {
      const storageKey = `userData_${spotifyProfile?.id}`;
      const existingData = await AsyncStorage.getItem(storageKey);
      const currentData = existingData ? JSON.parse(existingData) : {};
      
      const updatedData = {
        ...currentData,
        ...updates,
        lastUpdated: new Date().toISOString()
      };

      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  };

  // Handle song purchase with persistence
  const handlePurchaseSong = async (song) => {
    if (coins >= song.cost) {
      const newCoins = coins - song.cost;
      const newCollection = [...collection, {
        ...song,
        purchasedAt: new Date().toISOString()
      }];

      // Update local state through parent
      onUpdateCoins(newCoins);
      onUpdateCollection(newCollection);

      // Save to AsyncStorage
      await saveGameState({
        coins: newCoins,
        collection: newCollection
      });

      return true;
    }
    return false;
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
      <ParticleBackground />
      
      <Header 
        spotifyProfile={spotifyProfile}
        level={level}
        xp={xp}
        coins={coins}
        gems={gems}
      />

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

      {/* Modals */}
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
        spotifyProfile={spotifyProfile}
      />

      <SongPreviewModal
        isVisible={isPreviewVisible}
        song={selectedSong}
        onClose={handleClosePreview}
        onPurchase={handlePurchaseSong}
        coins={coins}
        isOwned={selectedSong ? collection.some(item => item.id === selectedSong.id) : false}
      />

      <TouchableOpacity
        style={styles.debugButton}
        onPress={async () => {
          const data = await AsyncStorage.getItem(`@gameData_${spotifyProfile.id}`);
          console.log('Saved Data:', JSON.parse(data));
        }}
      >
        <Text style={styles.debugButtonText}>Check Saved Data</Text>
      </TouchableOpacity>
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
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#1DB954',
    borderRadius: 2,
    opacity: 0.3,
  },
  songInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 4,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  songTitle: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: '#1DB954',
    borderRadius: 1.5,
  },
  debugButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HomeScreen;