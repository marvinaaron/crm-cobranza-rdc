/**
 * Pantalla de carga con marca para el portal del cliente.
 *
 * El logo RDC se "llena" de navy de izquierda a derecha: capa gris tenue
 * de base + capa navy revelada con un wrapper de overflow (más fiable
 * que clip-path sobre <img> en Safari/iOS).
 */

type Props = {
  mensaje: string;
  detalle?: string;
};

/** Ancho fijo del logo en px — debe coincidir con w-44 (176px). */
const LOGO_W = 176;

export default function PortalCargando({ mensaje, detalle }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="flex flex-col items-center text-center">
        {/* Logo con efecto de relleno */}
        <div
          className="relative select-none"
          style={{ width: LOGO_W, aspectRatio: "999 / 396" }}
          aria-hidden
        >
          {/* Silueta tenue */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/rdc-gray.png"
            alt=""
            width={LOGO_W}
            height={Math.round(LOGO_W * (396 / 999))}
            className="absolute inset-0 h-full w-full object-contain object-left opacity-40"
          />
          {/* Capa navy que se revela de izquierda a derecha */}
          <div className="absolute inset-y-0 left-0 overflow-hidden rdc-fill-reveal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/rdc-black.png"
              alt=""
              width={LOGO_W}
              height={Math.round(LOGO_W * (396 / 999))}
              className="h-full object-contain object-left"
              style={{ width: LOGO_W }}
            />
          </div>
        </div>

        {/* Barra fina sincronizada */}
        <div
          className="mt-5 h-1 overflow-hidden rounded-full bg-slate-200"
          style={{ width: LOGO_W }}
        >
          <div className="h-full w-full origin-left rounded-full bg-gradient-to-r from-blue-900 to-indigo-700 rdc-fill-bar" />
        </div>

        <p className="mt-5 text-sm font-bold text-slate-600" role="status">
          {mensaje}
        </p>
        {detalle && (
          <p className="mt-2 max-w-md text-xs text-slate-500 leading-relaxed">
            {detalle}
          </p>
        )}
      </div>
    </div>
  );
}
