import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { GeoLocation } from '../services/locationService';
import { fetchNearbyServices, NearbyService } from '../services/emergencyService';
// Ensure native Mapbox SDK is initialized with a token fallback.
// Replace the fallback token below with the project's public token for reliability.
import Mapbox from '@rnmapbox/maps';
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || 
type Props = { watch?: boolean };
type VehicleProfile = 'car' | 'motorbike' | 'walking';
type RouteInfo = { distance: number; duration: number; coordinates: [number, number][] };
type RouteSet = Record<VehicleProfile, RouteInfo | null>;

const vehicleProfileMap: Record<VehicleProfile, string> = { car: 'driving', motorbike: 'cycling', walking: 'walking' };
const vehicleLabels: Record<VehicleProfile, string> = { car: 'Car', motorbike: 'Two-Wheeler', walking: 'Walking' };

// Get token from Constants, env, or fallback
const runtimeExtra = Constants.expoConfig?.extra ?? (Constants.manifest as any)?.extra ?? {};
const mapboxToken = runtimeExtra.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN

let MapboxGL: any = null;
try {
  // dynamic require so file doesn't crash on web or when native SDK not installed
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  const mb = require('@rnmapbox/maps');
  MapboxGL = mb && (mb.default || mb);
  if (MapboxGL && typeof MapboxGL.setAccessToken === 'function') {
    MapboxGL.setAccessToken(mapboxToken);
  }
} catch (e) {
  // silently ignore - UI will show missing token / unsupported message
  MapboxGL = null;
}

export default function EmergencyMapView(_: Props) {
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [nearbyServices, setNearbyServices] = useState<NearbyService[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<[number, number] | null>(null); // [lng, lat]
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleProfile>('car');
  const [routes, setRoutes] = useState<RouteSet>({ car: null, motorbike: null, walking: null });
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const selectedRoute = selectedDestination ? routes[selectedVehicle] : null;

  // Load current position + nearby services
  useEffect(() => {
    let mounted = true;
    async function init() {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!mounted) return;
      if (status !== 'granted') {
        setLoading(false);
        Alert.alert('Location required', 'Please enable location permissions for maps to work.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      if (!mounted) return;
      if (!position?.coords) {
        setLoading(false);
        Alert.alert('Location required', 'Unable to read your current location.');
        return;
      }
      const loc: GeoLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setLocation(loc);
      try {
        const nearby = await fetchNearbyServices(loc.latitude, loc.longitude, mapboxToken);
        if (!mounted) return;
        setNearbyServices(nearby);
      } catch (e) {
        // ignore - keep app functional without POIs
      } finally {
        if (!mounted) setLoading(false);
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => { mounted = false; };
  }, []);

  // Handle map press: set selected destination and trigger routing
  const handleMapPress = (event: any) => {
    try {
      const clickedCoords = event?.geometry?.coordinates as [number, number] | undefined; // [lng, lat]
      if (!clickedCoords) return;
      setSelectedDestination(clickedCoords);
    } catch (e) {
      console.warn('handleMapPress error', e);
    }
  };

  // Compute routes when selectedDestination or location changes
  useEffect(() => {
    if (!selectedDestination || !location) {
      setRoutes({ car: null, motorbike: null, walking: null });
      setRouteError(null);
      return;
    }

    let mounted = true;
    async function loadRoutes() {
      setRouteLoading(true);
      setRouteError(null);
      try {
        const origin = location as GeoLocation;
        const [destLng, destLat] = selectedDestination as [number, number];
        const profileKeys: VehicleProfile[] = ['car', 'motorbike', 'walking'];
        const results = await Promise.all(profileKeys.map(async (vehicle) => {
          const profile = vehicleProfileMap[vehicle];
          const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${origin.longitude},${origin.latitude};${destLng},${destLat}?geometries=geojson&overview=full&access_token=${mapboxToken}`;
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Directions failed for ${vehicle}: ${response.status}`);
          const data = await response.json();
          const route = data.routes && data.routes[0];
          return {
            vehicle,
            route: route ? { distance: route.distance, duration: route.duration, coordinates: route.geometry.coordinates } : null,
          };
        }));

        if (!mounted) return;
        const nextRoutes: RouteSet = { car: null, motorbike: null, walking: null };
        results.forEach((item) => { nextRoutes[item.vehicle] = item.route; });
        setRoutes(nextRoutes);
        setSelectedVehicle('car');
      } catch (error) {
        if (!mounted) return;
        setRouteError(String(error));
      } finally {
        if (!mounted) return;
        setRouteLoading(false);
      }
    }

    loadRoutes();
    return () => { mounted = false; };
  }, [selectedDestination, location]);

  if (!mapboxToken || !MapboxGL) {
    return (
      <View style={styles.loader}>
        <Text style={{ textAlign: 'center' }}>Mapbox native SDK not available or token missing.</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.loader}>
        <Text style={{ textAlign: 'center' }}>Locating your position...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.mapContainer}>
        <MapboxGL.MapView
          style={styles.map}
          onPress={handleMapPress}
          logoEnabled={false}
          compassEnabled={true}
        >
          <MapboxGL.Camera centerCoordinate={[location.longitude, location.latitude]} zoomLevel={13} />
          <MapboxGL.UserLocation animated={true} androidRenderMode="gps" />

          {selectedDestination && (
            <MapboxGL.PointAnnotation id="destinationMarker" coordinate={selectedDestination}>
              <View style={styles.destinationPin} />
            </MapboxGL.PointAnnotation>
          )}

          {selectedRoute && selectedRoute.coordinates && (
            <MapboxGL.ShapeSource id="routeSource" shape={{ type: 'Feature', geometry: { type: 'LineString', coordinates: selectedRoute.coordinates } }}>
              <MapboxGL.LineLayer id="routeLine" style={{ lineColor: '#2E86FF', lineWidth: 6, lineOpacity: 0.85 }} />
            </MapboxGL.ShapeSource>
          )}
        </MapboxGL.MapView>
      </View>

      <View style={styles.routeSheet}>
        <Text style={styles.sectionTitle}>Tap anywhere to select destination</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicePicker}>
          {nearbyServices.map((service) => {
            const active = false; // we don't show multiple markers on map
            return (
              <TouchableOpacity key={service.id} style={[styles.servicePickerItem, active && styles.servicePickerItemActive]} onPress={() => setSelectedDestination([service.longitude, service.latitude])}>
                <Text style={styles.servicePickerText}>{service.name}</Text>
                <Text style={styles.servicePickerDistance}>{service.category}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.vehicleRow}>
          {(['walking', 'motorbike', 'car'] as VehicleProfile[]).map((vehicle) => {
            const active = selectedVehicle === vehicle;
            return (
              <TouchableOpacity key={vehicle} style={[styles.vehicleButton, active && styles.vehicleButtonActive]} onPress={() => setSelectedVehicle(vehicle)} disabled={!selectedDestination || !routes[vehicle]}>
                <Text style={[styles.vehicleButtonText, active && styles.vehicleButtonTextActive]}>{vehicleLabels[vehicle]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.routeInfoRow}>
          <View style={styles.routeInfoBlock}>
            <Text style={styles.routeInfoLabel}>Distance</Text>
            <Text style={styles.routeInfoValue}>{selectedRoute ? `${(selectedRoute.distance / 1000).toFixed(1)} km` : '—'}</Text>
          </View>
          <View style={styles.routeInfoBlock}>
            <Text style={styles.routeInfoLabel}>ETA</Text>
            <Text style={styles.routeInfoValue}>{selectedRoute ? `${Math.round(selectedRoute.duration / 60)} min` : '—'}</Text>
          </View>
        </View>

        <Text style={styles.routeStatus}>{routeLoading ? 'Loading routing options...' : selectedDestination ? 'Tap a profile to update the route.' : 'Select a destination by tapping the map.'}</Text>
        {routeError ? <Text style={styles.routeError}>{routeError}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  destinationPin: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#C0392B', borderColor: '#fff', borderWidth: 2 },
  routeSheet: { backgroundColor: '#ffffff', paddingVertical: 14, paddingHorizontal: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderColor: '#e0e0e0', borderTopWidth: 1, elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: -3 } },
  wrapper: { flex: 1, backgroundColor: '#ffffff' },
  mapContainer: { flex: 1, backgroundColor: '#000000' },
  sectionTitle: { color: '#666666', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' },
  servicePicker: { marginBottom: 12 },
  servicePickerItem: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f7f7f7', borderRadius: 8, marginRight: 8 },
  servicePickerItemActive: { backgroundColor: '#2E86FF' },
  servicePickerText: { fontWeight: '700' },
  servicePickerDistance: { fontSize: 11, color: '#666' },
  vehicleRow: { flexDirection: 'row', marginBottom: 12 },
  vehicleButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f1f1f1', marginRight: 8 },
  vehicleButtonActive: { backgroundColor: '#2E86FF' },
  vehicleButtonText: { fontWeight: '700' },
  vehicleButtonTextActive: { color: '#fff' },
  routeInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  routeInfoBlock: { alignItems: 'center', flex: 1 },
  routeInfoLabel: { fontSize: 12, color: '#888' },
  routeInfoValue: { fontSize: 16, fontWeight: '700' },
  routeStatus: { color: '#666', fontSize: 12 },
  routeError: { color: '#C0392B', marginTop: 8 },
});
