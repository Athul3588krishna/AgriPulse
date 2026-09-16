import { useState, useEffect, useCallback } from 'react';

// Coordinates of 14 Kerala districts for nearest matching
export const KERALA_DISTRICTS = [
  { id: 'palakkad', nameEn: 'Palakkad', nameMl: 'പാലക്കാട്', lat: 10.7867, lon: 76.6548 },
  { id: 'thrissur', nameEn: 'Thrissur', nameMl: 'തൃശ്ശൂർ', lat: 10.5276, lon: 76.2144 },
  { id: 'ernakulam', nameEn: 'Ernakulam', nameMl: 'എറണാകുളം', lat: 9.9816, lon: 76.2999 },
  { id: 'alappuzha', nameEn: 'Alappuzha', nameMl: 'ആലപ്പുഴ', lat: 9.4981, lon: 76.3388 },
  { id: 'wayanad', nameEn: 'Wayanad', nameMl: 'വയനാട്', lat: 11.6854, lon: 76.1320 },
  { id: 'idukki', nameEn: 'Idukki', nameMl: 'ഇടുക്കി', lat: 9.8494, lon: 76.9804 },
  { id: 'kottayam', nameEn: 'Kottayam', nameMl: 'കോട്ടയം', lat: 9.5916, lon: 76.5222 },
  { id: 'kozhikode', nameEn: 'Kozhikode', nameMl: 'കോഴിക്കോട്', lat: 11.2588, lon: 75.7804 },
  { id: 'kannur', nameEn: 'Kannur', nameMl: 'കണ്ണൂർ', lat: 11.8745, lon: 75.3704 },
  { id: 'kasaragod', nameEn: 'Kasaragod', nameMl: 'കാസർഗോഡ്', lat: 12.4996, lon: 74.9869 },
  { id: 'kollam', nameEn: 'Kollam', nameMl: 'കൊല്ലം', lat: 8.8932, lon: 76.6141 },
  { id: 'thiruvananthapuram', nameEn: 'Thiruvananthapuram', nameMl: 'തിരുവനന്തപുരം', lat: 8.5241, lon: 76.9366 },
  { id: 'malappuram', nameEn: 'Malappuram', nameMl: 'മലപ്പുറം', lat: 11.0510, lon: 76.0711 },
  { id: 'pathanamthitta', nameEn: 'Pathanamthitta', nameMl: 'പത്തനംതിട്ട', lat: 9.2648, lon: 76.7870 }
];

// Calculate distance between two coordinates in kilometers (Haversine formula)
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find closest Kerala district from GPS coordinates
export function getClosestDistrict(lat, lon) {
  let closest = KERALA_DISTRICTS[0];
  let minDistance = Infinity;

  for (const d of KERALA_DISTRICTS) {
    const dist = calculateDistanceKm(lat, lon, d.lat, d.lon);
    if (dist < minDistance) {
      minDistance = dist;
      closest = d;
    }
  }

  return {
    ...closest,
    distanceKm: Math.round(minDistance)
  };
}

const STORAGE_KEY = 'agripulse_device_location';

export function useDeviceLocation() {
  // Try loading cached location from localStorage for instant initial render
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Default fallback: Palakkad, Kerala (Agriculture hub)
    return {
      coords: { lat: 10.7867, lon: 76.6548 },
      district: 'Palakkad',
      districtMl: 'പാലക്കാട്',
      locality: 'Palakkad',
      locationName: 'Palakkad, Kerala',
      isGpsActive: false,
      accuracy: null
    };
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const closest = getClosestDistrict(latitude, longitude);

        let locality = closest.nameEn;
        let formattedName = `${closest.nameEn}, Kerala`;

        // Optional quick reverse geocoding via OpenStreetMap Nominatim for village/town name
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
            { signal: controller.signal, headers: { 'User-Agent': 'AgriPulse-AI/1.0' } }
          );
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const town = addr.village || addr.town || addr.suburb || addr.city || closest.nameEn;
            const dist = addr.state_district?.replace(' District', '') || addr.county || closest.nameEn;
            locality = town;
            formattedName = `${town}, ${dist}`;
          }
        } catch (revErr) {
          // If network timeout or offline, use closest district
          console.log('[useDeviceLocation] Reverse geocode note:', revErr.message);
        }

        const newLocation = {
          coords: { lat: latitude, lon: longitude },
          district: closest.nameEn,
          districtMl: closest.nameMl,
          locality,
          locationName: formattedName,
          isGpsActive: true,
          accuracy: Math.round(accuracy)
        };

        setLocation(newLocation);
        setLoading(false);

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocation));
        } catch (e) {}
      },
      (err) => {
        console.warn('[useDeviceLocation] Geolocation error:', err.message);
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 mins
      }
    );
  }, []);

  // Automatically request on mount if not already GPS active
  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  return {
    ...location,
    loading,
    error,
    refreshLocation: detectLocation
  };
}
