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
    <section className="border-y border-slate-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {VALORES.map((v) => (
            <div key={v.titulo} className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-black text-slate-900">{v.titulo}</p>
                <p className="text-sm text-slate-600">{v.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
