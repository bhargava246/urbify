/**
 * Ola Maps API service
 * Wraps: Reverse Geocoding, Places Autocomplete
 * All calls go browser → api.olamaps.io directly (same pattern as Google Maps JS API)
 */

const BASE = 'https://api.olamaps.io';

function apiKey(): string {
  return process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY ?? '';
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReverseGeocodeResult {
  fullAddress: string;
  locality: string;  // suburb / neighbourhood
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
}

export interface AutocompleteResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  lat?: number;
  lng?: number;
}

// ─── Reverse Geocoding ────────────────────────────────────────────────────────
// GET https://api.olamaps.io/places/v1/reverse-geocode?latlng={lat},{lng}&api_key={key}

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  const url = `${BASE}/places/v1/reverse-geocode?latlng=${lat},${lng}&api_key=${apiKey()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Reverse geocode failed: ${res.status}`);
  const data = await res.json();

  // Ola Maps returns results[0].address_components[]
  const result = data?.results?.[0];
  if (!result) throw new Error('No geocoding results returned');

  const components: { long_name: string; short_name: string; types: string[] }[] =
    result.address_components ?? [];

  const get = (...types: string[]) =>
    components.find((c) => types.some((t) => c.types.includes(t)))?.long_name ?? '';

  return {
    fullAddress: result.formatted_address ?? '',
    locality:
      get('sublocality_level_1', 'sublocality', 'neighborhood', 'locality') ||
      get('political'),
    city:
      get('locality', 'administrative_area_level_2') ||
      get('administrative_area_level_1'),
    state: get('administrative_area_level_1'),
    pincode: get('postal_code'),
    lat,
    lng,
  };
}

// ─── Places Autocomplete ──────────────────────────────────────────────────────
// GET https://api.olamaps.io/places/v1/autocomplete?input={text}&api_key={key}

export async function autocomplete(input: string): Promise<AutocompleteResult[]> {
  if (!input.trim()) return [];
  const url = `${BASE}/places/v1/autocomplete?input=${encodeURIComponent(input)}&api_key=${apiKey()}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();

  const predictions = data?.predictions ?? [];
  return predictions.map((p: any) => ({
    placeId: p.place_id ?? '',
    description: p.description ?? '',
    mainText: p.structured_formatting?.main_text ?? p.description ?? '',
    secondaryText: p.structured_formatting?.secondary_text ?? '',
    lat: p.geometry?.location?.lat,
    lng: p.geometry?.location?.lng,
  }));
}

// ─── Place Details (lat/lng from placeId) ─────────────────────────────────────
// GET https://api.olamaps.io/places/v1/details?place_id={id}&api_key={key}

export async function placeDetails(
  placeId: string,
): Promise<{ lat: number; lng: number; formattedAddress: string } | null> {
  const url = `${BASE}/places/v1/details?place_id=${encodeURIComponent(placeId)}&api_key=${apiKey()}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const loc = data?.result?.geometry?.location;
  if (!loc) return null;
  return {
    lat: loc.lat,
    lng: loc.lng,
    formattedAddress: data?.result?.formatted_address ?? '',
  };
}
