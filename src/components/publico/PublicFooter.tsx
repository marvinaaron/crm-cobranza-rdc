import Link from "next/link";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";

const REDES_FOOTER = [
  {
    nombre: "WhatsApp",
    url: CONTACTO_PUBLICO.whatsapp.url,
    hoverBg: "hover:bg-emerald-600",
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    nombre: "Instagram",
    url: CONTACTO_PUBLICO.instagram.url,
    hoverBg: "hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600",
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    nombre: "Facebook",
    url: CONTACTO_PUBLICO.facebook.url,
    hoverBg: "hover:bg-blue-600",
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
];

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group w-fit">
              <div className="w-10 h-10 rounded-xl bg-white text-slate-900 flex items-center justify-center font-black tracking-tight group-hover:scale-105 transition-transform">
                RDC
              </div>
              <div>
                <p className="text-base font-black text-white">RDC Contadores</p>
                <p className="text-[11px] text-slate-400">Despacho contable y fiscal</p>
              </div>
            </Link>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Más de una década acompañando a personas físicas y morales en el cumplimiento
              de sus obligaciones fiscales con cercanía, claridad y compromiso.
            </p>

            <div className="mt-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                Síguenos
              </p>
              <div className="flex items-center gap-3">
                {REDES_FOOTER.map((r) => (
                  <a
                    key={r.nombre}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={r.nombre}
                    className={`w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center transition-all hover:scale-110 ${r.hoverBg}`}
                  >
                    {r.icono}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">
              Despacho
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/servicios" className="hover:text-white transition-colors">
                  Servicios
                </Link>
              </li>
              <li>
                <Link href="/proceso" className="hover:text-white transition-colors">
                  Cómo trabajamos
                </Link>
              </li>
              <li>
                <Link href="/herramientas" className="hover:text-white transition-colors">
                  Herramientas fiscales
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="hover:text-white transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-white transition-colors">
                  Contacto
                </Link>
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
              <li>
                <a
                  href={CONTACTO_PUBLICO.calendly.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Agendar asesoría
                </a>
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
