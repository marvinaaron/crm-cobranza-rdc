import { SITE_URL } from "@/lib/seo/site";

export const NOMBRE_CAL_CUMPLE = "Cumple Despacho · RDC Contadores";

export function urlsCalendarioCumple(token: string) {
  const httpsUrl = `${SITE_URL}/api/cal/cumple-despacho/${encodeURIComponent(token)}`;
  const webcalUrl = httpsUrl.replace(/^https?:\/\//, "webcal://");
  return {
    httpsUrl,
    webcalUrl,
    google: `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(webcalUrl)}`,
    outlook: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(
      httpsUrl
    )}&name=${encodeURIComponent(NOMBRE_CAL_CUMPLE)}`,
  };
}
