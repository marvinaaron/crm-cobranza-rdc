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
import RevealOnScroll from "@/components/publico/motion/RevealOnScroll";
import TiltLayer from "@/components/publico/motion/TiltLayer";

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
          <p className="text-xl font-black text-amber-600 tabular-nums mt-1">
            Día 15
          </p>
          <p className="text-[9px] text-slate-500 mt-0.5">Acordado contigo</p>
        </div>
      </div>

      {/* Selector visual del día — tú eliges cuándo pagar */}
      <div className="mt-4 rounded-xl border-2 border-amber-300/60 bg-gradient-to-br from-amber-50 to-white p-3 shadow-sm shadow-amber-200/40 ring-1 ring-amber-200">
        <p className="text-[9px] font-black uppercase tracking-widest text-amber-800">
          Tú eliges el día del mes
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {[5, 10, 15, 20, 25, 28].map((d) => (
            <span
              key={d}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black transition-transform ${
                d === 15
                  ? "scale-110 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-400/40 ring-2 ring-amber-300"
                  : "bg-white text-slate-400 ring-1 ring-slate-200"
              }`}
            >
              {d}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[10px] font-semibold text-amber-900/75">
          Lo acordamos al inicio — sin sorpresas cada mes
        </p>
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
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-black shadow-lg shadow-indigo-200 mb-1"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
        Pagar con tarjeta
      </button>
      <p className="mb-3 text-center text-[9px] font-bold uppercase tracking-wider text-indigo-600">
        TDC y débito · Visa, MC, AMEX
      </p>

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

const DESTACADOS = [
  {
    titulo: "Tú decides el día",
    descripcion:
      "Acordamos contigo qué día del mes se genera tu pago de honorarios. Día 5, 15 o 28 — lo que mejor te convenga.",
    gradient: "from-amber-500/25 via-orange-500/15 to-transparent",
    ring: "ring-amber-400/30",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
    iconBg: "bg-amber-400/20 text-amber-300",
  },
  {
    titulo: "Siempre facturamos",
    descripcion:
      "Cada honorario pagado se factura. PDF y XML en tu portal al instante — sin pedírnoslos por correo o WhatsApp.",
    gradient: "from-rose-500/20 via-pink-500/10 to-transparent",
    ring: "ring-rose-400/25",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="15" y2="17" />
      </svg>
    ),
    iconBg: "bg-rose-400/20 text-rose-300",
  },
  {
    titulo: "TDC con Stripe",
    descripcion:
      "Paga con tarjeta de crédito o débito desde el portal. Procesado por Stripe — seguro, rápido y sin compartir datos con nosotros.",
    gradient: "from-indigo-500/25 via-violet-500/15 to-transparent",
    ring: "ring-indigo-400/30",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    iconBg: "bg-indigo-400/20 text-indigo-300",
  },
];

const BENEFICIOS = [
  {
    titulo: "Tu día, tu ritmo",
    descripcion:
      "El vencimiento de honorarios respeta el día que acordamos. Lo ves claro en el portal cada mes.",
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    color: "bg-amber-100 text-amber-700",
  },
  {
    titulo: "Tarjeta con Stripe",
    descripcion:
      "TDC, débito, Apple Pay y Google Pay. Checkout seguro de Stripe integrado en tu portal.",
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    titulo: "Factura siempre incluida",
    descripcion:
      "Facturamos todos los honorarios. PDF + XML disponibles en segundos tras tu pago.",
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

const COPY = {
  servicios: {
    eyebrow: "Control total desde tu portal",
    titulo: "Tus honorarios,",
    tituloGradiente: "transparentes y a un toque",
    subtitulo:
      "Una vez que eres cliente, manejas tus pagos como manejas tu banco. Sin enviar comprobantes por WhatsApp, sin pedirnos facturas. Todo está en tu portal.",
    cta: { href: "/cotizar", label: "Quiero cotizar y empezar →" },
  },
  proceso: {
    eyebrow: "Cobranza · honorarios sin fricción",
    titulo: "Así se ven tus",
    tituloGradiente: "honorarios en el portal",
    subtitulo:
      "Tú eliges el día de pago, pagas con tarjeta por Stripe o transferencia, y siempre recibes tu factura digital. Sin fricción, sin sorpresas.",
    cta: { href: "#portal-cliente", label: "Conocer el portal completo ↓" },
  },
} as const;

type Props = { variant?: keyof typeof COPY };

export default function HonorariosShowcase({ variant = "servicios" }: Props) {
  const copy = COPY[variant];

  return (
    <section
      data-parallax-root
      className="relative overflow-hidden bg-slate-950 py-14 sm:py-20 text-white"
    >
      <div className="pointer-events-none absolute -right-32 top-0 h-[28rem] w-[28rem] rounded-full bg-indigo-600/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll className="mb-10 text-center sm:mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-indigo-400">
            {copy.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            {copy.titulo}{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
              {copy.tituloGradiente}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">{copy.subtitulo}</p>
        </RevealOnScroll>

        <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {DESTACADOS.map((d, i) => (
            <RevealOnScroll key={d.titulo} delay={i * 90}>
              <div
                className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${d.gradient} p-5 ring-1 ${d.ring} backdrop-blur-sm transition-transform duration-500 hover:-translate-y-1`}
              >
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${d.iconBg}`}>
                  {d.icono}
                </span>
                <h3 className="mt-4 text-base font-black text-white sm:text-lg">{d.titulo}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">{d.descripcion}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <div className="mb-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {[
            { label: "01 · Estado del mes", node: <MockupEstadoCuenta />, tilt: -1, mt: "" },
            { label: "02 · Paga en línea", node: <MockupBotonPago />, tilt: 1, mt: "lg:mt-8" },
            { label: "03 · Descarga tu factura", node: <MockupFacturas />, tilt: -1, mt: "" },
          ].map((item, i) => (
            <RevealOnScroll key={item.label} delay={i * 100} className={item.mt}>
              <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-widest text-indigo-300/80">
                {item.label}
              </p>
              <TiltLayer maxTilt={6}>
                <div className={item.tilt > 0 ? "lg:rotate-1" : "lg:-rotate-1"}>{item.node}</div>
              </TiltLayer>
            </RevealOnScroll>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {BENEFICIOS.map((b, i) => (
            <RevealOnScroll key={b.titulo} delay={i * 80}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition-colors hover:border-white/20">
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${b.color}`}>
                  {b.icono}
                </span>
                <h3 className="mt-3 text-sm font-black text-white">{b.titulo}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{b.descripcion}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll delay={200} className="mt-12 text-center">
          <Link
            href={copy.cta.href}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-xl transition hover:bg-slate-100"
          >
            {copy.cta.label}
          </Link>
        </RevealOnScroll>
      </div>
    </section>
  );
}
