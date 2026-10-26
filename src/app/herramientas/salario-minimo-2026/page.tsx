import CierreInpcCaja from "@/components/publico/CierreInpcCaja";
import HerramientaTabla from "@/components/publico/HerramientaTabla";
import { PanelSalarioMinimo } from "@/components/publico/HerramientasFiscales";
import { SALARIO_MINIMO_VIGENTE } from "@/lib/fiscal/salario-minimo";
import {
  buildHerramientaJsonLd,
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";

const config = getHerramientaConfig("salario");

export const metadata = buildHerramientaMetadata(config);

const fmt = (n: number) =>
  n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  });

export default function SalarioMinimoPage() {
  const general = fmt(SALARIO_MINIMO_VIGENTE.general);
  return (
    <HerramientaTabla
      config={config}
      cabezal={{ oficina: "RDC · Tablas", fuente: "CONASAMI" }}
      h1={
        <>
          Salario mínimo <em>2026</em>
        </>
      }
      dato={
        <CierreInpcCaja
          valor={general}
          periodo={`${SALARIO_MINIMO_VIGENTE.vigenciaDesde} · zona general`}
          etiqueta="General"
          ariaNombre="salario mínimo general"
        />
      }
      lead={
        <>
          El salario mínimo es la retribución diaria mínima en México. En 2026
          la zona general es <strong>{general}</strong> y la Frontera Norte{" "}
          <strong>{fmt(SALARIO_MINIMO_VIGENTE.fronteraNorte)}</strong>, vigentes
          desde {SALARIO_MINIMO_VIGENTE.vigenciaDesde}. Abajo, histórico y
          extracto de salarios profesionales.
        </>
      }
      jsonLd={<JsonLd data={buildHerramientaJsonLd(config)} />}
      destinos={[
        {
          href: "/herramientas/uma",
          label: "UMA vigente",
          detalle: "No es lo mismo: la UMA es referencia para multas y topes.",
        },
        {
          href: "/herramientas/salario-diario-integrado",
          label: "Salario Diario Integrado",
          detalle: "El factor de integración para IMSS e INFONAVIT.",
        },
        {
          href: "/herramientas/isr-2026",
          label: "Tarifas ISR 2026",
          detalle: "Las tablas del Anexo 8 para retenciones de nómina.",
        },
      ]}
      cta={{
        titulo: "¿Tienes empleados o nómina que declarar?",
        cuerpo:
          "IMSS, INFONAVIT y obligaciones laborales al día. Primera llamada gratis.",
        primario: { href: "/contacto", label: "Hablar con un asesor" },
        secundario: { href: "/herramientas", label: "Todas las herramientas" },
      }}
    >
      <PanelSalarioMinimo />
    </HerramientaTabla>
  );
}
