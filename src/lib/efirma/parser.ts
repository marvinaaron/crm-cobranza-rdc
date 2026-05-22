import { X509Certificate } from "node:crypto";
import type { DatosCertificadoParseado } from "./types";

/** Convierte .cer en DER (binario o PEM). */
export function bufferCertificadoDesdeArchivo(buf: Buffer): Buffer {
  const inicio = buf.subarray(0, 32).toString("utf8");
  if (inicio.includes("BEGIN CERTIFICATE")) {
    const pem = buf.toString("utf8");
    const b64 = pem
      .replace(/-----BEGIN CERTIFICATE-----/g, "")
      .replace(/-----END CERTIFICATE-----/g, "")
      .replace(/\s/g, "");
    return Buffer.from(b64, "base64");
  }
  return buf;
}

function extraerCampoSubject(subject: string, clave: string): string | null {
  const partes = subject.split("\n").map((p) => p.trim());
  for (const p of partes) {
    const [k, ...rest] = p.split("=");
    if (k?.trim().toUpperCase() === clave.toUpperCase()) {
      return rest.join("=").trim() || null;
    }
  }
  return null;
}

function extraerRfc(subject: string): string | null {
  const serial = extraerCampoSubject(subject, "serialNumber");
  if (serial && /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i.test(serial.replace(/\s/g, ""))) {
    return serial.replace(/\s/g, "").toUpperCase();
  }
  const uid = extraerCampoSubject(subject, "x500UniqueIdentifier");
  if (uid) {
    const m = uid.match(/[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}/i);
    if (m) return m[0].toUpperCase();
  }
  const cn = extraerCampoSubject(subject, "CN");
  if (cn) {
    const m = cn.match(/[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}/i);
    if (m) return m[0].toUpperCase();
  }
  return null;
}

/**
 * Lee un certificado .cer (DER o PEM) y extrae titular, RFC y vigencia.
 */
export function parsearCertificadoCer(buf: Buffer): DatosCertificadoParseado {
  const der = bufferCertificadoDesdeArchivo(buf);
  let cert: X509Certificate;
  try {
    cert = new X509Certificate(der);
  } catch (e) {
    throw new Error(
      "No se pudo leer el certificado. Verifica que el archivo .cer sea válido (FIEL SAT)."
    );
  }

  const subject = cert.subject;
  const cn = extraerCampoSubject(subject, "CN") ?? "Titular no identificado";
  const o = extraerCampoSubject(subject, "O");
  const titular = o ? `${cn} · ${o}` : cn;
  const rfc = extraerRfc(subject);

  const vigenciaInicio = new Date(cert.validFrom);
  const vigenciaFin = new Date(cert.validTo);
  if (isNaN(vigenciaInicio.getTime()) || isNaN(vigenciaFin.getTime())) {
    throw new Error("El certificado no contiene fechas de vigencia válidas.");
  }

  return { titular, rfcCertificado: rfc, vigenciaInicio, vigenciaFin };
}
