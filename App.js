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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons'; // Assuming you're using Expo

const CLIENT_ID = '7ed969c99b8c4d1d846c3d9cfdb441f6';
const REDIRECT_URI = Platform.select({
  web: window.location.origin + '/callback',
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

export default function App() {
  const [authToken, setAuthToken] = useState(null);
  const [userName, setUserName] = useState('');
  const [topTracks, setTopTracks] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [collection, setCollection] = useState([]);

  const [currentSong, setCurrentSong] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showAuction, setShowAuction] = useState(false);
  const [coins, setCoins] = useState(1000);
  const [gems, setGems] = useState(50);

  const [songEncounters, setSongEncounters] = useState([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const rarityColors = {
    Common: '#a0a0a0',
    Rare: '#4a90e2',
    Epic: '#9b59b6',
  };

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('spotify_token');
        if (token) {
          setAuthToken(token);
          await fetchUserProfile(token);
          await fetchTopTracks(token);
          await fetchRecentlyPlayed(token);
        }
      } catch (error) {
        console.error('Error loading token:', error);
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
          // Clear the hash from the URL
          window.location.hash = '';
        }
      }
    }
  }, []);

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
    if (isLoggingIn) return;

    try {
      setIsLoggingIn(true);
      
      const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join('%20')}`;

      if (Platform.OS === 'web') {
        // For web, use window.open directly
        window.location.href = authUrl;
      } else {
        // For mobile platforms, use WebBrowser
        await WebBrowser.maybeCompleteAuthSession();
        
        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          REDIRECT_URI
        );

        if (result.type === 'success' && result.url) {
          const token = getAccessTokenFromUrl(result.url);
          if (token) {
            setAuthToken(token);
            await AsyncStorage.setItem('spotify_token', token);
            await fetchUserProfile(token);
            await fetchTopTracks(token);
            await fetchRecentlyPlayed(token);
            alert('Logged in successfully!');
          } else {
            alert('Failed to get the access token. Please try again.');
          }
        } else {
          alert('Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Login error: ' + error.message);
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
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchTopTracks = async (token) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=10', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTopTracks(data.items);

      // Update songEncounters with top tracks
      setSongEncounters((prevEncounters) => [
        ...prevEncounters,
        ...data.items.map((item) => ({
          id: item.id,
          name: item.name,
          artist: item.artists[0].name,
          x: Math.random() * (screenWidth - 60), // Adjust for icon size
          y: Math.random() * (screenHeight - 160), // Adjust for player bar and top
          rarity: 'Common', // You can set rarity based on some criteria
          count: 0,
          album: item.album,
        })),
      ]);
    } catch (error) {
      console.error('Error fetching top tracks:', error);
    }
  };

  const fetchRecentlyPlayed = async (token) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=10', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setRecentlyPlayed(data.items.map((item) => item.track));

      // Update songEncounters with recently played tracks
      setSongEncounters((prevEncounters) => [
        ...prevEncounters,
        ...data.items.map((item) => ({
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists[0].name,
          x: Math.random() * (screenWidth - 60),
          y: Math.random() * (screenHeight - 160),
          rarity: 'Common',
          count: 0,
          album: item.track.album,
        })),
      ]);
    } catch (error) {
      console.error('Error fetching recently played tracks:', error);
    }
  };

  const addToCollection = (track) => {
    if (!collection.some((item) => item.id === track.id)) {
      setCollection((prevCollection) => [...prevCollection, track]);
    }
  };

  const handleSongEncounter = (song) => {
    setCurrentSong(song);
    setSongEncounters((prevSongs) =>
      prevSongs.map((s) => (s.id === song.id ? { ...s, count: s.count + 1 } : s))
    );
    addToCollection(song);
  };

  return (
    <View style={styles.container}>
      {authToken ? (
        <>
          {/* Map View (simulated with a background image) */}
          <Image
            source={{ uri: 'https://example.com/map-background.jpg' }}
            style={styles.mapBackground}
          />

          {/* Song Encounters */}
          {songEncounters.map((song) => (
            <TouchableOpacity
              key={song.id}
              style={[styles.songEncounter, { left: song.x, top: song.y }]}
              onPress={() => handleSongEncounter(song)}
            >
              <Ionicons name="musical-notes" size={30} color="white" />
            </TouchableOpacity>
          ))}

          {/* Player Control Bar */}
          <View style={styles.playerBar}>
            {currentSong ? (
              <>
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle}>{currentSong.name}</Text>
                  <Text style={styles.artistName}>{currentSong.artist}</Text>
                  <View style={styles.songMeta}>
                    <View
                      style={[
                        styles.rarityBadge,
                        { backgroundColor: rarityColors[currentSong.rarity] },
                      ]}
                    >
                      <Text style={styles.rarityText}>{currentSong.rarity}</Text>
                    </View>
                    <Text style={styles.countText}>{currentSong.count} collected</Text>
                  </View>
                </View>
                <View style={styles.controls}>
                  <TouchableOpacity>
                    <Ionicons name="play-skip-back" size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.playButton}>
                    <Ionicons name="play" size={24} color="black" />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Ionicons name="play-skip-forward" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={styles.noSongText}>Tap on a song to start playing</Text>
            )}
          </View>

          {/* Bottom Navigation Bar */}
          <View style={styles.bottomNav}>
            <TouchableOpacity 
              style={styles.navButton} 
              onPress={() => setShowProfile(true)}
            >
              <Ionicons name="person-circle-outline" size={24} color="white" />
              <Text style={styles.navButtonText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => setShowAuction(true)}
            >
              <Ionicons name="hammer-outline" size={24} color="white" />
              <Text style={styles.navButtonText}>Auction</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="white" />
              <Text style={styles.navButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showProfile}
            onRequestClose={() => setShowProfile(false)}
          >
            <ScrollView contentContainerStyle={styles.modalContainer}>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Profile</Text>
                <View style={styles.profileInfo}>
                  <Ionicons name="person-circle" size={64} color="gray" />
                  <Text style={styles.username}>{userName}</Text>
                  <Text style={styles.level}>Level 10</Text>
                </View>
                <View style={styles.currencyInfo}>
                  <View style={styles.currencyItem}>
                    <Ionicons name="logo-bitcoin" size={24} color="gold" />
                    <Text style={styles.currencyText}>{coins}</Text>
                  </View>
                  <View style={styles.currencyItem}>
                    <Ionicons name="diamond" size={24} color="blue" />
                    <Text style={styles.currencyText}>{gems}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowProfile(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.logoutButton} 
                  onPress={() => {
                    handleLogout();
                    setShowProfile(false);
                  }}
                >
                  <Ionicons name="log-out-outline" size={24} color="white" />
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Modal>

          {/* Auction Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showAuction}
            onRequestClose={() => setShowAuction(false)}
          >
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Song Auction</Text>
              <ScrollView style={styles.auctionList}>
                {songEncounters.map((song) => (
                  <View key={song.id} style={styles.auctionItem}>
                    <View>
                      <Text style={styles.auctionSongTitle}>{song.name}</Text>
                      <Text style={styles.auctionArtistName}>{song.artist}</Text>
                    </View>
                    <View
                      style={[
                        styles.rarityBadge,
                        { backgroundColor: rarityColors[song.rarity] },
                      ]}
                    >
                      <Text style={styles.rarityText}>{song.rarity}</Text>
                    </View>
                    <TouchableOpacity style={styles.bidButton}>
                      <Text style={styles.bidButtonText}>Bid</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowAuction(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </>
      ) : (
        <View style={styles.loginContainer}>
          <Text style={styles.title}>Login to Spotify</Text>
          <Button 
            title="Login with Spotify" 
            onPress={handleLogin}
            disabled={isLoggingIn} 
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Map Background
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  // Song Encounter
  songEncounter: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Player Bar
  playerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  artistName: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  songMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 10,
  },
  rarityText: {
    color: 'white',
    fontSize: 12,
  },
  countText: {
    color: 'white',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  noSongText: {
    color: 'white',
    fontSize: 16,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  level: {
    fontSize: 16,
    color: 'gray',
  },
  currencyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyText: {
    marginLeft: 5,
    fontSize: 18,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    marginTop: 20,
    elevation: 2,
    width: '100%',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  auctionList: {
    width: '100%',
    maxHeight: 300,
  },
  auctionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  auctionSongTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  auctionArtistName: {
    fontSize: 14,
    color: 'gray',
  },
  bidButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
  },
  bidButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Title Styles
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
    width: '100%',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 100, // Position above the player bar
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 5,
  },

  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  navButtonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
});

//INVALID_CLIENT: Invalid redirect URI
//this hapens when we try to go back to the app from the browser
//to fix this, we need to add the redirect uri to the app.json file
//and make sure it matches the one we used in the spotify developer dashboard