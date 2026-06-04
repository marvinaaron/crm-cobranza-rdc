/**
 * Pantalla de carga con marca para el portal del cliente.
 *
 * Barra de progreso cuyo "riel" es la silueta del logo RDC: el contorno se
 * usa como máscara y un relleno navy crece de izquierda a derecha llenando
 * las letras R-D-C, como una barra de progreso normal. Debajo, una barra
 * fina con el mismo progreso, más la leyenda.
 */

import Fiscalino, { type FiscalinoMood } from "@/components/Fiscalino";

type Props = {
  mensaje: string;
  detalle?: string;
  /** Si se indica, muestra a Fiscalino en vez de la barra de carga (para estados que requieren atención, no carga). */
  mood?: FiscalinoMood;
};

/** Ancho del logo en px. */
const LOGO_W = 180;
/** Aspect ratio real del PNG (999 × 396). */
const LOGO_H = Math.round(LOGO_W * (396 / 999));

export default function PortalCargando({ mensaje, detalle, mood }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="flex flex-col items-center text-center">
        {mood ? (
          <Fiscalino mood={mood} size={128} />
        ) : (
          /* Riel RDC que se llena de navy de izquierda a derecha */
          <div
            className="rdc-track"
            style={{ width: LOGO_W, height: LOGO_H }}
            role="img"
            aria-label="RDC"
          >
            <div className="rdc-fill" />
          </div>
        )}

        <p className="mt-6 text-sm font-bold text-slate-600" role="status">
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
