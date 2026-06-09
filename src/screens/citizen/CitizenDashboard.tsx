import React, { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { requestCurrentLocation } from '../../services/locationService';
import EmergencyMapView from '../../components/EmergencyMapView';
import { User } from '../../models/types';

type ServiceKey = 'police' | 'hospital' | 'ambulance' | 'traffic';
type DashboardTab = 'home' | 'map' | 'history' | 'profile';
type MaterialIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface CitizenDashboardProps {
  user: User | null;
  initialTab?: DashboardTab;
  onOpenAI: () => void;
  onOpenProfile: () => void;
}

const services: Array<{
  key: ServiceKey;
  icon: MaterialIconName;
  iconColor: string;
  title: string;
  subtitle: string;
  tint: string;
}> = [
  { key: 'police', icon: 'police-badge', iconColor: '#1A3C6E', title: 'Police', subtitle: 'Nearest police station', tint: '#d6e4f7' },
  { key: 'hospital', icon: 'hospital-building', iconColor: '#1E8449', title: 'Hospital', subtitle: '24/7 emergency ward', tint: '#d5f0de' },
  { key: 'ambulance', icon: 'ambulance', iconColor: '#C0392B', title: 'Ambulance', subtitle: 'Quick medical response', tint: '#fde8e8' },
  { key: 'traffic', icon: 'traffic-light', iconColor: '#E67E22', title: 'Traffic Police', subtitle: 'Report road incidents', tint: '#fff3cd' },
];

const contacts: Record<ServiceKey, Array<{ name: string; detail: string; tag: string; tint: string }>> = {
  police: [
    { name: 'Koramangala Police Station', detail: '0.5 km away - Bangalore', tag: 'Verified', tint: '#d6e4f7' },
    { name: 'Adyar Police Station', detail: '1.2 km away - Chennai', tag: 'Verified', tint: '#d6e4f7' },
    { name: 'Velachery Police Station', detail: '3.5 km away - Chennai', tag: '100 - Emergency', tint: '#d6e4f7' },
    { name: 'National Helpline', detail: 'Police - All India', tag: 'Dial 100', tint: '#d6e4f7' },
  ],
  hospital: [
    { name: 'Apollo Hospital', detail: '0.8 km - 24/7 Emergency', tag: 'Emergency ward', tint: '#d5f0de' },
    { name: 'Govt. General Hospital', detail: '2.1 km - Free treatment', tag: 'Govt. facility', tint: '#d5f0de' },
  ],
  ambulance: [
    { name: '108 Ambulance', detail: 'National Emergency Service', tag: 'Dial 108', tint: '#fde8e8' },
    { name: 'Apollo Ambulance', detail: '4 units - 1.2 km away', tag: 'Available now', tint: '#fde8e8' },
  ],
  traffic: [
    { name: 'Traffic Control Room', detail: 'Guindy, Chennai', tag: '24/7 Active', tint: '#fff3cd' },
    { name: 'Traffic Police Response Unit', detail: 'Chennai road network', tag: 'Verified', tint: '#fff3cd' },
  ],
};

const navItems: Array<{ tab: DashboardTab; icon: MaterialIconName; label: string }> = [
  { tab: 'home', icon: 'home', label: 'Home' },
  { tab: 'map', icon: 'map', label: 'Map' },
  { tab: 'history', icon: 'clipboard-text-clock', label: 'History' },
  { tab: 'profile', icon: 'account-circle', label: 'Profile' },
];

const serviceIconByKey: Record<ServiceKey, { icon: MaterialIconName; color: string }> = {
  police: { icon: 'police-badge', color: '#1A3C6E' },
  hospital: { icon: 'hospital-building', color: '#1E8449' },
  ambulance: { icon: 'ambulance', color: '#C0392B' },
  traffic: { icon: 'traffic-light', color: '#E67E22' },
};

const profileActions: Array<{ label: string; icon: MaterialIconName }> = [
  { label: 'Emergency Contacts', icon: 'phone' },
  { label: 'Medical Info', icon: 'medical-bag' },
  { label: 'Settings', icon: 'cog' },
  { label: 'Help & Support', icon: 'help-circle' },
];

const titleByService: Record<ServiceKey, string> = {
  police: 'Police stations near you',
  hospital: 'Nearby hospitals',
  ambulance: 'Ambulance services near you',
  traffic: 'Traffic Police helplines near you',
};

const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  user,
  initialTab = 'home',
  onOpenAI,
  onOpenProfile,
}) => {
  const [tab, setTab] = useState<DashboardTab>(initialTab);
  const [service, setService] = useState<ServiceKey | null>(null);
  const [status, setStatus] = useState('Ready to dispatch with a single tap.');

  const handleSOS = async () => {
    setStatus('Requesting fastest route to local responders...');
    const location = await requestCurrentLocation();

    if (!location) {
      setStatus('Location unavailable. Please enable GPS or use manual mode.');
      Alert.alert('Location unavailable', 'RoadSOS could not access GPS for this alert.');
      return;
    }

    setStatus('SOS initiated. Nearest responders are being alerted.');
    Alert.alert('SOS - Emergency Alert', 'Your location and emergency request have been queued.');
  };

  const handleCall = (label: string) => {
    Alert.alert('Calling', `${label} is ready to contact from the production dialer.`);
  };

  const selectTab = (nextTab: DashboardTab) => {
    setService(null);
    setTab(nextTab);
    if (nextTab === 'profile') {
      onOpenProfile();
    }
  };

  const renderHome = () => (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.sectionTitle}>Emergency Services</Text>
      {services.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={styles.serviceCard}
          activeOpacity={0.86}
          onPress={() => setService(item.key)}
        >
          <View style={[styles.avatar, { backgroundColor: item.tint }]}>
            <MaterialCommunityIcons name={item.icon} size={28} color={item.iconColor} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{item.title}</Text>
            <Text style={styles.contactDetail}>{item.subtitle}</Text>
          </View>
          <TouchableOpacity style={styles.callButton} onPress={() => handleCall(item.title)}>
            <MaterialCommunityIcons name="phone" size={20} color="#ffffff" />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.sosButton} activeOpacity={0.9} onPress={handleSOS}>
        <Text style={styles.sosButtonText}>SOS - Emergency Alert</Text>
      </TouchableOpacity>
      <Text style={styles.statusText}>{status}</Text>
    </ScrollView>
  );

  const renderService = () => (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.sectionTitle}>{titleByService[service!]}</Text>
      {contacts[service!].map((item) => (
        <View key={item.name} style={styles.contactCard}>
          <View style={[styles.avatar, { backgroundColor: item.tint }]}>
            <MaterialCommunityIcons
              name={serviceIconByKey[service!].icon}
              size={26}
              color={serviceIconByKey[service!].color}
            />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactDetail}>{item.detail}</Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.tag}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.callButton} onPress={() => handleCall(item.name)}>
            <MaterialCommunityIcons name="phone" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ))}
      {service === 'ambulance' ? (
        <TouchableOpacity style={[styles.sosButton, styles.dispatchButton]} activeOpacity={0.9} onPress={handleSOS}>
          <Text style={styles.sosButtonText}>Dispatch Ambulance Now</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );

  const renderProfile = () => (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.sectionTitle}>My Profile</Text>
      <View style={[styles.contactCard, styles.profileCard]}>
        <View style={[styles.avatar, { backgroundColor: '#fde8e8' }]}>
          <MaterialCommunityIcons name="account" size={28} color="#C0392B" />
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{user?.name || 'Rishav Raj'}</Text>
          <Text style={styles.contactDetail}>{user?.phone || user?.email || 'Patna, India'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.aiButton} activeOpacity={0.88} onPress={onOpenAI}>
        <MaterialCommunityIcons name="robot" size={18} color="#ffffff" />
        <Text style={styles.aiButtonText}>AI Assist</Text>
      </TouchableOpacity>
      {profileActions.map((item) => (
        <TouchableOpacity key={item.label} style={styles.outlineButton} activeOpacity={0.82}>
          <MaterialCommunityIcons name={item.icon} size={18} color="#333333" />
          <Text style={styles.outlineText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderUtilityTab = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{tab === 'map' ? 'Map' : 'History'}</Text>
      <Text style={styles.emptyText}>
        {tab === 'map' ? 'Nearby responders will appear here once live maps are connected.' : 'Emergency activity will appear here after your first request.'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {service ? renderService() : tab === 'home' ? renderHome() : tab === 'map' ? <EmergencyMapView /> : tab === 'profile' ? renderProfile() : renderUtilityTab()}
      <View style={styles.navBar}>
        {navItems.map((item) => {
          const isActive = tab === item.tab;
          return (
            <TouchableOpacity
              key={item.tab}
              style={styles.navItem}
              activeOpacity={0.75}
              onPress={() => selectTab(item.tab)}
            >
              <MaterialCommunityIcons name={item.icon} size={22} color={isActive ? '#C0392B' : '#999999'} />
              <Text style={[styles.navLabel, isActive && styles.navActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  body: {
    gap: 12,
    padding: 20,
  },
  sectionTitle: {
    color: '#666666',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  serviceCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  contactCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  profileCard: {
    borderLeftColor: '#C0392B',
    borderLeftWidth: 3,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  contactInfo: {
    flex: 1,
    minWidth: 0,
  },
  contactName: {
    color: '#1a2633',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  contactDetail: {
    color: '#999999',
    fontSize: 11,
    marginBottom: 4,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: '#d5f0de',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    color: '#1E8449',
    fontSize: 9,
    fontWeight: '700',
  },
  callButton: {
    alignItems: 'center',
    backgroundColor: '#C0392B',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  sosButton: {
    alignItems: 'center',
    backgroundColor: '#C0392B',
    borderRadius: 12,
    elevation: 4,
    marginTop: 4,
    paddingVertical: 16,
    shadowColor: '#C0392B',
    shadowOpacity: 0.28,
    shadowRadius: 16,
  },
  dispatchButton: {
    marginTop: 18,
  },
  sosButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  statusText: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
  },
  aiButton: {
    alignItems: 'center',
    backgroundColor: '#7e57c2',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  aiButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  outlineButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderRadius: 10,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  outlineText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  emptyTitle: {
    color: '#1a2633',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyText: {
    color: '#999999',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  navBar: {
    backgroundColor: '#ffffff',
    borderTopColor: '#e0e0e0',
    borderTopWidth: 1,
    flexDirection: 'row',
    padding: 8,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    paddingVertical: 8,
  },
  navLabel: {
    color: '#999999',
    fontSize: 11,
    fontWeight: '600',
  },
  navActive: {
    color: '#C0392B',
  },
});

export default CitizenDashboard;
