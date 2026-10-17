"use client";

import PillDeslizable from "@/components/ui/PillDeslizable";

export type PestanaFicha = "sat" | "imss" | "estatales" | "repse";
export type PestanaSat = "cumplimiento" | "historico" | "carpeta";

const OUTER: Array<{ id: PestanaFicha; label: string }> = [
  { id: "sat", label: "SAT" },
  { id: "imss", label: "IMSS" },
  { id: "estatales", label: "Estatales" },
  { id: "repse", label: "REPSE" },
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
  const opciones = OUTER.filter((p) => visibles.includes(p.id));
  if (opciones.length === 0) return null;
  const value = opciones.some((o) => o.id === activa) ? activa : opciones[0].id;
  return (
    <PillDeslizable
      acento="claro"
      size="sm"
      compact={opciones.length <= 2}
      value={value}
      onChange={onChange}
      opciones={opciones.map((p) => ({ value: p.id, label: p.label }))}
      className="w-full"
    />
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
    <PillDeslizable
      acento="claro"
      size="sm"
      value={activa}
      onChange={onChange}
      opciones={INNER.map((p) => ({ value: p.id, label: p.label }))}
      className="w-full"
    />
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
