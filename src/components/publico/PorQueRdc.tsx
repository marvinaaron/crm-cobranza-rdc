/**
 * Sección "Por qué RDC": bloque oscuro cinema con stats y portal destacado.
 */

import Link from "next/link";
import RevealOnScroll from "@/components/publico/motion/RevealOnScroll";

type Stat = {
  numero: string;
  chispa?: boolean;
  badge?: string;
  titulo: string;
  descripcion: string;
};

const STATS: Stat[] = [
  {
    numero: "0",
    chispa: true,
    badge: "Garantía RDC",
    titulo: "Declaraciones brincadas",
    descripcion:
      "Presentamos cada obligación en tiempo y forma. Cero recargos por olvidos del despacho.",
  },
  {
    numero: "< 2h",
    titulo: "Tiempo de respuesta",
    descripcion:
      "Te contestamos en horas, no en días. Hablas directo con tu contador, no con un bot.",
  },
  {
    numero: "24/7",
    chispa: true,
    titulo: "Acceso a tu información",
    descripcion:
      "Tu SAT, IMSS y honorarios disponibles en el portal cuando los necesites, de día o de noche.",
  },
  {
    numero: "100%",
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
    <section className="relative overflow-hidden bg-marca-navy py-16 text-white sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.85) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/45">
            Por qué elegirnos
          </p>
          <h2 className="mb-3 text-2xl font-black leading-tight tracking-[-0.03em] md:text-3xl">
            No somos un call center.
            <br />
            Somos tu contador.
          </h2>
          <p className="mx-auto max-w-xl text-sm text-white/55">
            Datos reales de cómo trabajamos, no promesas genéricas.
          </p>
        </RevealOnScroll>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((s) => (
            <RevealOnScroll key={s.titulo}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.07]">
                <p
                  className={`mb-1 text-4xl font-black leading-none ${
                    s.chispa ? "text-[#c85fff]" : "text-white"
                  }`}
                >
                  {s.numero}
                </p>
                {s.badge && (
                  <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/90 ring-1 ring-white/15">
                    {s.badge}
                  </span>
                )}
                <p className="mb-1 text-sm font-bold text-white">{s.titulo}</p>
                <p className="text-xs leading-relaxed text-white/50">
                  {s.descripcion}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5 sm:px-6 sm:py-5">
            <div className="relative grid grid-cols-1 items-center gap-5 md:grid-cols-2 md:gap-6">
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                  Tecnología propia
                </p>
                <h3 className="text-lg font-black leading-tight tracking-[-0.03em] sm:text-xl">
                  Portal exclusivo para clientes
                </h3>
                <p className="mt-1.5 max-w-md text-sm leading-snug text-white/55">
                  SAT, IMSS y honorarios en un solo lugar, 24/7. Desarrollado
                  in-house en Guadalajara.
                </p>
                <Link
                  href="/portal/login"
                  className="mt-3.5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-marca-navy transition-colors hover:bg-[#f6f6f6]"
                >
                  Entrar al portal →
                </Link>
              </div>

              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PORTAL_CHECKS.map((check) => (
                  <li
                    key={check}
                    className="flex items-center gap-2.5 rounded-xl bg-white/[0.06] px-3 py-2.5 ring-1 ring-white/10"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#a92dff] text-[11px] font-black text-white">
                      ✓
                    </span>
                    <span className="text-xs leading-snug text-white/85 sm:text-[13px]">
                      {check}
                    </span>
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
