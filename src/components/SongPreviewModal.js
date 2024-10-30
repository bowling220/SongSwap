import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatNumber } from '../utils/numberUtils';

const SongPreviewModal = ({ isVisible, song, onClose, onPurchase, coins, isOwned }) => {
  if (!song) return null;

  const canAfford = coins >= (song.cost || 0);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
            >
              <Ionicons name="chevron-down" size={24} color="white" />
            </TouchableOpacity>
            {isOwned && (
              <View style={styles.ownedPill}>
                <Ionicons name="checkmark-circle" size={14} color="#1DB954" />
                <Text style={styles.ownedPillText}>In Collection</Text>
              </View>
            )}
          </View>

          {/* Song Image and Details */}
          <View style={styles.mainContent}>
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: song.image }} 
                style={styles.songImage}
              />
              {isOwned && (
                <View style={styles.ownedOverlay}>
                  <Ionicons name="checkmark-circle" size={32} color="white" />
                </View>
              )}
            </View>

            <View style={styles.detailsContainer}>
              <Text style={styles.songName} numberOfLines={1}>{song.name}</Text>
              <Text style={styles.artistName} numberOfLines={1}>{song.artist}</Text>

              <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(song.rarity) }]}>
                <Ionicons name={getRarityIcon(song.rarity)} size={14} color="white" />
                <Text style={styles.rarityText}>{song.rarity}</Text>
              </View>

              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={20} color="#FFD700" />
                  <Text style={styles.statValue}>{song.popularity || 0}</Text>
                  <Text style={styles.statLabel}>Popularity</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                  <Ionicons name="musical-notes" size={20} color="#1DB954" />
                  <Text style={styles.statValue}>{formatNumber(song.streams || 0)}</Text>
                  <Text style={styles.statLabel}>Streams</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Section */}
          <View style={styles.actionSection}>
            {isOwned ? (
              <>
                <TouchableOpacity style={styles.playButton}>
                  <View style={styles.actionButton}>
                    <Ionicons name="play" size={20} color="white" />
                    <Text style={styles.buttonText}>Play Preview</Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.priceTag}>
                  <Ionicons name="cash" size={20} color="#FFD700" />
                  <Text style={styles.priceText}>{formatNumber(song.cost)}</Text>
                </View>
                <TouchableOpacity
                  disabled={!canAfford}
                  onPress={() => canAfford && onPurchase(song)}
                  style={[styles.actionButton, !canAfford && styles.disabledButton]}
                >
                  <Text style={styles.buttonText}>
                    {canAfford ? 'Purchase Song' : 'Not Enough Coins'}
                  </Text>
                </TouchableOpacity>
                {!canAfford && (
                  <Text style={styles.insufficientText}>
                    Need {formatNumber(song.cost - coins)} more coins
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#282828',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  closeButton: {
    position: 'absolute',
    left: 10,
    padding: 8,
  },
  ownedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(29,185,84,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownedPillText: {
    color: '#1DB954',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  mainContent: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  imageContainer: {
    width: '40%',
  },
  songImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  ownedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    backgroundColor: 'rgba(29,185,84,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
    paddingLeft: 15,
  },
  songName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  artistName: {
    color: '#B3B3B3',
    fontSize: 16,
    marginTop: 2,
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  rarityText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 10,
  },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    color: '#B3B3B3',
    fontSize: 11,
    marginTop: 2,
  },
  actionSection: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  priceText: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  insufficientText: {
    color: '#FF6B6B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
});

const getRarityColor = (rarity) => {
  switch (rarity) {
    case 'Legendary':
      return '#FFD700';
    case 'Epic':
      return '#9400D3';
    case 'Rare':
      return '#0096FF';
    default:
      return '#808080';
  }
};

const getRarityIcon = (rarity) => {
  switch (rarity) {
    case 'Legendary':
      return 'star';
    case 'Epic':
      return 'diamond';
    case 'Rare':
      return 'trophy';
    default:
      return 'musical-note';
  }
};

export default SongPreviewModal; 