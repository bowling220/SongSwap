import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function Navigation({ 
  onShowCollection, 
  onShowProfile, 
  onShowSettings,
  onShowTrade,
  onShowShop,
  onRefreshSongs,
}) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={onShowCollection}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="library-outline" size={24} color="white" />
        </View>
        <Text style={styles.navText}>Collection</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={onShowShop}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="cart-outline" size={24} color="white" />
        </View>
        <Text style={styles.navText}>Shop</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={onShowTrade}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="swap-horizontal" size={24} color="white" />
        </View>
        <Text style={styles.navText}>Trade</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={onRefreshSongs}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="refresh-outline" size={24} color="white" />
        </View>
        <Text style={styles.navText}>Refresh</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={onShowProfile}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="person-outline" size={24} color="white" />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minWidth: 72,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default Navigation; 