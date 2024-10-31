import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

const CollectionScreen = ({ 
  isVisible, 
  onClose, 
  collection = [], 
  onSongPress 
}) => {
  const scrollY = new Animated.Value(0);

  const renderSongItem = ({ item, index }) => {
    const inputRange = [-1, 0, (height * 0.1) * index, (height * 0.1) * (index + 2)];
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.95],
    });
    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.7],
    });

    return (
      <Animated.View style={[
        styles.songItemContainer,
        {
          transform: [{ scale }],
          opacity,
        }
      ]}>
        <TouchableOpacity 
          style={styles.songItem}
          onPress={() => onSongPress(item)}
          activeOpacity={0.7}
        >
          <Image 
            source={{ uri: item.image }} 
            style={styles.songImage}
          />
          <View style={styles.songInfo}>
            <Text style={styles.songName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {item.artist}
            </Text>
            <View style={styles.costContainer}>
              <Ionicons name="diamond" size={16} color="#00ff00" />
              <Text style={styles.costText}>{item.cost}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Collection</Text>
          <TouchableOpacity 
            onPress={onClose} 
            style={styles.closeButton}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          {collection.length} {collection.length === 1 ? 'Song' : 'Songs'} Collected
        </Text>

        {collection.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-notes" size={64} color="#00ff00" />
            <Text style={styles.emptyText}>Your Collection is Empty</Text>
            <Text style={styles.emptySubText}>
              Explore and collect songs to build your library!
            </Text>
          </View>
        ) : (
          <Animated.FlatList
            data={collection}
            renderItem={renderSongItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00ff00',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff00',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContent: {
    padding: 15,
  },
  songItemContainer: {
    marginBottom: 12,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    height: 80,
  },
  songImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  songInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  songName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.7,
    marginBottom: 4,
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costText: {
    fontSize: 14,
    color: '#00ff00',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default CollectionScreen;