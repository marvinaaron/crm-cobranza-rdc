"use client";

import { TONO_ESTATAL, TONO_IMSS, TONO_REPSE, TONO_SAT } from "@/lib/cumplimiento";

export type PestanaFicha = "sat" | "imss" | "estatales" | "repse";
export type PestanaSat = "cumplimiento" | "historico" | "carpeta";

const OUTER: Array<{
  id: PestanaFicha;
  label: string;
  on: string;
  off: string;
}> = [
  {
    id: "sat",
    label: "SAT",
    on: TONO_SAT.header,
    off: "bg-white text-[#1D4ED8] ring-1 ring-[#1D4ED8]/25",
  },
  {
    id: "imss",
    label: "IMSS",
    on: TONO_IMSS.header,
    off: "bg-white text-[#006847] ring-1 ring-[#006847]/25",
  },
  {
    id: "estatales",
    label: "Estatales",
    on: TONO_ESTATAL.header,
    off: "bg-white text-[#D98638] ring-1 ring-[#D98638]/30",
  },
  {
    id: "repse",
    label: "REPSE",
    on: TONO_REPSE.header,
    off: "bg-white text-[#454F54] ring-1 ring-[#454F54]/25",
  },
];

const INNER: Array<{ id: PestanaSat; label: string }> = [
  { id: "cumplimiento", label: "Cumplimiento" },
  { id: "historico", label: "Histórico" },
  { id: "carpeta", label: "Carpeta" },
];

export function PildorasCategoriaFicha({
  visibles,
  activa,
  onChange,
}: {
  visibles: PestanaFicha[];
  activa: PestanaFicha;
  onChange: (id: PestanaFicha) => void;
}) {
  if (visibles.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {OUTER.filter((p) => visibles.includes(p.id)).map((p) => {
        const on = p.id === activa;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-colors ${
              on ? p.on : p.off
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

export function PildorasSatInner({
  activa,
  onChange,
}: {
  activa: PestanaSat;
  onChange: (id: PestanaSat) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {INNER.map((p) => {
        const on = p.id === activa;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
              on
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

export function pestanasVisiblesCliente(opts: {
  sat: boolean;
  imss: boolean;
  estatales: boolean;
  repse: boolean;
}): PestanaFicha[] {
  const out: PestanaFicha[] = [];
  if (opts.sat) out.push("sat");
  if (opts.imss) out.push("imss");
  if (opts.estatales) out.push("estatales");
  if (opts.repse) out.push("repse");
  return out.length ? out : ["sat"];
}
