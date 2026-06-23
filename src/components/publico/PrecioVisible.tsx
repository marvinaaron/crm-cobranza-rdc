/**
 * Sección "Precio visible": honorarios transparentes con la tarjeta estrella
 * de RESICO PF (estilo navy, igual que la página de Servicios) y una tarjeta
 * secundaria para personas morales/nómina. El único acento de color es el
 * botón "Quiero contratar RESICO". Solo presentación; los CTAs van a /contacto.
 */

import Link from "next/link";

const FEATURES = [
  "Inscripción/cambio a RESICO sin costo extra",
  "Cálculo y presentación mensual de impuestos",
  "Declaración anual incluida",
  "Buzón tributario monitoreado",
  "Portal de cliente con tus comprobantes",
  "Asesoría por WhatsApp en horario hábil",
];

const PASOS = [
  {
    paso: "01",
    titulo: "Cuéntanos tu caso",
    descripcion: "Por WhatsApp o llamada. Sin formularios eternos.",
  },
  {
    paso: "02",
    titulo: "Te damos precio en 24 h",
    descripcion: "Cotización clara, sin letras chiquitas ni cobros sorpresa.",
  },
  {
    paso: "03",
    titulo: "Arrancamos contigo",
    descripcion: "Recibes acceso al portal y empezamos a trabajar.",
  },
];

export default function PrecioVisible() {
  return (
    <section className="py-14 sm:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-indigo-600 text-xs font-semibold uppercase tracking-widest mb-2">
            Honorarios transparentes
          </p>
          <h2 className="text-slate-900 text-2xl md:text-3xl font-black tracking-tight mb-3 leading-tight">
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Precios claros
            </span>
            <br />
            desde el primer día.
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Sin contratos amarrados, sin costos ocultos. Pagas lo acordado y
            recibes factura mensual.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Card destacada: RESICO PF (estilo navy de Servicios) */}
          <div className="relative bg-[radial-gradient(circle_at_15%_15%,#1e3a5f_0%,#0f1d2e_45%,#0a1424_100%)] text-white rounded-3xl p-8 sm:p-10 shadow-2xl ring-1 ring-marca-navy/40 overflow-hidden">
            <div
              className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-violet-500/25 blur-3xl"
              aria-hidden
            />
            <div
              className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl"
              aria-hidden
            />

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-bold uppercase tracking-wider ring-1 ring-white/20">
                Más solicitado
              </span>
              <h3 className="mt-5 text-2xl font-black">RESICO Persona Física</h3>
              <p className="mt-2 text-white/80 text-sm leading-relaxed">
                Ideal para profesionistas y prestadores de servicios con
                ingresos anuales hasta 3.5 mdp.
              </p>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-sm text-white/70 font-semibold">desde</span>
                <span className="text-5xl sm:text-6xl font-black tracking-tight">
                  $812
                </span>
                <span className="text-base text-white/80 font-semibold">/ mes</span>
              </div>
              <p className="text-[11px] text-white/70 mt-1">IVA incluido</p>

              <ul className="mt-7 space-y-2.5">
                {FEATURES.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-white/90"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-emerald-300 shrink-0 mt-0.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Único acento de color: el botón */}
              <Link
                href="/contacto"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-indigo-900/40 w-full sm:w-auto justify-center"
              >
                Quiero contratar RESICO
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Card secundaria: cotización gratis para morales/nómina */}
          <div className="relative bg-slate-50 rounded-3xl p-8 sm:p-10 ring-1 ring-slate-200 flex flex-col">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wider ring-1 ring-emerald-200 w-fit">
              Sin costo
            </span>
            <h3 className="mt-5 text-2xl font-black text-slate-900">
              ¿Persona moral o con nómina? Cotizamos gratis en 24 h
            </h3>
            <p className="mt-2 text-slate-600 text-sm leading-relaxed">
              ¿Tienes empleados, comercio con alto volumen o un régimen
              particular? Te armamos un paquete a la medida con precio cerrado y
              sin compromiso.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3">
              {PASOS.map((p) => (
                <div
                  key={p.paso}
                  className="flex items-start gap-3 bg-white rounded-xl p-4 ring-1 ring-slate-200"
                >
                  <span className="shrink-0 w-9 h-9 rounded-lg bg-marca-navy/10 text-marca-navy font-black text-sm flex items-center justify-center">
                    {p.paso}
                  </span>
                  <div>
                    <p className="text-sm font-black text-slate-900">{p.titulo}</p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {p.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/contacto"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-marca-navy text-white text-sm font-bold hover:bg-marca-navy-deep transition-colors w-full sm:w-auto justify-center"
            >
              Cotizar mi caso gratis
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500 max-w-3xl mx-auto">
          Los honorarios definitivos se confirman tras revisar tu situación
          (volumen de operaciones, régimen, empleados, complementos). Sin
          sorpresas.
        </p>
      </div>
    </section>
  );
}
