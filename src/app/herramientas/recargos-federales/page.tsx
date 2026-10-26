import CierreInpcCaja from "@/components/publico/CierreInpcCaja";
import HerramientaTabla from "@/components/publico/HerramientaTabla";
import { PanelRecargos } from "@/components/publico/HerramientasFiscales";
import {
  TASA_MORA_PCT_2026,
  TASA_PRORROGA_PCT_2026,
} from "@/lib/fiscal/recargos";
import {
  buildHerramientaJsonLd,
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";

const config = getHerramientaConfig("recargos");

export const metadata = buildHerramientaMetadata(config);

export default function RecargosFederalesPage() {
  const mora = TASA_MORA_PCT_2026.toFixed(2);
  return (
    <HerramientaTabla
      config={config}
      cabezal={{ oficina: "RDC · Tablas", fuente: "LIF · art. 21 CFF" }}
      h1={
        <>
          Tasas de recargos <em>2026</em>
        </>
      }
      dato={
        <CierreInpcCaja
          valor={mora}
          periodo="Mora · lista para el SUA"
          etiqueta="Mora 2026"
          ariaNombre="mora"
        />
      }
      lead={
        <>
          Cuando una contribución federal se paga fuera de plazo, el SAT cobra
          recargos. En 2026 la mora (sin convenio) es{" "}
          <strong>{mora}%</strong> mensual y la prórroga{" "}
          <strong>{TASA_PRORROGA_PCT_2026.toFixed(2)}%</strong>. Las fija la Ley
          de Ingresos: valen los doce meses hasta que salga una nueva ley. La
          tabla de abajo es la que se pega en el SUA.
        </>
      }
      jsonLd={<JsonLd data={buildHerramientaJsonLd(config)} />}
      destinos={[
        {
          href: "/herramientas/actualizar-inpc-recargos-sua",
          label: "SUA - Actualiza",
          detalle: "Mes, año, mora e INPC listos para Utilerías.",
        },
        {
          href: "/herramientas/recargos-sat",
          label: "Calculadora de recargos",
          detalle: "Estima el importe de un adeudo con INPC y mora.",
        },
        {
          href: "/herramientas/inpc",
          label: "INPC · INEGI",
          detalle: "El índice que actualiza el monto antes del recargo.",
        },
      ]}
      cta={{
        titulo: "¿Tienes adeudos con recargos ante el SAT?",
        cuerpo:
          "Regularizamos tu situación y evitamos que crezca la deuda. Primera llamada gratis.",
        primario: { href: "/contacto", label: "Hablar con un asesor" },
        secundario: { href: "/herramientas", label: "Todas las herramientas" },
      }}
    >
      <PanelRecargos />
    </HerramientaTabla>
  );
}
