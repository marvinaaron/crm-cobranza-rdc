import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./_load-env.mjs";

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("✗ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const BUCKETS = [
  {
    name: "pdfs-cumplimiento",
    descripcion: "Preliminares, declaraciones y otros PDFs del cumplimiento.",
    publico: false,
    fileSizeLimit: 25 * 1024 * 1024,
    allowedMimeTypes: [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/heic",
    ],
  },
  {
    name: "comprobantes-impuestos",
    descripcion: "Comprobantes de pago de impuestos que sube el cliente.",
    publico: false,
    fileSizeLimit: 25 * 1024 * 1024,
    allowedMimeTypes: [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/heic",
    ],
  },
  {
    name: "comprobantes-honorarios",
    descripcion: "Comprobantes de pago de honorarios que sube el cliente.",
    publico: false,
    fileSizeLimit: 25 * 1024 * 1024,
    allowedMimeTypes: [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/heic",
    ],
  },
  {
    name: "facturas",
    descripcion: "Facturas PDF que emite el despacho.",
    publico: false,
    fileSizeLimit: 25 * 1024 * 1024,
    allowedMimeTypes: [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/heic",
    ],
  },
  {
    name: "avatares",
    descripcion:
      "Avatares de admins. Público para que el sidebar pueda mostrarlos por URL.",
    publico: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  },
  {
    name: "efirmas",
    descripcion:
      "Certificados .cer y llaves .key de e.firma por cliente. Solo acceso admin vía service_role.",
    publico: false,
    fileSizeLimit: 2 * 1024 * 1024,
    allowedMimeTypes: [
      "application/x-x509-ca-cert",
      "application/pkix-cert",
      "application/octet-stream",
    ],
  },
  {
    name: "documentos-sat",
    descripcion:
      "Constancia de situación fiscal y opinión de cumplimiento (PDF) por cliente.",
    publico: false,
    fileSizeLimit: 15 * 1024 * 1024,
    allowedMimeTypes: ["application/pdf"],
  },
  {
    name: "cfdi",
    descripcion:
      "XML de CFDI emitidos y recibidos por cliente. Solo acceso vía service_role.",
    publico: false,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["application/xml", "text/xml"],
  },
  {
    name: "encargos",
    descripcion:
      "Adjuntos de encargos: CSF/fotos que sube el cliente y PDF/XML de respuesta del despacho.",
    publico: false,
    fileSizeLimit: 15 * 1024 * 1024,
    allowedMimeTypes: [
      "application/pdf",
      "application/xml",
      "text/xml",
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/heic",
    ],
  },
  {
    name: "respaldos",
    descripcion:
      "Respaldos completos del CRM en JSON. Copia de seguridad restaurable del cierre mensual.",
    publico: false,
    fileSizeLimit: 50 * 1024 * 1024,
    allowedMimeTypes: ["application/json"],
  },
];

console.log("→ Listando buckets actuales…");
const { data: existing, error: listErr } = await supabase.storage.listBuckets();
if (listErr) {
  console.error("✗ Error listando buckets:", listErr.message);
  process.exit(1);
}
const existingNames = new Set((existing ?? []).map((b) => b.name));

for (const bucket of BUCKETS) {
  if (existingNames.has(bucket.name)) {
    console.log(`   · ${bucket.name} ya existe → skip.`);
    continue;
  }
  console.log(`   · creando ${bucket.name}…`);
  const { error } = await supabase.storage.createBucket(bucket.name, {
    public: bucket.publico,
    fileSizeLimit: bucket.fileSizeLimit,
    allowedMimeTypes: bucket.allowedMimeTypes,
  });
  if (error) {
    console.error(`     ✗ ${bucket.name}:`, error.message);
  } else {
    console.log(`     ✓ ${bucket.name} creado.`);
  }
}

const { data: finales } = await supabase.storage.listBuckets();
console.log(`\n→ Buckets actuales (${finales?.length ?? 0}):`);
for (const b of finales ?? []) {
  console.log(`   · ${b.name} ${b.public ? "(público)" : "(privado)"}`);
}
