import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatNumber } from '../utils/numberUtils';

const SettingsScreen = ({ 
  isVisible, 
  onClose, 
  settings,
  onSettingChange,
  onLogout,
  onResetProgress,
  onContactSupport,
  onPrivacyPolicy,
  onTermsOfService,
  stats = {}
}) => {
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          onPress: onLogout,
          style: "destructive"
        }
      ]
    );
  };

  const handleResetProgress = () => {
    Alert.alert(
      "Reset Progress",
      "Are you sure? This action cannot be undone!",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          onPress: onResetProgress,
          style: "destructive"
        }
      ]
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
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
          </View>

          <ScrollView style={styles.scrollView}>
            {/* Game Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Game Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.level || 1}</Text>
                  <Text style={styles.statLabel}>Level</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.songsCollected || 0}</Text>
                  <Text style={styles.statLabel}>Songs</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.coins || 0}</Text>
                  <Text style={styles.statLabel}>Coins</Text>
                </View>
              </View>
            </View>

            {/* Audio Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Audio</Text>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="musical-note" size={24} color="#1DB954" />
                  <Text style={styles.settingLabel}>Background Music</Text>
                </View>
                <Switch
                  value={settings.music}
                  onValueChange={(value) => onSettingChange('music', value)}
                  trackColor={{ false: '#767577', true: '#1DB954' }}
                  thumbColor={settings.music ? '#ffffff' : '#f4f3f4'}
                />
              </View>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="volume-high" size={24} color="#1DB954" />
                  <Text style={styles.settingLabel}>Sound Effects</Text>
                </View>
                <Switch
                  value={settings.soundEffects}
                  onValueChange={(value) => onSettingChange('soundEffects', value)}
                  trackColor={{ false: '#767577', true: '#1DB954' }}
                  thumbColor={settings.soundEffects ? '#ffffff' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* Notifications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="notifications" size={24} color="#1DB954" />
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                </View>
                <Switch
                  value={settings.notifications}
                  onValueChange={(value) => onSettingChange('notifications', value)}
                  trackColor={{ false: '#767577', true: '#1DB954' }}
                  thumbColor={settings.notifications ? '#ffffff' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* Support & Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Support & Info</Text>
              <TouchableOpacity style={styles.menuItem} onPress={onContactSupport}>
                <View style={styles.menuItemContent}>
                  <Ionicons name="mail" size={24} color="#1DB954" />
                  <Text style={styles.menuItemText}>Contact Support</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={onPrivacyPolicy}>
                <View style={styles.menuItemContent}>
                  <Ionicons name="shield-checkmark" size={24} color="#1DB954" />
                  <Text style={styles.menuItemText}>Privacy Policy</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={onTermsOfService}>
                <View style={styles.menuItemContent}>
                  <Ionicons name="document-text" size={24} color="#1DB954" />
                  <Text style={styles.menuItemText}>Terms of Service</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Account Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              <TouchableOpacity 
                style={[styles.actionButton, styles.resetButton]}
                onPress={handleResetProgress}
              >
                <Text style={styles.actionButtonText}>Reset Progress</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.logoutButton]}
                onPress={handleLogout}
              >
                <Text style={styles.actionButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>

            {/* Version Info */}
            <View style={styles.versionInfo}>
              <Text style={styles.versionText}>Version 1.0.0</Text>
              <Text style={styles.versionSubtext}>Made with ♥️ by Your Team</Text>
            </View>
          </ScrollView>
        </View>
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
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    color: '#1DB954',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  resetButton: {
    backgroundColor: '#FF6B6B',
  },
  logoutButton: {
    backgroundColor: '#E53935',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  versionInfo: {
    padding: 24,
    alignItems: 'center',
  },
  versionText: {
    color: '#666',
    fontSize: 14,
  },
  versionSubtext: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
});

export default SettingsScreen; 