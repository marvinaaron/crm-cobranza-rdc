/**
 * Sección "Por qué RDC": bloque oscuro premium con stats y portal destacado.
 */

import Link from "next/link";
import RevealOnScroll from "@/components/publico/motion/RevealOnScroll";

type Stat = {
  numero: string;
  gradiente: boolean;
  badge?: string;
  titulo: string;
  descripcion: string;
};

const STATS: Stat[] = [
  {
    numero: "0",
    gradiente: true,
    badge: "Garantía RDC",
    titulo: "Declaraciones brincadas",
    descripcion:
      "Presentamos cada obligación en tiempo y forma. Cero recargos por olvidos del despacho.",
  },
  {
    numero: "< 2h",
    gradiente: false,
    titulo: "Tiempo de respuesta",
    descripcion:
      "Te contestamos en horas, no en días. Hablas directo con tu contador, no con un bot.",
  },
  {
    numero: "24/7",
    gradiente: true,
    titulo: "Acceso a tu información",
    descripcion:
      "Tu SAT, IMSS y honorarios disponibles en el portal cuando los necesites, de día o de noche.",
  },
  {
    numero: "100%",
    gradiente: false,
    titulo: "Digital",
    descripcion:
      "Documentos, pagos y avisos en línea. Sin filas, sin papeleo y sin perder tiempo.",
  },
];

const PORTAL_CHECKS = [
  "Opinión 32-D en tiempo real",
  "Calendario fiscal sincronizable",
  "Pago con tarjeta desde el portal",
  "Alerta de vencimiento de e.firma",
];

export default function PorQueRdc() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-16 sm:py-20 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <ParallaxGlow />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-300">
            Por qué elegirnos
          </p>
          <h2 className="mb-3 text-2xl font-black leading-tight tracking-tight md:text-3xl">
            No somos un call center.
            <br />
            <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
              Somos tu contador.
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-sm text-slate-400">
            Datos reales de cómo trabajamos, no promesas genéricas.
          </p>
        </RevealOnScroll>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((s, i) => (
            <RevealOnScroll key={s.titulo} delay={i * 70}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/[0.07]">
                <p
                  className={`mb-1 text-4xl font-black leading-none ${
                    s.gradiente
                      ? "bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent"
                      : "text-white"
                  }`}
                >
                  {s.numero}
                </p>
                {s.badge && (
                  <span
                    className="mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-amber-950 shadow-md ring-1 ring-amber-200/70"
                    style={{
                      background:
                        "linear-gradient(135deg, #fef3c7 0%, #fcd34d 35%, #f59e0b 70%, #b45309 100%)",
                    }}
                  >
                    ★ {s.badge}
                  </span>
                )}
                <p className="mb-1 text-sm font-bold text-white">{s.titulo}</p>
                <p className="text-xs leading-relaxed text-slate-400">{s.descripcion}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll delay={120}>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-black/40 sm:p-10">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" aria-hidden />
            <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" aria-hidden />

            <div className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-2">
              <div>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-200 ring-1 ring-white/15">
                  🖥️ Tecnología propia
                </span>
                <h3 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl">
                  Portal exclusivo{" "}
                  <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
                    para clientes
                  </span>
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300 sm:text-base">
                  El único despacho en Guadalajara con portal propio desarrollado in-house. Tu SAT,
                  IMSS y honorarios en un solo lugar, accesibles las 24 horas.
                </p>
                <Link
                  href="/portal/login"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-marca-navy shadow-lg transition-colors hover:bg-slate-100"
                >
                  Entrar al portal de clientes →
                </Link>
              </div>

              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PORTAL_CHECKS.map((check) => (
                  <li
                    key={check}
                    className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3.5 py-3 ring-1 ring-white/10"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-xs text-emerald-300 ring-1 ring-emerald-300/40">
                      ✓
                    </span>
                    <span className="text-xs leading-snug text-slate-200 sm:text-[13px]">{check}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/** Halos animados muy ligeros (solo decoración). */
function ParallaxGlow() {
  return (
    <>
      <div className="pointer-events-none absolute left-1/4 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-600/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 translate-x-1/4 rounded-full bg-violet-600/10 blur-3xl" />
    </>
  );
}
