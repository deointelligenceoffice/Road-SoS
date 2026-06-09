export type NearbyService = {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
};

const SEARCH_CATEGORIES = ['hospital', 'police', 'medical'];

function normalizeFeature(feature: any, category: string): NearbyService {
  return {
    id: feature.id || `${category}-${feature.properties?.name || feature.text || Math.random()}`,
    name: feature.properties?.name || feature.text || 'Unknown Location',
    category,
    latitude: feature.geometry?.coordinates?.[1] ?? 0,
    longitude: feature.geometry?.coordinates?.[0] ?? 0,
  };
}

export async function fetchNearbyServices(latitude: number, longitude: number, token: string): Promise<NearbyService[]> {
  if (!token) {
    throw new Error('Mapbox access token is required for POI search.');
  }

  const requests = SEARCH_CATEGORIES.map(async (category) => {
    const url = `https://api.mapbox.com/search/searchbox/v1/category/${category}?access_token=${encodeURIComponent(token)}&proximity=${longitude},${latitude}&limit=5`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mapbox Search API failed for category ${category}: ${response.status}`);
    }
    const data = await response.json();
    const features = Array.isArray(data.features) ? data.features : [];
    return features.map((feature: any) => normalizeFeature(feature, category));
  });

  const results = await Promise.all(requests);
  const merged = results.flat();
  const uniqueById = new Map<string, NearbyService>();
  merged.forEach((service) => {
    if (service.latitude && service.longitude && !uniqueById.has(service.id)) {
      uniqueById.set(service.id, service);
    }
  });
  return Array.from(uniqueById.values());
}
