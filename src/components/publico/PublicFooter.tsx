import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white text-slate-900 flex items-center justify-center font-black tracking-tight">
                RDC
              </div>
              <div>
                <p className="text-base font-black text-white">RDC Contadores</p>
                <p className="text-[11px] text-slate-400">Despacho contable y fiscal</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Más de una década acompañando a personas físicas y morales en el cumplimiento
              de sus obligaciones fiscales con cercanía, claridad y compromiso.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">
              Despacho
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#servicios" className="hover:text-white transition-colors">
                  Servicios
                </a>
              </li>
              <li>
                <a href="#proceso" className="hover:text-white transition-colors">
                  Cómo trabajamos
                </a>
              </li>
              <li>
                <a href="#herramientas" className="hover:text-white transition-colors">
                  Herramientas fiscales
                </a>
              </li>
              <li>
                <a href="#nosotros" className="hover:text-white transition-colors">
                  Nosotros
                </a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-white transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">
              Accesos
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/portal/login" className="hover:text-white transition-colors">
                  Portal de clientes
                </Link>
              </li>
              <li>
                <Link href="/portal/recuperar" className="hover:text-white transition-colors">
                  Recuperar contraseña
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} RDC Contadores · Todos los derechos reservados
          </p>
          <p className="text-xs text-slate-500">Hecho con cuidado para nuestros clientes.</p>
        </div>
      </div>
    </footer>
  );
}
