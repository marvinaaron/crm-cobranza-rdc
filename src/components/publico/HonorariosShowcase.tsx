/**
 * Showcase de cómo se administran los honorarios desde el portal del cliente.
 *
 * Se usa en /servicios después del bloque de precios para enseñar que
 * el pago no es solo "te depositan y ya": hay tablero de estado, pago
 * con tarjeta integrado y factura digital descargable al instante.
 *
 * Mockups SVG/CSS — sin assets binarios — replican fielmente lo que el
 * cliente ve en /portal/honorarios.
 */

import Link from "next/link";

/**
 * Logos de medios de pago en gris monocromo.
 * Se usan en MockupBotonPago para reforzar familiaridad sin saturar de color.
 * Cada componente devuelve un SVG con `currentColor` para heredar el tono
 * del contenedor (text-slate-500/600).
 */

function VisaLogo() {
  return (
    <span
      className="inline-flex items-center justify-center h-5 px-1.5 rounded ring-1 ring-slate-200 bg-white"
      aria-label="Visa"
      title="Visa"
    >
      <svg
        viewBox="0 0 60 18"
        className="h-3 w-auto text-slate-500"
        fill="currentColor"
      >
        <text
          x="0"
          y="15"
          fontFamily="Helvetica, Arial, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="18"
          letterSpacing="-0.5"
        >
          VISA
        </text>
      </svg>
    </span>
  );
}

function MastercardLogo() {
  return (
    <span
      className="inline-flex items-center justify-center h-5 px-1.5 rounded ring-1 ring-slate-200 bg-white"
      aria-label="Mastercard"
      title="Mastercard"
    >
      <svg viewBox="0 0 24 14" className="h-3.5 w-auto">
        <circle cx="9" cy="7" r="6" fill="rgb(148 163 184)" />
        <circle
          cx="15"
          cy="7"
          r="6"
          fill="rgb(100 116 139)"
          fillOpacity="0.85"
        />
      </svg>
    </span>
  );
}

function AmexLogo() {
  return (
    <span
      className="inline-flex items-center justify-center h-5 px-1.5 rounded ring-1 ring-slate-200 bg-white"
      aria-label="American Express"
      title="American Express"
    >
      <svg
        viewBox="0 0 60 18"
        className="h-3 w-auto text-slate-500"
        fill="currentColor"
      >
        <text
          x="0"
          y="14"
          fontFamily="Helvetica, Arial, sans-serif"
          fontWeight="900"
          fontSize="14"
          letterSpacing="0.5"
        >
          AMEX
        </text>
      </svg>
    </span>
  );
}

function ApplePayLogo() {
  return (
    <span
      className="inline-flex items-center justify-center gap-0.5 h-5 px-1.5 rounded ring-1 ring-slate-200 bg-white"
      aria-label="Apple Pay"
      title="Apple Pay"
    >
      {/* Logo Apple */}
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-auto text-slate-600"
        fill="currentColor"
      >
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
      {/* Wordmark "Pay" */}
      <svg
        viewBox="0 0 26 14"
        className="h-2.5 w-auto text-slate-600"
        fill="currentColor"
      >
        <text
          x="0"
          y="11"
          fontFamily="Helvetica, Arial, sans-serif"
          fontWeight="700"
          fontSize="13"
          letterSpacing="-0.3"
        >
          Pay
        </text>
      </svg>
    </span>
  );
}

function GooglePayLogo() {
  return (
    <span
      className="inline-flex items-center justify-center gap-0.5 h-5 px-1.5 rounded ring-1 ring-slate-200 bg-white"
      aria-label="Google Pay"
      title="Google Pay"
    >
      {/* G de Google */}
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-auto text-slate-600"
        fill="currentColor"
      >
        <path d="M21.35 11.1H12v3.2h5.35c-.3 1.45-1.85 4.05-5.35 4.05-3.2 0-5.8-2.65-5.8-5.9s2.6-5.9 5.8-5.9c1.85 0 3.05.7 3.75 1.45l2.55-2.45C16.5 4.1 14.5 3.1 12 3.1c-4.95 0-9 4.05-9 9s4.05 9 9 9c5.2 0 8.65-3.65 8.65-8.8 0-.5-.05-.85-.15-1.2z" />
      </svg>
      {/* Wordmark "Pay" */}
      <svg
        viewBox="0 0 26 14"
        className="h-2.5 w-auto text-slate-600"
        fill="currentColor"
      >
        <text
          x="0"
          y="11"
          fontFamily="Helvetica, Arial, sans-serif"
          fontWeight="700"
          fontSize="13"
          letterSpacing="-0.3"
        >
          Pay
        </text>
      </svg>
    </span>
  );
}

function MockupEstadoCuenta() {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Mi cuenta
          </p>
          <p className="text-base font-black text-slate-900">
            Honorarios · Mayo 2026
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Pagado
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-100 p-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-700">
            Saldo del mes
          </p>
          <p className="text-xl font-black text-emerald-600 tabular-nums mt-1">
            $0.00
          </p>
          <p className="text-[9px] text-slate-500 mt-0.5">Sin adeudo</p>
        </div>
        <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-100 p-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-700">
            Pendiente acumulado
          </p>
          <p className="text-xl font-black text-emerald-600 tabular-nums mt-1">
            $0.00
          </p>
          <p className="text-[9px] text-slate-500 mt-0.5">Estás al día</p>
        </div>
        <div className="rounded-xl bg-white ring-1 ring-slate-200 p-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            Compromiso
          </p>
          <p className="text-xl font-black text-slate-800 tabular-nums mt-1">
            $2,500
          </p>
          <p className="text-[9px] text-slate-500 mt-0.5">Honorarios mensuales</p>
        </div>
        <div className="rounded-xl bg-slate-100 ring-1 ring-slate-200 p-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
            Día de pago
          </p>
          <p className="text-xl font-black text-slate-700 tabular-nums mt-1">
            Día 5
          </p>
          <p className="text-[9px] text-slate-500 mt-0.5">Cada mes</p>
        </div>
      </div>

      {/* Detalles del pago realizado */}
      <div className="mt-4 rounded-xl bg-gradient-to-br from-emerald-50 to-white ring-1 ring-emerald-100 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <p className="text-[11px] font-black text-emerald-800">
            Pago confirmado · 4 may 2026
          </p>
        </div>
        <p className="text-[10px] text-slate-600 ml-7 leading-snug">
          $2,500.00 MXN · Visa terminada en 4242
        </p>
      </div>
    </div>
  );
}

function MockupBotonPago() {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-xl p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
        Pagar honorarios
      </p>
      <p className="text-sm font-black text-slate-900 mb-4">
        Mayo 2026 · $2,500.00 MXN
      </p>

      {/* Botón Stripe principal */}
      <button
        type="button"
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-black shadow-lg shadow-indigo-200 mb-3"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
        Pagar con tarjeta
      </button>

      {/* Opción alterna */}
      <button
        type="button"
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
      >
        Pagar por transferencia
      </button>

      {/* Marcas de pago + seguridad */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-1.5">
          <VisaLogo />
          <MastercardLogo />
          <AmexLogo />
          <ApplePayLogo />
          <GooglePayLogo />
        </div>
        <div className="mt-2.5 flex items-center gap-1 text-[9px] font-bold text-emerald-700">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Procesado por Stripe
        </div>
      </div>
    </div>
  );
}

function MockupFacturas() {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Mis facturas
          </p>
          <p className="text-sm font-black text-slate-900">2026</p>
        </div>
        <span className="text-[9px] font-bold text-slate-500">5 / 5 al día</span>
      </div>

      <div className="space-y-2">
        {[
          { mes: "Mayo", folio: "RDC-2026-05-138", monto: "$2,500.00", color: "emerald" },
          { mes: "Abril", folio: "RDC-2026-04-122", monto: "$2,500.00", color: "emerald" },
          { mes: "Marzo", folio: "RDC-2026-03-108", monto: "$2,500.00", color: "emerald" },
        ].map((f) => (
          <div
            key={f.folio}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <span className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="15" y2="17" />
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-800 truncate">
                Factura {f.mes} 2026
              </p>
              <p className="text-[9px] text-slate-500 truncate font-mono">
                {f.folio}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-black text-slate-900 tabular-nums">
                {f.monto}
              </p>
              <div className="flex items-center gap-1 justify-end mt-0.5">
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[8px] font-black">
                  PDF
                </span>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[8px] font-black">
                  XML
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-[11px] font-black"
      >
        Ver historial completo
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

const BENEFICIOS = [
  {
    titulo: "Estado de cuenta siempre visible",
    descripcion:
      "Saldo del mes, pendientes acumulados y compromiso mensual en un solo tablero.",
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    titulo: "Pago en línea con tarjeta",
    descripcion:
      "Visa, Mastercard, AMEX, Apple Pay y Google Pay. Procesado por Stripe, sin compartir tu tarjeta con nosotros.",
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    titulo: "Factura digital al instante",
    descripcion:
      "PDF y XML disponibles segundos después de tu pago. Histórico completo siempre a la mano.",
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    color: "bg-rose-100 text-rose-700",
  },
];

export default function HonorariosShowcase() {
  return (
    <section className="relative py-16 sm:py-20 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-3xl -z-0 pointer-events-none" aria-hidden />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600">
            Control total desde tu portal
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Tus honorarios,{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              transparentes y a un toque
            </span>
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Una vez que eres cliente, manejas tus pagos como manejas tu banco.
            Sin enviar comprobantes por WhatsApp, sin pedirnos facturas. Todo
            está en tu portal.
          </p>
        </div>

        {/* Showcase de 3 mockups */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-12">
          <div className="lg:transform lg:-rotate-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2 px-1">
              01 · Estado del mes
            </p>
            <MockupEstadoCuenta />
          </div>
          <div className="lg:transform lg:rotate-1 lg:mt-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2 px-1">
              02 · Paga en línea
            </p>
            <MockupBotonPago />
          </div>
          <div className="lg:transform lg:-rotate-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2 px-1">
              03 · Descarga tu factura
            </p>
            <MockupFacturas />
          </div>
        </div>

        {/* Beneficios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {BENEFICIOS.map((b) => (
            <div
              key={b.titulo}
              className="bg-white rounded-2xl p-5 ring-1 ring-slate-200"
            >
              <span
                className={`inline-flex w-11 h-11 rounded-xl items-center justify-center ${b.color}`}
              >
                {b.icono}
              </span>
              <h3 className="mt-3 text-sm font-black text-slate-900">
                {b.titulo}
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                {b.descripcion}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg"
          >
            Quiero contratar y empezar
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
