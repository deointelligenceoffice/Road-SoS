import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { ActivityIndicator, Button, Card, Text, TextInput, Title, useTheme } from 'react-native-paper';
import { loadUserProfile, saveUserProfile } from '../services/storageService';
import { User } from '../models/types';

const DEFAULT_USER: User = {
  id: 1,
  name: '',
  phone: '',
  email: '', // Assuming 'email' is a required field in your User type
  language: 'en',
};

const ProfileScreen = () => {
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const theme = useTheme(); // Access the theme for ActivityIndicator color
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const stored = await loadUserProfile();
      if (stored) {
        setUser(stored);
      }
      setLoaded(true);
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    await saveUserProfile(user);
    Alert.alert('Success', 'Profile updated successfully.');
  };

  if (!loaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
        <Text style={styles.info}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card} elevation={4}>
        <Card.Content>
          <Title style={styles.title}>Your Profile</Title>
          <Text style={styles.subtitle}>Saved user details let you skip login and keep help ready.</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card} elevation={2}>
        <Card.Content>
          <TextInput
            label="Full Name"
            value={user.name}
            mode="outlined"
            style={styles.input}
            onChangeText={(value) => setUser({ ...user, name: value })}
          />
          <TextInput
            label="Phone Number"
            value={user.phone}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            onChangeText={(value) => setUser({ ...user, phone: value })}
          />
          {/* Added TextInput for email, assuming it's part of the User type */}
          <TextInput
            label="Email Address"
            value={user.email}
            mode="outlined"
            keyboardType="email-address"
            style={styles.input}
            onChangeText={(value) => setUser({ ...user, email: value })}
            autoCapitalize="none"
          />
          <TextInput
            label="Preferred Language"
            value={user.language}
            mode="outlined"
            style={styles.input}
            onChangeText={(value) => setUser({ ...user, language: value })}
            autoCapitalize="none" // Languages are usually lowercase codes
          />
          <Button mode="contained" onPress={handleSave} style={styles.button}>
            Save Profile
          </Button>
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
  input: {
    marginTop: 12,
    backgroundColor: '#1f2937'
  },
  button: {
    marginTop: 16
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0b1220', // Match app background
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    color: '#c0c7d7',
    marginTop: 12
  }
});

export default ProfileScreen;
