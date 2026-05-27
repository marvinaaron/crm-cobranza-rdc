/**
 * Sección de honorarios pública. Muestra el precio orientativo de RESICO PF
 * y enfatiza la cotización gratuita en 24 horas para casos más completos.
 */

import Link from "next/link";

const INCLUYE_RESICO = [
  "Inscripción/cambio a RESICO sin costo extra",
  "Cálculo y presentación mensual de impuestos",
  "Declaración anual incluida",
  "Buzón tributario monitoreado",
  "Portal de cliente con tus comprobantes",
  "Asesoría por WhatsApp en horario hábil",
];

const PROCESO = [
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

export default function Honorarios() {
  return (
    <section className="pt-4 sm:pt-6 pb-14 sm:pb-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600">
            Honorarios transparentes
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Precios claros desde el primer mes
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Sin contratos amarrados ni costos ocultos. Pagas lo que se acuerda y
            recibes facturas mensuales.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Card destacada: RESICO PF */}
          <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white rounded-3xl p-8 sm:p-10 shadow-2xl ring-1 ring-indigo-500/30 overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-violet-400/20 blur-3xl" aria-hidden />

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-bold uppercase tracking-wider ring-1 ring-white/20">
                Más solicitado
              </span>
              <h3 className="mt-5 text-2xl font-black">RESICO Persona Física</h3>
              <p className="mt-2 text-white/80 text-sm leading-relaxed">
                Ideal para profesionistas y prestadores de servicios con ingresos
                anuales hasta 3.5 mdp.
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
                {INCLUYE_RESICO.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/90">
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

              <Link
                href="/contacto"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-700 text-sm font-bold hover:bg-slate-50 transition-colors shadow-lg w-full sm:w-auto justify-center"
              >
                Quiero contratar RESICO
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Card secundaria: cotización gratis */}
          <div className="relative bg-slate-50 rounded-3xl p-8 sm:p-10 ring-1 ring-slate-200 flex flex-col">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wider ring-1 ring-emerald-200 w-fit">
              Sin costo
            </span>
            <h3 className="mt-5 text-2xl font-black text-slate-900">
              Cotizamos tu caso gratis en 24 horas
            </h3>
            <p className="mt-2 text-slate-600 text-sm leading-relaxed">
              ¿Eres persona moral, tienes nómina, comercio con alto volumen o un
              régimen particular? Te armamos un paquete a la medida con precio
              cerrado y sin compromiso.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3">
              {PROCESO.map((p) => (
                <div
                  key={p.paso}
                  className="flex items-start gap-3 bg-white rounded-xl p-4 ring-1 ring-slate-200"
                >
                  <span className="shrink-0 w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center">
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
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors w-full sm:w-auto justify-center"
            >
              Cotizar mi caso gratis
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500 max-w-3xl mx-auto">
          Los honorarios definitivos se confirman tras revisar tu situación
          (volumen de operaciones, régimen, empleados, complementos). Sin sorpresas.
        </p>
      </div>
    </section>
  );
}
