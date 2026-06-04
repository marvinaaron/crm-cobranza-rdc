/**
 * Pantalla de carga con marca para el portal del cliente.
 *
 * El logo RDC se usa como máscara y por debajo corre una banda de brillo
 * (shimmer / skeleton) de izquierda a derecha que recorre las letras R-D-C
 * una por una. Acompañado de una barra skeleton y la leyenda.
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
        {/* Logo RDC con shimmer recorriendo las letras */}
        <div
          className="rdc-shimmer"
          style={{ width: LOGO_W, height: LOGO_H }}
          role="img"
          aria-label="RDC"
        />

        {/* Barra skeleton bajo el logo */}
        <div
          className="rdc-skeleton-bar mt-5 h-2 rounded-full"
          style={{ width: LOGO_W }}
          aria-hidden
        />

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
