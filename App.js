// App.js
import React, { useState, useEffect } from 'react';
import { AppState, Button, View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

const CLIENT_ID = '7ed969c99b8c4d1d846c3d9cfdb441f6';
const REDIRECT_URI = 'exp://localhost:19000';

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

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('spotify_token');
      setAuthToken(null);
      setUserName('');
      setTopTracks([]);
      setRecentlyPlayed([]);
      setCollection([]);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join('%20')}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

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
    } catch (error) {
      console.error('Error during login:', error);
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
      setRecentlyPlayed(data.items.map(item => item.track));
    } catch (error) {
      console.error('Error fetching recently played tracks:', error);
    }
  };

  const addToCollection = (track) => {
    if (!collection.some((item) => item.id === track.id)) {
      setCollection((prevCollection) => [...prevCollection, track]);
    }
  };

  const renderTrackCard = ({ item }) => {
    const imageUrl = item.album?.images?.[0]?.url || 'https://via.placeholder.com/150';
    const trackName = item.name || 'Unknown Track';
    const artistName = item.artists?.[0]?.name || 'Unknown Artist';

    return (
      <View style={styles.card}>
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
        <Text style={styles.cardTitle}>{trackName}</Text>
        <Text style={styles.cardArtist}>{artistName}</Text>
        <TouchableOpacity style={styles.collectButton} onPress={() => addToCollection(item)}>
          <Text style={styles.collectButtonText}>Collect</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spotify Profile</Text>
      {authToken ? (
        <>
          <Text style={styles.profileText}>Hello, {userName}!</Text>

          <Text style={styles.sectionTitle}>Your Top Tracks</Text>
          <FlatList
            data={topTracks}
            renderItem={renderTrackCard}
            keyExtractor={(item) => item.id}
            horizontal
            contentContainerStyle={styles.trackList}
          />

          <Text style={styles.sectionTitle}>Recently Played</Text>
          <FlatList
            data={recentlyPlayed}
            renderItem={renderTrackCard}
            keyExtractor={(item) => item.id}
            horizontal
            contentContainerStyle={styles.trackList}
          />

          <Text style={styles.sectionTitle}>My Collection</Text>
          {collection.length > 0 ? (
            <FlatList
              data={collection}
              renderItem={renderTrackCard}
              keyExtractor={(item) => item.id}
              horizontal
              contentContainerStyle={styles.trackList}
            />
          ) : (
            <Text style={styles.noCollectionText}>You haven’t collected any tracks yet.</Text>
          )}

          <Button title="Logout" onPress={handleLogout} color="red" />
        </>
      ) : (
        <Button title="Login with Spotify" onPress={handleLogin} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileText: {
    fontSize: 20,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  trackList: {
    marginTop: 10,
    paddingBottom: 20,
  },
  card: {
    width: 150,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    padding: 10,
    alignItems: 'center',
  },
  cardImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  cardArtist: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  collectButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  collectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noCollectionText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 10,
    textAlign: 'center',
  },
});
