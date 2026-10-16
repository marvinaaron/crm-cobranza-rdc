import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { clienteIdDesdeUsuarioPortal } from "@/lib/sat/portal-user";
import { leerCrmEstadoCompleto } from "@/lib/supabase/crm-estado-db";
import { obtenerEfirmaPorCliente } from "@/lib/efirma/db";
import {
  diasHastaVencimiento,
  estadoVigenciaEfirma,
  formatFechaCertificado,
} from "@/lib/efirma/vigencia";
import {
  leerFilasContrasenas,
  tieneCsdPorRfc,
} from "@/lib/accesos/contrasenas-db";

/**
 * GET — e.firma y sello digital (CSD) del cliente, sin archivos ni contraseñas.
 */
export async function GET() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const clienteId = clienteIdDesdeUsuarioPortal(user);
  if (clienteId == null) {
    return NextResponse.json({ error: "Sin cliente asociado." }, { status: 403 });
  }

  try {
    const [estado, regEfirma, filas] = await Promise.all([
      leerCrmEstadoCompleto(),
      obtenerEfirmaPorCliente(clienteId),
      leerFilasContrasenas(),
    ]);
    const cliente = estado.clientes.find((c) => c.id === clienteId);
    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    const efirma = regEfirma
      ? {
          tiene: true as const,
          titular: regEfirma.titular,
          rfcCertificado: regEfirma.rfcCertificado,
          vigenciaFin: regEfirma.vigenciaFin,
          vigenciaFinLabel: formatFechaCertificado(regEfirma.vigenciaFin),
          diasRestantes: diasHastaVencimiento(regEfirma.vigenciaFin),
          estado: estadoVigenciaEfirma(regEfirma.vigenciaFin),
          tieneCer: Boolean(regEfirma.cerPath),
          tieneKey: Boolean(regEfirma.tieneKey),
        }
      : { tiene: false as const };

    const docs = cliente.satPortal?.documentos;

    return NextResponse.json({
      ok: true,
      efirma,
      sello: { tiene: tieneCsdPorRfc(filas, cliente.rfc ?? "") },
      documentos: {
        constancia: docs?.constancia
          ? {
              nombreArchivo: docs.constancia.nombreArchivo,
              subidoEn: docs.constancia.subidoEn,
            }
          : null,
        opinion: docs?.opinionPdf
          ? {
              nombreArchivo: docs.opinionPdf.nombreArchivo,
              subidoEn: docs.opinionPdf.subidoEn,
            }
          : null,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error." },
      { status: 500 }
    );
  }
}
