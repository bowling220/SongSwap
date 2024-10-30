import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatNumber } from '../utils/numberUtils';

const Header = ({ spotifyProfile, level, xp, coins, gems }) => {
  return (
    <View style={styles.header}>
      {/* Profile Image */}
      {spotifyProfile?.images?.[0]?.url && (
        <Image
          source={{ uri: spotifyProfile.images[0].url }}
          style={styles.profileImage}
        />
      )}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.statText}>Lv.{level}</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="flash" size={20} color="#FF6B6B" />
          <Text style={styles.statText}>{formatNumber(xp)} XP</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="cash" size={20} color="#FFD700" />
          <Text style={styles.statText}>{formatNumber(coins)}</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="diamond" size={20} color="#00E5FF" />
          <Text style={styles.statText}>{formatNumber(gems)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#282828',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#1DB954',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 70,
    justifyContent: 'center',
  },
  statText: {
    color: 'white',
  },
});

export default Header; 