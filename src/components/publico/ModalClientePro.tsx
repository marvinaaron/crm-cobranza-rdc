"use client";

import Link from "next/link";
import ClienteProAccesoLogin from "@/components/publico/ClienteProAccesoLogin";
import { FilaMetodosPago } from "@/components/publico/PaymentMethodLogos";

type Props = {
  abierto: boolean;
  onCerrar: () => void;
};

export default function ModalClientePro({ abierto, onCerrar }: Props) {
  if (!abierto) return null;

  const loginNext = encodeURIComponent("/herramientas");

  return (
    <div
      className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-cliente-pro-titulo"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onCerrar}
        aria-label="Cerrar"
      />
      <div className="relative w-full max-w-3xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl ring-1 ring-slate-200 overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="bg-gradient-to-br from-violet-950 to-indigo-950 px-6 py-6 sm:py-7 text-white text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-300">
            Cliente Pro
          </p>
          <h2 id="modal-cliente-pro-titulo" className="mt-2 text-2xl font-black">
            Herramientas sin límite
          </h2>
          <p className="mt-2 text-sm text-white/85 max-w-lg mx-auto">
            3 consultas gratis por calculadora. Cliente Pro desbloquea RFC, RESICO,
            facturación y vencimiento ilimitados.
          </p>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl ring-1 ring-slate-200 p-4 sm:p-5">
              <ClienteProAccesoLogin onCerrar={onCerrar} />
            </div>

            <div className="rounded-xl bg-gradient-to-br from-slate-50 to-violet-50/60 ring-1 ring-slate-200 p-4 sm:p-5 flex flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600">
                Clientes RDC
              </p>
              <p className="mt-2 text-lg font-black text-slate-900 leading-snug">
                ¿Ya eres cliente del despacho?
              </p>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Si ya trabajas con nosotros, entra al portal con tu correo y
                contraseña habituales. Los clientes activos tienen{" "}
                <strong className="text-amber-700">Cliente Pro incluido</strong>{" "}
                sin costo extra.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex gap-2">
                  <span className="text-emerald-500 shrink-0">✓</span>
                  RFC, RESICO, facturación y vencimiento ilimitados
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 shrink-0">✓</span>
                  Mismo acceso que tu portal de contabilidad
                </li>
              </ul>
              <Link
                href={`/portal/login?next=${loginNext}`}
                onClick={onCerrar}
                className="mt-5 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-marca-navy text-white text-sm font-bold hover:bg-marca-navy-soft transition"
              >
                Ingresar al portal
              </Link>
            </div>
          </div>

          <div className="rounded-xl bg-violet-50 ring-1 ring-violet-200/80 p-5 text-center">
            <p className="text-sm font-bold text-slate-900">
              ¿Quieres ver planes y pagar en línea?
            </p>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Abre la página Pro+ para comparar precios, qué incluye cada
              herramienta y pagar con los métodos que ya conoces.
            </p>
            <FilaMetodosPago className="mt-4" incluirTarjetas={false} />
            <Link
              href="/herramientas/pro"
              onClick={onCerrar}
              className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-violet-700 text-white text-sm font-bold hover:bg-violet-800 transition"
            >
              Ver planes Cliente Pro+
            </Link>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
