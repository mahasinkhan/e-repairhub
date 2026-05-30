export interface LatLng { lat: number; lng: number; formatted?: string; }

export async function geocodeAddress(address: string): Promise<LatLng | null> {
  const key = process.env.GOOGLE_MAPS_KEY;
  if (!key) { console.warn("[geocode] GOOGLE_MAPS_KEY not set"); return null; }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`;
    const res  = await fetch(url);
    const data = await res.json() as any;

    if (data.status !== "OK" || !data.results?.[0]) {
      console.warn("[geocode] No result for:", address, data.status);
      return null;
    }

    const loc = data.results[0].geometry.location;
    return {
      lat: loc.lat,
      lng: loc.lng,
      formatted: data.results[0].formatted_address,
    };
  } catch (e) {
    console.error("[geocode] Error:", e);
    return null;
  }
}

// Haversine distance in km (fallback when no MongoDB $geoNear)
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}