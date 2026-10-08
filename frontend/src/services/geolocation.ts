/**
 * Geolocation & Reverse Geocoding Service for RouteWise
 * Supports:
 * 1. HTML5 Browser Geolocation (high-accuracy GPS/Wi-Fi)
 * 2. Reverse geocoding via OpenStreetMap Nominatim with BigDataCloud fallback
 * 3. IP-based location fallback if GPS is denied or unavailable
 */

export interface DetectedLocation {
  name: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  source: 'gps' | 'ip' | 'cached';
}

// In-memory cache for recent reverse-geocodes
const geocodeCache = new Map<string, string>();

/**
 * Format address components into a clean, human-readable mobility origin
 * e.g. "Rabale, Navi Mumbai" or "Koparkhairane, Navi Mumbai"
 */
function formatAddress(address: any, fallbackName?: string): string {
  if (!address) return fallbackName || 'Current Location';

  const local =
    address.suburb ||
    address.neighbourhood ||
    address.residential ||
    address.quarter ||
    address.village ||
    address.town;

  const city =
    address.city ||
    address.city_district ||
    address.county ||
    address.state_district;

  if (local && city) {
    // If suburb contains city name, don't duplicate
    if (local.toLowerCase().includes(city.toLowerCase())) {
      return local;
    }
    return `${local}, ${city}`;
  }

  return local || city || fallbackName || address.state || 'Current Location';
}

/**
 * Reverse geocode latitude and longitude into human-readable place name
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<string> {
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  // 1. Try OpenStreetMap Nominatim reverse geocoding
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    const res = await fetch(nominatimUrl, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const formatted = formatAddress(data.address, data.name);
        geocodeCache.set(cacheKey, formatted);
        return formatted;
      }
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode failed, trying fallback...', err);
  }

  // 2. Fallback: BigDataCloud Reverse Geocoding Client
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(bdcUrl);
    if (res.ok) {
      const data = await res.json();
      const parts: string[] = [];
      if (data.locality) parts.push(data.locality);
      if (data.city && data.city !== data.locality) parts.push(data.city);
      else if (data.principalSubdivision && parts.length === 0) {
        parts.push(data.principalSubdivision);
      }

      if (parts.length > 0) {
        const formatted = parts.join(', ');
        geocodeCache.set(cacheKey, formatted);
        return formatted;
      }
    }
  } catch (err) {
    console.warn('BigDataCloud reverse geocode failed', err);
  }

  // 3. Fallback coordinates representation
  const coordsLabel = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  return coordsLabel;
}

/**
 * Fallback to IP-based Geolocation when browser GPS is denied or unavailable
 */
async function getIPLocation(): Promise<DetectedLocation> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        const parts: string[] = [];
        if (data.city) parts.push(data.city);
        if (data.region && data.region !== data.city) parts.push(data.region);
        const name = parts.join(', ') || 'Current Location';
        return {
          name,
          latitude: data.latitude,
          longitude: data.longitude,
          source: 'ip',
        };
      }
    }
  } catch (err) {
    console.warn('IP geolocation failed', err);
  }

  // Default fallback if all fails (Rabale, Navi Mumbai)
  return {
    name: 'Rabale, Navi Mumbai',
    latitude: 19.1363,
    longitude: 72.9984,
    source: 'cached',
  };
}

/**
 * Main method: Get user's current live location and reverse geocoded address
 */
export async function getUserCurrentLocation(): Promise<DetectedLocation> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      // Browser doesn't support HTML5 Geolocation, fallback to IP
      getIPLocation().then(resolve);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        try {
          const name = await reverseGeocode(latitude, longitude);
          
          // Cache in sessionStorage for map coordinates lookup
          try {
            sessionStorage.setItem(
              'routewise_user_coords',
              JSON.stringify({ latitude, longitude, name })
            );
          } catch (e) {
            // Ignore storage errors
          }

          resolve({
            name,
            latitude,
            longitude,
            accuracyMeters: accuracy,
            source: 'gps',
          });
        } catch (err) {
          resolve({
            name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            latitude,
            longitude,
            accuracyMeters: accuracy,
            source: 'gps',
          });
        }
      },
      (err) => {
        console.warn('GPS position error or denied by user:', err.message);
        // Fallback to IP location
        getIPLocation().then(resolve);
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 60000,
      }
    );
  });
}
