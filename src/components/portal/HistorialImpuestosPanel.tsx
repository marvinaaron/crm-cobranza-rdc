"use client";

import { useMemo } from "react";
import { MESES_NOM, type Cliente, type Periodo } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import {
  type CategoriaId,
  CATEGORIA_META,
  asegurarBloques,
  formatMontoImpuesto,
  esSinPagoImpuestos,
  previewPublicado,
  categoriaConPagoEnRegistro,
  getSubtotalCategoria,
  getFechaLimiteCategoria,
  limiteVencido,
  pagoValidadoCategoria,
  tieneComprobantePagoCategoria,
  categoriaTieneExtemporaneo,
} from "@/lib/cumplimiento";
import { categoriasHabilitadasCliente } from "@/lib/config-cumplimiento-cliente";
import PortalSection from "@/components/portal/PortalSection";

const CALENDLY_ASESORIA = "https://calendly.com/rdcontadores/asesoria";

const MESES_CORTOS = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
];

type Estado = "pagado" | "extemporaneo" | "cero" | "pendiente" | "vencido" | "sin_dato";

type CeldaMes = {
  mes: number; // 1..12
  estado: Estado;
  monto: number;
  pagadoEn?: string;
};

type FilaCategoria = {
  categoria: CategoriaId;
  meses: CeldaMes[];
  totalPagado: number;
};

type Props = { cliente: Cliente };

export default function HistorialImpuestosPanel({ cliente }: Props) {
  const {
    getHistorialImpuestosCliente,
    getCumplimientoPeriodo,
    periodoFiscalVigente,
  } = useClientes();

  const cats = categoriasHabilitadasCliente(cliente);
  const anioVista = periodoFiscalVigente.anio;
  const mesHoy =
    periodoFiscalVigente.anio === new Date().getFullYear()
      ? new Date().getMonth() + 1
      : 12;

  const filas = useMemo<FilaCategoria[]>(() => {
    return cats.map((cat) => {
      const historial = getHistorialImpuestosCliente(cliente.id, cat).filter(
        (h) => h.anio === anioVista
      );
      const porMes = new Map(historial.map((h) => [h.mes, h]));

      const meses: CeldaMes[] = Array.from({ length: 12 }, (_, i) => {
        const mes = i + 1;
        const periodo: Periodo = { mes, anio: anioVista };
        const regRaw = getCumplimientoPeriodo(cliente.id, periodo);
        const reg = regRaw ? asegurarBloques(regRaw) : undefined;
        const hist = porMes.get(mes);

        // 1) Pagado/validado/extemporáneo: hay entrada en historial
        if (hist && hist.monto > 0) {
          return {
            mes,
            estado: categoriaTieneExtemporaneo(reg, cat)
              ? "extemporaneo"
              : "pagado",
            monto: hist.monto,
            pagadoEn: hist.pagadoEn,
          };
        }

        // 2) Sin pago (declaración en ceros)
        if (esSinPagoImpuestos(reg)) {
          return { mes, estado: "cero", monto: 0 };
        }

        // 3) Sin previo o sin pago en preview → considerar como sin obligación
        const hayPrevio = previewPublicado(reg);
        const aplicaCat = reg ? categoriaConPagoEnRegistro(reg, cat) : false;
        const subtotal = reg ? getSubtotalCategoria(reg, cat) : 0;

        if (reg && hayPrevio && aplicaCat && subtotal > 0) {
          // Hay obligación detectada en el preview
          const fl = getFechaLimiteCategoria(reg, cat);
          const yaVencio = !!fl && limiteVencido(fl);
          const conComprobante = tieneComprobantePagoCategoria(reg, cat);
          const validado = pagoValidadoCategoria(reg, cat);

          if (validado && conComprobante) {
            // Edge case: validado pero la entrada de historial no llegó (no
            // debería pasar). Lo tratamos como pagado.
            return {
              mes,
              estado: "pagado",
              monto: subtotal,
            };
          }
          if (yaVencio) {
            return { mes, estado: "vencido", monto: subtotal };
          }
          return { mes, estado: "pendiente", monto: subtotal };
        }

        // 4) Mes futuro o sin información
        if (mes > mesHoy) return { mes, estado: "sin_dato", monto: 0 };
        // Mes pasado sin obligación detectable → sin datos
        return { mes, estado: "sin_dato", monto: 0 };
      });

      const totalPagado = meses
        .filter((m) => m.estado === "pagado" || m.estado === "extemporaneo")
        .reduce((s, m) => s + m.monto, 0);

      return { categoria: cat, meses, totalPagado };
    });
  }, [
    cats,
    cliente.id,
    anioVista,
    mesHoy,
    getHistorialImpuestosCliente,
    getCumplimientoPeriodo,
  ]);

  const algunaActiva = filas.length > 0;

  return (
    <>
      {algunaActiva && (
        <PortalSection title={`Historial ${anioVista}`} collapsible>
          <p className="text-[10px] font-bold text-slate-400 mb-4 leading-relaxed">
            Resumen mensual de tus impuestos. Verde = pagado, ámbar = pendiente,
            rojo = vencido, gris = sin obligación.
          </p>
          <div className="space-y-5">
            {filas.map((fila) => {
              const meta = CATEGORIA_META[fila.categoria];
              return (
                <div key={fila.categoria}>
                  <div className="flex items-baseline justify-between mb-2">
                    <p
                      className={`text-[10px] font-black uppercase tracking-widest ${meta.accent}`}
                    >
                      {meta.label}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 tabular-nums">
                      Pagado {anioVista}:{" "}
                      <span className={`font-black ${meta.accent}`}>
                        {formatMontoImpuesto(fila.totalPagado)}
                      </span>
                    </p>
                  </div>

                  <ul className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                    {fila.meses.map((m) => (
                      <CeldaMesView key={m.mes} celda={m} esActual={m.mes === mesHoy} />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <Leyenda />
        </PortalSection>
      )}

      <PortalSection title="¿Dudas con tus impuestos?" collapsible defaultOpen={false}>
        <p className="text-xs font-bold text-slate-500 mb-4 leading-relaxed">
          Agenda una asesoría con tu contador en el horario que te convenga.
        </p>
        <a
          href={CALENDLY_ASESORIA}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full justify-center py-3.5 rounded-2xl bg-blue-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-800"
        >
          Agendar asesoría en Calendly
        </a>
      </PortalSection>
    </>
  );
}

function CeldaMesView({
  celda,
  esActual,
}: {
  celda: CeldaMes;
  esActual: boolean;
}) {
  const labelMes = MESES_CORTOS[celda.mes - 1];
  const cls = ESTILO_ESTADO[celda.estado];
  return (
    <li
      title={tituloCelda(celda)}
      className={`relative rounded-lg border px-2 py-2 flex flex-col items-center justify-center min-h-[58px] ${cls.bg} ${cls.border} ${esActual ? "ring-2 ring-offset-1 ring-slate-300" : ""}`}
    >
      <span className={`text-[8px] font-black uppercase tracking-widest ${cls.labelColor}`}>
        {labelMes}
      </span>
      <span className={`text-[10px] font-black tabular-nums mt-0.5 ${cls.numColor}`}>
        {renderValor(celda)}
      </span>
      {celda.estado === "extemporaneo" && (
        <span className="absolute -top-1.5 -right-1.5 text-[7px] font-black px-1 rounded-full bg-red-500 text-white shadow">
          EXT
        </span>
      )}
    </li>
  );
}

function renderValor(c: CeldaMes): string {
  if (c.estado === "pagado" || c.estado === "extemporaneo") {
    if (c.monto >= 1_000_000) return `${Math.round(c.monto / 1000)}k`;
    if (c.monto >= 1000) return `${Math.round(c.monto / 100) / 10}k`;
    return formatMontoImpuesto(c.monto);
  }
  if (c.estado === "cero") return "$0";
  if (c.estado === "pendiente") return "···";
  if (c.estado === "vencido") return "!";
  return "—";
}

function tituloCelda(c: CeldaMes): string {
  const nombreMes = MESES_NOM[c.mes];
  if (c.estado === "pagado")
    return `${nombreMes}: pagado ${formatMontoImpuesto(c.monto)}`;
  if (c.estado === "extemporaneo")
    return `${nombreMes}: extemporáneo ${formatMontoImpuesto(c.monto)}`;
  if (c.estado === "cero") return `${nombreMes}: sin impuestos a pagar`;
  if (c.estado === "pendiente")
    return `${nombreMes}: pago pendiente · ${formatMontoImpuesto(c.monto)}`;
  if (c.estado === "vencido")
    return `${nombreMes}: plazo vencido sin comprobante · ${formatMontoImpuesto(c.monto)}`;
  return `${nombreMes}: sin información`;
}

const ESTILO_ESTADO: Record<
  Estado,
  { bg: string; border: string; labelColor: string; numColor: string }
> = {
  pagado: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    labelColor: "text-emerald-700",
    numColor: "text-emerald-700",
  },
  extemporaneo: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    labelColor: "text-amber-700",
    numColor: "text-amber-800",
  },
  cero: {
    bg: "bg-slate-100",
    border: "border-slate-200",
    labelColor: "text-slate-500",
    numColor: "text-slate-600",
  },
  pendiente: {
    bg: "bg-white",
    border: "border-slate-200 border-dashed",
    labelColor: "text-slate-400",
    numColor: "text-slate-400",
  },
  vencido: {
    bg: "bg-red-50",
    border: "border-red-200",
    labelColor: "text-red-700",
    numColor: "text-red-700",
  },
  sin_dato: {
    bg: "bg-slate-50",
    border: "border-slate-100",
    labelColor: "text-slate-300",
    numColor: "text-slate-300",
  },
};

function Leyenda() {
  const items: { color: string; label: string }[] = [
    { color: "bg-emerald-200", label: "Pagado" },
    { color: "bg-amber-200", label: "Extemporáneo" },
    { color: "bg-slate-200", label: "Sin pago ($0)" },
    { color: "bg-white border-dashed", label: "Pendiente" },
    { color: "bg-red-200", label: "Vencido" },
    { color: "bg-slate-100", label: "Sin info" },
  ];
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-5 pt-4 border-t border-slate-100">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5">
          <span
            className={`inline-block w-3 h-3 rounded border border-slate-200 ${it.color}`}
          />
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            {it.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export { CALENDLY_ASESORIA };
