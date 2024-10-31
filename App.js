// App.js
import React, { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, Text, Alert, StyleSheet, Dimensions, Image, Animated, ActivityIndicator, Platform,  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CollectionScreen from './src/screens/CollectionScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import GeneratorShopScreen from './src/screens/GeneratorShopScreen';
import { ResponseType, useAuthRequest } from 'expo-auth-session';
import {
  calculateCost,
  determineRarity,
  calculateXP,
  calculateLevel,
  calculateGeneratorCoins,
  getRandomPosition,
  GENERATOR_TYPES,
  INITIAL_GAME_STATE,
  createSaveData,
  loadSaveData
} from './src/utils/gameUtils';
import Svg, { Path } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import TradingScreen from './src/screens/TradingScreen';
import Navigation from './src/components/Navigation';
import ShopScreen from './src/screens/ShopScreen';

// Make sure to call this
WebBrowser.maybeCompleteAuthSession();

// Original Spotify config
const SPOTIFY_CLIENT_ID = '7ed969c99b8c4d1d846c3d9cfdb441f6';
const REDIRECT_URI = 'songswap://callback';

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

// Add this component above your App component
const LiquidBackground = () => {
  // Create multiple animation values for independent control
  const [xAnimation] = useState(new Animated.Value(0));
  const [yAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    // Horizontal movement - full width alternating directions
    Animated.loop(
      Animated.sequence([
        // Move left
        Animated.timing(xAnimation, {
          toValue: -1500,  // Almost full width of the SVG
          duration: 30000, // Slower for smoother movement
          useNativeDriver: false,
        }),
        // Move right
        Animated.timing(xAnimation, {
          toValue: 0,
          duration: 30000,
          useNativeDriver: false,
        })
      ])
    ).start();

    // Vertical movement
    Animated.loop(
      Animated.sequence([
        Animated.timing(yAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(yAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        })
      ])
    ).start();

    return () => {
      xAnimation.setValue(0);
      yAnimation.setValue(0);
    };
  }, []);

  // Vertical movements with different phases
  const translateY1 = yAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 10, 0],
  });

  const translateY2 = yAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [10, 0, 10],
  });

  const translateY3 = yAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [5, 15, 5],
  });

  return (
    <View style={styles.liquidBackground}>
      <Animated.View 
        style={[
          styles.liquidLayer,
          {
            transform: [
              { translateX: xAnimation }, 
              { translateY: translateY1 }
            ],
            bottom: -450,
          }
        ]}
      >
        <Svg height="100%" width="1600%" viewBox="0 0 1600 100" preserveAspectRatio="none">
          <Path
            d="M0,40 Q25,60 50,40 T100,40 T150,40 T200,40 T250,40 T300,40 T350,40 T400,40 T450,40 T500,40 T550,40 T600,40 T650,40 T700,40 T750,40 T800,40 T850,40 T900,40 T950,40 T1000,40 T1050,40 T1100,40 T1150,40 T1200,40 T1250,40 T1300,40 T1350,40 T1400,40 T1450,40 T1500,40 T1550,40 T1600,40 L1600,100 L0,100 Z"
            fill="#1DB954"
            fillOpacity="0.3"
          />
        </Svg>
      </Animated.View>

      <Animated.View 
        style={[
          styles.liquidLayer,
          {
            transform: [
              { translateX: xAnimation }, 
              { translateY: translateY2 }
            ],
            bottom: -475,
          }
        ]}
      >
        <Svg height="100%" width="1600%" viewBox="0 0 1600 100" preserveAspectRatio="none">
          <Path
            d="M0,35 Q25,55 50,35 T100,35 T150,35 T200,35 T250,35 T300,35 T350,35 T400,35 T450,35 T500,35 T550,35 T600,35 T650,35 T700,35 T750,35 T800,35 T850,35 T900,35 T950,35 T1000,35 T1050,35 T1100,35 T1150,35 T1200,35 T1250,35 T1300,35 T1350,35 T1400,35 T1450,35 T1500,35 T1550,35 T1600,35 L1600,100 L0,100 Z"
            fill="#1ed760"
            fillOpacity="0.3"
          />
        </Svg>
      </Animated.View>

      <Animated.View 
        style={[
          styles.liquidLayer,
          {
            transform: [
              { translateX: xAnimation }, 
              { translateY: translateY3 }
            ],
            bottom: -500,
          }
        ]}
      >
        <Svg height="100%" width="1600%" viewBox="0 0 1600 100" preserveAspectRatio="none">
          <Path
            d="M0,30 Q25,50 50,30 T100,30 T150,30 T200,30 T250,30 T300,30 T350,30 T400,30 T450,30 T500,30 T550,30 T600,30 T650,30 T700,30 T750,30 T800,30 T850,30 T900,30 T950,30 T1000,30 T1050,30 T1100,30 T1150,30 T1200,30 T1250,30 T1300,30 T1350,30 T1400,30 T1450,30 T1500,30 T1550,30 T1600,30 L1600,100 L0,100 Z"
            fill="#0099ff"
            fillOpacity="0.3"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

export default function App() {
  // State initialization
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [spotifyProfile, setSpotifyProfile] = useState(null);
  const [collection, setCollection] = useState([]);
  const [coins, setCoins] = useState(1000);
  const [gems, setGems] = useState(10);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [settings, setSettings] = useState({});
  const [generators, setGenerators] = useState({});
  const [songEncounters, setSongEncounters] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [topTracks, setTopTracks] = useState([]);

  // Modal states - all should be false by default
  const [showProfile, setShowProfile] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGeneratorShop, setShowGeneratorShop] = useState(false);
  const [showTrading, setShowTrading] = useState(false);
  const [showShop, setShowShop] = useState(false);

  // Add Spotify auth request
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: SPOTIFY_CLIENT_ID,
      scopes: ['user-read-email', 'user-read-private'],
      usePKCE: false,
      redirectUri: REDIRECT_URI,
      responseType: 'token',
    },
    discovery
  );

  // Add these state variables
  const [previewSound, setPreviewSound] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  // Add these near your other state declarations
  const [isLoading, setIsLoading] = useState(true);

  // Add these near your other state declarations
  const [saveInterval, setSaveInterval] = useState(null);

  // Add these state variables
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastProfileCheck, setLastProfileCheck] = useState(null);

  // Add this state to track if logout was intentional
  const [isIntentionalLogout, setIsIntentionalLogout] = useState(false);

  // Add these new state variables
  const [coinsPerSecond, setCoinsPerSecond] = useState(1); // Base rate
  const [lastCollectionTime, setLastCollectionTime] = useState(new Date());
  const [autoCollectorActive, setAutoCollectorActive] = useState(true);

  // Consolidate save function
  const saveGameData = async () => {
    if (!spotifyProfile?.id) return;
    
    try {
      const gameData = {
        level,
        xp,
        coins,
        gems,
        collection,
        lastSaved: new Date().toISOString()
      };

      await AsyncStorage.setItem(
        `@gameData_${spotifyProfile.id}`,
        JSON.stringify(gameData)
      );
      console.log('Game data saved successfully');
    } catch (error) {
      console.error('Error saving game data:', error);
    }
  };

  // Consolidate load function
  const loadGameData = async (userId) => {
    if (!userId || !isInitialized) return;
    
    try {
      const savedData = await AsyncStorage.getItem(`@gameData_${userId}`);
      
      if (savedData) {
        const data = JSON.parse(savedData);
        
        // Only update if there's actual data to load
        if (data.collection?.length > 0 || 
            data.coins !== 1000 || 
            data.level !== 1 || 
            data.gems !== 10) {
          
          setLevel(data.level || 1);
          setXp(data.xp || 0);
          setCoins(data.coins || 1000);
          setGems(data.gems || 10);
          setCollection(data.collection || []);
          
          setGameState(prevState => ({
            ...prevState,
            level: data.level || 1,
            xp: data.xp || 0,
            coins: data.coins || 1000,
            gems: data.gems || 10,
            collection: data.collection || [],
          }));
          
          console.log('Loaded existing game data');
        } else {
          console.log('No significant progress found, starting fresh');
        }
      }
    } catch (error) {
      console.error('Error loading game data:', error);
    }
  };

  // Start periodic saving
  useEffect(() => {
    if (spotifyProfile?.id) {
      // Initial load
      loadGameData(spotifyProfile.id);
      
      // Set up auto-save interval
      const interval = setInterval(() => {
        saveGameData();
      }, 30000); // 30 seconds
      
      setSaveInterval(interval);
      
      // Cleanup
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [spotifyProfile?.id]);

  // Update purchase handler
  const handlePurchaseSong = async (song) => {
    try {
      if (coins >= song.cost) {
        const newCoins = coins - song.cost;
        const newCollection = [...collection, {
          ...song,
          purchasedAt: new Date().toISOString()
        }];

        setCoins(newCoins);
        setCollection(newCollection);
        
        setGameState(prev => ({
          ...prev,
          coins: newCoins,
          collection: newCollection
        }));

        // Save immediately after purchase
        await saveGameData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error purchasing song:', error);
      return false;
    }
  };

  // Load user data
  const loadUserData = useCallback(async (userId) => {
    try {
      const storedData = await AsyncStorage.getItem(`userData_${userId}`);
      if (storedData) {
        const data = JSON.parse(storedData);
        // Update all the state with loaded data
        setLevel(data.level || 1);
        setXp(data.xp || 0);
        setCoins(data.coins || 1000);
        setGems(data.gems || 10);
        setCollection(data.collection || []);
        setGenerators(data.generators || {});
        setSettings(data.settings || {});
        
        // Update game state as well
        setGameState({
          level: data.level || 1,
          xp: data.xp || 0,
          coins: data.coins || 1000,
          gems: data.gems || 10,
          collection: data.collection || [],
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [setLevel, setXp, setCoins, setGems, setCollection, setGenerators, setSettings, setGameState]);

  // Fetch Spotify profile
  const fetchSpotifyProfile = useCallback(async (token) => {
    try {
      if (!token) return;
      
      console.log('Fetching profile...');
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      // Only proceed if we haven't already logged in
      if (!isLoggedIn) {
        console.log('Profile data:', data);
        setSpotifyProfile(data);
        
        // Fetch top tracks
        const tracksResponse = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=50', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const tracksData = await tracksResponse.json();
        setTopTracks(tracksData.items);
        
        await loadUserData(data.id);
        setIsLoggedIn(true);
        setAccessToken(token);
        console.log('Login complete, showing main screen');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [loadUserData]);

  // Simple login handler
  const handleLogin = async () => {
    try {
      console.log('Starting login process...');
      await promptAsync();
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to login. Please try again.');
    }
  };

  // Simple logout handler
  const handleForceLogout = async () => {
    try {
      // Save data before logging out
      if (spotifyProfile?.id) {
        await saveGameData();
      }
      
      setIsLoggedIn(false);
      setSpotifyProfile(null);
      setAccessToken(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Auth response handler
  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      console.log('Got access token:', access_token);
      
      const fetchUserProfile = async () => {
        try {
          const userResponse = await fetch('https://api.spotify.com/v1/me', {
            headers: { 
              'Authorization': `Bearer ${access_token}`
            }
          });

          if (!userResponse.ok) {
            throw new Error(`Profile fetch failed with status: ${userResponse.status}`);
          }

          const profile = await userResponse.json();
          setSpotifyProfile(profile);
          setAccessToken(access_token);
          setIsLoggedIn(true);
          
          // Load saved data
          await loadGameData(profile.id);
          
          // Generate initial encounters
          await generateRandomEncounters();
        } catch (error) {
          console.error('Profile fetch error:', error);
          Alert.alert('Login Error', 'Failed to connect to Spotify. Please try again.');
          setIsLoggedIn(false);
          setSpotifyProfile(null);
          setAccessToken(null);
        }
      };

      fetchUserProfile();
    } else if (response?.type === 'error') {
      console.log('Auth response error:', response.error); // Debug log
      Alert.alert(
        'Authentication Error',
        'Failed to login with Spotify. Please try again.'
      );
    }
  }, [response]);

  // Add handleSongPreview function
  const handleSongPreview = useCallback(async (song) => {
    try {
      // Stop any currently playing preview
      if (previewSound) {
        await previewSound.unloadAsync();
      }

      if (song.preview_url) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: song.preview_url },
          { shouldPlay: true }
        );
        setPreviewSound(sound);
        setSelectedSong(song);
        setIsPreviewVisible(true);

        // Add listener for when audio finishes playing
        sound.setOnPlaybackStatusUpdate(status => {
          if (status.didJustFinish) {
            sound.unloadAsync();
            setPreviewSound(null);
          }
        });
      } else {
        Alert.alert('Preview Unavailable', 'No preview available for this song.');
      }
    } catch (error) {
      console.error('Error playing preview:', error);
      Alert.alert('Error', 'Failed to play song preview.');
    }
  }, [previewSound]);

  // Add cleanup effect for audio
  useEffect(() => {
    return () => {
      if (previewSound) {
        previewSound.unloadAsync();
      }
    };
  }, [previewSound]);

  // Add handleSettingChange function
  const handleSettingChange = useCallback(async (key, value) => {
    try {
      const newSettings = {
        ...settings,
        [key]: value
      };
      setSettings(newSettings);

      // Save to AsyncStorage
      if (spotifyProfile?.id) {
        const userData = {
          level,
          xp,
          coins,
          gems,
          collection,
          generators,
          settings: newSettings
        };
        await AsyncStorage.setItem(`userData_${spotifyProfile.id}`, JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [settings, spotifyProfile, level, xp, coins, gems, collection, generators]);

  // Add handlePurchaseGenerator function
  const handlePurchaseGenerator = useCallback(async (generatorType) => {
    try {
      const generator = GENERATOR_TYPES[generatorType];
      if (!generator) {
        Alert.alert('Error', 'Invalid generator type');
        return false;
      }

      if (gems < generator.cost) {
        Alert.alert('Not enough gems!', 'Keep collecting gems to purchase this generator.');
        return false;
      }

      // Update gems and generators
      setGems(prevGems => prevGems - generator.cost);
      setGenerators(prevGenerators => ({
        ...prevGenerators,
        [generator.id]: (prevGenerators[generator.id] || 0) + 1
      }));

      // Save updated user data
      if (spotifyProfile?.id) {
        const userData = {
          level,
          xp,
          coins,
          gems: gems - generator.cost,
          collection,
          generators: {
            ...generators,
            [generator.id]: (generators[generator.id] || 0) + 1
          },
          settings
        };
        await AsyncStorage.setItem(`userData_${spotifyProfile.id}`, JSON.stringify(userData));
      }

      // Start generating coins if this is the first generator
      startGeneratingCoins();

      Alert.alert('Success!', `You've purchased a ${generator.name}!`);
      return true;
    } catch (error) {
      console.error('Error purchasing generator:', error);
      Alert.alert('Error', 'Failed to purchase generator. Please try again.');
      return false;
    }
  }, [gems, generators, spotifyProfile, level, xp, coins, collection, settings]);

  // Add coin generation functionality
  const startGeneratingCoins = useCallback(() => {
    const interval = setInterval(() => {
      let totalCoinsPerSecond = 0;
      
      // Calculate coins per second from all generators
      Object.entries(generators).forEach(([generatorId, count]) => {
        const generator = Object.values(GENERATOR_TYPES).find(g => g.id === generatorId);
        if (generator) {
          totalCoinsPerSecond += generator.coinsPerSecond * count;
        }
      });

      if (totalCoinsPerSecond > 0) {
        setCoins(prevCoins => prevCoins + totalCoinsPerSecond);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [generators]);

  // Add this function to handle preview closing
  const handleClosePreview = useCallback(async () => {
    if (previewSound) {
      await previewSound.unloadAsync();
    }
    setPreviewSound(null);
    setSelectedSong(null);
    setIsPreviewVisible(false);
  }, [previewSound]);

  const [gameState, setGameState] = useState({
    level: 1,
    xp: 0,
    coins: 1000,
    gems: 10,
    collection: [],
    // ... other state
  });

  const handleUpdateCoins = (newCoins) => {
    setGameState(prev => ({
      ...prev,
      coins: newCoins
    }));
  };

  const handleUpdateCollection = (newCollection) => {
    setGameState(prev => ({
      ...prev,
      collection: newCollection
    }));
  };

  // Create a stats object that combines game state and additional stats
  const stats = {
    level: gameState.level,
    xp: gameState.xp,
    coins: gameState.coins,
    gems: gameState.gems,
    songsCollected: gameState.collection.length,
    playTime: 0, // You can track this if needed
  };

  // Add these functions to handle user data persistence
  const saveUserData = async (userId, data) => {
    try {
      const userData = {
        level: data.level,
        xp: data.xp,
        coins: data.coins,
        gems: data.gems,
        collection: data.collection,
        generators: data.generators,
        settings: data.settings,
        lastSaved: new Date().toISOString()
      };
      await AsyncStorage.setItem(`userData_${userId}`, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  // Consolidate auth checking into a single function
  const checkAuthAndProfile = async (token) => {
    // Don't check if we've checked in the last 5 minutes
    const now = Date.now();
    if (lastProfileCheck && (now - lastProfileCheck) < 300000) {
      return true;
    }

    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Auth check failed');
      }

      setLastProfileCheck(now);
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  };

  // Update the auth response handler
  useEffect(() => {
    if (response?.type === 'success' && !isInitialized && !isIntentionalLogout) {
      const { access_token } = response.params;
      
      const initializeApp = async () => {
        try {
          setAccessToken(access_token);
          
          const userResponse = await fetch('https://api.spotify.com/v1/me', {
            headers: { 
              'Authorization': `Bearer ${access_token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!userResponse.ok) {
            throw new Error('Failed to fetch profile');
          }

          const profile = await userResponse.json();
          setSpotifyProfile(profile);
          setIsLoggedIn(true);
          setIsInitialized(true);
          
          // Load saved data
          await loadGameData(profile.id);
          console.log('App initialized successfully');
          
        } catch (error) {
          console.error('Initialization Error:', error);
          handleForceLogout();
        }
      };

      initializeApp();
    }
  }, [response, isInitialized, isIntentionalLogout]);

  // Update the auto-save functionality
  useEffect(() => {
    let saveInterval;
    
    if (spotifyProfile?.id && isInitialized) {
      saveInterval = setInterval(async () => {
        const isAuthValid = await checkAuthAndProfile(accessToken);
        
        if (isAuthValid) {
          await saveGameData();
        } else {
          clearInterval(saveInterval);
          handleForceLogout();
        }
      }, 30000);
    }

    return () => {
      if (saveInterval) {
        clearInterval(saveInterval);
      }
    };
  }, [spotifyProfile?.id, isInitialized, accessToken]);

  // Add this effect to load saved data on startup
  useEffect(() => {
    const loadSavedData = async () => {
      if (spotifyProfile?.id) {
        try {
          const storageKey = `userData_${spotifyProfile.id}`;
          const savedData = await AsyncStorage.getItem(storageKey);
          
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            
            // Update all relevant state
            setGameState(prevState => ({
              ...prevState,
              level: parsedData.level || 1,
              xp: parsedData.xp || 0,
              coins: parsedData.coins || 1000,
              gems: parsedData.gems || 10,
              collection: parsedData.collection || [],
            }));

            setCollection(parsedData.collection || []);
            setCoins(parsedData.coins || 1000);
            setGems(parsedData.gems || 10);
            setLevel(parsedData.level || 1);
            setXp(parsedData.xp || 0);
          }
        } catch (error) {
          console.error('Error loading saved data:', error);
        }
      }
    };

    loadSavedData();
  }, [spotifyProfile?.id]);

  // Add this to handle updates from screens
  const handleStateUpdate = async (updates) => {
    if (spotifyProfile?.id) {
      try {
        const storageKey = `userData_${spotifyProfile.id}`;
        const existingData = await AsyncStorage.getItem(storageKey);
        const currentData = existingData ? JSON.parse(existingData) : {};
        
        const updatedData = {
          ...currentData,
          ...updates,
          lastUpdated: new Date().toISOString()
        };

        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedData));
        
        // Update local state
        setGameState(prevState => ({
          ...prevState,
          ...updates
        }));
      } catch (error) {
        console.error('Error updating game state:', error);
      }
    }
  };

  // Add this debug function to check data
  const checkCurrentData = async () => {
    if (spotifyProfile?.id) {
      try {
        const key = `@gameData_${spotifyProfile.id}`;
        const savedData = await AsyncStorage.getItem(key);
        console.log('Current saved data:', JSON.parse(savedData));
      } catch (error) {
        console.error('Error checking data:', error);
      }
    }
  };

  // Add this debug function to check current save state
  const checkSaveState = async () => {
    if (spotifyProfile?.id) {
      try {
        const savedData = await AsyncStorage.getItem(`@gameData_${spotifyProfile.id}`);
        console.log('Current saved data:', JSON.parse(savedData));
      } catch (error) {
        console.error('Error checking save state:', error);
      }
    }
  };

  // Add this debug function
  const debugCheckSave = async () => {
    if (spotifyProfile?.id) {
      try {
        const savedData = await AsyncStorage.getItem(`@gameData_${spotifyProfile.id}`);
        console.log('Current saved data:', JSON.parse(savedData));
      } catch (error) {
        console.error('Error checking save:', error);
      }
    }
  };

  // Add this function back
  const generateRandomEncounters = useCallback(async () => {
    if (!accessToken) return;

    try {
      const response = await fetch('https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tracks');
      }

      const data = await response.json();
      const tracks = data.items.map(item => item.track).filter(track => track.preview_url);

      // Generate 4 random encounters
      const encounters = tracks.sort(() => Math.random() - 0.5).slice(0, 4).map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        preview_url: track.preview_url,
        image: track.album.images[0].url,
        popularity: track.popularity,
        cost: Math.floor((track.popularity * 10) + 100),
        x: Math.random() * (Dimensions.get('window').width - 100),
        y: Math.random() * (Dimensions.get('window').height - 300),
      }));

      setSongEncounters(encounters);
    } catch (error) {
      console.error('Error generating encounters:', error);
      Alert.alert('Error', 'Failed to refresh songs. Please try again.');
    }
  }, [accessToken]);

  // Add this helper function to check auth state
  const checkAuthState = async (token) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  // Add an effect to handle auth state persistence
  useEffect(() => {
    if (accessToken) {
      const validateAuth = async () => {
        const isValid = await checkAuthState(accessToken);
        if (!isValid) {
          console.log('Auth token invalid, logging out'); // Debug log
          handleForceLogout();
        }
      };
      validateAuth();
    }
  }, [accessToken]);

  // Add this handler
  const handleTrade = async (targetSong, offeredSongs) => {
    try {
      // Remove offered songs from collection
      const newCollection = collection.filter(
        song => !offeredSongs.some(offered => offered.id === song.id)
      );

      // Add the target song to collection
      newCollection.push({
        ...targetSong,
        purchasedAt: new Date().toISOString(),
        obtainedBy: 'trade'
      });

      // Update collection state
      setCollection(newCollection);

      // Save to AsyncStorage
      await saveGameState({
        collection: newCollection
      });

      // Show success message
      Alert.alert(
        'Trade Successful!',
        `You traded ${offeredSongs.length} song${offeredSongs.length > 1 ? 's' : ''} for "${targetSong.name}"`,
        [{ text: 'OK' }]
      );

      // Close trading screen
      setShowTrading(false);

    } catch (error) {
      console.error('Trade error:', error);
      Alert.alert(
        'Trade Failed',
        'There was an error processing your trade. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Add this to check if the button is working
  const handleShowTrade = () => {
    console.log('Trade button pressed');  // Debug log
    setShowTrading(true);
  };

  // Add this function near your other state management functions
  const saveGameState = async (updates) => {
    try {
      // Get the storage key based on the user's Spotify ID
      const storageKey = `userData_${spotifyProfile?.id}`;
      
      // Get existing data
      const existingData = await AsyncStorage.getItem(storageKey);
      const currentData = existingData ? JSON.parse(existingData) : {};
      
      // Merge existing data with updates
      const updatedData = {
        ...currentData,
        ...updates,
        lastUpdated: new Date().toISOString()
      };

      // Save to AsyncStorage
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedData));
      
      console.log('Game state saved successfully');
    } catch (error) {
      console.error('Error saving game state:', error);
      throw error; // Rethrow the error to be caught by the trade handler
    }
  };

  // Add this useEffect for the coin generation
  useEffect(() => {
    let intervalId;

    if (autoCollectorActive && isLoggedIn) {
      // Update coins every second
      intervalId = setInterval(async () => {
        const currentTime = new Date();
        const timeDiff = (currentTime - new Date(lastCollectionTime)) / 1000; // in seconds
        const newCoins = Math.floor(timeDiff * coinsPerSecond);
        
        if (newCoins > 0) {
          setCoins(prevCoins => prevCoins + newCoins);
          setLastCollectionTime(currentTime);
          
          // Save to AsyncStorage
          await saveGameState({
            coins,
            lastCollectionTime: currentTime,
            coinsPerSecond
          });
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoCollectorActive, isLoggedIn, coinsPerSecond, lastCollectionTime]);

  // Add this function to calculate offline earnings when app starts
  const calculateOfflineEarnings = async () => {
    if (!isLoggedIn) return;

    try {
      const currentTime = new Date();
      const timeDiff = (currentTime - new Date(lastCollectionTime)) / 1000;
      const offlineEarnings = Math.floor(timeDiff * coinsPerSecond);

      if (offlineEarnings > 0) {
        setCoins(prevCoins => prevCoins + offlineEarnings);
        setLastCollectionTime(currentTime);

        // Show offline earnings notification
        Alert.alert(
          'Welcome Back!',
          `You earned ${offlineEarnings} coins while away!`,
          [{ text: 'Collect' }]
        );

        await saveGameState({
          coins: coins + offlineEarnings,
          lastCollectionTime: currentTime
        });
      }
    } catch (error) {
      console.error('Error calculating offline earnings:', error);
    }
  };

  // Add this to your initial useEffect when app loads
  useEffect(() => {
    const initializeGame = async () => {
      // ... your existing initialization code ...
      
      // Calculate offline earnings
      await calculateOfflineEarnings();
    };

    initializeGame();
  }, [isLoggedIn]);

  // Add purchase handler
  const handlePurchase = async (item) => {
    try {
      // Deduct currency
      if (item.currency === 'gems') {
        setGems(prev => prev - item.price);
      } else {
        setCoins(prev => prev - item.price);
      }

      // Add to collection
      const newSong = {
        ...item,
        purchasedAt: new Date().toISOString(),
        obtainedBy: 'shop'
      };

      setCollection(prev => [...prev, newSong]);

      // Save game state
      await saveGameState({
        collection: [...collection, newSong],
        coins: item.currency === 'coins' ? coins - item.price : coins,
        gems: item.currency === 'gems' ? gems - item.price : gems
      });

      Alert.alert('Success', `Successfully purchased "${item.name}"!`);
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'Failed to complete purchase');
    }
  };

  return (
    <View style={styles.container}>
      {!isLoggedIn ? (
        <View style={styles.loginContainer}>
          <LiquidBackground />
          <View style={styles.contentContainer}>
            <Image 
              source={require('./assets/images/logo.png')} 
              style={styles.logo}
            />
            <Text style={styles.welcomeText}>Welcome to SongSwap</Text>
            <Text style={styles.subtitleText}>
              Collect and discover new music
            </Text>
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
            >
              <Image 
                source={{ uri: 'https://cdn.iconscout.com/icon/free/png-256/spotify-11-432546.png' }}
                style={styles.spotifyIcon}
              />
              <Text style={styles.buttonText}>
                Login with Spotify
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <HomeScreen
            spotifyProfile={spotifyProfile}
            level={level}
            xp={xp}
            coins={coins}
            gems={gems}
            songEncounters={songEncounters}
            collection={collection}
            onPurchaseSong={handlePurchaseSong}
            onShowCollection={() => setShowCollection(true)}
            onShowSettings={() => setShowSettings(true)}
            onShowProfile={() => setShowProfile(true)}
            onRefreshSongs={generateRandomEncounters}
            onSongPress={handleSongPreview}
            onUpdateCoins={async (newCoins) => {
              setCoins(newCoins);
              await saveGameData();
            }}
            onUpdateCollection={async (newCollection) => {
              setCollection(newCollection);
              await saveGameData();
            }}
            stats={stats} // Pass the stats object
          />

          {showProfile && (
            <ProfileScreen 
              isVisible={showProfile}
              onClose={() => setShowProfile(false)}
              profile={spotifyProfile}
              stats={{
                level,
                xp,
                coins,
                gems,
                collection: gameState.collection || []
              }}
            />
          )}

          {showCollection && (
            <CollectionScreen 
              isVisible={showCollection}
              onClose={() => setShowCollection(false)}
              collection={collection}
              onSongPress={handleSongPreview}
            />
          )}

          {showSettings && (
            <SettingsScreen 
              visible={showSettings}
              onClose={() => setShowSettings(false)}
              settings={settings}
              onSettingChange={handleSettingChange}
              onLogout={handleForceLogout}
              stats={stats} // Pass the stats object here too
            />
          )}

          {showGeneratorShop && (
            <GeneratorShopScreen 
              isVisible={showGeneratorShop}
              onClose={() => setShowGeneratorShop(false)}
              gems={gems}
              onPurchase={handlePurchaseGenerator}
              ownedGenerators={generators}
              generatorTypes={GENERATOR_TYPES}
            />
          )}

          <TradingScreen
            isVisible={showTrading}
            onClose={() => setShowTrading(false)}
            collection={collection}
            spotifyToken={accessToken}
            onTrade={handleTrade}
          />

          <Navigation
            onShowCollection={() => setShowCollection(true)}
            onShowProfile={() => setShowProfile(true)}
            onShowSettings={() => setShowSettings(true)}
            onShowTrade={() => setShowTrading(true)}
            onRefreshSongs={generateRandomEncounters}
          />

          <ShopScreen
            isVisible={showShop}
            onClose={() => setShowShop(false)}
            coins={coins}
            gems={gems}
            onPurchase={handlePurchase}
            spotifyToken={accessToken}
            collection={collection}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1128',
  },
  loginContainer: {
    flex: 1,
    backgroundColor: '#0A1128',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 2,
  },
  liquidBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  liquidLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '100%',
  },
  waveContainer: {
    flexDirection: 'row',
    width: '200%',  // Double width to hold both SVGs
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
    zIndex: 3,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    zIndex: 3,
  },
  subtitleText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 40,
    textAlign: 'center',
    opacity: 0.8,
    zIndex: 3,
  },
  loginButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    maxWidth: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 3,
  },
  spotifyIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});