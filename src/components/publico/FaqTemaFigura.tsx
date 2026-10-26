"use client";

const MESES = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"] as const;

const PAQUETES = [
  { monto: "$812", lineas: ["RESICO", "PF"], tono: null },
  { monto: "$1,508", lineas: ["Act. emp.", "y facturación"], tono: "cyan" },
  { monto: "$2,900", lineas: ["Nómina", "e IMSS"], tono: "violeta" },
  { monto: "$3,480", lineas: ["ICSOE", "y SISUB"], tono: "verde" },
] as const;

const ANTES = [70, 92, 48, 84, 62];

export default function FaqTemaFigura({
  tema,
  instant,
}: {
  tema: "precio" | "cambio" | "sat" | "portal";
  instant: boolean;
}) {
  const mes = new Date().getMonth();

  return (
    <div
      className={`faq-figura ${tema === "precio" ? "is-escala" : ""}`}
      aria-hidden
    >
      <div
        key={tema}
        className={`faq-figura-in ${instant ? "is-instant" : ""}`}
      >
        {tema === "precio" ? (
          <FiguraPrecio />
        ) : tema === "cambio" ? (
          <FiguraCambio />
        ) : tema === "sat" ? (
          <FiguraSat mes={mes} />
        ) : (
          <FiguraPortal />
        )}
      </div>
    </div>
  );
}

function FiguraPrecio() {
  return (
    <div className="faq-fig faq-fig-precio">
      <p className="faq-fig-kicker">Ejemplos · IVA al mes · cada uno suma lo anterior</p>
      <div className="faq-packs">
        {PAQUETES.map((p) => (
          <div
            key={p.monto}
            className={p.tono ? `faq-pack is-${p.tono}` : "faq-pack"}
          >
            <p className="faq-pack-monto">{p.monto}</p>
            <p className="faq-pack-label">
              <span className="faq-pack-l1">
                {p.tono ? (
                  <svg className="faq-pack-plus" viewBox="0 0 12 12" aria-hidden>
                    <path
                      d="M1.5 6h9M6 1.5v9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : null}
                {p.lineas[0]}
              </span>
              <span className="faq-pack-l2">{p.lineas[1]}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FiguraCambio() {
  return (
    <div className="faq-fig faq-fig-cambio">
      <p className="faq-fig-kicker">Lo que haces tú</p>
      <div className="faq-cambio-row">
        <div className="faq-bars">
          <div className="faq-bars-row">
            {ANTES.map((h, i) => (
              <span key={`a${i}`} style={{ height: `${h}%` }} />
            ))}
          </div>
          <p>Tú cargas</p>
        </div>
        <svg
          className="faq-flecha"
          viewBox="0 0 32 16"
          fill="none"
          aria-hidden
        >
          <path
            d="M2 8h24M20 3l6 5-6 5"
            stroke="#7c3aed"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="faq-bars is-after">
          <div className="faq-bars-row">
            <span style={{ height: "40%" }} />
          </div>
          <p>Tú firmas</p>
        </div>
      </div>
    </div>
  );
}

function FiguraSat({ mes }: { mes: number }) {
  return (
    <div className="faq-fig faq-fig-sat">
      <p className="faq-fig-kicker">Doce declaraciones al año</p>
      <div className="faq-cal">
        {MESES.map((letra, i) => (
          <span
            key={`${letra}-${i}`}
            className={i === mes ? "is-now" : i < mes ? "is-past" : ""}
          >
            {letra}
            {(i < mes || i === mes) && (
              <svg viewBox="0 0 12 12" aria-hidden>
                <path
                  d="M2.5 6.2 5 8.6 9.5 3.6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function FiguraPortal() {
  return (
    <div className="faq-fig faq-fig-portal">
      {[
        ["Acuse del mes", "Listo"],
        ["Honorarios", "Listo"],
        ["SIPARE", "Listo"],
      ].map(([nombre, estado]) => (
        <div key={nombre} className="faq-row">
          <span className="faq-row-dot" />
          <span className="faq-row-name">{nombre}</span>
          <span className="faq-row-ok">{estado}</span>
        </div>
      ))}
    </div>
  );
}
