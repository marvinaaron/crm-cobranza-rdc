import Link from "next/link";

export const metadata = {
  title: "RDC Contadores",
};

const IconAdmin = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a3 3 0 0 0-3 3v1H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3V5a3 3 0 0 0-3-3z" />
    <path d="M9 14h6" />
    <path d="M9 17h4" />
  </svg>
);

const IconCliente = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

const Arrow = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-2">
            RDC Contadores
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            ¿Cómo deseas ingresar?
          </h1>
          <p className="mt-3 text-sm text-slate-500 max-w-md mx-auto">
            Selecciona el acceso que corresponda. Si eres cliente y es tu
            primera vez, revisa el correo de invitación que te enviamos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link
            href="/login"
            className="group bg-white rounded-3xl p-8 shadow-sm ring-1 ring-slate-200 hover:ring-slate-900 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                <IconAdmin />
              </div>
              <span className="text-slate-300 group-hover:text-slate-900 transition-colors">
                <Arrow />
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Personal del despacho
            </p>
            <h2 className="text-xl font-black text-slate-900 mb-1.5">
              Soy administrador
            </h2>
            <p className="text-[13px] text-slate-500 leading-relaxed">
              Accede al CRM: cumplimiento fiscal, cobranza, clientes y reportes.
            </p>
          </Link>

          <Link
            href="/portal/login"
            className="group bg-white rounded-3xl p-8 shadow-sm ring-1 ring-slate-200 hover:ring-indigo-500 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                <IconCliente />
              </div>
              <span className="text-slate-300 group-hover:text-indigo-600 transition-colors">
                <Arrow />
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">
              Portal del cliente
            </p>
            <h2 className="text-xl font-black text-slate-900 mb-1.5">
              Soy cliente
            </h2>
            <p className="text-[13px] text-slate-500 leading-relaxed">
              Consulta tus honorarios, cumplimiento fiscal y comprobantes.
            </p>
          </Link>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-10">
          © {new Date().getFullYear()} RDC Contadores · Todos los derechos
          reservados
        </p>
      </div>
    </div>
  );
}
