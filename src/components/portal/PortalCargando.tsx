/**
 * Pantalla de carga con marca para el portal del cliente.
 *
 * Barra de progreso cuyo "riel" es la silueta del logo RDC: el contorno se
 * usa como máscara y un relleno navy crece de izquierda a derecha llenando
 * las letras R-D-C, como una barra de progreso normal. Debajo, una barra
 * fina con el mismo progreso, más la leyenda.
 */

type Props = {
  mensaje: string;
  detalle?: string;
};

/** Ancho del logo en px. */
const LOGO_W = 180;
/** Aspect ratio real del PNG (999 × 396). */
const LOGO_H = Math.round(LOGO_W * (396 / 999));

export default function PortalCargando({ mensaje, detalle }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="flex flex-col items-center text-center">
        {/* Riel RDC que se llena de navy de izquierda a derecha */}
        <div
          className="rdc-track"
          style={{ width: LOGO_W, height: LOGO_H }}
          role="img"
          aria-label="RDC"
        >
          <div className="rdc-fill" />
        </div>

        {/* Barra fina con el mismo progreso */}
        <div
          className="rdc-bar-track mt-5 h-2 rounded-full"
          style={{ width: LOGO_W }}
          aria-hidden
        >
          <div className="rdc-bar-fill rounded-full" />
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
