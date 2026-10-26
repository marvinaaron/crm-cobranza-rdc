import CierreInpcCaja from "@/components/publico/CierreInpcCaja";
import HerramientaTabla from "@/components/publico/HerramientaTabla";
import { PanelUma } from "@/components/publico/HerramientasFiscales";
import { UMA_VIGENTE } from "@/lib/fiscal/uma";
import {
  buildHerramientaJsonLd,
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";

const config = getHerramientaConfig("uma");

export const metadata = buildHerramientaMetadata(config);

const fmt = (n: number) =>
  n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  });

export default function UmaPage() {
  const diaria = fmt(UMA_VIGENTE.diaria);
  return (
    <HerramientaTabla
      config={config}
      cabezal={{ oficina: "RDC · Tablas", fuente: "INEGI · UMA" }}
      h1={
        <>
          UMA <em>{UMA_VIGENTE.anio}</em>
        </>
      }
      dato={
        <CierreInpcCaja
          valor={diaria}
          periodo={`${UMA_VIGENTE.vigenciaDesde} · diaria`}
          etiqueta="UMA vigente"
          ariaNombre="UMA diaria"
        />
      }
      lead={
        <>
          La Unidad de Medida y Actualización es la referencia para multas,
          topes fiscales y obligaciones en México. Vigente del{" "}
          {UMA_VIGENTE.vigenciaDesde} al {UMA_VIGENTE.vigenciaHasta}: diaria{" "}
          <strong>{diaria}</strong>, mensual{" "}
          <strong>{fmt(UMA_VIGENTE.mensual)}</strong> y anual{" "}
          <strong>{fmt(UMA_VIGENTE.anual)}</strong>. Abajo, el histórico anual.
        </>
      }
      jsonLd={<JsonLd data={buildHerramientaJsonLd(config)} />}
      destinos={[
        {
          href: "/herramientas/salario-minimo-2026",
          label: "Salario mínimo 2026",
          detalle: "La UMA no es el salario mínimo; son referencias distintas.",
        },
        {
          href: "/herramientas/recargos-federales",
          label: "Tasas de recargos",
          detalle: "Mora y prórroga del año, listas para el SUA.",
        },
        {
          href: "/herramientas/isr-2026",
          label: "Tarifas ISR 2026",
          detalle: "Las tablas del Anexo 8, en el mismo pliego.",
        },
      ]}
      cta={{
        titulo: "¿Usas la UMA para IMSS, INFONAVIT o topes fiscales?",
        cuerpo:
          "Calculamos y declaramos por ti. Portal de cliente incluido. Primera llamada gratis.",
        primario: { href: "/contacto", label: "Hablar con un asesor" },
        secundario: { href: "/herramientas", label: "Todas las herramientas" },
      }}
    >
      <PanelUma />
    </HerramientaTabla>
  );
}
