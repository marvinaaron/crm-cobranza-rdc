import Link from "next/link";
import IconoAppHerramienta from "@/components/publico/IconoAppHerramienta";
import {
  GLIFOS_TABLA,
  esCalculadora,
} from "@/components/publico/glifos-tablas";
import {
  HERRAMIENTAS,
  type HerramientaId,
} from "@/lib/seo/herramientas-config";

export type DestinoSeguir = {
  href: string;
  label: string;
  detalle: string;
};

function idDesdeHref(href: string): HerramientaId | null {
  const path = href.split("#")[0]?.split("?")[0] ?? href;
  const hit = HERRAMIENTAS.find((h) => h.path === path);
  return hit?.id ?? null;
}

function IconoDestino({ id }: { id: HerramientaId | null }) {
  if (id && esCalculadora(id)) {
    return (
      <IconoAppHerramienta id={id} size={32} className="hz-seguir-ico" />
    );
  }

  const glifo = id ? GLIFOS_TABLA[id] : null;
  if (glifo) {
    return (
      <span className="hz-seguir-ico hz-seguir-ico-tabla" aria-hidden>
        {glifo}
      </span>
    );
  }

  return (
    <span className="hz-seguir-ico hz-seguir-ico-gen" aria-hidden>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    </span>
  );
}

/**
 * Franja horizontal tipo “otros regímenes”: icono + título + detalle,
 * divisores verticales que no tocan el borde del cuadro.
 * Calculadoras → icono app (R). Tablas → glifo del hub.
 */
export default function SeguirEnSitio({
  destinos,
  titulo = "Seguir en el sitio",
}: {
  destinos: DestinoSeguir[];
  titulo?: string;
}) {
  if (destinos.length === 0) return null;

  return (
    <nav
      className="hz-seguir"
      aria-label="Profundizar"
      data-n={destinos.length}
    >
      <h2>{titulo}</h2>
      <div className="hz-seguir-fila">
        {destinos.map((d) => (
          <Link key={d.href} href={d.href}>
            <IconoDestino id={idDesdeHref(d.href)} />
            <span className="hz-seguir-txt">
              <strong>{d.label}</strong>
              <span>{d.detalle}</span>
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
