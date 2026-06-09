# Road SOS

A mobile-first road safety emergency app for IIT Madras hackathon.

## What this project includes
- One-tap emergency screen
- GPS-based nearest service lookup
- Offline cache structure for emergency contacts
- SMS fallback and location fallback logic
- Modular architecture for AI chatbot and service integrations

## Next steps
1. Install Node.js (16+ or 18+) and Expo CLI.
2. Run `npm install`.
3. Run `npm start`.
4. Test on a device or simulator.

## Mapbox setup
1. Copy `.env.example` to `.env` and add your Mapbox token:

```bash
MAPBOX_ACCESS_TOKEN=YOUR_MAPBOX_ACCESS_TOKEN
```

2. Install dependencies:

```bash
npm install
```

3. Build and run with Expo native support (required for Mapbox native module):

```bash
expo prebuild
npm run android
# or
npm run ios
```

4. If you use EAS, build like this:

```bash
eas build --platform android
# or
eas build --platform ios
```

The map component reads `MAPBOX_ACCESS_TOKEN` from `.env` via `app.config.js`.

## Architecture
- `App.tsx` — app entry and screen selection
- `src/screens/` — emergency UI and info screens
- `src/services/` — GPS, SMS, and emergency service logic
- `src/db/` — local data schema and cache helpers
- `src/components/` — reusable UI elements
