import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";

export type RedMarca = "whatsapp" | "instagram" | "facebook" | "youtube";

const TRAZO = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconoMarcaRed({
  red,
  size = 22,
}: {
  red: RedMarca;
  size?: number;
}) {
  const s = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true as const };
  if (red === "whatsapp") {
    return (
      <svg {...s} {...TRAZO}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    );
  }
  if (red === "instagram") {
    return (
      <svg {...s} {...TRAZO}>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    );
  }
  if (red === "facebook") {
    return (
      <svg {...s} {...TRAZO}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    );
  }
  return (
    <svg {...s} {...TRAZO}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none" />
    </svg>
  );
}

export const REDES_MARCA: {
  nombre: string;
  red: RedMarca;
  url: string;
  hoverColor: string;
}[] = [
  {
    nombre: "WhatsApp",
    red: "whatsapp",
    url: CONTACTO_PUBLICO.whatsapp.url,
    hoverColor: "hover:text-emerald-400",
  },
  {
    nombre: "Instagram",
    red: "instagram",
    url: CONTACTO_PUBLICO.instagram.url,
    hoverColor: "hover:text-pink-500",
  },
  {
    nombre: "Facebook",
    red: "facebook",
    url: CONTACTO_PUBLICO.facebook.url,
    hoverColor: "hover:text-blue-500",
  },
  {
    nombre: "YouTube",
    red: "youtube",
    url: CONTACTO_PUBLICO.youtube.url,
    hoverColor: "hover:text-red-500",
  },
];
