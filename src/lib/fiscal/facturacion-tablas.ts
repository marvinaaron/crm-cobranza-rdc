/**
 * Tasas y fundamentos legales — Calculadora de Facturación (neto → CFDI).
 * Fuentes: LISR, LIVA, RLIVA, RMF 2026.
 */

export type TipoEmisor = "pf" | "pm";
export type RegimenEmisor = "resico" | "pfae";
export type TipoReceptor = "pm" | "pf";
export type TipoOperacion =
  | "honorarios"
  | "venta_bienes"
  | "arrendamiento_domestico"
  | "arrendamiento_amueblado"
  | "arrendamiento_comercial"
  | "comisionista"
  | "autotransporte"
  | "agapes";

export type FundamentoLegal = {
  ley: string;
  articulo: string;
  nota?: string;
};

export type TasasOperacion = {
  aplicaIva: boolean;
  /** Retención IVA como fracción del subtotal (ej. 0.106667 = 2/3 del IVA 16%). */
  retIvaSubtotal: number;
  /** Retención ISR como fracción del subtotal. */
  retIsrSubtotal: number;
  fundamentos: FundamentoLegal[];
  etiquetaIva: string;
  etiquetaRetIva: string;
  etiquetaRetIsr: string;
};

const F_ISR_RESICO: FundamentoLegal = {
  ley: "LISR",
  articulo: "Art. 113-J",
  nota: "1.25% sobre el pago sin IVA (persona moral receptora).",
};
const F_ISR_PFAE_HON: FundamentoLegal = {
  ley: "LISR",
  articulo: "Art. 106",
  nota: "10% sobre honorarios / servicios profesionales hacia PM.",
};
const F_ISR_PFAE_ARREND: FundamentoLegal = {
  ley: "LISR",
  articulo: "Art. 116",
  nota: "10% sobre arrendamiento hacia PM.",
};
const F_IVA_RET_2_3: FundamentoLegal = {
  ley: "LIVA",
  articulo: "Art. 1-A fr. II + RLIVA Art. 3 fr. I",
  nota: "Retención de 2/3 del IVA trasladado.",
};
const F_IVA_RET_FLETE: FundamentoLegal = {
  ley: "LIVA",
  articulo: "Art. 1-A fr. II inc. c) + RLIVA Art. 3 fr. II",
  nota: "4% sobre la contraprestación (autotransporte).",
};
const F_IVA_EXENTO_CASA: FundamentoLegal = {
  ley: "LIVA",
  articulo: "Art. 20 fr. II",
  nota: "Casa habitación uso doméstico sin amueblar — exento de IVA.",
};
const F_IVA_AMUEBLADO: FundamentoLegal = {
  ley: "RLIVA",
  articulo: "Art. 45",
  nota: "Casa habitación amueblada — IVA sobre el total.",
};
const F_AGAPES_EXENTO: FundamentoLegal = {
  ley: "RMF 2026",
  articulo: "Regla 3.13.26 + Art. 113-E 9º párrafo LISR",
  nota: "Relevo de retención si ingresos AGAPES exentos (≤ $900,000/año) y leyenda en CFDI.",
};

/** 2/3 del IVA general (16%). */
export const RET_IVA_2_3_DE_16 = 0.106667;
/** 2/3 del IVA frontera (8%). */
export const RET_IVA_2_3_DE_8 = 0.053333;
export const RET_IVA_AUTOTRANSPORTE = 0.04;
export const RET_ISR_RESICO = 0.0125;
export const RET_ISR_PFAE = 0.1;

export const OPERACIONES_META: Record<
  TipoOperacion,
  { label: string; grupo: "servicios" | "venta" | "arrendamiento" | "otros" }
> = {
  honorarios: { label: "Honorarios", grupo: "servicios" },
  comisionista: { label: "Comisiones", grupo: "servicios" },
  venta_bienes: { label: "Venta de bienes", grupo: "venta" },
  arrendamiento_domestico: {
    label: "Casa doméstica",
    grupo: "arrendamiento",
  },
  arrendamiento_amueblado: {
    label: "Casa amueblada",
    grupo: "arrendamiento",
  },
  arrendamiento_comercial: {
    label: "Local / comercial",
    grupo: "arrendamiento",
  },
  autotransporte: { label: "Autotransporte", grupo: "otros" },
  agapes: { label: "AGAPES", grupo: "otros" },
};

export function tasasParaOperacion(opts: {
  emisor: TipoEmisor;
  regimen?: RegimenEmisor;
  receptor: TipoReceptor;
  operacion: TipoOperacion;
  ivaFrontera: boolean;
  agapesExento: boolean;
}): TasasOperacion | { error: string } {
  const { emisor, regimen, receptor, operacion, ivaFrontera, agapesExento } =
    opts;

  if (emisor === "pm") {
    return {
      aplicaIva: operacion !== "arrendamiento_domestico",
      retIvaSubtotal: 0,
      retIsrSubtotal: 0,
      fundamentos: [
        {
          ley: "LIVA / LISR",
          articulo: "—",
          nota: "Esta calculadora modela retenciones cuando tú facturas como persona física. Como persona moral emisora no aplican estas retenciones al cobrarte.",
        },
      ],
      etiquetaIva: "IVA",
      etiquetaRetIva: "Ret. IVA",
      etiquetaRetIsr: "Ret. ISR",
    };
  }

  if (!regimen) {
    return { error: "Selecciona régimen fiscal (RESICO o PFAE)." };
  }

  if (receptor === "pf") {
    return {
      aplicaIva: operacion !== "arrendamiento_domestico",
      retIvaSubtotal: 0,
      retIsrSubtotal: 0,
      fundamentos: [
        {
          ley: "LIVA / LISR",
          articulo: "—",
          nota: "Entre personas físicas, por regla general no hay retención de ISR ni IVA en estos escenarios.",
        },
      ],
      etiquetaIva: "IVA",
      etiquetaRetIva: "Ret. IVA",
      etiquetaRetIsr: "Ret. ISR",
    };
  }

  // Receptor persona moral — retenciones
  const retIva2_3 = ivaFrontera ? RET_IVA_2_3_DE_8 : RET_IVA_2_3_DE_16;
  const isrResico = RET_ISR_RESICO;
  const isrPfaeHon = RET_ISR_PFAE;
  const isrPfaeArrend = RET_ISR_PFAE;

  if (operacion === "agapes" && agapesExento) {
    return {
      aplicaIva: false,
      retIvaSubtotal: 0,
      retIsrSubtotal: 0,
      fundamentos: [F_AGAPES_EXENTO],
      etiquetaIva: "IVA (exento)",
      etiquetaRetIva: "Ret. IVA (no aplica)",
      etiquetaRetIsr: "Ret. ISR (relevo)",
    };
  }

  const isr =
    regimen === "resico"
      ? isrResico
      : operacion === "arrendamiento_domestico" ||
          operacion === "arrendamiento_amueblado" ||
          operacion === "arrendamiento_comercial"
        ? isrPfaeArrend
        : isrPfaeHon;

  switch (operacion) {
    case "honorarios":
      return {
        aplicaIva: true,
        retIvaSubtotal: retIva2_3,
        retIsrSubtotal: isr,
        fundamentos: [
          regimen === "resico" ? F_ISR_RESICO : F_ISR_PFAE_HON,
          F_IVA_RET_2_3,
        ],
        etiquetaIva: ivaFrontera ? "IVA 8%" : "IVA 16%",
        etiquetaRetIva: ivaFrontera ? "Ret. IVA (5.3333%)" : "Ret. IVA (10.6667%)",
        etiquetaRetIsr:
          regimen === "resico" ? "Ret. ISR (1.25%)" : "Ret. ISR (10%)",
      };
    case "comisionista":
      return {
        aplicaIva: true,
        retIvaSubtotal: retIva2_3,
        retIsrSubtotal: isr,
        fundamentos: [
          regimen === "resico" ? F_ISR_RESICO : F_ISR_PFAE_HON,
          F_IVA_RET_2_3,
        ],
        etiquetaIva: ivaFrontera ? "IVA 8%" : "IVA 16%",
        etiquetaRetIva: ivaFrontera ? "Ret. IVA (5.3333%)" : "Ret. IVA (10.6667%)",
        etiquetaRetIsr:
          regimen === "resico" ? "Ret. ISR (1.25%)" : "Ret. ISR (10%)",
      };
    case "venta_bienes":
      return {
        aplicaIva: true,
        retIvaSubtotal: 0,
        retIsrSubtotal: regimen === "resico" ? isrResico : 0,
        fundamentos: [
          regimen === "resico"
            ? F_ISR_RESICO
            : {
                ley: "LISR",
                articulo: "Actividad empresarial",
                nota: "Enajenación de bienes PFAE hacia PM: sin retención de ISR ni IVA.",
              },
        ],
        etiquetaIva: ivaFrontera ? "IVA 8%" : "IVA 16%",
        etiquetaRetIva: "Ret. IVA (no aplica)",
        etiquetaRetIsr:
          regimen === "resico" ? "Ret. ISR (1.25%)" : "Ret. ISR (no aplica)",
      };
    case "arrendamiento_domestico":
      return {
        aplicaIva: false,
        retIvaSubtotal: 0,
        retIsrSubtotal: isr,
        fundamentos: [F_IVA_EXENTO_CASA, regimen === "resico" ? F_ISR_RESICO : F_ISR_PFAE_ARREND],
        etiquetaIva: "IVA (exento)",
        etiquetaRetIva: "Ret. IVA (no aplica)",
        etiquetaRetIsr:
          regimen === "resico" ? "Ret. ISR (1.25%)" : "Ret. ISR (10%)",
      };
    case "arrendamiento_amueblado":
      return {
        aplicaIva: true,
        retIvaSubtotal: retIva2_3,
        retIsrSubtotal: isr,
        fundamentos: [
          F_IVA_AMUEBLADO,
          regimen === "resico" ? F_ISR_RESICO : F_ISR_PFAE_ARREND,
          F_IVA_RET_2_3,
        ],
        etiquetaIva: ivaFrontera ? "IVA 8%" : "IVA 16%",
        etiquetaRetIva: ivaFrontera ? "Ret. IVA (5.3333%)" : "Ret. IVA (10.6667%)",
        etiquetaRetIsr:
          regimen === "resico" ? "Ret. ISR (1.25%)" : "Ret. ISR (10%)",
      };
    case "arrendamiento_comercial":
      return {
        aplicaIva: true,
        retIvaSubtotal: retIva2_3,
        retIsrSubtotal: isr,
        fundamentos: [
          regimen === "resico" ? F_ISR_RESICO : F_ISR_PFAE_ARREND,
          F_IVA_RET_2_3,
        ],
        etiquetaIva: ivaFrontera ? "IVA 8%" : "IVA 16%",
        etiquetaRetIva: ivaFrontera ? "Ret. IVA (5.3333%)" : "Ret. IVA (10.6667%)",
        etiquetaRetIsr:
          regimen === "resico" ? "Ret. ISR (1.25%)" : "Ret. ISR (10%)",
      };
    case "autotransporte":
      return {
        aplicaIva: true,
        retIvaSubtotal: RET_IVA_AUTOTRANSPORTE,
        retIsrSubtotal: isr,
        fundamentos: [
          regimen === "resico" ? F_ISR_RESICO : F_ISR_PFAE_HON,
          F_IVA_RET_FLETE,
        ],
        etiquetaIva: ivaFrontera ? "IVA 8%" : "IVA 16%",
        etiquetaRetIva: "Ret. IVA (4%)",
        etiquetaRetIsr:
          regimen === "resico" ? "Ret. ISR (1.25%)" : "Ret. ISR (10%)",
      };
    case "agapes":
      return {
        aplicaIva: false,
        retIvaSubtotal: 0,
        retIsrSubtotal: regimen === "resico" ? isrResico : isrPfaeHon,
        fundamentos: [regimen === "resico" ? F_ISR_RESICO : F_ISR_PFAE_HON],
        etiquetaIva: "IVA (no aplica)",
        etiquetaRetIva: "Ret. IVA (no aplica)",
        etiquetaRetIsr:
          regimen === "resico" ? "Ret. ISR (1.25%)" : "Ret. ISR (10%)",
      };
    default:
      return { error: "Operación no reconocida." };
  }
}
