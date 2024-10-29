// App.js
import React, { useState, useEffect } from 'react';
import {
  AppState,
  Button,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const CLIENT_ID = '7ed969c99b8c4d1d846c3d9cfdb441f6';
const REDIRECT_URI = Platform.select({
  web: 'exp://localhost:19000/--/callback',
  ios: 'songswap://callback',
  android: 'songswap://callback'
});

const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';
const SCOPES = [
  'user-read-email',
  'playlist-read-private',
  'user-library-read',
  'user-read-private',
  'user-top-read',
  'user-read-recently-played',
  'user-modify-playback-state',
  'user-read-playback-state',
];

const RARITY_COSTS = {
  Common: 100,
  Rare: 250,
  Epic: 500,
  Legendary: 1000,
  Mythic: 2000
};

const rarityColors = {
  Common: '#a0a0a0',
  Rare: '#4a90e2',
  Epic: '#9b59b6',
  Legendary: '#f1c40f',
  Mythic: '#e74c3c'
};

const ACHIEVEMENTS = [
  {
    id: 'first_collect',
    title: 'First Collection',
    description: 'Collect your first song',
    icon: 'musical-note',
    requirement: 1,
    xpReward: 50,
    type: 'collection'
  },
  {
    id: 'collector_10',
    title: 'Novice Collector',
    description: 'Collect 10 songs',
    icon: 'albums',
    requirement: 10,
    xpReward: 100,
    type: 'collection'
  },
  {
    id: 'rare_collector',
    title: 'Rare Hunter',
    description: 'Collect 5 Rare songs',
    icon: 'star',
    requirement: 5,
    xpReward: 150,
    type: 'rare'
  },
  {
    id: 'epic_collector',
    title: 'Epic Enthusiast',
    description: 'Collect 3 Epic songs',
    icon: 'trophy',
    requirement: 3,
    xpReward: 200,
    type: 'epic'
  }
];

const ProfileScreen = ({ visible, onClose, userName, userImage, level, xp, coins, gems, collection, unlockedAchievements }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.profileInfo}>
              {userImage ? (
                <Image source={{ uri: userImage }} style={styles.profileAvatar} />
              ) : (
                <View style={styles.profileAvatarPlaceholder}>
                  <Ionicons name="person-circle" size={60} color="white" />
                </View>
              )}
              <Text style={styles.profileName}>{userName}</Text>
              
              <View style={styles.profileStats}>
                <View style={styles.profileStatItem}>
                  <Ionicons name="star" size={24} color="#FFD700" />
                  <Text style={styles.profileStatValue}>Level {level}</Text>
                  <Text style={styles.profileStatLabel}>XP: {xp}/100</Text>
                </View>
                
                <View style={styles.profileCurrency}>
                  <View style={styles.currencyItem}>
                    <Ionicons name="logo-bitcoin" size={24} color="#FFA500" />
                    <Text style={styles.currencyValue}>{coins}</Text>
                  </View>
                  <View style={styles.currencyItem}>
                    <Ionicons name="diamond" size={24} color="#00CED1" />
                    <Text style={styles.currencyValue}>{gems}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.achievementsSection}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              {ACHIEVEMENTS.map(achievement => (
                <View 
                  key={achievement.id} 
                  style={[
                    styles.achievementItem,
                    unlockedAchievements.includes(achievement.id) && styles.achievementUnlocked
                  ]}
                >
                  <Ionicons 
                    name={achievement.icon} 
                    size={24} 
                    color={unlockedAchievements.includes(achievement.id) ? "#1DB954" : "#666"} 
                  />
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  </View>
                  <Text style={styles.achievementXP}>+{achievement.xpReward} XP</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const CollectionScreen = ({ visible, onClose, collection }) => {
  const [playingSound, setPlayingSound] = useState(null);
  const [playingSongId, setPlayingSongId] = useState(null);

  useEffect(() => {
    return playingSound
      ? () => {
          playingSound.unloadAsync();
        }
      : undefined;
  }, [playingSound]);

  const playSong = async (song) => {
    if (playingSound) {
      await playingSound.unloadAsync();
    }

    if (playingSongId === song.id) {
      setPlayingSongId(null);
      setPlayingSound(null);
      return;
    }

    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.preview_url },
        { shouldPlay: true }
      );
      setPlayingSound(newSound);
      setPlayingSongId(song.id);
    } catch (error) {
      console.error('Error playing song:', error);
      alert('Unable to play song');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        if (playingSound) {
          playingSound.unloadAsync();
        }
        onClose();
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Collection</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.collectionStats}>
            <Text style={styles.collectionTotal}>
              Total Songs: {collection.length}
            </Text>
          </View>

          <FlatList
            data={collection}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.collectionItem}
                onPress={() => playSong(item)}
              >
                <Image source={{ uri: item.image }} style={styles.collectionItemImage} />
                <View style={styles.collectionItemInfo}>
                  <Text style={styles.collectionItemTitle}>{item.name}</Text>
                  <Text style={styles.collectionItemArtist}>{item.artist}</Text>
                  <View style={[styles.rarityBadge, { backgroundColor: rarityColors[item.rarity] }]}>
                    <Text style={styles.rarityText}>{item.rarity}</Text>
                  </View>
                </View>
                <Ionicons 
                  name={playingSongId === item.id ? "pause-circle" : "play-circle"} 
                  size={30} 
                  color="#1DB954" 
                />
              </TouchableOpacity>
            )}
            style={styles.collectionList}
          />
        </View>
      </View>
    </Modal>
  );
};

const PreviewModal = ({ visible, onClose, song, onPurchase }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const stopAndClosePreview = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
    setIsPlaying(false);
    onClose();
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playPreview = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } else if (song?.preview_url) {
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: song.preview_url },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing preview:', error);
        alert('Unable to play preview');
      }
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={stopAndClosePreview}
    >
      <View style={styles.previewModalContainer}>
        <View style={styles.previewModalContent}>
          <View style={styles.previewHeader}>
            <TouchableOpacity onPress={stopAndClosePreview} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.previewInfo}>
            <Image 
              source={{ uri: song?.image }} 
              style={styles.previewImage} 
            />
            <Text style={styles.previewTitle}>{song?.name}</Text>
            <Text style={styles.previewArtist}>{song?.artist}</Text>
            
            <View style={[styles.rarityBadge, { backgroundColor: rarityColors[song?.rarity] }]}>
              <Text style={styles.rarityText}>{song?.rarity}</Text>
            </View>

            <Text style={styles.previewCost}>
              Cost: {RARITY_COSTS[song?.rarity]} coins
            </Text>

            <View style={styles.previewControls}>
              <TouchableOpacity 
                style={styles.playButton} 
                onPress={playPreview}
              >
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={30} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.purchaseButton}
              onPress={() => {
                stopAndClosePreview();
                onPurchase();
              }}
            >
              <Text style={styles.purchaseButtonText}>Purchase Song</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function App() {
  const [authToken, setAuthToken] = useState(null);
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [collection, setCollection] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [collectedSongIds, setCollectedSongIds] = useState([]);

  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAuction, setShowAuction] = useState(false);
  const [coins, setCoins] = useState(1000);
  const [gems, setGems] = useState(50);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);

  const [songEncounters, setSongEncounters] = useState([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [previewSong, setPreviewSong] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewAudio, setPreviewAudio] = useState(null);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsed = JSON.parse(userData);
          setLevel(parsed.level || 1);
          setXp(parsed.xp || 0);
          setCoins(parsed.coins || 1000);
          setGems(parsed.gems || 50);
          setCollection(parsed.collection || []);
          setUnlockedAchievements(parsed.unlockedAchievements || []);
          setCollectedSongIds(parsed.collectedSongIds || []);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const loadToken = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('spotify_token');
        if (token) {
          setAuthToken(token);
          await Promise.all([
            fetchUserProfile(token),
            fetchTopTracks(token),
            fetchRecentlyPlayed(token)
          ]);
          setIsDataLoaded(true);
        }
      } catch (error) {
        console.error('Error loading token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        loadToken();
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (isDataLoaded && topTracks.length > 0) {
      generateRandomEncounters();
    }
  }, [isDataLoaded, topTracks]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const hash = window.location.hash;
      if (hash) {
        const token = hash.match(/access_token=([^&]*)/);
        if (token) {
          const accessToken = token[1];
          setAuthToken(accessToken);
          AsyncStorage.setItem('spotify_token', accessToken);
          fetchUserProfile(accessToken);
          fetchTopTracks(accessToken);
          fetchRecentlyPlayed(accessToken);
          window.location.hash = '';
        }
      }
    }
  }, []);

  const addXP = async (amount) => {
    const newXP = xp + amount;
    let newLevel = level;
    let remainingXP = newXP;

    if (newXP >= 100) {
      newLevel = level + Math.floor(newXP / 100);
      remainingXP = newXP % 100;
      const levelUpBonus = 500;
      setCoins(prevCoins => prevCoins + levelUpBonus);
      alert(`Level Up! You are now level ${newLevel}! +${levelUpBonus} coins`);
    }

    setXp(remainingXP);
    setLevel(newLevel);

    await AsyncStorage.setItem('userData', JSON.stringify({
      level: newLevel,
      xp: remainingXP,
      coins,
      gems,
      collection,
      unlockedAchievements,
      collectedSongIds
    }));
  };

  const handleSongEncounter = (song) => {
    setPreviewSong(song);
    setIsPreviewVisible(true);
  };

  const handlePurchase = async (song) => {
    const cost = RARITY_COSTS[song.rarity];
    
    if (coins < cost) {
      alert(`Not enough coins! This ${song.rarity} song costs ${cost} coins`);
      return;
    }

    const newCoins = coins - cost;
    setCoins(newCoins);

    const updatedCollection = [...collection, song];
    setCollection(updatedCollection);

    const updatedCollectedSongs = [...collectedSongIds, song.id];
    setCollectedSongIds(updatedCollectedSongs);

    setSongEncounters(prevEncounters => 
      prevEncounters.filter(encounter => encounter.id !== song.id)
    );

    checkAchievements(updatedCollection);

    await AsyncStorage.setItem('userData', JSON.stringify({
      level,
      xp,
      coins: newCoins,
      gems,
      collection: updatedCollection,
      unlockedAchievements,
      collectedSongIds: updatedCollectedSongs
    }));

    setIsPreviewVisible(false);
    alert(`You collected ${song.name}! (-${cost} coins)`);
  };

  const checkAchievements = (updatedCollection) => {
    ACHIEVEMENTS.forEach(achievement => {
      if (!unlockedAchievements.includes(achievement.id)) {
        let requirement = 0;

        switch (achievement.type) {
          case 'collection':
            requirement = updatedCollection.length;
            break;
          case 'rare':
            requirement = updatedCollection.filter(song => song.rarity === 'Rare').length;
            break;
          case 'epic':
            requirement = updatedCollection.filter(song => song.rarity === 'Epic').length;
            break;
        }

        if (requirement >= achievement.requirement) {
          setUnlockedAchievements(prev => [...prev, achievement.id]);
          addXP(achievement.xpReward);
          alert(`Achievement Unlocked: ${achievement.title}! +${achievement.xpReward} XP`);
        }
      }
    });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('spotify_token');
      setAuthToken(null);
      setUserName('');
      setTopTracks([]);
      setRecentlyPlayed([]);
      setCollection([]);
      setSongEncounters([]);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(
        SCOPES.join(' ')
      )}`;

      if (Platform.OS === 'android') {
        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          REDIRECT_URI
        );
        
        if (result.type === 'success') {
          const url = result.url;
          const token = url.match(/access_token=([^&]*)/);
          if (token) {
            const accessToken = token[1];
            setAuthToken(accessToken);
            await AsyncStorage.setItem('spotify_token', accessToken);
            await fetchUserProfile(accessToken);
            await fetchTopTracks(accessToken);
            await fetchRecentlyPlayed(accessToken);
          }
        }
      } else {
        await Linking.openURL(authUrl);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to login. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const getAccessTokenFromUrl = (url) => {
    const match = url.match(/access_token=([^&]*)/);
    return match ? match[1] : null;
  };

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUserName(data.display_name);
      setUserImage(data.images?.[0]?.url);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchTopTracks = async (token) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=20', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data && data.items) {
        setTopTracks(data.items);
      } else {
        console.log('No top tracks data available:', data);
        setTopTracks([]);
      }
    } catch (error) {
      console.error('Error fetching top tracks:', error);
      setTopTracks([]);
    }
  };

  const fetchRecentlyPlayed = async (token) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=20', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data && data.items) {
        setRecentlyPlayed(data.items);
      } else {
        console.log('No recently played tracks available:', data);
        setRecentlyPlayed([]);
      }
    } catch (error) {
      console.error('Error fetching recently played tracks:', error);
      setRecentlyPlayed([]);
    }
  };

  const generateRandomEncounters = () => {
    if (!topTracks || topTracks.length === 0) {
      console.log('No top tracks available for encounters');
      return;
    }

    const availableTracks = topTracks.filter(track => !collectedSongIds.includes(track.id));

    const encounters = availableTracks.slice(0, 10).map((track) => {
      if (!track || !track.album || !track.album.images || track.album.images.length === 0) {
        return null;
      }

      return {
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        image: track.album.images[0].url,
        preview_url: track.preview_url,
        rarity: determineRarity(track.popularity),
        x: Math.random() * (screenWidth - 60),
        y: Math.random() * (screenHeight - 200),
      };
    }).filter(encounter => encounter !== null);

    if (encounters.length > 0) {
      setSongEncounters(encounters);
    }
  };

  const determineRarity = (popularity) => {
    if (popularity >= 90) return 'Mythic';
    if (popularity >= 80) return 'Legendary';
    if (popularity >= 70) return 'Epic';
    if (popularity >= 50) return 'Rare';
    return 'Common';
  };

  const refreshAvailableSongs = async () => {
    try {
      await fetchTopTracks(authToken);
      generateRandomEncounters();
    } catch (error) {
      console.error('Error refreshing songs:', error);
      alert('Failed to refresh songs. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Loading your music world...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {authToken ? (
        <>
          <ImageBackground
            source={require('./assets/images/map-background.jpg')}
            style={styles.mapBackground}
            resizeMode="cover"
          >
            <View style={styles.darkOverlay}>
              <View style={styles.header}>
                <View style={styles.userInfo}>
                  {userImage ? (
                    <Image source={{ uri: userImage }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person-circle" size={40} color="white" />
                    </View>
                  )}
                  <View style={styles.userTextInfo}>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.userName}>{userName}</Text>
                  </View>
                </View>

                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <Ionicons name="star" size={20} color="#FFD700" />
                    </View>
                    <View style={styles.statTextContainer}>
                      <Text style={styles.statLabel}>LEVEL</Text>
                      <Text style={styles.statValue}>{level}</Text>
                    </View>
                  </View>

                  <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <Ionicons name="logo-bitcoin" size={20} color="#FFA500" />
                    </View>
                    <View style={styles.statTextContainer}>
                      <Text style={styles.statLabel}>COINS</Text>
                      <Text style={styles.statValue}>{coins}</Text>
                    </View>
                  </View>

                  <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <Ionicons name="diamond" size={20} color="#00CED1" />
                    </View>
                    <View style={styles.statTextContainer}>
                      <Text style={styles.statLabel}>GEMS</Text>
                      <Text style={styles.statValue}>{gems}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {songEncounters.length > 0 ? (
              songEncounters.map((song) => (
                <TouchableOpacity
                  key={song.id}
                  style={[
                    styles.songEncounter,
                    { left: song.x, top: song.y },
                    { backgroundColor: rarityColors[song.rarity] }
                  ]}
                  onPress={() => handleSongEncounter(song)}
                >
                  <Image source={{ uri: song.image }} style={styles.songImage} />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noSongsContainer}>
                <Text style={styles.noSongsText}>
                  {collectedSongIds.length >= topTracks.length 
                    ? 'All songs collected!' 
                    : 'No songs available'}
                </Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={refreshAvailableSongs}
                >
                  <Text style={styles.retryButtonText}>
                    {collectedSongIds.length >= topTracks.length 
                      ? 'Check for New Songs' 
                      : 'Retry Loading Songs'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {currentSong && (
              <View style={styles.playerBar}>
                <Image
                  source={{ uri: currentSong.image }}
                  style={styles.currentSongImage}
                />
                <View style={styles.songInfo}>
                  <Text style={styles.currentSongTitle}>{currentSong.name}</Text>
                  <Text style={styles.currentSongArtist}>{currentSong.artist}</Text>
                </View>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => setIsPlaying(!isPlaying)}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={30}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.bottomNav}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setShowProfile(true)}
              >
                <Ionicons name="person" size={24} color="white" />
                <Text style={styles.navText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setShowAuction(true)}
              >
                <Ionicons name="trophy" size={24} color="white" />
                <Text style={styles.navText}>Collection</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navButton}
                onPress={handleLogout}
              >
                <Ionicons name="log-out" size={24} color="white" />
                <Text style={styles.navText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>

          <ProfileScreen
            visible={showProfile}
            onClose={() => setShowProfile(false)}
            userName={userName}
            userImage={userImage}
            level={level}
            xp={xp}
            coins={coins}
            gems={gems}
            collection={collection}
            unlockedAchievements={unlockedAchievements}
          />

          <CollectionScreen
            visible={showAuction}
            onClose={() => setShowAuction(false)}
            collection={collection}
          />

          <PreviewModal
            visible={isPreviewVisible}
            onClose={() => setIsPreviewVisible(false)}
            song={previewSong}
            onPurchase={() => handlePurchase(previewSong)}
          />
        </>
      ) : (
        <View style={styles.loginContainer}>
          <Text style={styles.title}>Welcome to SongSwap</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoggingIn}
          >
            <Ionicons name="musical-notes" size={24} color="white" />
            <Text style={styles.loginButtonText}>
              {isLoggingIn ? 'Connecting...' : 'Connect with Spotify'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191414',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  mapBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#1DB954',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userTextInfo: {
    marginLeft: 15,
  },
  welcomeText: {
    color: '#888',
    fontSize: 14,
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 10,
    marginTop: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 10,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
    color: '#888',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  songEncounter: {
    position: 'absolute',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  songImage: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  playerBar: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    height: 75,
    backgroundColor: 'rgba(29, 185, 84, 0.95)',
    borderRadius: 38,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  currentSongImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  songInfo: {
    flex: 1,
  },
  currentSongTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentSongArtist: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: 'rgba(0,0,0,0.95)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  navButton: {
    alignItems: 'center',
    padding: 8,
    minWidth: 80,
  },
  navText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    color: 'white',
    marginBottom: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(29, 185, 84, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: '#1DB954',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  noSongsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noSongsText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1DB954',
    padding: 15,
    borderRadius: 25,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#191414',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: '#1DB954',
  },
  achievementsSection: {
    padding: 20,
  },
  achievementsList: {
    maxHeight: 300,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    marginBottom: 10,
    opacity: 0.6,
  },
  achievementUnlocked: {
    opacity: 1,
    backgroundColor: 'rgba(29,185,84,0.1)',
  },
  achievementInfo: {
    flex: 1,
    marginLeft: 15,
  },
  achievementTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  achievementDescription: {
    color: '#888',
    fontSize: 14,
  },
  achievementXP: {
    color: '#1DB954',
    fontWeight: 'bold',
  },
  collectionStats: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  collectionTotal: {
    color: 'white',
    fontSize: 16,
  },
  collectionList: {
    flex: 1,
  },
  collectionItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  collectionItemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  collectionItemInfo: {
    marginLeft: 15,
    flex: 1,
  },
  collectionItemTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  collectionItemArtist: {
    color: '#888',
    fontSize: 14,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 5,
  },
  rarityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  previewModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
  },
  previewModalContent: {
    margin: 20,
    backgroundColor: '#191414',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  previewHeader: {
    width: '100%',
    alignItems: 'flex-end',
  },
  previewInfo: {
    alignItems: 'center',
    padding: 20,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  previewTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  previewArtist: {
    color: '#888',
    fontSize: 18,
    marginBottom: 20,
  },
  previewCost: {
    color: '#1DB954',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  purchaseButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});