import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatNumber } from '../utils/numberUtils';

const CollectionScreen = ({ isVisible, onClose, collection = [], onSongPress }) => {
  const hasItems = collection?.length > 0;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Collection</Text>
          </View>

          {/* Collection Stats */}
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {collection?.length || 0} Songs Collected
            </Text>
          </View>

          {/* Collection List */}
          {hasItems ? (
            <FlatList
              data={collection}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.songItem}
                  onPress={() => onSongPress(item)}
                >
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.songImage}
                  />
                  <View style={styles.songInfo}>
                    <Text style={styles.songName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.artistName} numberOfLines={1}>{item.artist}</Text>
                  </View>
                  <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(item.rarity) }]}>
                    <Text style={styles.rarityText}>{item.rarity}</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={item => item?.id || Math.random().toString()}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No songs collected yet</Text>
              <Text style={styles.emptySubtext}>
                Start collecting songs to build your collection!
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  statsText: {
    color: '#B3B3B3',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  songName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  artistName: {
    color: '#B3B3B3',
    fontSize: 14,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  rarityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#B3B3B3',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default CollectionScreen;