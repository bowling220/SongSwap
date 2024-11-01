import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatNumber } from '../utils/numberUtils';
import { ACHIEVEMENTS } from '../constants/achievements';

const ProfileScreen = ({ 
  isVisible, 
  onClose, 
  profile, 
  stats = {}, 
  collection = [],
  onViewCollection
}) => {
  // Calculate collection stats with safe checks
  const collectionStats = {
    total: collection?.length || 0,
    legendary: collection?.filter(song => song?.rarity === 'Legendary')?.length || 0,
    epic: collection?.filter(song => song?.rarity === 'Epic')?.length || 0,
    rare: collection?.filter(song => song?.rarity === 'Rare')?.length || 0,
    common: collection?.filter(song => song?.rarity === 'Common')?.length || 0,
  };

  const renderAchievements = () => {
    return (
      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        {ACHIEVEMENTS.map(achievement => {
          const isUnlocked = stats.achievements?.includes(achievement.id);
          
          return (
            <View 
              key={achievement.id}
              style={[
                styles.achievementItem,
                isUnlocked ? styles.achievementUnlocked : styles.achievementLocked
              ]}
            >
              <View style={styles.achievementIcon}>
                <Ionicons 
                  name={isUnlocked ? "trophy" : "lock-closed"} 
                  size={24} 
                  color={isUnlocked ? "#1DB954" : "#666"} 
                />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>
                  {achievement.title}
                </Text>
                <Text style={styles.achievementDesc}>
                  {achievement.description}
                </Text>
                <Text style={styles.achievementXP}>+{achievement.xp} XP</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onClose}
          >
            <Ionicons name="chevron-back" size={28} color="#1DB954" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Profile</Text>
          
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Profile Info */}
          <View style={styles.profileSection}>
            {profile?.images?.[0]?.url && (
              <Image
                source={{ uri: profile.images[0].url }}
                style={styles.profileImage}
              />
            )}
            <Text style={styles.displayName}>{profile?.display_name}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Level {stats.level}</Text>
            </View>
          </View>

          {/* Collection Summary */}
          <TouchableOpacity 
            style={styles.collectionSection}
            onPress={onViewCollection}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Collection</Text>
              <View style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={20} color="#1DB954" />
              </View>
            </View>

            <View style={styles.collectionStats}>
              <View style={styles.rarityBar}>
                {collectionStats.legendary > 0 && (
                  <View style={[styles.raritySegment, { backgroundColor: '#FFD700', flex: collectionStats.legendary }]} />
                )}
                {collectionStats.epic > 0 && (
                  <View style={[styles.raritySegment, { backgroundColor: '#9400D3', flex: collectionStats.epic }]} />
                )}
                {collectionStats.rare > 0 && (
                  <View style={[styles.raritySegment, { backgroundColor: '#0096FF', flex: collectionStats.rare }]} />
                )}
                {collectionStats.common > 0 && (
                  <View style={[styles.raritySegment, { backgroundColor: '#808080', flex: collectionStats.common }]} />
                )}
              </View>

              <View style={styles.rarityLegend}>
                <Text style={styles.totalSongs}>{collectionStats.total} Songs</Text>
                <View style={styles.rarityItems}>
                  {collectionStats.legendary > 0 && (
                    <View style={styles.rarityItem}>
                      <View style={[styles.rarityDot, { backgroundColor: '#FFD700' }]} />
                      <Text style={styles.rarityCount}>{collectionStats.legendary} Legendary</Text>
                    </View>
                  )}
                  {collectionStats.epic > 0 && (
                    <View style={styles.rarityItem}>
                      <View style={[styles.rarityDot, { backgroundColor: '#9400D3' }]} />
                      <Text style={styles.rarityCount}>{collectionStats.epic} Epic</Text>
                    </View>
                  )}
                  {collectionStats.rare > 0 && (
                    <View style={styles.rarityItem}>
                      <View style={[styles.rarityDot, { backgroundColor: '#0096FF' }]} />
                      <Text style={styles.rarityCount}>{collectionStats.rare} Rare</Text>
                    </View>
                  )}
                  {collectionStats.common > 0 && (
                    <View style={styles.rarityItem}>
                      <View style={[styles.rarityDot, { backgroundColor: '#808080' }]} />
                      <Text style={styles.rarityCount}>{collectionStats.common} Common</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons name="musical-notes" size={24} color="#1DB954" />
                <Text style={styles.statValue}>{formatNumber(stats.songsCollected)}</Text>
                <Text style={styles.statLabel}>Songs</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="cash" size={24} color="#FFD700" />
                <Text style={styles.statValue}>{formatNumber(stats.coins)}</Text>
                <Text style={styles.statLabel}>Coins</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time" size={24} color="#FF6B6B" />
                <Text style={styles.statValue}>{stats.playTime}h</Text>
                <Text style={styles.statLabel}>Play Time</Text>
              </View>
            </View>
          </View>

          {renderAchievements()}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  content: {
    flex: 1,
    backgroundColor: '#282828',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#000',
  },
  backText: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerRight: {
    width: 80, // Match the width of backButton for balanced layout
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#1DB954',
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1DB954',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: 'white',
    fontWeight: 'bold',
  },
  displayName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    color: '#B3B3B3',
    fontSize: 16,
  },
  progressSection: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginHorizontal: 16,
    borderRadius: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    color: 'white',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1DB954',
  },
  nextLevelText: {
    color: '#B3B3B3',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  statsSection: {
    padding: 16,
  },
  sectionTitle: {
    color: '#1DB954',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#B3B3B3',
    fontSize: 14,
    marginTop: 4,
  },
  achievementsSection: {
    padding: 15,
    marginTop: 20,
  },
  achievementItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  achievementUnlocked: {
    borderColor: '#1DB954',
    borderWidth: 1,
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDesc: {
    color: '#999',
    fontSize: 14,
  },
  achievementXP: {
    color: '#1DB954',
    fontSize: 12,
    marginTop: 4,
  },
  collectionSection: {
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    margin: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '500',
  },
  collectionStats: {
    gap: 15,
  },
  rarityBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  raritySegment: {
    height: '100%',
  },
  rarityLegend: {
    gap: 8,
  },
  totalSongs: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rarityItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rarityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rarityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rarityCount: {
    color: '#B3B3B3',
    fontSize: 12,
  },
  levelProgressContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelTitle: {
    color: '#1DB954',
    fontSize: 18,
    fontWeight: 'bold',
  },
  xpText: {
    color: '#fff',
    fontSize: 14,
  },
  xpBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: 4,
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 12,
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementLockedText: {
    color: '#666',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDesc: {
    color: '#B3B3B3',
    fontSize: 14,
    marginBottom: 4,
  },
  achievementXP: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: 'bold',
  },
  completedBadge: {
    marginLeft: 10,
  },
});

export default ProfileScreen; 