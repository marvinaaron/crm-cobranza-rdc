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
  /** Certificados .cer y llaves .key de e.firma (privado, solo service_role). */
  efirmas: "efirmas",
  /** CSF y opinión de cumplimiento subidos por el despacho (privado). */
  documentosSat: "documentos-sat",
  /** Archivos de encargos: CSF/fotos del cliente y PDF/XML de respuesta (privado). */
  encargos: "encargos",
  /** Respaldos completos del CRM en JSON (privado). Copia de seguridad restaurable. */
  respaldos: "respaldos",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];
