export interface RouteInfo {
  distanceKm: number;
  durationMin: number;
}

/**
 * Interroge OSRM pour calculer la distance routière réelle entre deux points.
 */
export async function getRouteDistance(
  lat_a: string,
  lng_a: string,
  lat_b: string,
  lng_b: string
): Promise<RouteInfo | null> {
  try {
    const osrmUrl = process.env.NEXT_PUBLIC_OSRM_URL || "https://router.project-osrm.org";
    const url = `${osrmUrl}/route/v1/driving/${lng_a},${lat_a};${lng_b},${lat_b}?overview=false`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Erreur OSRM");

    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.length) return null;

    const route = data.routes[0];
    return {
      distanceKm: route.distance / 1000, // mètres -> km
      durationMin: route.duration / 60, // secondes -> minutes
    };
  } catch (err) {
    console.error("Erreur calcul distance OSRM:", err);
    return null;
  }
}

/**
 * Calcule le montant estimé de la course selon la formule :
 * montant = FRAIS_BASE + (COUT_PAR_KM * distance)
 */
export function calculerMontant(distanceKm: number): number {
  const fraisBase = Number(process.env.NEXT_PUBLIC_FRAIS_BASE);
  const coutParKm = Number(process.env.NEXT_PUBLIC_COUT_PAR_KM);

  if (isNaN(fraisBase) || isNaN(coutParKm)) {
    console.error("Variables de tarification manquantes ou invalides dans .env.local");
    return 0;
  }

  const montant = fraisBase + coutParKm * distanceKm;
  return Math.round(montant);
}