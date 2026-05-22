export type RegistroEfirma = {
  id: string;
  clienteId: number;
  titular: string;
  rfcCertificado: string | null;
  vigenciaInicio: string;
  vigenciaFin: string;
  cerPath: string;
  tieneKey: boolean;
  notificado30: boolean;
  notificado15: boolean;
  notificado7: boolean;
  notificado3: boolean;
  ultimoCorreoAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DatosCertificadoParseado = {
  titular: string;
  rfcCertificado: string | null;
  vigenciaInicio: Date;
  vigenciaFin: Date;
};

export type EstadoVigenciaEfirma =
  | "vigente"
  | "alerta" // ≤ 30 días
  | "urgente" // ≤ 7 días
  | "vencida";

export type UmbralRecordatorio = 30 | 15 | 7 | 3;
