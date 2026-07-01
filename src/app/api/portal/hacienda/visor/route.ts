import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { clienteIdDesdeUsuarioPortal } from "@/lib/sat/portal-user";
import { leerCrmEstadoCompleto } from "@/lib/supabase/crm-estado-db";
import { listarCfdiAnioCliente, listarCfdiCliente } from "@/lib/cfdi/db";
import { agruparPorCategoria } from "@/lib/cfdi/categorias-visor";
import {
  calcularDeduccionesAsalariado,
  CATALOGO_DEDUCCIONES,
  esRegimenAsalariado,
} from "@/lib/cfdi/deducciones-personales";
import { montoConsulta } from "@/lib/cfdi/consulta";
import { getPeriodoFiscalVigente, periodoLabel } from "@/lib/clientes";
import { regimenPorClave } from "@/lib/regimenes-fiscales";

function parsePeriodo(searchParams: URLSearchParams) {
  const fiscal = getPeriodoFiscalVigente();
  const mes = Number.parseInt(searchParams.get("mes") ?? String(fiscal.mes), 10);
  const anio = Number.parseInt(searchParams.get("anio") ?? String(fiscal.anio), 10);
  if (!Number.isFinite(mes) || mes < 0 || mes > 11) return { error: "Mes inválido." as const };
  if (!Number.isFinite(anio) || anio < 2000) return { error: "Año inválido." as const };
  return { mes, anio };
}

/** GET — visor fiscal: categorías del mes + dashboard según régimen. */
export async function GET(req: NextRequest) {
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

  const periodo = parsePeriodo(req.nextUrl.searchParams);
  if ("error" in periodo) {
    return NextResponse.json({ error: periodo.error }, { status: 400 });
  }

  try {
    const estado = await leerCrmEstadoCompleto();
    const cliente = estado.clientes.find((c) => c.id === clienteId);
    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    const regimen = regimenPorClave(cliente.regimenFiscalClave);
    const asalariado = esRegimenAsalariado(cliente.regimenFiscalClave);

    const { items: mesItems } = await listarCfdiCliente({
      clienteId,
      mes: periodo.mes,
      anio: periodo.anio,
    });

    const categorias = agruparPorCategoria(mesItems);

    const anioItems = await listarCfdiAnioCliente(clienteId, periodo.anio);

    let deducciones = null;
    let resumenActividad = null;

    if (asalariado) {
      deducciones = calcularDeduccionesAsalariado(anioItems);
    } else {
      const ingresos = mesItems
        .filter((r) => r.tipo === "emitido" && r.estatus === "vigente")
        .reduce((s, r) => s + montoConsulta(r), 0);
      const gastos = mesItems
        .filter((r) => r.tipo === "recibido" && r.estatus === "vigente")
        .reduce((s, r) => s + montoConsulta(r), 0);
      resumenActividad = {
        ingresosMes: Math.round(ingresos * 100) / 100,
        gastosMes: Math.round(gastos * 100) / 100,
        diferenciaMes: Math.round((ingresos - gastos) * 100) / 100,
        facturasEmitidas: mesItems.filter((r) => r.tipo === "emitido").length,
        facturasRecibidas: mesItems.filter((r) => r.tipo === "recibido").length,
      };
    }

    return NextResponse.json({
      ok: true,
      periodo: { ...periodo, label: periodoLabel(periodo) },
      regimen: regimen
        ? { clave: regimen.clave, nombre: regimen.label }
        : { clave: cliente.regimenFiscalClave, nombre: "Régimen fiscal" },
      perfil: asalariado ? "asalariado" : "actividad",
      categorias,
      deducciones,
      resumenActividad,
      catalogoDeducciones: asalariado ? CATALOGO_DEDUCCIONES : null,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error en visor." },
      { status: 500 }
    );
  }
}
