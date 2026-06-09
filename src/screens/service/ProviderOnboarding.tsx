import React, { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { ProviderNode, ServiceType } from '../../models/types';
import { loadProviderNodes, saveProviderNode } from '../../services/storageService';
import { requestCurrentLocation } from '../../services/locationService';

type MaterialIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface ProviderOnboardingProps {
  serviceType: ServiceType;
}

const serviceCopy: Record<
  ServiceType,
  {
    icon: MaterialIconName;
    iconColor: string;
    nameLabel: string;
    namePlaceholder: string;
    adminLabel: string;
    adminPlaceholder: string;
  }
> = {
  Police: {
    icon: 'police-badge',
    iconColor: '#1A3C6E',
    nameLabel: 'Station name',
    namePlaceholder: 'Adyar Police Station',
    adminLabel: 'In-charge officer name',
    adminPlaceholder: 'Inspector / officer name',
  },
  Hospital: {
    icon: 'hospital-building',
    iconColor: '#1E8449',
    nameLabel: 'Hospital name',
    namePlaceholder: 'Apollo Hospital',
    adminLabel: 'Admin name',
    adminPlaceholder: 'Hospital admin name',
  },
  'Traffic Police': {
    icon: 'traffic-light',
    iconColor: '#E67E22',
    nameLabel: 'Traffic police unit name',
    namePlaceholder: 'Traffic Control Room',
    adminLabel: 'In-charge officer name',
    adminPlaceholder: 'Traffic officer name',
  },
};

const normalizeServiceType = (value?: string): ServiceType | null => {
  const compactValue = (value || '').replace(/[^A-Za-z]/g, '').toLowerCase();

  if (compactValue === 'police' || compactValue === 'localpolice') {
    return 'Police';
  }
  if (compactValue === 'hospital' || compactValue === 'hospitalems') {
    return 'Hospital';
  }
  if (compactValue === 'trafficpolice' || compactValue === 'trafficguard') {
    return 'Traffic Police';
  }
  return null;
};

const ProviderOnboarding: React.FC<ProviderOnboardingProps> = ({ serviceType }) => {
  const copy = serviceCopy[serviceType];
  const [facilityName, setFacilityName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [address, setAddress] = useState('');
  const [primaryHelpline, setPrimaryHelpline] = useState('');
  const [secondaryHelpline, setSecondaryHelpline] = useState('');
  const [adminName, setAdminName] = useState('');
  const [node, setNode] = useState<ProviderNode | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    async function loadNode() {
      const stored = await loadProviderNodes();
      const latestMatch = [...stored]
        .reverse()
        .find((item) => normalizeServiceType((item as { serviceType?: string }).serviceType) === serviceType);

      if (latestMatch) {
        setNode(latestMatch);
        setFacilityName(latestMatch.facilityName || '');
        setRegistrationNumber(latestMatch.registrationNumber || '');
        setAddress(latestMatch.address || '');
        setPrimaryHelpline(latestMatch.primaryHelpline || latestMatch.hotline || '');
        setSecondaryHelpline(latestMatch.secondaryHelpline || '');
        setAdminName(latestMatch.adminName || '');
      }
    }

    loadNode();
  }, [serviceType]);

  const handleRegister = async () => {
    if (
      !facilityName.trim() ||
      !registrationNumber.trim() ||
      !address.trim() ||
      !primaryHelpline.trim() ||
      !adminName.trim()
    ) {
      Alert.alert('Incomplete form', 'Please complete all required service registration fields.');
      return;
    }

    setPending(true);
    const location = await requestCurrentLocation();

    const newNode: ProviderNode = {
      id: Date.now(),
      serviceType,
      facilityName: facilityName.trim(),
      hotline: primaryHelpline.trim(),
      assets: `${serviceType} registration`,
      registrationNumber: registrationNumber.trim(),
      address: address.trim(),
      primaryHelpline: primaryHelpline.trim(),
      secondaryHelpline: secondaryHelpline.trim() || undefined,
      adminName: adminName.trim(),
      latitude: location?.latitude ?? 0,
      longitude: location?.longitude ?? 0,
      active: true,
      createdAt: new Date().toISOString(),
    };

    await saveProviderNode(newNode);
    setNode(newNode);
    setPending(false);

    Alert.alert(
      'Registration complete',
      location
        ? `${serviceType} registration is live with GPS location.`
        : `${serviceType} registration is live using the address you entered.`
    );
  };

  const displayNodeType = normalizeServiceType((node as { serviceType?: string } | null)?.serviceType) || serviceType;
  const displayHelpline = node?.primaryHelpline || node?.hotline || 'Not provided';

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text style={styles.sectionTitle}>Enter your service details</Text>
          <View style={styles.lockedServiceCard}>
            <View style={styles.serviceBadge}>
              <MaterialCommunityIcons name={copy.icon} size={28} color={copy.iconColor} />
            </View>
            <View style={styles.serviceTextBlock}>
              <Text style={styles.serviceLabel}>Service name</Text>
              <Text style={styles.serviceName}>{serviceType}</Text>
            </View>
            <View style={styles.lockPill}>
              <Text style={styles.lockPillText}>Locked</Text>
            </View>
          </View>
        </View>

        <View style={styles.formPanel}>
          <TextInput
            label={copy.nameLabel}
            mode="outlined"
            value={facilityName}
            onChangeText={setFacilityName}
            outlineColor="#e0e0e0"
            activeOutlineColor="#C0392B"
            style={styles.input}
            contentStyle={styles.inputContent}
            placeholder={copy.namePlaceholder}
          />
          <TextInput
            label="Official registration number"
            mode="outlined"
            value={registrationNumber}
            onChangeText={setRegistrationNumber}
            outlineColor="#e0e0e0"
            activeOutlineColor="#C0392B"
            style={styles.input}
            contentStyle={styles.inputContent}
            placeholder="Official ID / license number"
            autoCapitalize="characters"
          />
          <TextInput
            label="Address / Location"
            mode="outlined"
            value={address}
            onChangeText={setAddress}
            outlineColor="#e0e0e0"
            activeOutlineColor="#C0392B"
            style={styles.input}
            contentStyle={styles.inputContent}
            placeholder="Street, area, city"
          />
          <TextInput
            label="Primary helpline number"
            mode="outlined"
            keyboardType="phone-pad"
            value={primaryHelpline}
            onChangeText={setPrimaryHelpline}
            outlineColor="#e0e0e0"
            activeOutlineColor="#C0392B"
            style={styles.input}
            contentStyle={styles.inputContent}
            placeholder="+91 98765 43210"
          />
          <TextInput
            label="Secondary helpline number"
            mode="outlined"
            keyboardType="phone-pad"
            value={secondaryHelpline}
            onChangeText={setSecondaryHelpline}
            outlineColor="#e0e0e0"
            activeOutlineColor="#C0392B"
            style={styles.input}
            contentStyle={styles.inputContent}
            placeholder="Optional"
          />
          <TextInput
            label={copy.adminLabel}
            mode="outlined"
            value={adminName}
            onChangeText={setAdminName}
            outlineColor="#e0e0e0"
            activeOutlineColor="#C0392B"
            style={styles.input}
            contentStyle={styles.inputContent}
            placeholder={copy.adminPlaceholder}
          />

          <TouchableOpacity
            style={[styles.primaryButton, pending && styles.primaryButtonDisabled]}
            activeOpacity={0.88}
            onPress={handleRegister}
            disabled={pending}
          >
            <Text style={styles.primaryButtonText}>{pending ? 'Registering...' : 'Register & Continue'}</Text>
          </TouchableOpacity>
        </View>

        {node ? (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Current live registration</Text>
            <Text style={styles.statusLine}>Service: {displayNodeType}</Text>
            <Text style={styles.statusLine}>Name: {node.facilityName}</Text>
            <Text style={styles.statusLine}>Registration: {node.registrationNumber || 'Legacy record'}</Text>
            <Text style={styles.statusLine}>Address: {node.address || 'Address not saved in legacy record'}</Text>
            <Text style={styles.statusLine}>Primary helpline: {displayHelpline}</Text>
            {node.secondaryHelpline ? <Text style={styles.statusLine}>Secondary helpline: {node.secondaryHelpline}</Text> : null}
            <Text style={styles.statusLine}>Admin: {node.adminName || 'Not provided'}</Text>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  page: {
    gap: 14,
    padding: 20,
  },
  intro: {
    gap: 10,
  },
  sectionTitle: {
    color: '#666666',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  lockedServiceCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  serviceBadge: {
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    width: 54,
  },
  serviceTextBlock: {
    flex: 1,
  },
  serviceLabel: {
    color: '#999999',
    fontSize: 11,
    marginBottom: 2,
  },
  serviceName: {
    color: '#1a2633',
    fontSize: 16,
    fontWeight: '800',
  },
  lockPill: {
    backgroundColor: '#d5f0de',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lockPillText: {
    color: '#1E8449',
    fontSize: 10,
    fontWeight: '800',
  },
  formPanel: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  input: {
    backgroundColor: '#f8f8f8',
    fontSize: 14,
  },
  inputContent: {
    paddingVertical: 8,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#C0392B',
    borderRadius: 10,
    marginTop: 4,
    paddingVertical: 14,
    shadowColor: '#C0392B',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 3,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderLeftColor: '#C0392B',
    borderLeftWidth: 3,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
  },
  statusTitle: {
    color: '#1a2633',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  statusLine: {
    color: '#666666',
    fontSize: 12,
    lineHeight: 18,
  },
});

export default ProviderOnboarding;
