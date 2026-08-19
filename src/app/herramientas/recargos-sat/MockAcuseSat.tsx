/**
 * Mock ilustrativo de un acuse SAT. Datos ficticios en secuencia 1234…
 * No es un documento oficial ni sirve para pagar.
 */
export default function MockAcuseSat() {
  return (
    <figure className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-700">
            Cómo leer tu acuse
          </p>
          <h3 className="mt-1 text-base font-bold text-slate-900">
            Dónde está el importe y la fecha de pago
          </h3>
        </div>
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-800">
          Ejemplo · datos inventados
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-[11px]">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800 ring-1 ring-emerald-200">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] text-white">
            1
          </span>
          Importe total a pagar
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 font-semibold text-rose-800 ring-1 ring-rose-200">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] text-white">
            2
          </span>
          Vigente hasta = fecha de pago
        </span>
      </div>

      <div className="overflow-hidden rounded-xl bg-[#f7f4ee] ring-1 ring-stone-300 shadow-sm">
        <div className="border-b border-stone-300 bg-white px-3 py-2.5 sm:px-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[9px] font-black uppercase leading-tight tracking-wide text-[#6b1c23] sm:text-[10px]">
              Hacienda
              <span className="mt-0.5 block text-[8px] font-semibold normal-case tracking-normal text-stone-500">
                Secretaría de Hacienda
                <br />
                y Crédito Público
              </span>
            </p>
            <p className="max-w-[12rem] text-center text-[9px] font-black uppercase leading-snug text-stone-800 sm:max-w-xs sm:text-[10px]">
              Acuse de recibo declaración provisional o definitiva de impuestos federales
            </p>
            <p className="text-right text-[9px] font-black uppercase leading-tight tracking-widest text-[#1e4d8c] sm:text-[10px]">
              SAT
              <span className="mt-0.5 block text-[8px] font-semibold normal-case tracking-normal text-stone-500">
                Servicio de Administración
                <br />
                Tributaria
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-2.5 px-3 py-3 text-[10px] text-stone-800 sm:px-4 sm:text-[11px]">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            <p>
              <span className="font-bold">RFC:</span>{" "}
              <span className="font-mono tracking-wide">1234567890123</span>
            </p>
            <p>
              <span className="font-bold">Nombre:</span> NOMBRE DE EJEMPLO CONTRIBUYENTE
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 border border-stone-300 bg-white/70 p-2 leading-relaxed">
            <p>
              <span className="font-bold">Tipo de declaración:</span> Normal
            </p>
            <p>
              <span className="font-bold">Período:</span> Junio
            </p>
            <p>
              <span className="font-bold">Periodicidad:</span> Mensual
            </p>
            <p>
              <span className="font-bold">Fecha y hora de presentación:</span> 01/06/2026 12:34
            </p>
            <p>
              <span className="font-bold">Ejercicio:</span> 2026
            </p>
            <p>
              <span className="font-bold">Vencimiento obligación:</span> 17/06/2026
            </p>
            <p>
              <span className="font-bold">Medio / versión:</span> Internet · 12.3.4
            </p>
            <p>
              <span className="font-bold">Número de operación:</span>{" "}
              <span className="font-mono">123456789012</span>
            </p>
          </div>

          <p className="text-[9px] leading-snug text-stone-500">
            El contribuyente es responsable de la veracidad de los datos. Este recuadro es un mockup didáctico
            de RDC Contadores; no es un acuse emitido por el SAT.
          </p>

          <div className="border-2 border-stone-800 bg-white p-2.5 sm:p-3">
            <p className="mb-1.5 text-center text-[10px] font-black uppercase tracking-wide">
              Sección línea de captura
            </p>
            <p className="mb-2 text-[9px] leading-snug text-stone-600">
              El importe a cargo determinado en esta declaración deberá ser pagado en las instituciones de
              crédito autorizadas, utilizando la línea de captura que se indica.
            </p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="text-[9px] font-bold uppercase text-stone-500">Línea de captura</p>
                <p className="font-mono text-sm font-bold tracking-wider text-stone-900 sm:text-base">
                  1234 5678 9012 3456 7890
                </p>
              </div>
              <div className="relative rounded-lg bg-emerald-50 px-3 py-2 ring-2 ring-emerald-500">
                <span className="absolute -top-2 left-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-black text-white">
                  1
                </span>
                <p className="text-[9px] font-bold uppercase text-emerald-800">Importe total a pagar</p>
                <p className="text-xl font-black tabular-nums tracking-tight text-emerald-950">$12,345</p>
              </div>
            </div>

            <div className="relative mt-2 inline-block rounded-lg bg-rose-50 px-3 py-1.5 ring-2 ring-rose-500">
              <span className="absolute -top-2 left-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white">
                2
              </span>
              <p className="text-[9px] font-bold uppercase text-rose-800">Vigente hasta</p>
              <p className="text-base font-black tabular-nums text-rose-950">17/06/2026</p>
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="min-w-0 flex-1">
              <div
                aria-hidden
                className="h-10 w-full rounded-sm"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, #1c1917 0 2px, transparent 2px 3px, #1c1917 3px 5px, transparent 5px 7px, #1c1917 7px 8px, transparent 8px 10px)",
                }}
              />
              <p className="mt-0.5 text-center font-mono text-[9px] tracking-[0.2em] text-stone-700">
                12345678901234567890
              </p>
            </div>
            <svg
              aria-hidden
              viewBox="0 0 21 21"
              className="h-12 w-12 shrink-0 text-stone-900"
              fill="currentColor"
            >
              {Array.from({ length: 21 * 21 }, (_, i) => {
                const x = i % 21;
                const y = Math.floor(i / 21);
                const on = (x * 7 + y * 13 + i) % 5 !== 0;
                if (!on) return null;
                return <rect key={i} x={x} y={y} width="1" height="1" />;
              })}
            </svg>
          </div>

          <p className="break-all font-mono text-[8px] leading-snug text-stone-500">
            <span className="font-sans font-bold text-stone-700">Sello digital: </span>
            12345678901234567890123456789012345678901234567890123456789012345678901234567890
          </p>
        </div>
      </div>

      <figcaption className="text-xs text-slate-500 leading-relaxed">
        <span className="font-semibold text-slate-700">1 · Importe:</span> cópialo al campo “Monto del impuesto
        omitido”. <span className="font-semibold text-slate-700">2 · Vigente hasta:</span> es la fecha de pago de
        esa línea de captura (el mes de esa fecha es el que usas como pago proyectado). El “Vencimiento
        obligación” del encabezado es la fecha en que debió pagarse originalmente.
      </figcaption>
    </figure>
  );
}
