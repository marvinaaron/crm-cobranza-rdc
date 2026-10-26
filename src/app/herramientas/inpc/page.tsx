import { cache } from "react";
import CierreInpcCaja from "@/components/publico/CierreInpcCaja";
import HerramientaTabla from "@/components/publico/HerramientaTabla";
import InpcSeoBloques from "@/components/publico/InpcSeoBloques";
import PanelInpcTabla from "@/components/publico/PanelInpcTabla";
import { nombreMesInpc, ultimoRegistroInpc } from "@/lib/fiscal/inpc";
import { obtenerSerieInpc } from "@/lib/fiscal/inegi";
import {
  buildHerramientaJsonLd,
  buildHerramientaMetadata,
  configInpcConSerie,
} from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";

/** Relee INEGI/Banxico cada 6 h: el “último valor” cambia sin un commit. */
export const revalidate = 21600;

const cargarInpc = cache(obtenerSerieInpc);

export async function generateMetadata() {
  const datos = await cargarInpc();
  return buildHerramientaMetadata(configInpcConSerie(datos.serie));
}

export default async function InpcPage() {
  const datos = await cargarInpc();
  const config = configInpcConSerie(datos.serie);
  const ultimo = ultimoRegistroInpc(datos.serie);
  const valor = ultimo.valor.toFixed(3);
  const anio = ultimo.anio;
  const mes = nombreMesInpc(ultimo.mes);

  return (
    <HerramientaTabla
      config={config}
      cabezal={{ oficina: "RDC · Tablas", fuente: "INEGI · base julio 2018" }}
      h1="INPC 2026"
      dato={<CierreInpcCaja valor={valor} periodo={`${mes} ${anio}`} />}
      lead={
        <>
          El INPC {anio} es el valor actualizado del Índice Nacional de Precios
          al Consumidor para el año {anio} en México. El INEGI lo publica
          quincenalmente y{" "}
          <strong>mide la inflación</strong> mediante el seguimiento de los
          precios de una canasta de bienes y servicios representativa del
          consumo de los hogares mexicanos. El valor del INPC en{" "}
          {mes.toLowerCase()} de {anio} es de{" "}
          <strong>{valor} puntos</strong>, según cifras oficiales.
        </>
      }
      jsonLd={<JsonLd data={buildHerramientaJsonLd(config)} />}
      hero={{
        src: "/herramientas/inpc-hero-holograma.jpg",
        alt: "INPC 2026 — Índice Nacional de Precios al Consumidor: tabla, gráfica e inflación en México. RDC Contadores.",
        pie: "INPC 2026 — Índice Nacional de Precios al Consumidor. Valores mensuales e inflación. RDC Contadores.",
      }}
      destinos={[
        {
          href: "/herramientas/actualizar-inpc-recargos-sua",
          label: "SUA - Actualiza",
          detalle: "El mismo INPC, listo para pegar en Utilerías.",
        },
        {
          href: "/herramientas/recargos-sat",
          label: "Recargos y actualización",
          detalle: "El INPC entra al factor del art. 17-A.",
        },
        {
          href: "/herramientas/isr-2026",
          label: "Tarifas ISR 2026",
          detalle: "Las tablas del Anexo 8, en el mismo pliego.",
        },
      ]}
      cta={{
        titulo: "¿Necesitas el INPC para un contrato o el SAT?",
        cuerpo:
          "Te ayudamos con declaraciones, nómina y cumplimiento. Primera llamada gratis.",
        primario: { href: "/contacto", label: "Hablar con un asesor" },
        secundario: { href: "/herramientas", label: "Todas las herramientas" },
      }}
      despues={<InpcSeoBloques serie={datos.serie} />}
    >
      <PanelInpcTabla inicial={datos} />
    </HerramientaTabla>
  );
}
