import * as Location from 'expo-location';

export type GeoLocation = {
  latitude: number;
  longitude: number;
};

export async function requestCurrentLocation(): Promise<GeoLocation | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
  if (!location?.coords) {
    return null;
  }

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude
  };
}
