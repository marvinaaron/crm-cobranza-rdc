/**
 * Showcase visual del portal del cliente. Pensado para enamorar al visitante:
 * mockups de dispositivos reales (laptop + iPhone) renderizados con CSS/SVG
 * mostrando vistas distintas del portal en simultáneo.
 *
 * Es un Server Component: sin interactividad (la versión interactiva
 * con tabs vive en `PortalPreview.tsx`, que se usa en /proceso).
 */

import Image from "next/image";
import Link from "next/link";

function MockupDesktopInicio() {
  return (
    <div className="relative w-full max-w-[560px] mx-auto">
      {/* Chrome de ventana tipo macOS */}
      <div className="rounded-t-2xl bg-slate-800 px-4 py-2.5 flex items-center gap-1.5 ring-1 ring-slate-900/20">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 text-[10px] font-semibold text-slate-400 tracking-wider">
          rdcontadores.com/portal
        </span>
      </div>

      {/* Cuerpo del navegador */}
      <div className="rounded-b-2xl bg-slate-50 p-5 ring-1 ring-slate-900/10 shadow-2xl">
        {/* Header del portal */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Mi portal
            </p>
            <p className="text-base font-black text-slate-900">Hola, María</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-widest">
            Todo al día
          </span>
        </div>

        {/* Calendario fiscal mini */}
        <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200 mb-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Calendario fiscal · Mayo
            </p>
            <span className="text-[9px] font-semibold text-slate-400">2026</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
              <span
                key={i}
                className="text-[8px] font-bold uppercase tracking-widest text-slate-400"
              >
                {d}
              </span>
            ))}
            {Array.from({ length: 31 }).map((_, i) => {
              const dia = i + 1;
              const esEvento = dia === 17;
              const esHoy = dia === 12;
              return (
                <span
                  key={dia}
                  className={`text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-md ${
                    esEvento
                      ? "bg-rose-500 text-white"
                      : esHoy
                      ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300"
                      : "text-slate-600"
                  }`}
                >
                  {dia}
                </span>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[10px] text-slate-700 font-semibold">
              17 May · Pago ISR e IVA
            </span>
          </div>
        </div>

        {/* Cards inferiores */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-white ring-1 ring-slate-200 p-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Cumplimiento
            </p>
            <p className="text-xs font-black text-emerald-700 mt-1">Presentado</p>
            <p className="text-[9px] text-slate-500">Abril 2026</p>
          </div>
          <div className="rounded-xl bg-white ring-1 ring-slate-200 p-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Honorarios
            </p>
            <p className="text-xs font-black text-emerald-700 mt-1">Pagado</p>
            <p className="text-[9px] text-slate-500">Mayo 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupCountdownVencimiento() {
  return (
    <div className="bg-white rounded-3xl ring-1 ring-slate-200 shadow-2xl p-6 max-w-md w-full">
      {/* Header rojo de urgencia */}
      <div className="flex items-center gap-2 mb-4">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
        </span>
        <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">
          Próximo vencimiento
        </p>
      </div>

      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        SAT · Pago ISR e IVA
      </p>
      <p className="text-lg font-black text-slate-900 leading-tight mt-0.5">
        Periodo abril 2026
      </p>

      {/* Countdown grande */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-xl p-3 text-center shadow-md">
          <p className="text-3xl font-black tabular-nums leading-none">03</p>
          <p className="text-[9px] font-bold uppercase tracking-widest mt-1 opacity-90">
            días
          </p>
        </div>
        <div className="bg-slate-100 rounded-xl p-3 text-center">
          <p className="text-3xl font-black tabular-nums text-slate-700 leading-none">
            14
          </p>
          <p className="text-[9px] font-bold uppercase tracking-widest mt-1 text-slate-500">
            horas
          </p>
        </div>
        <div className="bg-slate-100 rounded-xl p-3 text-center">
          <p className="text-3xl font-black tabular-nums text-slate-700 leading-none">
            22
          </p>
          <p className="text-[9px] font-bold uppercase tracking-widest mt-1 text-slate-500">
            min
          </p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
          <span className="text-slate-500">12 may</span>
          <span className="text-rose-600">Vence 17 may</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 rounded-full"
            style={{ width: "85%" }}
          />
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Ver línea de captura
        </div>
        <div className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          Hablar con contador
        </div>
      </div>
    </div>
  );
}

function MockupCalendarioPortal() {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-2xl p-4 w-full max-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            Calendario fiscal
          </p>
          <p className="text-sm font-black text-slate-900">Mayo 2026</p>
        </div>
        <div className="flex gap-1">
          <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-bold">
            ‹
          </span>
          <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-bold">
            ›
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <span
            key={i}
            className="text-[8px] font-bold uppercase tracking-widest text-slate-400 text-center"
          >
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 31 }).map((_, i) => {
          const dia = i + 1;
          const esHoy = dia === 12;
          const eventos: { color: string }[] =
            dia === 17
              ? [{ color: "bg-rose-500" }, { color: "bg-amber-500" }]
              : dia === 5
              ? [{ color: "bg-emerald-500" }]
              : dia === 20
              ? [{ color: "bg-indigo-500" }]
              : dia === 31
              ? [{ color: "bg-violet-500" }]
              : [];
          return (
            <div
              key={dia}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-md text-[10px] font-bold ${
                esHoy
                  ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300"
                  : "text-slate-700"
              }`}
            >
              {dia}
              {eventos.length > 0 ? (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {eventos.map((e, idx) => (
                    <span
                      key={idx}
                      className={`w-1 h-1 rounded-full ${e.color}`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="12" y1="14" x2="12" y2="18" />
          <line x1="10" y1="16" x2="14" y2="16" />
        </svg>
        Agregar a mi calendario
      </button>
    </div>
  );
}

function MockupIPhoneCalendarioNativo() {
  return (
    <div className="w-[200px] bg-slate-900 rounded-[2.5rem] p-2 shadow-2xl ring-1 ring-black/30">
      <div className="relative">
        <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-20 h-5 bg-slate-900 rounded-b-2xl z-10" />
        <div className="bg-white rounded-[2rem] overflow-hidden">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-3 pb-1.5">
            <span className="text-[9px] font-bold text-slate-700">9:41</span>
            <div className="flex items-center gap-1">
              <svg width="14" height="9" viewBox="0 0 22 14" fill="none" className="text-slate-700">
                <rect x="0.5" y="0.5" width="18" height="13" rx="2.5" stroke="currentColor" />
                <rect x="2" y="2" width="13" height="10" rx="1.5" fill="currentColor" />
                <rect x="20" y="4" width="1.5" height="6" rx="0.75" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* App Calendario nativa */}
          <div className="px-4 pt-3 pb-2">
            <p className="text-[10px] font-bold text-red-500">Mayo 2026</p>
            <p className="text-xl font-black text-slate-900 leading-none">
              Domingo 17
            </p>
          </div>

          {/* Horarios */}
          <div className="px-4 space-y-1 pb-4">
            <div className="flex gap-2">
              <span className="text-[8px] font-bold text-slate-400 w-7 shrink-0 pt-1">
                todo el día
              </span>
              <div className="flex-1 bg-rose-100 border-l-2 border-rose-500 rounded-r-md px-2 py-1.5">
                <p className="text-[10px] font-black text-rose-700 leading-tight">
                  SAT · Pago ISR e IVA
                </p>
                <p className="text-[8px] text-rose-600">Calendario fiscal RDC</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-[8px] font-bold text-slate-400 w-7 shrink-0 pt-1">
                09:00
              </span>
              <div className="flex-1 bg-slate-100 border-l-2 border-slate-300 rounded-r-md px-2 py-1.5">
                <p className="text-[10px] font-semibold text-slate-700 leading-tight">
                  Reunión cliente
                </p>
              </div>
            </div>

            {/* Notificación push */}
            <div className="mt-3 bg-slate-100 rounded-xl p-2.5 ring-1 ring-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-md bg-rose-500 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <p className="text-[9px] font-black text-slate-700">CALENDARIO</p>
                <span className="ml-auto text-[8px] text-slate-400">ayer</span>
              </div>
              <p className="text-[9px] font-black text-slate-900 leading-tight">
                Mañana: SAT · Pago ISR e IVA
              </p>
              <p className="text-[8px] text-slate-600 leading-tight mt-0.5">
                Recordatorio del calendario fiscal RDC
              </p>
            </div>
          </div>

          <div className="flex justify-center pb-2">
            <span className="h-1 w-20 rounded-full bg-slate-900" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupEfirmaAlerta() {
  return (
    <div className="bg-amber-50 rounded-2xl ring-1 ring-amber-200 p-4 shadow-xl">
      <div className="flex items-center gap-3">
        {/* Cuenta regresiva circular */}
        <div className="relative w-14 h-14 shrink-0">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke="rgb(254 215 170)"
              strokeWidth="4"
            />
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke="rgb(217 119 6)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="150.8"
              strokeDashoffset="60"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-black text-amber-700 leading-none">23</span>
            <span className="text-[8px] font-bold text-amber-600 uppercase tracking-wider leading-none mt-0.5">
              días
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 mb-0.5">
            Aviso · e.firma (FIEL)
          </p>
          <p className="text-[11px] font-bold text-slate-800 leading-snug">
            Su certificado vence el{" "}
            <span className="text-amber-900">18 de junio 2026</span>.
          </p>
          <p className="text-[9px] font-bold uppercase tracking-widest text-amber-700 mt-1.5">
            Renueva pronto
          </p>
        </div>
      </div>
    </div>
  );
}

function MockupTuContador() {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-xl p-4 flex items-center gap-3">
      <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 ring-2 ring-violet-100 bg-slate-100">
        <Image
          src="/equipo/aaron.jpg"
          alt="Aaron Rosales"
          fill
          sizes="56px"
          className="object-cover object-top"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          Tu contador
        </p>
        <p className="text-sm font-black text-slate-800 leading-tight mt-0.5 truncate">
          Aaron Rosales
        </p>
        <p className="text-[10px] font-bold text-slate-500 truncate">
          Contador Público
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-wider">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            Correo
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.5-.6.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.5-.9-2.1-.2-.5-.5-.5-.6-.5h-.6c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2 0 1.3.9 2.5 1 2.7.1.2 1.7 2.7 4.3 3.8.6.3 1.1.4 1.4.5.6.2 1.2.2 1.6.1.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z" />
            </svg>
            WhatsApp
          </span>
        </div>
      </div>
    </div>
  );
}

function MockupMobileSAT() {
  return (
    <div className="relative">
      {/* Marco del teléfono */}
      <div className="w-[200px] sm:w-[220px] bg-slate-900 rounded-[2.5rem] p-2 shadow-2xl ring-1 ring-black/20">
        {/* Notch */}
        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-20 h-5 bg-slate-900 rounded-b-2xl z-10" />
          {/* Pantalla */}
          <div className="bg-white rounded-[2rem] overflow-hidden">
            {/* Status bar */}
            <div className="flex items-center justify-between px-5 pt-3 pb-1.5">
              <span className="text-[9px] font-bold text-slate-700">9:41</span>
              <div className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-slate-700">
                  <path d="M2 22L20 4l2 2L4 24z" opacity="0" />
                  <path d="M5 12l3 3 9-9" stroke="currentColor" strokeWidth="0" />
                  <rect x="3" y="9" width="2" height="6" rx="0.5" />
                  <rect x="6" y="7" width="2" height="8" rx="0.5" />
                  <rect x="9" y="5" width="2" height="10" rx="0.5" />
                  <rect x="12" y="3" width="2" height="12" rx="0.5" />
                </svg>
                <svg width="14" height="9" viewBox="0 0 22 14" fill="none" className="text-slate-700">
                  <rect x="0.5" y="0.5" width="18" height="13" rx="2.5" stroke="currentColor" />
                  <rect x="2" y="2" width="13" height="10" rx="1.5" fill="currentColor" />
                  <rect x="20" y="4" width="1.5" height="6" rx="0.75" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Header app */}
            <div className="px-4 pt-3 pb-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                Mi situación
              </p>
              <p className="text-base font-black text-slate-900 leading-tight">
                SAT
              </p>
            </div>

            {/* Semáforo opinión */}
            <div className="mx-4 mb-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-white ring-1 ring-emerald-200 p-4">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-pulse" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                </span>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-700">
                    Opinión 32-D
                  </p>
                  <p className="text-[13px] font-black text-emerald-800">
                    Positiva
                  </p>
                </div>
              </div>
              <p className="text-[9px] text-slate-500 mt-2">
                Verificado hace 2 horas
              </p>
            </div>

            {/* Documentos */}
            <div className="px-4 pb-5 space-y-2">
              {[
                { nombre: "Constancia situación fiscal", color: "indigo" },
                { nombre: "Opinión de cumplimiento", color: "emerald" },
                { nombre: "Acuse SAT abril", color: "slate" },
              ].map((d) => (
                <div
                  key={d.nombre}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50"
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      d.color === "indigo"
                        ? "bg-indigo-100 text-indigo-600"
                        : d.color === "emerald"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-800 truncate">
                      {d.nombre}
                    </p>
                    <p className="text-[8px] text-slate-500">PDF · Descargar</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Indicador home */}
            <div className="flex justify-center pb-2">
              <span className="h-1 w-20 rounded-full bg-slate-900" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    titulo: "SAT en tiempo real",
    descripcion:
      "Tu opinión 32-D actualizada automáticamente cada vez que abres el portal.",
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    titulo: "Calendario fiscal",
    descripcion:
      "Marca los vencimientos del mes para que ni tú ni nosotros olvidemos nada.",
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    titulo: "Documentos a un clic",
    descripcion:
      "Constancia, opinión y acuses listos para descargar cuando el banco te los pida.",
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    color: "bg-violet-100 text-violet-700",
  },
  {
    titulo: "Pago en línea",
    descripcion:
      "Paga tus honorarios con tarjeta desde tu celular. Factura digital al instante.",
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    color: "bg-amber-100 text-amber-700",
  },
];

export default function PortalShowcase() {
  return (
    <section className="relative pt-14 sm:pt-20 pb-20 sm:pb-28 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white overflow-hidden">
      {/* Glow decorativo */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl -z-0 pointer-events-none" aria-hidden />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-3xl -z-0 pointer-events-none" aria-hidden />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 ring-1 ring-white/20 text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Tecnología propia
          </span>
          <h2 className="mt-5 text-3xl sm:text-5xl font-black tracking-tight">
            Lo que nos hace diferentes:
            <br />
            <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
              tu despacho en un portal hermoso
            </span>
          </h2>
          <p className="mt-5 text-slate-300 leading-relaxed text-base sm:text-lg">
            Somos de los pocos despachos en México con un portal propio para sus
            clientes. Ahí ves tu cumplimiento fiscal, tu opinión del SAT, tus
            documentos y pagos en tiempo real, desde tu computadora o tu celular.
          </p>
        </div>

        {/* Showcase de dispositivos */}
        <div className="relative h-[480px] sm:h-[560px] mb-16">
          {/* Laptop al fondo */}
          <div className="absolute inset-x-0 top-4 flex justify-center px-4 sm:px-0">
            <div className="w-full max-w-[600px]">
              <MockupDesktopInicio />
            </div>
          </div>

          {/* Teléfono encima a la derecha */}
          <div className="absolute right-4 sm:right-8 lg:right-20 bottom-0 z-10 transform rotate-3">
            <MockupMobileSAT />
          </div>

          {/* Etiqueta flotante a la izquierda */}
          <div className="hidden sm:block absolute left-4 lg:left-12 bottom-12 z-10 transform -rotate-3">
            <div className="bg-white rounded-2xl p-4 ring-1 ring-slate-200 shadow-2xl max-w-[200px]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <p className="text-[10px] font-black text-slate-900">Acuse recibido</p>
              </div>
              <p className="text-[10px] text-slate-600 leading-snug">
                Tu declaración de IVA del mes fue presentada con éxito.
              </p>
              <p className="text-[9px] text-slate-400 mt-1.5">hace 5 min</p>
            </div>
          </div>
        </div>

        {/* Galería secundaria: piezas reales del portal */}
        <div className="mb-14">
          <div className="text-center mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-300">
              Y mucho más por dentro
            </p>
            <h3 className="mt-2 text-xl sm:text-2xl font-black text-white">
              Estas son piezas reales de tu portal
            </h3>
            <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
              Cuando entres por primera vez, todo te va a resultar familiar.
              Diseñamos cada sección pensando en cómo tú las usarías.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 ring-1 ring-white/10 backdrop-blur rounded-2xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-3">
                Bloque 1 · e.firma
              </p>
              <MockupEfirmaAlerta />
              <p className="text-[11px] text-slate-300 mt-3 leading-relaxed">
                Te avisamos con tiempo cuando tu e.firma esté por vencer.
                Sin sustos, sin trámites de última hora.
              </p>
            </div>

            <div className="bg-white/5 ring-1 ring-white/10 backdrop-blur rounded-2xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-3">
                Bloque 2 · Tu contador
              </p>
              <MockupTuContador />
              <p className="text-[11px] text-slate-300 mt-3 leading-relaxed">
                Sabes quién lleva tu cuenta y puedes contactarlo con un solo
                toque. Sin filtros, sin call center.
              </p>
            </div>

            <div className="bg-white/5 ring-1 ring-white/10 backdrop-blur rounded-2xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-3">
                Bloque 3 · Notificaciones
              </p>
              <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-800 truncate">
                      Declaración presentada
                    </p>
                    <p className="text-[9px] text-slate-500">hace 5 min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-800 truncate">
                      Acuse disponible
                    </p>
                    <p className="text-[9px] text-slate-500">hoy 9:32 am</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-800 truncate">
                      Vencimiento próximo
                    </p>
                    <p className="text-[9px] text-slate-500">17 de junio</p>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 mt-3 leading-relaxed">
                Avisos puntuales para que nada se te pase. En el portal y por
                correo cuando es importante.
              </p>
            </div>
          </div>
        </div>

        {/* Feature: countdown a vencimientos */}
        <div className="relative mb-14 rounded-3xl overflow-hidden bg-gradient-to-br from-rose-900/30 via-amber-900/20 to-slate-900 ring-1 ring-rose-400/20 backdrop-blur p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 ring-1 ring-rose-400/30 text-[10px] font-bold uppercase tracking-[0.25em] text-rose-200">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                </span>
                Te avisamos en tiempo real
              </span>
              <h3 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Cuenta regresiva visible
                <br />
                <span className="bg-gradient-to-r from-rose-300 to-amber-300 bg-clip-text text-transparent">
                  cuando se acerca una fecha
                </span>
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                Cuando una obligación está a punto de vencer, el portal cambia
                de tono y muestra un{" "}
                <span className="font-bold text-white">contador en tiempo real</span>{" "}
                con días, horas y minutos exactos. Junto con la línea de captura
                lista para que pagues y un botón directo para hablar con tu
                contador.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  "Aviso desde 5 días antes con tono ámbar de alerta",
                  "Última recta (≤24 h): rojo intenso y notificación push",
                  "Línea de captura precargada — pagas en segundos",
                  "Botón directo a tu contador si tienes dudas",
                ].map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-3 text-sm text-slate-200"
                  >
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center lg:justify-end">
              <MockupCountdownVencimiento />
            </div>
          </div>
        </div>

        {/* Feature destacado: sincronización con calendario del teléfono */}
        <div className="relative mb-14 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600/20 via-violet-600/15 to-emerald-500/15 ring-1 ring-white/15 backdrop-blur p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/30 text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-200">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                Exclusivo de RDC
              </span>
              <h3 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Lleva tus fechas fiscales
                <br />
                <span className="bg-gradient-to-r from-emerald-300 to-indigo-300 bg-clip-text text-transparent">
                  directo a tu celular
                </span>
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                Con un solo toque agregas todas tus obligaciones (SAT, IMSS,
                REPSE, honorarios) a la app Calendario de tu iPhone o Android.
                Recibes <span className="font-bold text-white">recordatorio 1 día antes</span>{" "}
                de cada vencimiento — para que nunca se te pase nada importante.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  {
                    icono: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ),
                    texto: "Compatible con iPhone, Android, Google Calendar y Outlook",
                  },
                  {
                    icono: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ),
                    texto: "Notificación automática 1 día antes de cada fecha límite",
                  },
                  {
                    icono: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ),
                    texto: "Personalizado para tu régimen (SAT, IMSS, REPSE, etc.)",
                  },
                ].map((p) => (
                  <li
                    key={p.texto}
                    className="flex items-start gap-3 text-sm text-slate-200"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      {p.icono}
                    </span>
                    {p.texto}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual: dos pantallas conectadas */}
            <div className="relative flex items-center justify-center min-h-[380px] sm:min-h-[420px]">
              {/* Calendario del portal a la izquierda */}
              <div className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 -rotate-6 z-10">
                <MockupCalendarioPortal />
              </div>

              {/* Flecha animada en el centro */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center"
                aria-hidden
              >
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 sync-dot" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 sync-dot sync-dot-2" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 sync-dot sync-dot-3" />
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgb(74 222 128)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* iPhone con calendario nativo a la derecha */}
              <div className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 rotate-3 z-10">
                <MockupIPhoneCalendarioNativo />
              </div>
            </div>
          </div>

        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.titulo}
              className="rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-5 hover:bg-white/10 transition-colors"
            >
              <span
                className={`inline-flex w-10 h-10 rounded-xl items-center justify-center ${f.color}`}
              >
                {f.icono}
              </span>
              <h3 className="mt-4 text-sm font-black text-white">{f.titulo}</h3>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                {f.descripcion}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-300 mb-4">
            ¿Quieres ver el portal por dentro?
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/portal/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 transition-colors shadow-lg"
            >
              Entrar al portal
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white text-sm font-bold ring-1 ring-white/20 hover:bg-white/20 transition-colors"
            >
              Quiero acceso
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
