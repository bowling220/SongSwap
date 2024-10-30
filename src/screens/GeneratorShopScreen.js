import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { formatNumber } from '../utils/numberUtils';

const GeneratorShopScreen = ({ 
  isVisible, 
  onClose, 
  gems,
  onPurchase,
  ownedGenerators,
  generatorTypes 
}) => {
  const renderGeneratorItem = ({ item }) => {
    const isOwned = ownedGenerators[item.id];
    const canAfford = gems >= item.cost;

    return (
      <View style={styles.generatorItem}>
        <View style={styles.generatorIcon}>
          <MaterialCommunityIcons name={item.icon} size={32} color="#1DB954" />
        </View>
        
        <View style={styles.generatorInfo}>
          <Text style={styles.generatorName}>{item.name}</Text>
          <Text style={styles.generatorDescription}>{item.description}</Text>
          <Text style={styles.generatorStats}>
            Generates {item.coinsPerHour} coins/hour
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.purchaseButton,
            isOwned && styles.ownedButton,
            !canAfford && !isOwned && styles.disabledButton
          ]}
          onPress={() => !isOwned && canAfford && onPurchase(item)}
          disabled={isOwned || !canAfford}
        >
          {isOwned ? (
            <Text style={styles.buttonText}>Owned</Text>
          ) : (
            <>
              <Ionicons name="diamond" size={16} color="white" />
              <Text style={styles.buttonText}>{formatNumber(item.cost)}</Text>
            </>
          )}
        </TouchableOpacity>
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
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Generator Shop</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Gems Balance */}
          <View style={styles.balanceContainer}>
            <Ionicons name="diamond" size={24} color="#00E5FF" />
            <Text style={styles.balanceText}>{formatNumber(gems)}</Text>
          </View>

          {/* Generators */}
          <FlatList
            data={generatorTypes}
            renderItem={renderGeneratorItem}
            keyExtractor={item => item.id}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 10,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  generatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  generatorIcon: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  generatorInfo: {
    flex: 1,
  },
  generatorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  generatorDescription: {
    fontSize: 16,
    color: 'gray',
  },
  generatorStats: {
    fontSize: 14,
    color: 'gray',
  },
  purchaseButton: {
    backgroundColor: '#1DB954',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownedButton: {
    backgroundColor: 'gray',
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 5,
  },
});

export default GeneratorShopScreen; 