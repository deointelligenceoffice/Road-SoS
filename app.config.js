/* App config that injects the Mapbox access token from environment variables.
   Create a .env file or set env vars before running expo.
   Example .env key: MAPBOX_ACCESS_TOKEN
*/
try {
  // Load .env when available (optional)
  // eslint-disable-next-line global-require
  require('dotenv').config();
} catch (e) {
  // ignore if dotenv is not installed
}
export default ({ config }) => {
  const mapboxToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.MAPBOX_ACCESS_TOKEN || process.env.MAPBOX_TOKEN || '';

  return {
    ...config,
    expo: {
      ...config.expo,
      android: {
        package: "com.anonymous.roadsos",
      },
      splash: {
        resizeMode: "contain",
        backgroundColor: "#0b1220",
      },
      extra: {
        ...config.expo?.extra,
        MAPBOX_ACCESS_TOKEN: mapboxToken,
        EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN: mapboxToken,
      },
    },
  };
};
