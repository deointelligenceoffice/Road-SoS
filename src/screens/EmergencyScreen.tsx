import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Card, Title, Paragraph } from 'react-native-paper';
import EmergencyButton from '../components/EmergencyButton';

const EmergencyScreen = () => {
  return (
    <View style={styles.container}>
      <Card style={styles.heroCard} elevation={4}>
        <Card.Content>
          <Title>Save Lives Faster</Title>
          <Paragraph>Use Road SOS to request help, share your location, and reach first responders instantly.</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.statsCard} elevation={2}>
        <Card.Content>
          <Text style={styles.statsLabel}>People helped today</Text>
          <Text style={styles.statsValue}>8</Text>
          <Text style={styles.statsText}>Every tap brings help faster to someone in need.</Text>
        </Card.Content>
      </Card>

      <EmergencyButton service="Ambulance" phoneNumber="+911234567890" color="#d32f2f" />
      <EmergencyButton service="Hospital" phoneNumber="+911234567891" color="#1976d2" />
      <EmergencyButton service="Police" phoneNumber="+911234567892" color="#388e3c" />
      <EmergencyButton service="Tow Service" phoneNumber="+911234567893" color="#cb8a23" />

      <Card style={styles.hintCard} elevation={2}>
        <Card.Content>
          <Text style={styles.hintTitle}>Your roadside partner</Text>
          <Text style={styles.hintText}>This app is built for fast action in emergencies with offline safety and clear commands.</Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16
  },
  heroCard: {
    padding: 16,
    backgroundColor: '#1f2937'
  },
  statsCard: {
    padding: 16,
    backgroundColor: '#111827'
  },
  card: {
    padding: 12,
    backgroundColor: '#111827'
  },
  hintCard: {
    padding: 12,
    backgroundColor: '#161f38'
  },
  statsLabel: {
    color: '#a5b4fc',
    fontWeight: '700',
    marginBottom: 4
  },
  statsValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800'
  },
  statsText: {
    color: '#c0c7d7',
    marginTop: 8
  },
  hintTitle: {
    color: '#ffffff',
    marginBottom: 6,
    fontWeight: '700'
  },
  hintText: {
    color: '#c0c7d7'
  }
});

export default EmergencyScreen;
// duplicate map-oriented styles removed