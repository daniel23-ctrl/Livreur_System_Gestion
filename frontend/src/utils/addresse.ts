export const isCoordinatesString = (str: string): boolean => {
  if (!str) return false;
  const parts = str.trim().split(/\s+/);
  if (parts.length !== 2) return false;
  const [val1, val2] = parts.map(Number);
  return !isNaN(val1) && !isNaN(val2);
};

const addressCache = new Map<string, string>();

export async function getReadableAddress(coordsString: string): Promise<string> {
  if (!isCoordinatesString(coordsString)) return coordsString;
  if (addressCache.has(coordsString)) return addressCache.get(coordsString)!;

  try {
    const parts = coordsString.trim().split(/\s+/);
    const val1 = parseFloat(parts[0]);
    const val2 = parseFloat(parts[1]);

    // Testons l'ordre : si val1 est autour de 1 et val2 autour de 6 (cas du Togo), 
    // alors val1 = Longitude et val2 = Latitude. 
    // Nominatim a besoin de lat en premier (donc val2) et lon ensuite (donc val1).
    let lat = val2;
    let lon = val1;

    // Sécurité au cas où c'est déjà dans l'autre sens dans certains cas
    if (Math.abs(val1) > Math.abs(val2)) {
      lat = val1;
      lon = val2;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'fr',
          'User-Agent': 'KusiApp/1.0',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);
    if (!res.ok) return coordsString;

    const data = await res.json();
    if (data && data.address) {
      const addr = data.address;
      const quartier = addr.suburb || addr.neighbourhood || addr.residential || addr.city_district || '';
      const route = addr.road || '';
      const ville = addr.city || addr.town || addr.village || '';
      
      const elements = [quartier, route, ville].filter(Boolean);
      const finalAddress = elements.length > 0 ? elements.join(', ') : data.display_name;

      addressCache.set(coordsString, finalAddress);
      return finalAddress;
    }

    return coordsString;
  } catch (error) {
    return coordsString;
  }
}