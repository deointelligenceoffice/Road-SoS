import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { User } from '../../models/types';

interface AuthLandingScreenProps {
  onAuthenticate: (user: User) => void;
}

const AuthLandingScreen: React.FC<AuthLandingScreenProps> = ({ onAuthenticate }) => {
  const [identity, setIdentity] = useState('');

  const handleAuthenticate = () => {
    const trimmedIdentity = identity.trim();
    const user: User = {
      id: Date.now(),
      name: 'Rishav Raj',
      phone: trimmedIdentity,
      email: trimmedIdentity.includes('@') ? trimmedIdentity : '',
      language: 'en',
    };

    onAuthenticate(user);
  };

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Sign In</Text>
        <TextInput
          mode="outlined"
          value={identity}
          onChangeText={setIdentity}
          placeholder="Email or Phone"
          autoCapitalize="none"
          keyboardType="email-address"
          outlineColor="#e0e0e0"
          activeOutlineColor="#C0392B"
          style={styles.input}
          contentStyle={styles.inputContent}
        />

        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.88} onPress={handleAuthenticate}>
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>Or continue with</Text>

        <TouchableOpacity style={styles.outlineButton} activeOpacity={0.8} onPress={handleAuthenticate}>
          <Text style={styles.outlineIcon}>G</Text>
          <Text style={styles.outlineText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineButton} activeOpacity={0.8} onPress={handleAuthenticate}>
          <Text style={styles.outlineIcon}>OTP</Text>
          <Text style={styles.outlineText}>Phone OTP</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  body: {
    flex: 1,
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
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  orText: {
    color: '#999999',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
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
  outlineIcon: {
    color: '#1A3C6E',
    fontSize: 12,
    fontWeight: '800',
  },
  outlineText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AuthLandingScreen;
