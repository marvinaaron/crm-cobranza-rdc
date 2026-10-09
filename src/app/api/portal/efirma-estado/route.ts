import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { obtenerEfirmaPorCliente } from "@/lib/efirma/db";
import {
  diasHastaVencimiento,
  estadoVigenciaEfirma,
  formatFechaCertificado,
  porcentajeVentana30,
} from "@/lib/efirma/vigencia";

/** GET — estado de vigencia de e.firma del cliente autenticado (sin archivos). */
export async function GET() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const meta = user.app_metadata as Record<string, unknown>;
  const clienteId = Number(meta.clienteId);
  if (!Number.isFinite(clienteId)) {
    return NextResponse.json({ tieneEfirma: false });
  }

  try {
    const reg = await obtenerEfirmaPorCliente(clienteId);
    if (!reg) {
      return NextResponse.json({ tieneEfirma: false });
    }

    const dias = diasHastaVencimiento(reg.vigenciaFin);
    const estado = estadoVigenciaEfirma(reg.vigenciaFin);

    return NextResponse.json({
      tieneEfirma: true,
      titular: reg.titular,
      rfcCertificado: reg.rfcCertificado,
      vigenciaFin: reg.vigenciaFin,
      vigenciaFinLabel: formatFechaCertificado(reg.vigenciaFin),
      diasRestantes: dias,
      estado,
      porcentajeVentana30: porcentajeVentana30(dias),
      enVentanaAlerta: dias <= 30 && dias >= 0,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error." },
      { status: 500 }
    );
  }
}
