import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { clienteIdDesdeUsuarioPortal } from "@/lib/sat/portal-user";
import { leerCrmEstadoCompleto } from "@/lib/supabase/crm-estado-db";
import { getPeriodoFiscalVigente } from "@/lib/clientes";
import { getSaldoFavorPeriodo } from "@/lib/cumplimiento";
import { regimenPorClave } from "@/lib/regimenes-fiscales";
import { obtenerEfirmaPorCliente } from "@/lib/efirma/db";
import {
  diasHastaVencimiento,
  estadoVigenciaEfirma,
  formatFechaCertificado,
  porcentajeVentana30,
} from "@/lib/efirma/vigencia";

/** GET — resumen SAT del cliente autenticado (sin archivos binarios). */
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
    const estado = await leerCrmEstadoCompleto();
    const cliente = estado.clientes.find((c) => c.id === clienteId);
    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    const periodo = getPeriodoFiscalVigente();
    const reg = estado.cumplimiento.find(
      (r) => r.clienteId === clienteId && r.mes === periodo.mes && r.anio === periodo.anio
    );
    const saldoFavor = getSaldoFavorPeriodo(reg);
    const regimen = regimenPorClave(cliente.regimenFiscalClave);

    let efirma: Record<string, unknown> = { tieneEfirma: false };
    const regEfirma = await obtenerEfirmaPorCliente(clienteId);
    if (regEfirma) {
      const dias = diasHastaVencimiento(regEfirma.vigenciaFin);
      efirma = {
        tieneEfirma: true,
        titular: regEfirma.titular,
        rfcCertificado: regEfirma.rfcCertificado,
        vigenciaFin: regEfirma.vigenciaFin,
        vigenciaFinLabel: formatFechaCertificado(regEfirma.vigenciaFin),
        diasRestantes: dias,
        estado: estadoVigenciaEfirma(regEfirma.vigenciaFin),
        porcentajeVentana30: porcentajeVentana30(dias),
        enVentanaAlerta: dias <= 30 && dias >= 0,
      };
    }

    const docs = cliente.satPortal?.documentos;
    return NextResponse.json({
      ok: true,
      rfc: cliente.rfc,
      razonSocial: cliente.razonSocial,
      regimen: regimen
        ? { clave: regimen.clave, nombre: regimen.label, descripcion: regimen.descripcion }
        : null,
      satPortal: cliente.satPortal ?? null,
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
      saldoFavor,
      efirma,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error." },
      { status: 500 }
    );
  }
}
