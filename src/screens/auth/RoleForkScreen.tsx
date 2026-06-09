import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { ServiceType, UserRole } from '../../models/types';

type MaterialIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface RoleForkScreenProps {
  onSelectRole: (role: UserRole, providerServiceType?: ServiceType) => void;
}

const roles: Array<{
  icon: MaterialIconName;
  iconColor: string;
  name: string;
  description: string;
  role: UserRole;
  providerServiceType?: ServiceType;
}> = [
  { icon: 'account-circle', iconColor: '#C0392B', name: 'Normal User', description: 'Access emergency services', role: 'citizen' },
  { icon: 'police-badge', iconColor: '#1A3C6E', name: 'Police', description: 'Police station login', role: 'provider', providerServiceType: 'Police' },
  { icon: 'hospital-building', iconColor: '#1E8449', name: 'Hospital', description: 'Hospital registration', role: 'provider', providerServiceType: 'Hospital' },
  { icon: 'traffic-light', iconColor: '#E67E22', name: 'Traffic Police', description: 'Traffic dept. login', role: 'provider', providerServiceType: 'Traffic Police' },
];

const RoleForkScreen: React.FC<RoleForkScreenProps> = ({ onSelectRole }) => {
  return (
    <View style={styles.page}>
      <Text style={styles.sectionTitle}>Select your account type</Text>
      <View style={styles.grid}>
        {roles.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.roleCard}
            activeOpacity={0.82}
            onPress={() => onSelectRole(item.role, item.providerServiceType)}
          >
            <View style={styles.badge}>
              <MaterialCommunityIcons name={item.icon} size={32} color={item.iconColor} />
            </View>
            <Text style={styles.roleName}>{item.name}</Text>
            <Text style={styles.roleDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    color: '#666666',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  roleCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderRadius: 12,
    borderWidth: 1.5,
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 128,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    marginBottom: 10,
    width: 54,
  },
  roleName: {
    color: '#1a2633',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  roleDescription: {
    color: '#999999',
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
});

export default RoleForkScreen;
