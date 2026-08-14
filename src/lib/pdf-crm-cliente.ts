export type DestinoPdfCrmCliente =
  | "cumplimiento"
  | "comprobantes-impuestos"
  | "comprobantes-honorarios"
  | "facturas";

function esPortal(): boolean {
  return typeof window !== "undefined" && window.location.pathname.startsWith("/portal");
}

function dataUrlAFile(
  dataUrl: string,
  nombreArchivo: string,
  tipoMime: string
): File {
  const partes = dataUrl.split(",");
  const b64 = partes.length > 1 ? partes[1] : partes[0];
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], nombreArchivo, {
    type: tipoMime || "application/pdf",
  });
}

export async function subirDataUrlAStorage(opts: {
  dataUrl: string;
  nombreArchivo: string;
  tipoMime: string;
  destino: DestinoPdfCrmCliente;
}): Promise<string> {
  const file = dataUrlAFile(opts.dataUrl, opts.nombreArchivo, opts.tipoMime);
  const fd = new FormData();
  fd.append("file", file);
  fd.append("destino", opts.destino);
  const url = esPortal() ? "/api/portal/pdf-crm" : "/api/admin/pdf-crm";
  const res = await fetch(url, { method: "POST", body: fd });
  let data: { error?: string; path?: string } = {};
  try {
    data = await res.json();
  } catch {
    throw new Error("No se pudo subir el PDF a la nube.");
  }
  if (!res.ok || !data.path) {
    throw new Error(data.error ?? "No se pudo subir el PDF a la nube.");
  }
  return data.path;
}

export function esDataUrlEmpotrado(dataUrl: string | undefined): boolean {
  return !!dataUrl && dataUrl.startsWith("data:");
}
