import Link from "next/link";

const AVATARES = [
  { ini: "JM", color: "bg-slate-700" },
  { ini: "AR", color: "bg-slate-600" },
  { ini: "LC", color: "bg-slate-500" },
  { ini: "DR", color: "bg-slate-800" },
];

function PortalPanel() {
  return (
    <div className="relative mx-auto hidden max-w-md lg:block">
      <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] ring-1 ring-black/[0.04]">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Portal del cliente
          </p>
          <p className="mt-0.5 text-lg font-semibold text-slate-900">Tu cumplimiento</p>
        </div>
        <div className="space-y-2 p-5">
          {[
            { label: "Opinión 32-D", value: "Positiva", ok: true },
            { label: "IVA junio", value: "Presentado", ok: true },
            { label: "Honorarios", value: "Al corriente", ok: true },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-xl bg-[#f5f5f7] px-4 py-3"
            >
              <span className="text-sm font-medium text-slate-700">{row.label}</span>
              <span
                className={`text-xs font-semibold ${row.ok ? "text-emerald-600" : "text-slate-500"}`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 px-5 py-3 text-[11px] text-slate-400">
          Actualizado en tiempo real · rdcontadores.com
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="pt-14 pb-12 sm:pt-20 sm:pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Despacho contable · Guadalajara
            </p>
            <h1 className="mt-3 text-[clamp(2.5rem,5.5vw,3.5rem)] font-semibold leading-[1.08] tracking-tight text-slate-900">
              Tu contabilidad en buenas manos.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-500">
              Cumplimiento ante el SAT, IMSS y REPSE con un portal propio para ver tu
              información cuando la necesites.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Solicitar cotización
              </Link>
              <Link
                href="/proceso"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                Cómo trabajamos →
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {AVATARES.map((a) => (
                  <span
                    key={a.ini}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-[#fbfbfd] ${a.color}`}
                  >
                    {a.ini}
                  </span>
                ))}
              </div>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-800">+20 clientes</span> confían en RDC
              </p>
            </div>
          </div>

          <PortalPanel />
        </div>
      </div>
    </section>
  );
}
