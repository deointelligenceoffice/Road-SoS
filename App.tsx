import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, BackHandler } from 'react-native';
import { ActivityIndicator, MD3DarkTheme, PaperProvider, Text, IconButton } from 'react-native-paper';
import AuthLandingScreen from './src/screens/auth/AuthLandingScreen';
import RoleForkScreen from './src/screens/auth/RoleForkScreen';
import CitizenDashboard from './src/screens/citizen/CitizenDashboard';
import ProviderOnboarding from './src/screens/service/ProviderOnboarding';
import AIChatScreen from './src/screens/citizen/AIChatScreen';
import { requestCurrentLocation } from './src/services/locationService';
import { loadUserRole, loadUserSession, saveUserRole, saveUserSession } from './src/services/storageService';
import { ServiceType, User, UserRole } from './src/models/types';

type AppStep = 'auth' | 'role' | 'citizen' | 'provider' | 'ai-chat' | 'profile';

const theme = {
  ...MD3DarkTheme,
  roundness: 8,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#C0392B',
    secondary: '#10b981',
    background: '#f5f5f5',
    surface: '#ffffff',
    onSurface: '#1a1a1a',
    onSurfaceVariant: '#94a3b8',
  },
};

// Debug: log Mapbox public token at startup so we can verify Expo exposes it
console.log('DEBUG MAPBOX TOKEN:', process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN);

// Try to initialize native Mapbox SDK at app entry if installed.
try {
  // Require dynamically so code doesn't crash if package isn't installed
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  const MapboxNative = require('@rnmapbox/maps');
  const Mapbox = MapboxNative && (MapboxNative.default || MapboxNative);
  if (Mapbox && typeof Mapbox.setAccessToken === 'function') {
    Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoicmlzaGF2MTgiLCJhIjoiY21wemo4YTluMGdnZDJxcjJ5cGs0bG85eCJ9.serQeCr3mqHd6qrrtcI05A');
    console.log('Mapbox native SDK: setAccessToken called');
  }
} catch (e) {
  console.log('Mapbox native SDK not available or failed to initialize:', e && e.message ? e.message : e);
}

export default function App() {
  const [step, setStep] = useState<AppStep>('auth');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [locationStatus, setLocationStatus] = useState('Acquiring location...');

  const handleBack = useCallback(() => {
    if (step === 'role') {
      setUser(null);
      setStep('auth');
      return true; // handled
    } else if (step === 'ai-chat' || step === 'profile') {
      setStep('citizen');
      return true;
    } else if (step === 'citizen' || step === 'provider') {
      setStep('role');
      return true; // handled
    }
    return false; // let system handle it (exit app)
  }, [step]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBack
    );

    return () => { backHandler.remove(); };
  }, [handleBack]);

  useEffect(() => {
    async function bootstrap() {
      try {
        const session = await loadUserSession();
        const role = (await loadUserRole()) as UserRole | null;
        
        if (session) {
          setUser(session);
          if (!role) {
            setStep('role');
          } else if (role === 'provider' && !session.providerServiceType) {
            setStep('role');
          } else {
            setStep(role === 'citizen' ? 'citizen' : 'provider');
          }
        }
      } catch (e) {
        console.error("Bootstrap error:", e);
      } finally {
        setLoading(false);
      }
    }

    async function initLocation() {
      try {
        const location = await requestCurrentLocation();
        if (location) {
          setLocationStatus(`Location acquired: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
        } else {
          setLocationStatus('Location unavailable. Please enable GPS or use manual mode.');
        }
      } catch (error) {
        setLocationStatus('Unable to fetch location. GPS fallback active.');
      }
    }

    bootstrap();
    initLocation();
  }, []);

  const handleAuth = async (authenticatedUser: User) => {
    setUser(authenticatedUser);
    await saveUserSession(authenticatedUser);
    setStep('role');
  };

  const handleRoleSelect = async (selectedRole: UserRole, providerServiceType?: ServiceType) => {
    if (user) {
      const updatedUser: User = {
        ...user,
        role: selectedRole,
        providerServiceType: selectedRole === 'provider' ? providerServiceType : undefined,
      };
      setUser(updatedUser as User);
      await saveUserRole(selectedRole);
      await saveUserSession(updatedUser);
      setStep(selectedRole === 'citizen' ? 'citizen' : 'provider');
    }
  };

  if (loading) {
    return (
      <PaperProvider theme={theme}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#C0392B" />
        
        <View style={[styles.header, step === 'auth' ? styles.authHeader : null]}>
          <View style={styles.titleRow}>
            {(step === 'role' || step === 'citizen' || step === 'provider' || step === 'ai-chat' || step === 'profile') && (
              <IconButton
                icon="arrow-left"
                iconColor="#ffffff"
                size={24}
                onPress={handleBack}
                style={styles.backButton}
              />
            )}
            <View style={styles.logoContainer}>
              {step === 'role' ? (
                <Text style={styles.headerTitle}>Select User Type</Text>
              ) : step === 'ai-chat' ? (
                <Text style={styles.headerTitle}>AI Assistant</Text>
              ) : step === 'profile' ? (
                <Text style={styles.headerTitle}>Profile</Text>
              ) : step === 'provider' ? (
                <Text style={styles.headerTitle}>Service registration</Text>
              ) : (
                <>
                  <Text style={styles.logoBase}>Road<Text style={styles.logoAccent}>SOS</Text></Text>
                  <Text style={styles.tagline}>Emergency Response Network</Text>
                </>
              )}
            </View>
          </View>
          {step === 'citizen' && (
            <Text variant="bodySmall" style={styles.locationText}>{locationStatus}</Text>
          )}
        </View>

        {step === 'auth' && <AuthLandingScreen onAuthenticate={handleAuth} />}
        {step === 'role' && <RoleForkScreen onSelectRole={handleRoleSelect} />}
        {step === 'citizen' && (
          <CitizenDashboard
            user={user}
            onOpenAI={() => setStep('ai-chat')}
            onOpenProfile={() => setStep('profile')}
          />
        )}
        {step === 'provider' && user?.providerServiceType ? (
          <ProviderOnboarding serviceType={user.providerServiceType} />
        ) : null}
        {step === 'ai-chat' && <AIChatScreen />}
        {step === 'profile' && (
          <CitizenDashboard
            user={user}
            initialTab="profile"
            onOpenAI={() => setStep('ai-chat')}
            onOpenProfile={() => setStep('profile')}
          />
        )}
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#C0392B',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#C0392B',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    elevation: 4,
  },
  authHeader: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logoBase: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: '#FFD700',
  },
  tagline: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.85,
    textAlign: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    left: -10,
    zIndex: 1,
  },
  locationText: {
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 5
  }
});
