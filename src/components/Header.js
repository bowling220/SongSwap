import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const Header = ({ spotifyProfile, level, xp, coins, gems }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const xpForNextLevel = level * 1000;
  const xpProgress = (xp / xpForNextLevel) * 100;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      {/* Left Section: Profile & Level */}
      <View style={styles.leftSection}>
        <View style={styles.profileWrapper}>
          {spotifyProfile?.images?.[0]?.url ? (
            <Image
              source={{ uri: spotifyProfile.images[0].url }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={16} color="#1DB954" />
            </View>
          )}
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{level}</Text>
          </View>
        </View>
      </View>

      {/* Middle Section: XP Bar */}
      <View style={styles.middleSection}>
        <View style={styles.xpBar}>
          <Animated.View style={[styles.xpProgress, { width: `${xpProgress}%` }]} />
        </View>
      </View>

      {/* Right Section: Currency */}
      <View style={styles.rightSection}>
        <View style={styles.currencyItem}>
          <FontAwesome5 name="bitcoin" size={16} color="#F7931A" />
          <Text style={styles.currencyText}>{coins}</Text>
        </View>
        <View style={styles.currencyItem}>
          <MaterialCommunityIcons name="diamond-stone" size={16} color="#00FFFF" />
          <Text style={styles.currencyText}>{gems}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    height: 60, // Fixed height for consistency
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
  },
  profileWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  profileImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#1DB954',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  levelText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  middleSection: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  xpBar: {
    height: 4,
    backgroundColor: '#404040',
    borderRadius: 2,
    overflow: 'hidden',
  },
  xpProgress: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: 2,
  },
  rightSection: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  currencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Header; 