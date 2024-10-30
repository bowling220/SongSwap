// App.js
import React, { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, Text, Alert, StyleSheet, Dimensions } from 'react-native';
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

// Add Spotify config directly
const SPOTIFY_CLIENT_ID = '7ed969c99b8c4d1d846c3d9cfdb441f6';

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
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

  // Add Spotify auth request
  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: SPOTIFY_CLIENT_ID,
      scopes: ['user-read-email', 'user-library-read', 'user-top-read'],
      usePKCE: false,
      redirectUri: 'songswap://callback'  // Update this with your Expo development URL
    },
    discovery
  );

  // Add these state variables
  const [previewSound, setPreviewSound] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  // Handle song purchase
  const handlePurchaseSong = useCallback(async (song) => {
    try {
      if (!song?.cost || coins < song.cost) {
        Alert.alert('Not enough coins!', 'Keep collecting coins to purchase this song.');
        return false;
      }

      const newCoins = coins - song.cost;
      const newCollection = [...collection, {
        ...song,
        purchasedAt: new Date().toISOString()
      }];

      setCoins(newCoins);
      setCollection(newCollection);

      // Add XP
      const xpGained = 50;
      const newXp = xp + xpGained;
      const xpNeeded = level * 100;

      if (newXp >= xpNeeded) {
        setLevel(prev => prev + 1);
        setXp(newXp - xpNeeded);
        setGems(prev => prev + 5);
        Alert.alert('Level Up!', `You've reached level ${level + 1}!\nReceived: 5 gems`);
      } else {
        setXp(newXp);
      }

      // Save data
      if (spotifyProfile?.id) {
        const userData = {
          level,
          xp: newXp,
          coins: newCoins,
          gems,
          collection: newCollection,
          generators,
          settings
        };
        await AsyncStorage.setItem(`userData_${spotifyProfile.id}`, JSON.stringify(userData));
      }

      Alert.alert('Success!', `You've added "${song.name}" to your collection!`);
      return true;
    } catch (error) {
      console.error('Error purchasing song:', error);
      Alert.alert('Error', 'Failed to purchase song. Please try again.');
      return false;
    }
  }, [coins, collection, level, xp, gems, generators, settings, spotifyProfile]);

  // Load user data
  const loadUserData = useCallback(async () => {
    try {
      if (!spotifyProfile?.id) return;
      
      const storedData = await AsyncStorage.getItem(`userData_${spotifyProfile.id}`);
      if (storedData) {
        const data = JSON.parse(storedData);
        setLevel(data.level || 1);
        setXp(data.xp || 0);
        setCoins(data.coins || 1000);
        setGems(data.gems || 10);
        setCollection(data.collection || []);
        setGenerators(data.generators || {});
        setSettings(data.settings || {});
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [spotifyProfile]);

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
        
        await loadUserData();
        setIsLoggedIn(true);
        setAccessToken(token);
        console.log('Login complete, showing main screen');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [loadUserData]);

  // Add handleLogin function
  const handleLogin = useCallback(async () => {
    try {
      console.log('Starting login...');
      const result = await promptAsync({
        useProxy: false,
        showInRecents: true,
        extraParams: {
          show_dialog: 'true'
        }
      });
      
      console.log('Login result:', result);
      
      if (result.type === 'success') {
        console.log('Login successful, token:', result.params.access_token);
        const { access_token } = result.params;
        await fetchSpotifyProfile(access_token);
        
        // Fetch top tracks after successful login
        try {
          const tracksResponse = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=50', {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          });
          const tracksData = await tracksResponse.json();
          setTopTracks(tracksData.items);
        } catch (error) {
          console.error('Error fetching top tracks:', error);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  }, [promptAsync, fetchSpotifyProfile]);

  // Add auth response handler
  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      fetchSpotifyProfile(access_token);
    }
  }, [response, fetchSpotifyProfile]);

  // Add force logout handler
  const handleForceLogout = useCallback(async () => {
    try {
      if (spotifyProfile?.id) {
        await AsyncStorage.removeItem(`userData_${spotifyProfile.id}`);
      }
      setIsLoggedIn(false);
      setSpotifyProfile(null);
      setCollection([]);
      setCoins(1000);
      setGems(10);
      setLevel(1);
      setXp(0);
      setSettings({});
      setGenerators({});
      setShowProfile(false);
      setShowCollection(false);
      setShowSettings(false);
      setShowGeneratorShop(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, [spotifyProfile]);

  // Add generateRandomEncounters function
  const generateRandomEncounters = useCallback(() => {
    if (!topTracks || !Array.isArray(topTracks)) return;
    
    const availableTracks = topTracks.filter(track => 
      !collection.some(collected => collected.id === track.id)
    );

    const encounters = availableTracks.slice(0, 5).map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      image: track.album.images[0].url,
      preview_url: track.preview_url,
      rarity: determineRarity(track.popularity),
      cost: calculateCost(track.popularity),
      x: Math.random() * (Dimensions.get('window').width - 80),
      y: Math.random() * (Dimensions.get('window').height - 300),
    }));

    setSongEncounters(encounters);
  }, [topTracks, collection]);

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

  return (
    <View style={styles.container}>
      {!isLoggedIn ? (
        <View style={styles.loginContainer}>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Login with Spotify</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <HomeScreen
            spotifyProfile={spotifyProfile}
            level={gameState.level}
            xp={gameState.xp}
            coins={gameState.coins}
            gems={gameState.gems}
            songEncounters={songEncounters}
            onPurchaseSong={handlePurchaseSong}
            onShowCollection={() => setShowCollection(true)}
            onShowSettings={() => setShowSettings(true)}
            onShowProfile={() => setShowProfile(true)}
            onShowShop={() => setShowGeneratorShop(true)}
            onRefreshSongs={generateRandomEncounters}
            onSongPress={handleSongPreview}
            collection={gameState.collection || []}
            onUpdateCoins={(newCoins) => 
              setGameState(prev => ({ ...prev, coins: newCoins }))
            }
            onUpdateCollection={(newCollection) => 
              setGameState(prev => ({ ...prev, collection: newCollection }))
            }
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191414',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});