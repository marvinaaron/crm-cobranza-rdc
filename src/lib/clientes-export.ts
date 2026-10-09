import { MESES_NOM, type Cliente } from "@/lib/clientes";
import { regimenPorClave } from "@/lib/regimenes-fiscales";

function celdaCsv(valor: string | number): string {
  return `"${String(valor).replace(/"/g, '""')}"`;
}

export function exportarClientesCsv(
  clientes: Cliente[],
  etiqueta: "activos" | "inactivos" | "todos" = "todos"
): void {
  const encabezado = [
    "Razón social",
    "RFC",
    "Email",
    "WhatsApp",
    "Honorarios",
    "Día pago",
    "Mes inicio",
    "Año inicio",
    "Persona moral",
    "Régimen fiscal",
    "Estado",
    "Federales",
    "IMSS",
    "Estatales",
    "REPSE",
  ]
    .map(celdaCsv)
    .join(",");

  const filas = clientes.map((c) => {
    const regimen = c.regimenFiscalClave
      ? regimenPorClave(c.regimenFiscalClave)?.label ?? c.regimenFiscalClave
      : "";
    const cfg = c.configCumplimiento;
    return [
      c.razonSocial,
      c.rfc,
      c.email ?? "",
      c.whatsapp ?? "",
      c.honorarios,
      c.fechaPago,
      MESES_NOM[c.inicioMes] ?? String(c.inicioMes),
      c.inicioAnio,
      c.esPersonaMoral ? "Sí" : "No",
      regimen,
      c.activo ? "Activo" : "Inactivo",
      cfg?.federales ? "Sí" : "No",
      cfg?.imss ? "Sí" : "No",
      cfg?.estatales ? "Sí" : "No",
      c.configRepse?.habilitado ? "Sí" : "No",
    ]
      .map(celdaCsv)
      .join(",");
  });

  const csv = [encabezado, ...filas].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const fecha = new Date().toISOString().slice(0, 10);
  a.download = `clientes-${etiqueta}-${fecha}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
