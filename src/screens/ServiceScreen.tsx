import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Button, Card, SegmentedButtons, Text, TextInput, Title } from 'react-native-paper';
import { loadServiceRecords, saveServiceRecords } from '../services/storageService';
import { ServiceRecord } from '../models/types';

const DEFAULT_SERVICES: ServiceRecord[] = [
  {
    id: 1,
    incident_id: 0,
    service_type: 'hospital',
    provider: 'Apollo Hospital',
    phone: '+911234567890',
    status: 'pending'
  },
  {
    id: 2,
    incident_id: 0,
    service_type: 'police_station',
    provider: 'Central Police Station',
    phone: '+911234567891',
    status: 'pending'
  }
];

const ServiceScreen = () => {
  const [services, setServices] = useState<ServiceRecord[]>(DEFAULT_SERVICES);
  const [selectedService, setSelectedService] = useState<ServiceRecord | null>(null);
  const [provider, setProvider] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<'hospital' | 'police_station'>('hospital');

  useEffect(() => {
    async function load() {
      const stored = await loadServiceRecords();
      if (stored.length) {
        setServices(stored);
      }
    }
    load();
  }, []);

  const handleSelect = (service: ServiceRecord) => {
    setSelectedService(service);
    setProvider(service.provider ?? '');
    setPhone(service.phone ?? '');
    setCategory(service.service_type as 'hospital' | 'police_station');
  };

  const handleSave = async () => {
    if (!selectedService) {
      return;
    }
    const updated = services.map((service) =>
      service.id === selectedService.id
        ? { ...service, provider, phone, service_type: category }
        : service
    );
    setServices(updated);
    await saveServiceRecords(updated);
    Alert.alert('Success', 'Service details updated.');
  };

  const handleAdd = async () => {
    const newService: ServiceRecord = {
      id: Date.now(),
      incident_id: 0,
      service_type: category,
      provider: provider || 'New Service',
      phone: phone || '+91',
      status: 'pending'
    };
    const updated = [...services, newService];
    setServices(updated);
    await saveServiceRecords(updated);
    setSelectedService(newService);
    setProvider('');
    setPhone('');
    Alert.alert('Service Added', `${provider} has been added to your local network.`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card} elevation={4}>
        <Card.Content>
          <Title style={styles.title}>Service Network</Title>
          <Text style={styles.subtitle}>Save hospital, police, and ambulance contact details for your city.</Text>
        </Card.Content>
      </Card>

      {services.map((service) => (
        <Card key={service.id} style={styles.serviceCard} elevation={2}>
          <Card.Content>
            <Text style={styles.serviceType}>{service.service_type.replace('_', ' ').toUpperCase()}</Text>
            <Text style={styles.serviceName}>{service.provider}</Text>
            <Text style={styles.servicePhone}>{service.phone}</Text>
            <Button mode="contained" onPress={() => handleSelect(service)} style={styles.serviceButton}>
              Edit
            </Button>
          </Card.Content>
        </Card>
      ))}

      <Card style={styles.card} elevation={2}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Edit or add service</Text>
          <SegmentedButtons
            value={category}
            onValueChange={(value) => setCategory(value as 'hospital' | 'police_station')}
            buttons={[
              {
                value: 'hospital',
                label: 'Hospital',
              },
              {
                value: 'police_station',
                label: 'Police',
              },
            ]}
          />
          <TextInput
            label={selectedService ? "Edit Provider name" : "New Provider name"}
            value={provider}
            mode="outlined"
            style={styles.input}
            onChangeText={setProvider}
          />
          <TextInput
            label="Phone number"
            value={phone}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            onChangeText={setPhone}
          />
          <View style={styles.buttonRow}>
            <Button mode="contained" onPress={handleSave} style={styles.button}>
              Save Service
            </Button>
            <Button mode="outlined" onPress={handleAdd} style={styles.button}>
              Add Service
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16
  },
  card: {
    padding: 12,
    backgroundColor: '#111827'
  },
  title: {
    color: '#ffffff'
  },
  subtitle: {
    color: '#c0c7d7',
    marginTop: 8
  },
  serviceCard: {
    padding: 12,
    backgroundColor: '#1f2937'
  },
  serviceType: {
    color: '#a5b4fc',
    fontWeight: '700'
  },
  serviceName: {
    color: '#ffffff',
    marginTop: 4
  },
  servicePhone: {
    color: '#c0c7d7',
    marginTop: 2
  },
  serviceButton: {
    marginTop: 12
  },
  sectionTitle: {
    color: '#ffffff',
    marginBottom: 12,
    fontWeight: '700'
  },
  input: {
    marginTop: 12,
    backgroundColor: '#1f2937'
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12
  },
  button: {
    flex: 1
  }
});

export default ServiceScreen;
