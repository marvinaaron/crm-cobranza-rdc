import Fiscalino from "@/components/Fiscalino";

/**
 * Mock didáctico del acuse SAT. Datos en secuencia 1234… — no es un documento oficial.
 */
export default function MockAcuseSat() {
  return (
    <section className="grid grid-cols-1 items-center gap-6 pt-4 lg:grid-cols-2 lg:gap-8 lg:pt-8">
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-rose-700">
          Cómo leer tu acuse
        </p>
        <h3 className="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
          Importe y fecha de pago, en la línea de captura
        </h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          En el PDF del SAT baja hasta el recuadro negro. Ahí están los dos datos que usa esta
          calculadora. Fiscalino te los señala en el ejemplo (todo inventado).
        </p>

        <ol className="mt-4 space-y-3">
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[11px] font-black text-amber-950">
              1
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Importe total a pagar</p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                El monto en pesos. Cópialo a “Monto del impuesto omitido”.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500 text-[11px] font-black text-white">
              2
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Vigente hasta</p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Fecha de pago de esa línea. El mes y año son tu “fecha de pago proyectada”.
              </p>
            </div>
          </li>
        </ol>

        <p className="mt-4 text-xs text-slate-500 leading-relaxed">
          El “Vencimiento obligación” del encabezado es cuándo debió pagarse originalmente. Este
          recuadro no es un acuse del SAT.
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-[320px] pt-6 pb-4 lg:ml-auto lg:mr-0">
        <div
          className="pointer-events-none absolute -right-2 top-2 z-0 sm:-right-4 sm:top-0"
          aria-hidden
        >
          <Fiscalino mood="happy" size={168} className="-rotate-[12deg] drop-shadow-lg" />
        </div>

        <article
          className="relative z-10 ml-0 mr-14 w-[200px] origin-bottom-left -rotate-[2.5deg] bg-white px-2.5 py-2.5 shadow-[0_18px_40px_-12px_rgba(15,23,42,0.4)] ring-1 ring-stone-300 sm:w-[216px] sm:px-3"
          aria-label="Ejemplo de acuse SAT con datos inventados"
        >
          <header className="flex items-start justify-between gap-2 border-b border-stone-800 pb-2">
            <LogoHacienda />
            <p className="max-w-[7.5rem] pt-1 text-center text-[6.5px] font-bold uppercase leading-[1.25] tracking-wide text-stone-900">
              Acuse de recibo declaración provisional o definitiva de impuestos federales
            </p>
            <LogoSat />
          </header>

          <div className="mt-2 grid grid-cols-[auto_1fr_auto] items-end gap-x-2 text-[8px] leading-tight text-stone-900 sm:text-[9px]">
            <span className="font-bold">RFC:</span>
            <span className="font-mono tracking-wide">1234567890123</span>
            <span className="text-right text-stone-600">Hoja 1 de 1</span>
            <span className="font-bold">Nombre:</span>
            <span className="col-span-2">NOMBRE DE EJEMPLO CONTRIBUYENTE</span>
          </div>

          <div className="mt-2 space-y-0.5 border-y border-stone-400 py-1.5 text-[7.5px] leading-[1.5] text-stone-900">
            <Campo k="Tipo de declaración" v="Normal" />
            <Campo k="Periodicidad" v="Mensual" />
            <Campo k="Ejercicio" v="2026" />
            <Campo k="Período de la declaración" v="Junio" />
            <Campo k="Fecha y hora de presentación" v="01/06/2026 12:34" />
            <Campo k="Vencimiento Obligación" v="17/06/2026" />
            <Campo k="Número de operación" v="123456789012" />
          </div>

          <p className="mt-1.5 text-[6.5px] leading-snug text-stone-600 sm:text-[7px]">
            El contribuyente es responsable de la veracidad y exactitud de los datos asentados. La
            presentación de esta declaración no implica resolución favorable de la autoridad fiscal.
          </p>

          <div className="mt-2 border-[2.5px] border-stone-900 px-2 py-1.5 sm:px-2.5">
            <p className="text-center text-[8px] font-bold uppercase tracking-wide text-stone-900 sm:text-[9px]">
              Sección línea de captura
            </p>
            <p className="mt-1 text-[6.5px] leading-snug text-stone-700 sm:text-[7px]">
              El importe a cargo determinado en esta declaración deberá ser pagado en las instituciones
              de crédito autorizadas, utilizando para tal efecto la línea de captura que se indica.
            </p>
            <div className="mt-1.5 space-y-1.5 text-[8px] leading-snug">
              <p>
                <span className="font-bold">Línea de Captura:</span>
                <span className="mt-0.5 block font-mono font-semibold tracking-wide">
                  1234 5678 9012 3456 7890
                </span>
              </p>
              <p>
                <span className="font-bold">Importe total a pagar:</span>{" "}
                <mark className="relative ml-0.5 rounded-sm bg-amber-300 px-1 py-0.5 font-bold text-stone-950 ring-1 ring-amber-500">
                  <span className="absolute -left-2.5 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[8px] font-black text-amber-950 ring-1 ring-white">
                    1
                  </span>
                  $12,345
                </mark>
              </p>
              <p>
                <span className="font-bold">Vigente hasta:</span>{" "}
                <mark className="relative ml-0.5 rounded-sm bg-sky-300 px-1 py-0.5 font-bold text-stone-950 ring-1 ring-sky-500">
                  <span className="absolute -left-2.5 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[8px] font-black text-white ring-1 ring-white">
                    2
                  </span>
                  17/06/2026
                </mark>
              </p>
            </div>
          </div>

          <div className="mt-2 flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <CodigoBarras />
              <p className="mt-0.5 text-center font-mono text-[7px] tracking-[0.12em] text-stone-800">
                12345678901234567890 12345
              </p>
            </div>
            <QrFalso />
          </div>

          <p className="mt-1.5 break-all font-mono text-[5.5px] leading-[1.35] text-stone-700 sm:text-[6px]">
            <span className="font-sans font-bold">Sello digital: </span>
            1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890
          </p>
        </article>
      </div>
    </section>
  );
}

function Campo({ k, v }: { k: string; v: string }) {
  return (
    <p>
      <span className="font-bold">{k}:</span> {v}
    </p>
  );
}

function LogoHacienda() {
  return (
    <div className="flex items-center gap-1.5">
      <svg viewBox="0 0 36 36" className="h-8 w-8 shrink-0 text-stone-800" aria-hidden>
        <circle cx="18" cy="18" r="17" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M18 8l1.2 3.6H23l-3 2.2 1.1 3.5L18 15.2l-3.1 2.1 1.1-3.5-3-2.2h3.8z"
          fill="currentColor"
        />
        <path d="M11 24c2.4-3 4.6-4 7-4s4.6 1 7 4" fill="none" stroke="currentColor" strokeWidth="1.1" />
      </svg>
      <p className="sr-only">Hacienda</p>
    </div>
  );
}

function LogoSat() {
  return (
    <div className="flex items-center gap-1.5">
      <p className="sr-only">Servicio de Administración Tributaria</p>
      <div className="text-center">
        <div className="mx-auto grid w-7 grid-cols-2 gap-0.5">
          <span className="h-3 w-3 rounded-full bg-[#1e4d8c]" />
          <span className="h-3 w-3 rounded-full bg-[#1e4d8c]" />
          <span className="h-3 w-3 rounded-full bg-[#1e4d8c]" />
          <span className="h-3 w-3 rounded-full bg-[#1e4d8c]" />
        </div>
        <p className="mt-0.5 text-[8px] font-black tracking-[0.2em] text-[#1e4d8c]">SAT</p>
      </div>
    </div>
  );
}

function CodigoBarras() {
  const anchos = [1, 2, 1, 3, 1, 1, 2, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 1, 2, 3, 1, 2, 1, 1, 2, 1, 3, 1, 2, 1, 2, 1, 3, 1];
  return (
    <div className="flex h-9 items-stretch justify-between overflow-hidden bg-white" aria-hidden>
      {anchos.map((w, i) => (
        <span
          key={i}
          className="h-full bg-stone-900"
          style={{ width: w * 2, marginRight: i % 4 === 0 ? 1 : 0 }}
        />
      ))}
    </div>
  );
}

function QrFalso() {
  const n = 17;
  const cells: boolean[] = [];
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      const finder =
        (x < 5 && y < 5) || (x >= n - 5 && y < 5) || (x < 5 && y >= n - 5);
      const finderInner =
        (x >= 1 && x <= 3 && y >= 1 && y <= 3) ||
        (x >= n - 4 && x <= n - 2 && y >= 1 && y <= 3) ||
        (x >= 1 && x <= 3 && y >= n - 4 && y <= n - 2);
      cells.push(finder ? !finderInner || (x + y) % 2 === 0 : (x * 5 + y * 11) % 7 > 2);
    }
  }
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="h-11 w-11 shrink-0 text-stone-900" aria-hidden>
      {cells.map((on, i) =>
        on ? <rect key={i} x={i % n} y={Math.floor(i / n)} width="1" height="1" fill="currentColor" /> : null
      )}
    </svg>
  );
}
