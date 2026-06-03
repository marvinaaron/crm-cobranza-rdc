/**
 * Sección "Precio visible": honorarios transparentes con la tarjeta estrella
 * de RESICO PF y una tarjeta secundaria para personas morales/nómina.
 * Solo presentación; los CTAs llevan a /contacto.
 */

import Link from "next/link";

const FEATURES = [
  "Declaración mensual SAT",
  "Declaración anual incluida",
  "Buzón tributario monitoreado",
  "Portal de cliente 24/7",
  "Asesoría por WhatsApp",
  "Cambio a RESICO sin costo extra",
];

export default function PrecioVisible() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-indigo-600 text-xs font-semibold uppercase tracking-widest mb-2">
            Honorarios transparentes
          </p>
          <h2 className="text-slate-900 text-2xl md:text-3xl font-bold mb-3 leading-tight">
            Precios claros
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              desde el primer día.
            </span>
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Sin contratos amarrados, sin costos ocultos. Pagas lo acordado y
            recibes factura mensual.
          </p>
        </div>

        {/* Card RESICO con borde gradiente */}
        <div className="max-w-xl mx-auto p-px rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600">
          <div className="bg-white rounded-[15px] p-7">
            <span className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-5">
              ⭐ Más solicitado
            </span>

            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-slate-900 font-bold text-base mb-1">
                  RESICO Persona Física
                </p>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Régimen Simplificado de Confianza para personas físicas con
                  actividad empresarial, profesional o arrendamiento.
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-slate-400 text-xs">desde</p>
                <p className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent leading-none">
                  $812
                </p>
                <p className="text-slate-400 text-xs">/mes</p>
                <span className="inline-block bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-2 py-0.5 rounded-full mt-1">
                  IVA incluido
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 my-5" />

            <div className="grid grid-cols-2 gap-3 mb-6">
              {FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs flex-shrink-0"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <span className="text-slate-600 text-xs">{f}</span>
                </div>
              ))}
            </div>

            <Link
              href="/contacto"
              className="block w-full text-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-md shadow-indigo-200"
            >
              Quiero contratar RESICO →
            </Link>

            <p className="text-slate-400 text-xs text-center mt-3">
              Sin compromiso · Cotizamos tu caso en 24 hrs
            </p>
          </div>
        </div>

        {/* Card secundaria: personas morales / nómina */}
        <div className="max-w-xl mx-auto mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-slate-900 font-semibold text-sm mb-1">
              ¿Eres persona moral o tienes nómina?
            </p>
            <p className="text-slate-400 text-xs">
              Paquete a la medida. Cotización gratis.
            </p>
          </div>
          <Link
            href="/contacto"
            className="bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            Cotizar mi caso →
          </Link>
        </div>
      </div>
    </section>
  );
}
