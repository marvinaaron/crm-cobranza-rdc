import RevealOnScroll from "@/components/publico/motion/RevealOnScroll";

const VALORES = [
  {
    titulo: "Cumplimiento puntual",
    descripcion: "Tus impuestos presentados a tiempo. Sin sorpresas ni recargos.",
  },
  {
    titulo: "Atención cercana",
    descripcion: "Respondemos en horas, no en días. Hablamos claro y sin tecnicismos.",
  },
  {
    titulo: "Tecnología propia",
    descripcion: "Portal del cliente con tu información actualizada las 24 horas.",
  },
];

export default function Valores() {
  return (
    <section className="border-y border-black/5 bg-[#f6f6f6]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {VALORES.map((v) => (
            <RevealOnScroll key={v.titulo}>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-marca-navy text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-black tracking-tight text-marca-navy">
                    {v.titulo}
                  </p>
                  <p className="text-sm text-marca-navy/60">{v.descripcion}</p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
