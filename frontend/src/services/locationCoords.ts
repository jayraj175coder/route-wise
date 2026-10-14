/**
 * Unified Location Coordinates & Geocoding Service for RouteWise
 * 100% Zero API Key Required:
 * - Direct coordinate format parsing ("lat, lon")
 * - User's live GPS/IP cached position from sessionStorage
 * - Fast offline dictionary for 150+ Indian and global transit hubs
 * - Asynchronous OpenStreetMap Nominatim geocoding fallback (completely free & open, no API key)
 */

export const KNOWN_COORDINATES: Record<string, [number, number]> = {
  // Mumbai Metropolitan Region (MMR)
  rabale: [19.1363, 72.9984],
  'rabale naka': [19.135, 72.997],
  'rabale railway station': [19.1363, 72.9984],
  airoli: [19.1579, 72.9935],
  'digha gaon': [19.176, 72.988],
  ghansoli: [19.1245, 72.9987],
  koparkhairane: [19.1026, 73.0035],
  turbhe: [19.0833, 73.0197],
  sanpada: [19.0653, 73.0089],
  vashi: [19.0771, 72.9986],
  'vashi bus station': [19.075, 72.995],
  nerul: [19.033, 73.0169],
  belapur: [19.0195, 73.0397],
  panvel: [18.9894, 73.1175],
  'navi mumbai': [19.033, 73.0297],
  thane: [19.1972, 72.9722],
  'thane railway station': [19.186, 72.9754],
  mulund: [19.1726, 72.9565],
  bhandup: [19.1439, 72.9378],
  kanjurmarg: [19.1315, 72.9312],
  vikhroli: [19.1111, 72.9282],
  ghatkopar: [19.0864, 72.9081],
  vidyavihar: [19.0798, 72.8973],
  kurla: [19.0657, 72.8793],
  sion: [19.0434, 72.8633],
  dadar: [19.0178, 72.8478],
  mankhurd: [19.0494, 72.9328],
  govandi: [19.0553, 72.915],
  'govandi railway station': [19.0553, 72.915],
  chembur: [19.056, 72.909],
  'shah & anchor': [19.056, 72.909],
  'shah and anchor': [19.056, 72.909],
  kutchhi: [19.056, 72.909],
  deonar: [19.06, 72.918],
  andheri: [19.1197, 72.8468],
  bandra: [19.0596, 72.8295],
  bkc: [19.0657, 72.8687],
  borivali: [19.2307, 72.8567],
  csmt: [18.94, 72.8353],
  cst: [18.94, 72.8353],
  churchgate: [18.9322, 72.8264],
  mumbai: [18.922, 72.8347],
  kalyan: [19.2403, 73.1305],
  dombivli: [19.2184, 73.0867],

  // Pune Region
  pune: [18.5204, 73.8567],
  'pune junction': [18.5284, 73.8744],
  hinjawadi: [18.5913, 73.7389],
  wakad: [18.5987, 73.766],
  baner: [18.5679, 73.8016],
  shivajinagar: [18.5314, 73.8446],
  pimpri: [18.6279, 73.8009],
  chinchwad: [18.6298, 73.7997],
  hadapsar: [18.5089, 73.926],
  magarpatta: [18.5144, 73.9298],
  kharadi: [18.5529, 73.9416],
  viman: [18.5679, 73.9143],
  'viman nagar': [18.5679, 73.9143],
  kothrud: [18.5074, 73.8077],
  lonavala: [18.7525, 73.3718],
  khandala: [18.7617, 73.3644],

  // Delhi NCR
  delhi: [28.6139, 77.209],
  'new delhi': [28.6139, 77.209],
  noida: [28.5355, 77.391],
  'greater noida': [28.4744, 77.504],
  gurgaon: [28.4595, 77.0266],
  gurugram: [28.4595, 77.0266],
  faridabad: [28.4089, 77.3178],
  ghaziabad: [28.6692, 77.4538],
  connaught: [28.6315, 77.2167],
  'connaught place': [28.6315, 77.2167],
  saket: [28.5244, 77.2167],
  dwarka: [28.5921, 77.046],
  aerocity: [28.5501, 77.121],

  // Bengaluru / Bangalore
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  whitefield: [12.9698, 77.75],
  'electronic city': [12.8399, 77.677],
  koramangala: [12.9352, 77.6245],
  indiranagar: [12.9784, 77.6408],
  marathahalli: [12.9591, 77.6974],
  bellandur: [12.9304, 77.6784],
  hebbal: [13.0358, 77.597],
  jayanagar: [12.9308, 77.5838],
  yeshwanthpur: [13.0285, 77.5457],
  mysore: [12.2958, 76.6394],
  mysuru: [12.2958, 76.6394],

  // Hyderabad & Telangana
  hyderabad: [17.385, 78.4867],
  secunderabad: [17.4399, 78.4983],
  'hitec city': [17.4435, 78.3772],
  gachibowli: [17.4401, 78.3489],
  madhapur: [17.4483, 78.3915],
  jubilee: [17.4319, 78.4073],
  'jubilee hills': [17.4319, 78.4073],
  banjara: [17.4156, 78.4357],
  'banjara hills': [17.4156, 78.4357],
  kondapur: [17.4699, 78.3578],
  warangal: [17.9784, 79.5941],

  // Chennai & Tamil Nadu
  chennai: [13.0827, 80.2707],
  tambaram: [12.9249, 80.1],
  guindy: [13.0067, 80.202],
  velachery: [12.9759, 80.2212],
  omr: [12.915, 80.229],
  coimbatore: [11.0168, 76.9558],
  madurai: [9.9252, 78.1198],
  salem: [11.6643, 78.146],
  tiruchirappalli: [10.7905, 78.7047],
  trichy: [10.7905, 78.7047],

  // Kolkata & West Bengal
  kolkata: [22.5726, 88.3639],
  howrah: [22.5958, 88.2636],
  'salt lake': [22.5867, 88.4178],
  'new town': [22.5898, 88.4744],
  alipore: [22.5323, 88.3243],
  siliguri: [26.7271, 88.3953],

  // Gujarat
  ahmedabad: [23.0225, 72.5714],
  gandhinagar: [23.2156, 72.6369],
  surat: [21.1702, 72.8311],
  vadodara: [22.3072, 73.1812],
  baroda: [22.3072, 73.1812],
  rajkot: [22.3039, 70.8022],

  // Rajasthan
  jaipur: [26.9124, 75.7873],
  udaipur: [24.5854, 73.7125],
  jodhpur: [26.2389, 73.0243],
  kota: [25.2138, 75.8648],
  ajmer: [26.4499, 74.6399],

  // Uttar Pradesh & Central
  lucknow: [26.8467, 80.9462],
  kanpur: [26.4499, 80.3319],
  agra: [27.1767, 78.0081],
  varanasi: [25.3176, 82.9739],
  prayagraj: [25.4358, 81.8463],
  allahabad: [25.4358, 81.8463],
  bhopal: [23.2599, 77.4126],
  indore: [22.7196, 75.8577],
  gwalior: [26.2183, 78.1828],
  jabalpur: [23.1815, 79.9864],

  // Punjab, Haryana & North
  chandigarh: [30.7333, 76.7794],
  mohali: [30.7046, 76.7179],
  panchkula: [30.6942, 76.8606],
  ludhiana: [30.901, 75.8573],
  amritsar: [31.634, 74.8723],
  shimla: [31.1048, 77.1734],
  dehradun: [30.3165, 78.0322],
  rishikesh: [30.0869, 78.2676],

  // Bihar & East
  patna: [25.5941, 85.1376],
  gaya: [24.7914, 85.0002],
  ranchi: [23.3441, 85.3096],
  jamshedpur: [22.8046, 86.2029],
  bhubaneswar: [20.2961, 85.8245],
  cuttack: [20.4625, 85.883],
  puri: [19.8135, 85.8312],

  // Kerala & South
  kochi: [9.9312, 76.2673],
  cochin: [9.9312, 76.2673],
  thiruvananthapuram: [8.5241, 76.9366],
  trivandrum: [8.5241, 76.9366],
  kozhikode: [11.2588, 75.7804],
  calicut: [11.2588, 75.7804],
  visakhapatnam: [17.6868, 83.2185],
  vizag: [17.6868, 83.2185],
  vijayawada: [16.5062, 80.648],

  // Goa & Northeast
  goa: [15.2993, 74.124],
  panaji: [15.4909, 73.8278],
  margao: [15.2832, 73.9862],
  vasco: [15.3982, 73.8113],
  guwahati: [26.1445, 91.7362],
  shillong: [25.5788, 91.8933],
};

// In-memory cache for dynamic geocodes so we don't query repeatedly
const dynamicGeocodeCache = new Map<string, [number, number]>();

/**
 * Synchronous coordinate resolution for immediate rendering:
 * 1. Checks sessionStorage for user's detected GPS position
 * 2. Parses literal "lat, lon"
 * 3. Matches against 150+ known transit cities and hubs
 */
export function resolveLocationCoords(name: string): [number, number] | null {
  if (!name) return null;
  const clean = name.trim();
  const lower = clean.toLowerCase();

  // 1. Direct "lat, lon" numbers
  const commaMatch = lower.match(/^([-+]?[0-9]*\.?[0-9]+)\s*,\s*([-+]?[0-9]*\.?[0-9]+)$/);
  if (commaMatch) {
    const lat = parseFloat(commaMatch[1]);
    const lon = parseFloat(commaMatch[2]);
    if (!isNaN(lat) && !isNaN(lon)) return [lat, lon];
  }

  // 2. Check in-memory cache from previous dynamic geocodes
  if (dynamicGeocodeCache.has(lower)) {
    return dynamicGeocodeCache.get(lower)!;
  }

  // 3. Check sessionStorage user location
  try {
    const cached = sessionStorage.getItem('routewise_user_coords');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (
        parsed.name &&
        (lower.includes(parsed.name.toLowerCase()) ||
          parsed.name.toLowerCase().includes(lower) ||
          lower.includes('current location') ||
          lower.includes('my location'))
      ) {
        return [parsed.latitude, parsed.longitude];
      }
    }
  } catch (_) {}

  // 4. Match against known locations dictionary
  for (const [key, coords] of Object.entries(KNOWN_COORDINATES)) {
    if (lower.includes(key) || key.includes(lower)) {
      return coords;
    }
  }

  return null;
}

/**
 * Asynchronous coordinate resolution with free OpenStreetMap Nominatim fallback
 * Zero API key required!
 */
export async function resolveLocationCoordsAsync(name: string): Promise<[number, number] | null> {
  const syncResult = resolveLocationCoords(name);
  if (syncResult) return syncResult;

  const clean = name.trim();
  const lower = clean.toLowerCase();

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      clean
    )}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (!isNaN(lat) && !isNaN(lon)) {
          const coords: [number, number] = [lat, lon];
          dynamicGeocodeCache.set(lower, coords);
          return coords;
        }
      }
    }
  } catch (e) {
    console.warn(`Free Nominatim geocode lookup failed for: ${name}`, e);
  }

  return null;
}
