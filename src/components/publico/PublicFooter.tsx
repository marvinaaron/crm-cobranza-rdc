import Link from "next/link";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";
import Logo from "./Logo";
import { SelloEmpresaMexicana } from "./MarcaMexicana";
import { IconoMarcaRed, REDES_MARCA } from "./redes-marca";

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group w-fit" aria-label="RDC Contadores · Inicio">
              <Logo mark="rdc" variante="white" alto={36} className="group-hover:scale-105 transition-transform" />
              <div>
                <p className="text-base font-black text-white">Contadores</p>
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
              <div className="flex items-center gap-5">
                {REDES_MARCA.map((r) => (
                  <a
                    key={r.nombre}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={r.nombre}
                    className={`text-slate-400 transition-all hover:scale-110 ${r.hoverColor}`}
                  >
                    <IconoMarcaRed red={r.red} />
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
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="hover:text-white transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/preguntas-frecuentes" className="hover:text-white transition-colors">
                  Preguntas frecuentes
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

        <div className="mt-8 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <SelloEmpresaMexicana />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} RDC Contadores</p>
            <span className="hidden sm:inline text-slate-700" aria-hidden>
              ·
            </span>
            <Link href="/aviso-de-privacidad" className="hover:text-white transition-colors">
              Aviso de privacidad
            </Link>
            <span className="hidden sm:inline text-slate-700" aria-hidden>
              ·
            </span>
            <p>Hecho con cuidado para nuestros clientes.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
