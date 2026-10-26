import { cache } from "react";
import ActualizarInpcRecargosSua from "@/components/publico/ActualizarInpcRecargosSua";
import HerramientaTabla from "@/components/publico/HerramientaTabla";
import { obtenerSerieInpc } from "@/lib/fiscal/inegi";
import {
  buildHerramientaJsonLd,
  buildHerramientaMetadata,
  getHerramientaConfig,
} from "@/lib/seo/herramientas-config";
import { JsonLd } from "@/lib/seo/json-ld";

export const revalidate = 21600;

const cargarInpc = cache(obtenerSerieInpc);
const config = getHerramientaConfig("inpc-sua");

export async function generateMetadata() {
  return buildHerramientaMetadata(config);
}

export default async function ActualizarInpcRecargosSuaPage() {
  const datos = await cargarInpc();

  return (
    <HerramientaTabla
      config={config}
      cabezal={{ oficina: "RDC · Tablas", fuente: "INEGI · LIF · SUA IMSS" }}
      h1={
        <>
          SUA · <em>Actualiza</em>
        </>
      }
      lead={
        <>
          En Utilerías del SUA pegas dos cifras por periodo: la{" "}
          <strong>mora</strong> (Recargos, sin el %) y el cierre mensual del{" "}
          <strong>INPC</strong>. Elige mes y año; copia ambos al programa. La
          mora es la misma todo el año; el INPC cambia cada mes.
        </>
      }
      jsonLd={<JsonLd data={buildHerramientaJsonLd(config)} />}
      destinos={[
        {
          href: "/herramientas/recargos-federales",
          label: "Tasas de recargos",
          detalle: "Mora y prórroga del año, con histórico.",
        },
        {
          href: "/herramientas/inpc",
          label: "INPC · INEGI",
          detalle: "La serie completa del índice, mes a mes.",
        },
        {
          href: "/blog/sua-imss-como-actualizar-inpc-y-recargos",
          label: "Guía del SUA",
          detalle: "Paso a paso para Utilerías y el SIPARE.",
        },
      ]}
      cta={{
        titulo: "¿El SUA te arroja diferencias o se te pasó el SIPARE?",
        cuerpo:
          "Actualizamos INPC y recargos, y te sacamos la línea con la fecha de pago que elijas.",
        primario: { href: "/contacto", label: "Hablar con un asesor" },
        secundario: { href: "/herramientas", label: "Todas las herramientas" },
      }}
    >
      <ActualizarInpcRecargosSua
        serieInicial={datos.serie}
        origen="herramienta"
      />
    </HerramientaTabla>
  );
}
