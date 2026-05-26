/** Estado de la consulta pública de opinión 32-D (SAT). */
export type OpinionPublicaEstado =
  | "positiva"
  | "negativa"
  | "sin_obligaciones"
  | "no_autorizada"
  | "pendiente"
  | "error";

export type DocumentoSATRef = {
  storagePath: string;
  nombreArchivo: string;
  subidoEn: string;
  tamanoBytes?: number;
};

/** Datos SAT visibles en portal y gestionados por el despacho. */
export type SatPortalCliente = {
  /** El cliente autorizó opinión pública en el portal del SAT. */
  opinionAutorizadaEnSat?: boolean;
  opinionPublica?: {
    estado: OpinionPublicaEstado;
    mensaje?: string;
    ultimaConsulta?: string;
  };
  documentos?: {
    constancia?: DocumentoSATRef;
    opinionPdf?: DocumentoSATRef;
  };
};

export type TipoDocumentoSAT = "constancia" | "opinion";

export const ETIQUETAS_DOCUMENTO_SAT: Record<TipoDocumentoSAT, string> = {
  constancia: "Constancia de situación fiscal",
  opinion: "Opinión de cumplimiento (PDF)",
};
