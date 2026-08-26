/**
 * Catálogo de servicios + perfil (tipo, ingresos, CFDI) para armar cotización.
 * Se pasan a /empezar vía query y rellenan “¿En qué te ayudamos?”.
 */

export type ServicioCotizable = {
  id: string;
  label: string;
  hint: string;
  /** Ícono gold-on-navy en /public/cotizar/iconos/ */
  icon: string;
  /** Segundo ícono (p. ej. IMSS + Infonavit juntos). */
  iconExtra?: string;
  /** Servicios que suelen ir juntos (recomendaciones contextuales). */
  relatedIds?: readonly string[];
};

export const SERVICIOS_COTIZABLES: readonly ServicioCotizable[] = [
  {
    id: "sua",
    label: "Manejo y administración de SUA",
    hint: "Conciliación SUA vs IDSE, movimientos manuales, EMA/EBA y SIPARE al corriente",
    icon: "/cotizar/iconos/sua.png",
    relatedIds: ["nominas", "imss"],
  },
  {
    id: "imss",
    label: "Movimientos IMSS e Infonavit",
    hint: "Altas y bajas en IDSE, modificaciones de salario y créditos Infonavit",
    icon: "/cotizar/iconos/imss.png",
    relatedIds: ["sua", "nominas"],
    iconExtra: "/cotizar/iconos/infonavit.png",
  },
  {
    id: "facturacion",
    label: "Facturación electrónica",
    hint: "Emisión, timbrado y control de CFDI; soporte para que factures sin errores",
    icon: "/cotizar/iconos/facturacion.png",
    relatedIds: ["impuestos", "contabilidad"],
  },
  {
    id: "repse",
    label: "Registro REPSE",
    hint: "Alta y renovación ante STPS, contratos e integración de plantilla",
    icon: "/cotizar/iconos/repse.png",
    relatedIds: ["icsoe-sisub", "contabilidad"],
  },
  {
    id: "icsoe-sisub",
    label: "Declaraciones ICSOE & SISUB",
    hint: "Cumple tus obligaciones cuatrimestrales ante IMSS e Infonavit",
    icon: "/cotizar/iconos/infonavit.png",
    relatedIds: ["repse", "nominas"],
  },
  {
    id: "impuestos",
    label: "Impuestos mensuales",
    hint: "Cálculo y presentación de ISR, IVA, retenciones y DIOT cuando apliquen",
    icon: "/cotizar/iconos/sat.png",
    relatedIds: ["contabilidad", "facturacion"],
  },
  {
    id: "regularizacion",
    label: "Regularización fiscal",
    hint: "Poner al corriente omisos, requerimientos y situación ante el SAT",
    icon: "/cotizar/iconos/sat.png",
    relatedIds: ["impuestos", "asesoria"],
  },
  {
    id: "nominas",
    label: "Nómina y timbrado",
    hint: "Lista de raya (semanal, quincenal o mensual), cálculo y CFDI de nómina",
    icon: "/cotizar/iconos/nomina.png",
    relatedIds: ["sua", "imss"],
  },
  {
    id: "contabilidad",
    label: "Contabilidad mensual",
    hint: "Registro en CONTPAQi, conciliaciones bancarias, ingresos/gastos y portal",
    icon: "/cotizar/iconos/contabilidad.png",
    relatedIds: ["impuestos", "facturacion"],
  },
  {
    id: "anual",
    label: "Declaración anual",
    hint: "Anual de PF o PM: integración de ingresos, deducciones y saldos a favor",
    icon: "/cotizar/iconos/sat.png",
    relatedIds: ["impuestos", "contabilidad"],
  },
  {
    id: "anual-fed",
    label: "Declaración Anual (FED)",
    hint: "Solicitud manual para sueldos y salarios: preparación del paquete de la declaración",
    icon: "/cotizar/iconos/sat.png",
    relatedIds: ["anual", "asesoria"],
  },
  {
    id: "constitucion",
    label: "Constitución de empresa",
    hint: "Alta de persona moral, razón social y estructura legal inicial",
    icon: "/cotizar/iconos/mexico.png",
    relatedIds: ["contabilidad", "asesoria"],
  },
  {
    id: "asesoria",
    label: "Asesoría fiscal",
    hint: "Orientación de régimen, estrategia y consultas puntuales sin tecnicismos",
    icon: "/cotizar/iconos/mexico.png",
    relatedIds: ["impuestos", "regularizacion"],
  },
] as const;

export type TipoEmpresaId = "nuevo" | "fisica" | "moral";

export const TIPOS_EMPRESA: readonly {
  id: TipoEmpresaId;
  label: string;
  hint: string;
  /** Destacado visual: el camino para no-expertos. */
  primario?: boolean;
}[] = [
  {
    id: "nuevo",
    label: "Soy nuevo · necesito saber cuál elegir",
    hint: "Te orientamos sin tecnicismos. Esta página también es para ti.",
    primario: true,
  },
  {
    id: "fisica",
    label: "Soy persona física",
    hint: "RFC de persona física · actividad, RESICO, rentas, apps…",
  },
  {
    id: "moral",
    label: "Soy persona moral",
    hint: "Empresa / sociedad / asociación",
  },
] as const;

/** Regímenes que cotizamos, alineados a /servicios. */
export const REGIMENES_COTIZABLES_PF: readonly {
  id: string;
  label: string;
  hint: string;
}[] = [
  { id: "resico", label: "RESICO (626)", hint: "Simplificado de confianza PF" },
  {
    id: "actividades-empresariales",
    label: "Actividades empresariales (612)",
    hint: "Honorarios / negocio PF",
  },
  {
    id: "arrendamiento",
    label: "Arrendamiento (606)",
    hint: "Rentas de inmuebles",
  },
  {
    id: "plataformas-tecnologicas",
    label: "Plataformas tecnológicas (625)",
    hint: "Uber, DiDi, apps…",
  },
  {
    id: "sueldos-salarios",
    label: "Sueldos y salarios (605)",
    hint: "Asimilados / nómina",
  },
  {
    id: "rif",
    label: "RIF en transición (621)",
    hint: "Migración / cumplimiento",
  },
] as const;

export const REGIMENES_COTIZABLES_PM: readonly {
  id: string;
  label: string;
  hint: string;
}[] = [
  {
    id: "regimen-general",
    label: "Régimen general (601)",
    hint: "Persona moral Título II",
  },
  {
    id: "fines-no-lucrativos",
    label: "Fines no lucrativos (603)",
    hint: "Donatarias / asociaciones",
  },
] as const;

const REGIMEN_BY_ID = new Map(
  [...REGIMENES_COTIZABLES_PF, ...REGIMENES_COTIZABLES_PM].map((r) => [r.id, r])
);

export const INGRESOS_MAX = 300_000;
export const CFDI_MAX = 50;

export type PerfilCotizacion = {
  tipo?: TipoEmpresaId;
  /** Slugs de régimen marcados (solo aplica si tipo es fisica/moral). */
  regimenes: string[];
  /** 0–300000; si mas300, se ignora el número al mostrar */
  ingresos: number;
  ingresosMas300: boolean;
  /** 1–50; si mas50, se ignora el número al mostrar */
  cfdi: number;
  cfdiMas50: boolean;
};

export const PERFIL_VACIO: PerfilCotizacion = {
  tipo: undefined,
  regimenes: [],
  ingresos: 0,
  ingresosMas300: false,
  cfdi: 1,
  cfdiMas50: false,
};

/** Paquetes sugeridos: “Agregar paquete” llena el carrito. Solo RESICO publica precio. */
export type PaqueteCotizable = {
  id: string;
  nombre: string;
  tagline: string;
  /** Frase corta de beneficio (card colapsada). */
  beneficio: string;
  /** Qué hace el paquete (bullets concretos para el cliente). */
  incluye: readonly string[];
  /** Cuántos bullets mostrar antes de “Ver todo”. */
  previewCount?: number;
  servicioIds: readonly string[];
  /** Solo el paquete RESICO muestra precio público. */
  precioDesde?: number;
  popular?: boolean;
  /** Al agregar, sugiere perfil/régimen (no obliga). */
  perfilSugerido?: Partial<Pick<PerfilCotizacion, "tipo" | "regimenes">>;
};

export const PAQUETES_COTIZABLES: readonly PaqueteCotizable[] = [
  {
    id: "nomina-imss",
    nombre: "Nómina + IMSS + SUA",
    tagline: "Personal y seguridad social al día",
    beneficio: "Tu personal al día ante IMSS, Infonavit y el SAT",
    previewCount: 4,
    incluye: [
      "Lista de raya quincenal, semanal o mensual",
      "Timbrado de nómina (CFDI de nómina)",
      "Altas y bajas en IDSE",
      "Conciliación SUA vs IDSE",
      "Movimientos manuales de SUA",
      "Declaración anual y cálculo PRT",
      "Descarga EMA / EBA",
      "Declaración ISN (3%)",
      "Descarga SIPARE",
    ],
    servicioIds: ["nominas", "imss", "sua"],
  },
  {
    id: "contable-base",
    nombre: "Contabilidad + Impuestos + Facturación",
    tagline: "Operación mensual completa (sin REPSE)",
    beneficio: "Operación mensual completa: libros, impuestos y CFDI",
    previewCount: 4,
    incluye: [
      "Registro contable mensual (CONTPAQi Contabiliza)",
      "Conciliaciones bancarias e ingresos/gastos",
      "Cálculo y presentación de ISR e IVA",
      "Retenciones y DIOT cuando apliquen",
      "Declaraciones anuales ante el SAT",
      "Emisión y control de CFDI",
      "Licencia de plataforma incluida sin costo extra",
      "Portal de cliente 24/7",
    ],
    servicioIds: ["contabilidad", "impuestos", "facturacion"],
  },
  {
    id: "resico-facturacion",
    nombre: "Impuestos RESICO + Facturación",
    tagline: "Persona física en RESICO · lo más solicitado",
    beneficio: "ISR RESICO + facturación, con precio público desde el primer mes",
    previewCount: 4,
    incluye: [
      "Alta o cambio a RESICO (clave 626) sin costo extra",
      "Cálculo y presentación mensual de ISR RESICO",
      "IVA mensual cuando aplique",
      "Emisión y control de CFDI (facturación electrónica)",
      "Declaración anual de persona física",
      "Monitoreo del buzón tributario SAT",
      "Portal de cliente con acuses y comprobantes",
    ],
    servicioIds: ["impuestos", "facturacion"],
    precioDesde: 812,
    popular: true,
    perfilSugerido: { tipo: "fisica", regimenes: ["resico"] },
  },
  {
    id: "contable-repse",
    nombre: "Contable + REPSE + ICSOE & SISUB",
    tagline: "Contabilidad + cumplimiento outsourcing / STPS",
    beneficio: "Contabilidad completa más cumplimiento REPSE / ICSOE / SISUB",
    previewCount: 4,
    incluye: [
      "Todo lo del paquete Contabilidad + Impuestos + Facturación",
      "Alta y renovación REPSE ante STPS",
      "Integración de contratos y plantilla",
      "Declaración cuatrimestral ICSOE (IMSS)",
      "Declaración cuatrimestral SISUB (Infonavit)",
      "Cruce contratos REPSE ↔ nómina / trabajadores",
      "Acuses listos para tus clientes receptores",
      "Calendario de ventanas mayo · septiembre · enero",
    ],
    servicioIds: [
      "contabilidad",
      "impuestos",
      "facturacion",
      "repse",
      "icsoe-sisub",
    ],
  },
] as const;

const BY_ID = new Map(SERVICIOS_COTIZABLES.map((s) => [s.id, s]));
const TIPO_BY_ID = new Map(TIPOS_EMPRESA.map((t) => [t.id, t]));

export function parseServiciosQuery(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  const ids = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const valid = new Set(SERVICIOS_COTIZABLES.map((s) => s.id));
  return [...new Set(ids.filter((id) => valid.has(id)))];
}

export function parseTipoQuery(
  raw: string | null | undefined
): TipoEmpresaId | undefined {
  if (!raw) return undefined;
  const t = raw.trim().toLowerCase();
  // legado
  if (t === "comenzando") return "nuevo";
  if (t === "nuevo" || t === "fisica" || t === "moral") return t;
  return undefined;
}

export function parseRegimenesQuery(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  const ids = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(ids.filter((id) => REGIMEN_BY_ID.has(id)))];
}

export function parsePerfilDesdeSearchParams(sp: {
  tipo?: string;
  ingresos?: string;
  cfdi?: string;
  regimen?: string;
  regimenes?: string;
}): PerfilCotizacion {
  const tipo = parseTipoQuery(sp.tipo);
  const regimenes = parseRegimenesQuery(sp.regimenes ?? sp.regimen);
  const ingRaw = (sp.ingresos ?? "").trim().toLowerCase();
  const cfdiRaw = (sp.cfdi ?? "").trim().toLowerCase();

  const ingresosMas300 =
    ingRaw === "mas300" || ingRaw === "+300k" || ingRaw === "300k+";
  let ingresos = 0;
  if (!ingresosMas300 && ingRaw) {
    const n = Number(ingRaw.replace(/[^\d]/g, ""));
    if (Number.isFinite(n)) ingresos = Math.min(INGRESOS_MAX, Math.max(0, n));
  }

  const cfdiMas50 =
    cfdiRaw === "mas50" || cfdiRaw === "+50" || cfdiRaw === "50+";
  let cfdi = 1;
  if (!cfdiMas50 && cfdiRaw) {
    const n = Number(cfdiRaw.replace(/[^\d]/g, ""));
    if (Number.isFinite(n)) cfdi = Math.min(CFDI_MAX, Math.max(1, n));
  }

  return { tipo, regimenes, ingresos, ingresosMas300, cfdi, cfdiMas50 };
}

export function labelsDesdeServiciosIds(ids: string[]): string[] {
  return ids
    .map((id) => BY_ID.get(id)?.label)
    .filter((x): x is string => Boolean(x));
}

export function formatearIngresos(perfil: PerfilCotizacion): string {
  if (perfil.ingresosMas300) return "+$300,000 / mes";
  return `$${perfil.ingresos.toLocaleString("es-MX")} / mes`;
}

export function formatearCfdi(perfil: PerfilCotizacion): string {
  if (perfil.cfdiMas50) return "+50 CFDI / mes";
  return `${perfil.cfdi} CFDI / mes`;
}

export function resumenPerfilLineas(perfil: PerfilCotizacion): string[] {
  const lineas: string[] = [];
  if (perfil.tipo) {
    const t = TIPO_BY_ID.get(perfil.tipo);
    if (t) lineas.push(`Tipo: ${t.label}`);
  }
  if (perfil.tipo === "nuevo") {
    lineas.push("Régimen: aún no lo sé — necesito orientación");
  } else if (perfil.regimenes.length > 0) {
    const labels = perfil.regimenes
      .map((id) => REGIMEN_BY_ID.get(id)?.label)
      .filter((x): x is string => Boolean(x));
    if (labels.length) {
      lineas.push(`Régimen(es): ${labels.join(", ")}`);
    }
  }
  if (perfil.ingresosMas300 || perfil.ingresos > 0) {
    lineas.push(
      `Ingresos aprox.: ${formatearIngresos(perfil)} (para estrategia fiscal)`
    );
  }
  if (perfil.cfdiMas50 || perfil.cfdi > 1) {
    lineas.push(
      `Volumen CFDI: ${formatearCfdi(perfil)} (carga de trabajo contable)`
    );
  }
  return lineas;
}

export function mensajeDesdeServiciosIds(ids: string[]): string {
  const labels = labelsDesdeServiciosIds(ids);
  if (labels.length === 0) return "";
  return `Me interesa cotizar:\n${labels.map((l) => `• ${l}`).join("\n")}`;
}

export function mensajeDesdePaqueteYPerfil(
  ids: string[],
  perfil: PerfilCotizacion
): string {
  const bloques: string[] = [];
  const perfilLineas = resumenPerfilLineas(perfil);
  if (perfilLineas.length > 0) {
    bloques.push(`Perfil:\n${perfilLineas.map((l) => `• ${l}`).join("\n")}`);
  }
  const servicios = mensajeDesdeServiciosIds(ids);
  if (servicios) bloques.push(servicios);
  return bloques.join("\n\n");
}

/** Si el usuario borró el listado del textarea, lo reinyectamos al enviar. */
export function asegurarMensajeConPaquete(
  mensaje: string,
  ids: string[],
  perfil: PerfilCotizacion = PERFIL_VACIO
): string {
  const base = mensajeDesdePaqueteYPerfil(ids, perfil);
  if (!base) return mensaje;
  if (!mensaje.trim()) return base;
  // Prefill intacto o editado: ya trae nuestras secciones
  if (mensaje.includes("Me interesa cotizar") || mensaje.includes("Perfil:")) {
    return mensaje;
  }
  // Escribió algo libre: anteponemos el paquete/perfil
  return `${base}\n\n${mensaje.trim()}`;
}

/** Mensaje listo para WhatsApp con el paquete armado. */
export function mensajeWhatsAppPaquete(opts: {
  nombre?: string;
  mensaje: string;
  ids: string[];
  perfil?: PerfilCotizacion;
}): string {
  const cuerpo = asegurarMensajeConPaquete(
    opts.mensaje,
    opts.ids,
    opts.perfil ?? PERFIL_VACIO
  );
  const lineas = [
    "Hola, vengo del cotizador de rdcontadores.com y quiero cotizar.",
  ];
  if (opts.nombre?.trim()) {
    lineas.push(`Soy ${opts.nombre.trim()}.`);
  }
  if (cuerpo.trim()) {
    lineas.push(cuerpo.trim());
  }
  return lineas.join("\n\n");
}

export function hrefEmpezarConPaquete(
  ids: string[],
  perfil: PerfilCotizacion
): string {
  const params = new URLSearchParams();
  if (ids.length > 0) params.set("servicios", ids.join(","));
  if (perfil.tipo) params.set("tipo", perfil.tipo);
  if (perfil.regimenes.length > 0) {
    params.set("regimenes", perfil.regimenes.join(","));
  }
  if (perfil.ingresosMas300) params.set("ingresos", "mas300");
  else if (perfil.ingresos > 0) params.set("ingresos", String(perfil.ingresos));
  if (perfil.cfdiMas50) params.set("cfdi", "mas50");
  else if (perfil.cfdi > 1) params.set("cfdi", String(perfil.cfdi));
  const q = params.toString();
  return q ? `/empezar?${q}` : "/empezar";
}

/** Link a /cotizar con un paquete listo (p. ej. RESICO popular). */
export function hrefCotizarConPaquete(paqueteId: string): string {
  const valid = PAQUETES_COTIZABLES.some((p) => p.id === paqueteId);
  if (!valid) return "/cotizar";
  return `/cotizar?paquete=${encodeURIComponent(paqueteId)}`;
}

export function parsePaqueteQuery(
  raw: string | null | undefined
): PaqueteCotizable | undefined {
  if (!raw?.trim()) return undefined;
  const id = raw.trim().toLowerCase();
  return PAQUETES_COTIZABLES.find((p) => p.id === id);
}

/** @deprecated usar hrefEmpezarConPaquete */
export function hrefEmpezarConServicios(ids: string[]): string {
  return hrefEmpezarConPaquete(ids, PERFIL_VACIO);
}

/** Copy de incentivo: descubrimiento / solicitud (sin montos inventados). */
export function copyIncentivoPaquete(n: number): {
  titulo: string;
  detalle: string;
} {
  if (n <= 0) {
    return {
      titulo: "Arma tu solución",
      detalle:
        "Elige un paquete o suma necesidades. Te cotizamos sin compromiso.",
    };
  }
  if (n === 1) {
    return {
      titulo: "Buen comienzo",
      detalle:
        "Puedes sumar necesidades relacionadas para una cotización más completa.",
    };
  }
  if (n <= 3) {
    return {
      titulo: "Vas armando tu solicitud",
      detalle:
        "Entre más claras estén tus necesidades, más precisa será la cotización.",
    };
  }
  return {
    titulo: "Solución completa",
    detalle:
      "Con este alcance te armamos una cotización a la medida en Empezar.",
  };
}


/** Beneficio corto de un servicio (hint orientado al cliente). */
export function beneficioServicio(id: string): string {
  return BY_ID.get(id)?.hint ?? "";
}

/**
 * Recomendación de paquete según perfil.
 * Reglas conservadoras: no inventa fiscalidad; usa tipología + régimen + señales.
 */
export function recomendarPaqueteId(perfil: PerfilCotizacion): string {
  const reg = perfil.regimenes[0];
  if (perfil.tipo === "fisica" && (reg === "resico" || !reg)) {
    return "resico-facturacion";
  }
  if (perfil.tipo === "nuevo") return "resico-facturacion";
  if (perfil.tipo === "moral") {
    // Volumen / CFDI alto → contable; si no, base
    if (perfil.cfdiMas50 || perfil.cfdi >= 25 || perfil.ingresosMas300) {
      return "contable-base";
    }
    return "contable-base";
  }
  if (reg === "sueldos-salarios") return "nomina-imss";
  if (perfil.tipo === "fisica") return "resico-facturacion";
  return "contable-base";
}

export function paquetePorId(id: string): PaqueteCotizable | undefined {
  return PAQUETES_COTIZABLES.find((p) => p.id === id);
}

/** Servicios relacionados aún no seleccionados (máx. 3). */
export function serviciosRelacionadosPendientes(
  seleccionados: string[],
  limite = 3
): ServicioCotizable[] {
  const set = new Set(seleccionados);
  const scored = new Map<string, number>();
  for (const id of seleccionados) {
    const s = BY_ID.get(id);
    for (const rid of s?.relatedIds ?? []) {
      if (set.has(rid)) continue;
      scored.set(rid, (scored.get(rid) ?? 0) + 1);
    }
  }
  return [...scored.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limite)
    .map(([id]) => BY_ID.get(id))
    .filter((x): x is ServicioCotizable => Boolean(x));
}

export type PasoProgresoId =
  | "perfil"
  | "necesidades"
  | "servicios"
  | "contacto";

export type PasoProgreso = {
  id: PasoProgresoId;
  label: string;
  done: boolean;
};

export function progresoCotizacion(
  perfil: PerfilCotizacion,
  servicioIds: string[]
): {
  pasos: PasoProgreso[];
  pct: number;
  /** Listo para ir a Empezar (datos de contacto). */
  listo: boolean;
} {
  const perfilDone = Boolean(perfil.tipo);
  const necesidadesDone = servicioIds.length > 0;
  const serviciosDone = servicioIds.length >= 1;
  // Datos de contacto viven en /empezar — aquí solo señalamos el siguiente paso.
  const contactoDone = false;
  const listo = perfilDone && necesidadesDone;

  const pasos: PasoProgreso[] = [
    { id: "perfil", label: "Perfil", done: perfilDone },
    { id: "necesidades", label: "Necesidades", done: necesidadesDone },
    { id: "servicios", label: "Servicios", done: serviciosDone },
    { id: "contacto", label: "Datos de contacto", done: contactoDone },
  ];
  // % sobre pasos de configuración (sin contar contacto como “hecho” aquí)
  const configDone = [perfilDone, necesidadesDone, serviciosDone].filter(
    Boolean
  ).length;
  const pct = Math.round((configDone / 3) * 100);
  return { pasos, pct, listo };
}

export type LineaSolucion = {
  id: string;
  label: string;
  /** Solo RESICO tiene precio público. */
  tipo: "publico" | "cotizacion";
  monto?: number;
};

/**
 * Desglose comercial de la selección.
 * Único precio público: RESICO $812. Todo lo demás = cotización personalizada.
 * No inventa totales ni descuentos.
 */
export function desgloseSolucion(servicioIds: string[]): {
  lineas: LineaSolucion[];
  incluyeResicoPublico: boolean;
  requiereCotizacion: boolean;
  /** Solo el paquete RESICO exacto (impuestos + facturación). */
  soloResicoPublico: boolean;
  precioPublicoResico: number | null;
} {
  const resico = PAQUETES_COTIZABLES.find((p) => p.id === "resico-facturacion");
  const set = new Set(servicioIds);
  const lineas: LineaSolucion[] = [];
  const cubiertos = new Set<string>();

  const soloResicoPublico = Boolean(
    resico?.precioDesde &&
      servicioIds.length === resico.servicioIds.length &&
      resico.servicioIds.every((id) => set.has(id))
  );

  const incluyeResico =
    Boolean(resico?.precioDesde) &&
    Boolean(resico?.servicioIds.every((id) => set.has(id)));

  if (incluyeResico && resico) {
    lineas.push({
      id: resico.id,
      label: resico.nombre,
      tipo: "publico",
      monto: resico.precioDesde,
    });
    for (const id of resico.servicioIds) cubiertos.add(id);
  }

  // Paquetes sin precio público que estén completos en la selección
  for (const paq of PAQUETES_COTIZABLES) {
    if (paq.id === "resico-facturacion") continue;
    if (!paq.servicioIds.every((id) => set.has(id))) continue;
    // Evitar duplicar si ya cubiertos como servicios sueltos de otro paquete
    const yaTodosCubiertos = paq.servicioIds.every((id) => cubiertos.has(id));
    if (yaTodosCubiertos) continue;
    lineas.push({
      id: paq.id,
      label: paq.nombre,
      tipo: "cotizacion",
    });
    for (const id of paq.servicioIds) cubiertos.add(id);
  }

  for (const id of servicioIds) {
    if (cubiertos.has(id)) continue;
    const s = BY_ID.get(id);
    if (!s) continue;
    lineas.push({
      id: s.id,
      label: s.label,
      tipo: "cotizacion",
    });
    cubiertos.add(id);
  }

  const requiereCotizacion =
    !soloResicoPublico || lineas.some((l) => l.tipo === "cotizacion");

  return {
    lineas,
    incluyeResicoPublico: incluyeResico,
    requiereCotizacion: soloResicoPublico ? false : requiereCotizacion,
    soloResicoPublico,
    precioPublicoResico: incluyeResico ? (resico?.precioDesde ?? null) : null,
  };
}

/** @deprecated usar desgloseSolucion — solo precio público RESICO exacto. */
export function precioPublicoSeleccion(servicioIds: string[]): {
  monto: number;
  etiqueta: string;
} | null {
  const d = desgloseSolucion(servicioIds);
  if (d.soloResicoPublico && d.precioPublicoResico != null) {
    return {
      monto: d.precioPublicoResico,
      etiqueta: "Precio público · IVA incluido",
    };
  }
  return null;
}

/**
 * Mensaje de descubrimiento (sin precios ni ahorros inventados).
 */
export function mensajeCombinacion(servicioIds: string[]): {
  titulo: string;
  detalle: string;
} | null {
  if (servicioIds.length < 1) return null;
  const relatedHits = serviciosRelacionadosPendientes(servicioIds, 1);
  if (relatedHits.length > 0) {
    return {
      titulo: "También podemos ayudarte con",
      detalle:
        "Suma necesidades relacionadas para que tu cotización cubra todo tu caso.",
    };
  }
  if (servicioIds.length >= 2) {
    return {
      titulo: "Solicitud en construcción",
      detalle:
        "Con estas necesidades te armamos una cotización personalizada sin compromiso.",
    };
  }
  return null;
}

export function resumenPerfilCorto(perfil: PerfilCotizacion): string | null {
  if (!perfil.tipo) return null;
  const partes: string[] = [];
  const t = TIPO_BY_ID.get(perfil.tipo);
  if (t) {
    partes.push(
      perfil.tipo === "fisica"
        ? "Persona física"
        : perfil.tipo === "moral"
          ? "Persona moral"
          : "Orientación"
    );
  }
  if (perfil.regimenes[0]) {
    const r = REGIMEN_BY_ID.get(perfil.regimenes[0]);
    if (r) partes.push(r.label);
  }
  if (perfil.ingresosMas300 || perfil.ingresos > 0) {
    partes.push(formatearIngresos(perfil).replace(" / mes", "/mes"));
  }
  if (perfil.cfdiMas50 || perfil.cfdi > 1) {
    partes.push(formatearCfdi(perfil).replace(" / mes", "/mes"));
  }
  return partes.join(" · ");
}

/** True cuando el perfil ya da señal para mostrar recomendación. */
export function perfilListoParaRecomendar(perfil: PerfilCotizacion): boolean {
  return Boolean(perfil.tipo);
}
