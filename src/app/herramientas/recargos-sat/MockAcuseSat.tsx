import Fiscalino from "@/components/Fiscalino";

/**
 * Facsímil de la sección línea de captura del SAT. Ejemplo; no es un acuse oficial.
 */
export default function MockAcuseSat() {
  return (
    <section className="hz-acuse">
      <div className="hz-acuse-top">
        <p>Cómo leer tu acuse</p>
      </div>
      <h3>Importe y fecha, en el recuadro negro</h3>
      <p className="hz-acuse-lead">
        En el PDF del SAT baja hasta este recuadro. De todo el acuse, la
        calculadora usa solo lo marcado.
      </p>

      <div className="hz-acuse-escena">
        <div className="hz-acuse-hoja">
          <div className="hz-acuse-legal">
            <p>
              Es recomendable verificar que el importe calculado de la parte
              actualizada esté correcto, en virtud de que puede haber cambiado el
              índice nacional de precios al consumidor y el cálculo debe estar
              basado en el último publicado.
            </p>
            <p>
              Los datos personales son incorporados y protegidos en los sistemas
              del SAT, de conformidad con las disposiciones legales en la
              materia.
            </p>
            <p>Para modificar o corregir datos personales visita sat.gob.mx.</p>
            <p>
              Este acuse es emitido sin prejuzgar la veracidad de los datos
              asentados ni el cumplimiento dentro de los plazos establecidos.
              Quedan a salvo las facultades de revisión de la autoridad fiscal.
            </p>
          </div>

          <article
            className="hz-acuse-papel"
            aria-label="Ejemplo de línea de captura, con datos de muestra"
          >
            <h4>Sección línea de captura</h4>
            <p>
              El importe a cargo determinado en esta declaración, deberá ser
              pagado en las instituciones de crédito autorizadas, utilizando para
              tal efecto la línea de captura que se indica.
            </p>

            <div className="hz-acuse-fila">
              <span className="hz-acuse-lab">
                Línea de
                <br />
                Captura:
              </span>
              <strong className="hz-acuse-linea">0426 3778 9700 4966 9205</strong>
              <span className="hz-acuse-lab">
                Importe total
                <br />
                a pagar:
              </span>
              <mark className="hz-acuse-hit">
                <span className="hz-acuse-n">1</span>
                $4,567
              </mark>
            </div>

            <div className="hz-acuse-fila">
              <span className="hz-acuse-lab">Vigente hasta:</span>
              <mark className="hz-acuse-hit">
                <span className="hz-acuse-n">2</span>
                23/09/2026
              </mark>
            </div>
          </article>

          <div className="hz-acuse-codes" aria-hidden>
            <div className="hz-acuse-barwrap">
              <CodigoBarras />
              <p>04263778970049669205 4567</p>
            </div>
            <QrFalso />
          </div>
        </div>

        <div className="hz-acuse-owl" aria-hidden>
          <Fiscalino mood="happy" size={118} />
        </div>
      </div>

      <p className="hz-acuse-nota">
        El “Vencimiento obligación” del encabezado es cuándo debió pagarse. Este
        recuadro no es un acuse del SAT.
      </p>
    </section>
  );
}

function CodigoBarras() {
  const anchos = [
    1, 2, 1, 3, 1, 1, 2, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 1, 2, 3, 1, 2, 1,
    1, 2, 1, 3, 1, 2, 1, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1,
  ];
  return (
    <div className="hz-acuse-barras">
      {anchos.map((w, i) => (
        <span
          key={i}
          style={{ width: w, marginRight: i % 3 === 0 ? 1 : 0 }}
        />
      ))}
    </div>
  );
}

function QrFalso() {
  const n = 21;
  const cells: boolean[] = [];
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      const finder =
        (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
      const finderInner =
        (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
        (x >= n - 5 && x <= n - 3 && y >= 2 && y <= 4) ||
        (x >= 2 && x <= 4 && y >= n - 5 && y <= n - 3);
      cells.push(
        finder ? !finderInner || (x + y) % 2 === 0 : (x * 5 + y * 11) % 7 > 2,
      );
    }
  }
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="hz-acuse-qr">
      {cells.map((on, i) =>
        on ? (
          <rect
            key={i}
            x={i % n}
            y={Math.floor(i / n)}
            width="1"
            height="1"
            fill="currentColor"
          />
        ) : null,
      )}
    </svg>
  );
}
