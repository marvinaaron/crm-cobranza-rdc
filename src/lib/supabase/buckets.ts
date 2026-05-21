/**
 * Nombres canónicos de los buckets de Supabase Storage usados por el CRM.
 * Si cambia un nombre, hay que cambiarlo en scripts/setup-storage.mjs también.
 */
export const BUCKETS = {
  pdfsCumplimiento: "pdfs-cumplimiento",
  comprobantesImpuestos: "comprobantes-impuestos",
  comprobantesHonorarios: "comprobantes-honorarios",
  facturas: "facturas",
  /** Avatares de admin (público para servir las URLs desde el sidebar). */
  avatares: "avatares",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];
