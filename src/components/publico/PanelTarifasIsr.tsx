"use client";

import { useState } from "react";
import {
  ISR_PROVISIONALES_PF_2026,
  ISR_RETENCIONES_2026,
  ISR_RIF_BIMESTRAL_2026,
  SUBSIDIO_EMPLEO_2026,
  TARIFA_ISR_ANUAL_2026,
  type BimestreRif,
  type MesProvisional,
  type PeriodicidadRetencion,
  type RenglonTarifa,
  type TarifaIsr,
} from "@/lib/fiscal/isr";

type Categoria = "provisionales" | "rif" | "anual" | "retenciones";

const CATEGORIAS: Array<{ id: Categoria; label: string; leyenda: string }> = [
  {
    id: "provisionales",
    label: "Mensual PF",
    leyenda: "Pagos provisionales de personas físicas con actividad empresarial.",
  },
  {
    id: "rif",
    label: "Bimestral RIF",
    leyenda: "Régimen de Incorporación Fiscal · coeficiente de utilidad.",
  },
  {
    id: "anual",
    label: "Anual",
    leyenda: "Tarifa del ejercicio 2026 (arts. 97 y 152 LISR).",
  },
  {
    id: "retenciones",
    label: "Retenciones",
    leyenda: "Diaria, semanal, decenal, quincenal y mensual.",
  },
];

const ORDEN_RETENCIONES: PeriodicidadRetencion[] = [
  "diaria",
  "semanal",
  "decenal",
  "quincenal",
  "mensual",
];

const ORDEN_MESES: MesProvisional[] = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const ORDEN_BIMESTRES: BimestreRif[] = [
  "ene-feb",
  "mar-abr",
  "may-jun",
  "jul-ago",
  "sep-oct",
  "nov-dic",
];

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "En adelante";
  return n.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtMxn(n: number): string {
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  });
}

export default function PanelTarifasIsr() {
  const [categoria, setCategoria] = useState<Categoria>("provisionales");
  const [retencion, setRetencion] = useState<PeriodicidadRetencion>("mensual");
  const [mes, setMes] = useState<MesProvisional>("enero");
  const [bim, setBim] = useState<BimestreRif>("ene-feb");

  let tarifa: TarifaIsr = TARIFA_ISR_ANUAL_2026;
  if (categoria === "retenciones") tarifa = ISR_RETENCIONES_2026[retencion];
  else if (categoria === "provisionales") tarifa = ISR_PROVISIONALES_PF_2026[mes];
  else if (categoria === "rif") tarifa = ISR_RIF_BIMESTRAL_2026[bim];
  else tarifa = TARIFA_ISR_ANUAL_2026;

  const leyenda = CATEGORIAS.find((c) => c.id === categoria)?.leyenda ?? "";

  return (
    <>
      <div className="tb-indice" role="tablist" aria-label="Tipo de tarifa">
        {CATEGORIAS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={c.id === categoria}
            data-on={c.id === categoria ? "" : undefined}
            onClick={() => setCategoria(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="tb-leyenda">{leyenda}</p>

      {categoria === "retenciones" ? (
        <div className="tb-periodo" role="tablist" aria-label="Periodicidad">
          {ORDEN_RETENCIONES.map((id) => (
            <button
              key={id}
              type="button"
              data-on={id === retencion ? "" : undefined}
              onClick={() => setRetencion(id)}
            >
              {ISR_RETENCIONES_2026[id].etiquetaCorta}
            </button>
          ))}
        </div>
      ) : null}

      {categoria === "provisionales" ? (
        <div className="tb-periodo" role="tablist" aria-label="Mes acumulado">
          {ORDEN_MESES.map((id) => (
            <button
              key={id}
              type="button"
              data-on={id === mes ? "" : undefined}
              onClick={() => setMes(id)}
            >
              {ISR_PROVISIONALES_PF_2026[id].etiquetaCorta}
            </button>
          ))}
        </div>
      ) : null}

      {categoria === "rif" ? (
        <div className="tb-periodo" role="tablist" aria-label="Bimestre">
          {ORDEN_BIMESTRES.map((id) => (
            <button
              key={id}
              type="button"
              data-on={id === bim ? "" : undefined}
              onClick={() => setBim(id)}
            >
              {ISR_RIF_BIMESTRAL_2026[id].etiquetaCorta}
            </button>
          ))}
        </div>
      ) : null}

      <Tabla tarifa={tarifa} />

      {categoria === "retenciones" ? (
        <div className="tb-subsidio">
          <div>
            <p>Subsidio al empleo</p>
            <strong>{fmtMxn(SUBSIDIO_EMPLEO_2026.montoFijoMensual)}</strong>
            <span>Fijo mensual · {SUBSIDIO_EMPLEO_2026.vigenciaDesde}</span>
          </div>
          <div>
            <p>Tope de ingreso</p>
            <strong>1 SMG</strong>
            <span>Hasta {fmtMxn(SUBSIDIO_EMPLEO_2026.limiteIngresoMensual)} / mes</span>
          </div>
        </div>
      ) : null}

      {categoria === "retenciones" ? (
        <p className="tb-pie">{SUBSIDIO_EMPLEO_2026.nota}</p>
      ) : null}
    </>
  );
}

function Tabla({ tarifa }: { tarifa: TarifaIsr }) {
  return (
    <div className="tb-grupo">
      <div className="tb-grupo-head">
        <b>{tarifa.titulo}</b>
        <span>{tarifa.vigenciaDesde}</span>
      </div>
      <div className="tb-hoja">
      <table>
        <thead>
          <tr>
            <th>Límite inferior</th>
            <th>Límite superior</th>
            <th>Cuota fija</th>
            <th>% s/ excedente</th>
          </tr>
        </thead>
        <tbody>
          {tarifa.renglones.map((r, i) => (
            <Fila key={i} r={r} />
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function Fila({ r }: { r: RenglonTarifa }) {
  return (
    <tr>
      <td>{fmt(r.limiteInferior)}</td>
      <td>{fmt(r.limiteSuperior)}</td>
      <td>{fmt(r.cuotaFija)}</td>
      <td data-pct="">{r.porcentajeExcedente.toFixed(2)}%</td>
    </tr>
  );
}
