const VALORES = [
  {
    titulo: "Cumplimiento puntual",
    descripcion: "Impuestos a tiempo. Sin sorpresas ni recargos.",
  },
  {
    titulo: "Atención cercana",
    descripcion: "Respuesta en horas. Hablas con tu contador.",
  },
  {
    titulo: "Portal propio",
    descripcion: "Tu información fiscal disponible 24/7.",
  },
];

export default function Valores() {
  return (
    <section className="border-t border-black/[0.04] py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
          {VALORES.map((v) => (
            <div key={v.titulo}>
              <p className="text-sm font-semibold text-slate-900">{v.titulo}</p>
              <p className="mt-1 text-sm text-slate-500">{v.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
