import { comprimirImagenAFile } from "@/lib/archivos";
import type { ArchivoEncargo, Encargo } from "@/lib/encargos";

async function subir(url: string, file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(url, { method: "POST", body: fd });
  let data: { path?: string; error?: string } = {};
  try {
    data = await res.json();
  } catch {
    /* respuesta no-JSON */
  }
  if (!res.ok || !data.path) {
    throw new Error(data.error ?? "No se pudo subir el archivo.");
  }
  return data.path;
}

/** Comprime (si es imagen) y sube un adjunto del cliente al bucket de encargos. */
export async function subirAdjuntoCliente(
  file: File,
  opts: { nota?: string; grupo?: number } = {}
): Promise<ArchivoEncargo> {
  const f = await comprimirImagenAFile(file);
  const path = await subir("/api/portal/encargos/archivo", f);
  return {
    nombreArchivo: file.name,
    tipoMime: f.type || file.type || "application/octet-stream",
    path,
    subidoEn: new Date().toISOString(),
    nota: opts.nota,
    grupo: opts.grupo,
  };
}

/** Sube un archivo de respuesta del admin (PDF/XML) al bucket de encargos. */
export async function subirArchivoAdmin(file: File): Promise<ArchivoEncargo> {
  const path = await subir("/api/admin/encargos/archivo", file);
  return {
    nombreArchivo: file.name,
    tipoMime: file.type || "application/octet-stream",
    path,
    subidoEn: new Date().toISOString(),
  };
}

/** Pide al servidor (admin) borrar de Storage los archivos de unos encargos. */
export async function borrarArchivosEncargosAdmin(
  encargos: Encargo[]
): Promise<void> {
  try {
    await fetch("/api/admin/encargos/archivo", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encargos }),
    });
  } catch {
    /* mejor esfuerzo: si falla, el archivo queda huérfano pero no rompe nada */
  }
}

/** Reúne las rutas (paths) de Storage de un encargo. */
export function pathsDeEncargo(enc: Encargo): string[] {
  const paths: string[] = [];
  for (const a of enc.adjuntosCliente ?? []) if (a.path) paths.push(a.path);
  for (const ent of enc.entregas ?? [])
    for (const a of ent.archivos ?? []) if (a.path) paths.push(a.path);
  return paths;
}

/** Cliente: borra de Storage sus propios archivos (por path). */
export async function borrarArchivosCliente(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  try {
    await fetch("/api/portal/encargos/archivo", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths }),
    });
  } catch {
    /* mejor esfuerzo */
  }
}
