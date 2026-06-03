/**
 * Sección "Logos de credibilidad": respaldo tecnológico (suite CONTPAQi)
 * y membresías/formación discretas (CEFOR y Cámara de Comercio).
 * Solo presentación; sin lógica ni enlaces externos.
 */

type Producto = {
  emoji: string;
  nombre: string;
  descripcion: string;
  badge?: string;
};

const PRODUCTOS: Producto[] = [
  {
    emoji: "📊",
    nombre: "Contabiliza",
    descripcion: "Contabilidad electrónica, pólizas y balanzas alineadas al SAT.",
    badge: "Certificado SAT",
  },
  {
    emoji: "👥",
    nombre: "Personia",
    descripcion: "Cálculo y timbrado de nómina, CFDI 4.0, IMSS, Infonavit e ISN.",
  },
  {
    emoji: "🧾",
    nombre: "Vende",
    descripcion: "Facturación electrónica, ventas e inventarios para PF y PM.",
  },
];

const MEMBRESIAS = [
  { emoji: "🎓", nombre: "CEFOR", sub: "Formación fiscal continua" },
  { emoji: "🏛️", nombre: "Cámara de Comercio", sub: "Miembro · Guadalajara" },
];

export default function LogosCredibilidad() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-indigo-600 text-xs font-semibold uppercase tracking-widest mb-2">
            Respaldado por
          </p>
          <h2 className="text-slate-900 text-2xl md:text-3xl font-bold mb-3 leading-tight">
            Trabajamos con el software
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              estándar de la industria.
            </span>
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Operamos sobre el ecosistema CONTPAQi, certificado por el SAT — el
            estándar profesional de despachos serios en México.
          </p>
        </div>

        {/* CONTPAQi: 3 productos protagonistas */}
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest text-center mb-4">
          CONTPAQi® — Suite completa
        </p>

        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-3">
          {PRODUCTOS.map((p) => (
            <div
              key={p.nombre}
              className="bg-white border border-slate-200 rounded-2xl p-5 text-center relative hover:border-indigo-200 hover:shadow-md transition-all duration-200"
            >
              {p.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                  {p.badge}
                </span>
              )}
              <span
                className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl mx-auto mb-3 mt-2"
                aria-hidden="true"
              >
                {p.emoji}
              </span>
              <p className="text-slate-900 font-bold text-sm mb-1">{p.nombre}</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                {p.descripcion}
              </p>
            </div>
          ))}
        </div>

        <p className="text-slate-300 text-xs text-center mt-2 mb-10">
          CONTPAQi® es marca registrada de Computación en Acción, S.A. de C.V. ·
          Software autorizado por el SAT
        </p>

        {/* Separador */}
        <div className="border-t border-slate-100 max-w-xs mx-auto mb-8" />

        {/* CEFOR y Cámara de Comercio: discretos */}
        <p className="text-slate-300 text-xs font-semibold uppercase tracking-widest text-center mb-4">
          Formación continua y membresías
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          {MEMBRESIAS.map((m) => (
            <div
              key={m.nombre}
              className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 flex items-center gap-2"
            >
              <span className="text-base opacity-50" aria-hidden="true">
                {m.emoji}
              </span>
              <div>
                <p className="text-slate-400 text-xs font-semibold">{m.nombre}</p>
                <p className="text-slate-300 text-xs">{m.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
