#!/usr/bin/env node
/**
 * Regenera src/data/accesos-contrasenas-2026.json desde el Excel del despacho.
 * Uso: node scripts/import-contrasenas-excel.mjs "/ruta/Contraseñas 2026.xlsx"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const input =
  process.argv[2] ||
  path.join(process.env.HOME ?? "", "Downloads", "Contraseñas 2026.xlsx");
const output = path.join(root, "src/data/accesos-contrasenas-2026.json");

const wb = XLSX.readFile(input);
const data = XLSX.utils.sheet_to_json(wb.Sheets["Contraseñas 2026"], {
  header: 1,
  defval: "",
});

const rows = [];
for (let i = 3; i < data.length; i++) {
  const r = data[i];
  if (!String(r[1] ?? "").trim() && !String(r[2] ?? "").trim()) continue;
  rows.push({
    id: `c${rows.length + 1}`,
    regimen: String(r[0] ?? "").trim(),
    cliente: String(r[1] ?? "").trim(),
    rfc: String(r[2] ?? "").trim(),
    satPassword: String(r[3] ?? "").trim(),
    fiel: String(r[4] ?? "").trim(),
    csd: String(r[5] ?? "").trim(),
    idse: String(r[6] ?? "").trim(),
    repse: String(r[7] ?? "").trim(),
    sipare: String(r[8] ?? "").trim(),
    infonavit: String(r[10] ?? "").trim(),
    repseCorreo: String(r[11] ?? "").trim(),
  });
}

fs.writeFileSync(output, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Importados ${rows.length} clientes → ${output}`);
