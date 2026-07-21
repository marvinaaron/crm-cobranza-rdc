import { Dela_Gothic_One, Red_Hat_Display } from "next/font/google";

/** Texto base de toda la app (formal, limpio — como Draftea). */
export const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-red-hat",
  display: "swap",
});

/** Display atrevido para momentos y banners de marketing. */
export const delaGothicOne = Dela_Gothic_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dela",
  display: "swap",
});

/** Clases para aplicar en <html>: variables CSS de ambas familias. */
export const fontVariables = `${redHatDisplay.variable} ${delaGothicOne.variable}`;
