"use client";

import { useEffect, useState } from "react";
import IconoRfcNav from "@/components/publico/IconoRfcNav";
import { useCalculadoraUso } from "@/context/CalculadoraUsoContext";
import {
  calcularRfcPersonaFisica,
  type ResultadoRfc,
} from "@/lib/fiscal/rfc";


const MESES = [
  { v: 1, label: "Enero" },
  { v: 2, label: "Febrero" },
  { v: 3, label: "Marzo" },
  { v: 4, label: "Abril" },
  { v: 5, label: "Mayo" },
  { v: 6, label: "Junio" },
  { v: 7, label: "Julio" },
  { v: 8, label: "Agosto" },
  { v: 9, label: "Septiembre" },
  { v: 10, label: "Octubre" },
  { v: 11, label: "Noviembre" },
  { v: 12, label: "Diciembre" },
];

const ANIO_ACTUAL = new Date().getFullYear();
const ANIOS = Array.from({ length: ANIO_ACTUAL - 1899 }, (_, i) => ANIO_ACTUAL - i);

type Resultado = ReturnType<typeof calcularRfcPersonaFisica> | null;

export default function PanelRfc() {
  const [nombres, setNombres] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [segundoApellido, setSegundoApellido] = useState("");
  const [anio, setAnio] = useState<number | "">("");
  const [mes, setMes] = useState<number | "">("");
  const [dia, setDia] = useState<number | "">("");
  const [copiado, setCopiado] = useState(false);
  // Resultado AHORA es estado manual (no useMemo): solo se calcula al
  // dar click en "Consultar RFC". Da sensación de control al usuario.
  const [resultado, setResultado] = useState<Resultado>(null);
  const { consumirIntento, abrirPaywall } = useCalculadoraUso();

  // Si el usuario edita cualquier campo después de consultar, limpiamos
  // el resultado para evitar mostrar un RFC desactualizado.
  useEffect(() => {
    setResultado(null);
  }, [nombres, primerApellido, segundoApellido, anio, mes, dia]);

  const formularioCompleto =
    !!nombres.trim() &&
    !!primerApellido.trim() &&
    typeof anio === "number" &&
    typeof mes === "number" &&
    typeof dia === "number";

  const tieneRfc = resultado && !("error" in resultado);
  const erroresValidacion =
    resultado && "error" in resultado ? resultado.error : [];

  const consultar = async () => {
    if (!formularioCompleto) return;
    if (
      typeof anio !== "number" ||
      typeof mes !== "number" ||
      typeof dia !== "number"
    ) {
      return;
    }
    const { ok } = await consumirIntento();
    if (!ok) {
      abrirPaywall();
      return;
    }
    setResultado(
      calcularRfcPersonaFisica({
        nombres,
        primerApellido,
        segundoApellido,
        anio,
        mes,
        dia,
      })
    );
  };

  const copiar = async () => {
    if (!tieneRfc || !resultado || "error" in resultado) return;
    try {
      await navigator.clipboard.writeText(resultado.rfc);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin clipboard API: silencioso.
    }
  };

  const limpiar = () => {
    setNombres("");
    setPrimerApellido("");
    setSegundoApellido("");
    setAnio("");
    setMes("");
    setDia("");
    setResultado(null);
  };

  return (
    <div className="space-y-6">
      <div className="hz-cols">
        <div className="hz-col">
          <div>
            <label className="hz-label" htmlFor="rfc-nombres">
              Nombre(s)
            </label>
            <div className="hz-campo-ico">
              <IcoPersona />
              <input
                id="rfc-nombres"
                type="text"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void consultar();
                }}
                placeholder="Ej. Pedro o María Fernanda"
                className="hz-control"
                data-caps=""
                autoComplete="given-name"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="hz-fila" data-2="">
            <div>
              <label className="hz-label" htmlFor="rfc-paterno">
                Primer apellido
              </label>
              <div className="hz-campo-ico">
                <IcoPersona />
                <input
                  id="rfc-paterno"
                  type="text"
                  value={primerApellido}
                  onChange={(e) => setPrimerApellido(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void consultar();
                  }}
                  placeholder="Paterno"
                  className="hz-control"
                  data-caps=""
                  autoComplete="family-name"
                  spellCheck={false}
                />
              </div>
            </div>
            <div>
              <label className="hz-label" htmlFor="rfc-materno">
                Segundo apellido
              </label>
              <div className="hz-campo-ico">
                <IcoPersona />
                <input
                  id="rfc-materno"
                  type="text"
                  value={segundoApellido}
                  onChange={(e) => setSegundoApellido(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void consultar();
                  }}
                  placeholder="Materno (opcional)"
                  className="hz-control"
                  data-caps=""
                  autoComplete="additional-name"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>

          <div>
            <p className="hz-label">Fecha de nacimiento</p>
            <div className="hz-fila" data-3="">
              <div className="hz-campo-ico">
                <IcoCalendario />
                <select
                value={dia}
                onChange={(e) =>
                  setDia(e.target.value ? Number(e.target.value) : "")
                }
                className="hz-control"
                aria-label="Día"
              >
                <option value="">Día</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              </div>
              <div className="hz-campo-ico">
                <IcoCalendario />
              <select
                value={mes}
                onChange={(e) =>
                  setMes(e.target.value ? Number(e.target.value) : "")
                }
                className="hz-control"
                aria-label="Mes"
              >
                <option value="">Mes</option>
                {MESES.map((m) => (
                  <option key={m.v} value={m.v}>
                    {m.label}
                  </option>
                ))}
              </select>
              </div>
              <div className="hz-campo-ico">
                <IcoCalendario />
              <select
                value={anio}
                onChange={(e) =>
                  setAnio(e.target.value ? Number(e.target.value) : "")
                }
                className="hz-control"
                aria-label="Año"
              >
                <option value="">Año</option>
                {ANIOS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              </div>
            </div>
          </div>

          <div className="hz-acciones">
            <button type="button" onClick={limpiar} className="hz-btn" data-ghost="">
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => void consultar()}
              disabled={!formularioCompleto}
              className="hz-btn"
              data-calcular=""
            >
              <IconoRfcNav size={18} />
              {formularioCompleto ? "Consultar RFC" : "Completa los campos"}
            </button>
          </div>
        </div>

        <div className="hz-col">
          <p className="hz-label">Resultado</p>
          {tieneRfc && resultado && !("error" in resultado) ? (
            <div className="hz-caja" data-cinta="">
              <p className="hz-label">RFC con homoclave</p>
              <div className="flex items-center gap-1.5">
                <p className="hz-monto select-all break-all">{resultado.rfc}</p>
                <button
                  type="button"
                  onClick={() => void copiar()}
                  className="hz-copiar"
                  aria-label={copiado ? "RFC copiado" : "Copiar RFC"}
                  title={copiado ? "Copiado" : "Copiar"}
                >
                  {copiado ? <CheckCopiar /> : <IconoCopiar />}
                </button>
              </div>
            </div>
          ) : (
            <div className="hz-vacio">
              <p>
                {formularioCompleto
                  ? "Listo. Consulta tu RFC."
                  : "Captura los datos y consulta tu RFC."}
              </p>
              <p className="hz-ayuda">El resultado aparece aquí al instante.</p>
              {erroresValidacion.length > 0 ? (
                <ul className="hz-ayuda">
                  {erroresValidacion.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Desglose interactivo (full width debajo del form/resultado).
          Solo aparece cuando hay un RFC válido para no estorbar el
          empty state. */}
      {tieneRfc && resultado && !("error" in resultado) && (
        <RfcDesgloseInteractivo resultado={resultado} />
      )}

      {/* Nota técnica al pie del form. El banner de privacidad y el
          mensaje formal ya viven en la página contenedora; aquí
          mantenemos solo la advertencia funcional sobre el SAT. */}
      <p className="hz-ayuda">
        El RFC oficial lo asigna el SAT. En homonimias o registros previos la
        homoclave puede diferir. Constancia en{" "}
        <a
          href="https://www.sat.gob.mx/aplicacion/login/53027/genera-tu-constancia-de-situacion-fiscal"
          target="_blank"
          rel="noopener noreferrer"
        >
          sat.gob.mx
        </a>
        .
      </p>
    </div>
  );
}

function IcoPersona() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.2c.7-3.2 3.2-5 6.5-5s5.8 1.8 6.5 5" />
    </svg>
  );
}

function IcoCalendario() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="5.5" width="16" height="14" rx="2.2" />
      <path d="M8 3.8v3.2M16 3.8v3.2M4 10h16" />
    </svg>
  );
}

function IconoCopiar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckCopiar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

type IdSegmento = "letras" | "fecha" | "homoclave" | "verif";

const SEGMENTOS: Record<
  IdSegmento,
  { etiqueta: string; titulo: string; descripcion: string }
> = {
  letras: {
    etiqueta: "4 letras del nombre",
    titulo: "Letras de tus apellidos y nombre",
    descripcion:
      "1ª letra + 1ª vocal interna del primer apellido, 1ª letra del segundo apellido, 1ª letra del nombre.",
  },
  fecha: {
    etiqueta: "6 dígitos AAMMDD",
    titulo: "Tu fecha de nacimiento",
    descripcion:
      "Año (últimos 2 dígitos), mes y día con ceros a la izquierda. Total: 6 dígitos.",
  },
  homoclave: {
    etiqueta: "2 caracteres SAT",
    titulo: "Homoclave del SAT",
    descripcion:
      "Calculados con tabla del SAT a partir del nombre completo original (apellidos + nombres en orden).",
  },
  verif: {
    etiqueta: "1 dígito verificador",
    titulo: "Dígito verificador",
    descripcion:
      "Suma ponderada de los 12 primeros caracteres módulo 11. Sirve para validar que el RFC no tenga errores de captura.",
  },
};

const ETIQUETAS_SEGMENTO: Record<IdSegmento, string> = {
  letras: "Nombre",
  fecha: "Fecha",
  homoclave: "Homoclave",
  verif: "Verificador",
};

type Posicion = {
  char: string;
  segmento: IdSegmento;
  explicacion: string;
};

function construirPosiciones(resultado: ResultadoRfc): Posicion[] {
  const homo = resultado.homoclave.slice(0, 2);
  const aa = resultado.fecha.slice(0, 2);
  const mm = resultado.fecha.slice(2, 4);
  const dd = resultado.fecha.slice(4, 6);
  return [
    {
      char: resultado.letras[0] ?? "",
      segmento: "letras",
      explicacion: "1ª letra de tu primer apellido.",
    },
    {
      char: resultado.letras[1] ?? "",
      segmento: "letras",
      explicacion: "1ª vocal interna de tu primer apellido.",
    },
    {
      char: resultado.letras[2] ?? "",
      segmento: "letras",
      explicacion: "1ª letra de tu segundo apellido.",
    },
    {
      char: resultado.letras[3] ?? "",
      segmento: "letras",
      explicacion: "1ª letra de tu nombre.",
    },
    {
      char: aa,
      segmento: "fecha",
      explicacion: `${aa} es el año de nacimiento (últimos 2 dígitos).`,
    },
    {
      char: mm,
      segmento: "fecha",
      explicacion: `${mm} es el mes de nacimiento.`,
    },
    {
      char: dd,
      segmento: "fecha",
      explicacion: `${dd} es el día de nacimiento.`,
    },
    {
      char: homo,
      segmento: "homoclave",
      explicacion: `${homo} es la homoclave del SAT, calculada con tu nombre completo.`,
    },
    {
      char: resultado.digitoVerificador,
      segmento: "verif",
      explicacion: "Dígito verificador: valida que el RFC no tenga errores.",
    },
  ];
}

function RfcDesgloseInteractivo({ resultado }: { resultado: ResultadoRfc }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const posiciones = construirPosiciones(resultado);
  const activo = hoverIdx !== null ? posiciones[hoverIdx] : null;
  const seg = activo ? SEGMENTOS[activo.segmento] : null;

  const grupos: Array<{
    segmento: IdSegmento;
    items: Array<{ pos: Posicion; idx: number }>;
  }> = [];
  posiciones.forEach((pos, idx) => {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.segmento === pos.segmento) {
      ultimo.items.push({ pos, idx });
    } else {
      grupos.push({ segmento: pos.segmento, items: [{ pos, idx }] });
    }
  });

  return (
    <div className="hz-rfc">
      <div className="hz-rfc-top">
        <p>Cómo se compone tu RFC</p>
      </div>

      <div className="hz-rfc-grupos">
        {grupos.map((grupo) => (
          <div
            key={grupo.segmento}
            className="hz-rfc-grupo"
            data-on={activo?.segmento === grupo.segmento ? "" : undefined}
          >
            <b>{ETIQUETAS_SEGMENTO[grupo.segmento]}</b>
            <div className="hz-rfc-tiles">
              {grupo.items.map(({ pos, idx }) => (
                <button
                  key={idx}
                  type="button"
                  className="hz-rfc-tile"
                  data-wide={pos.char.length > 1 ? "" : undefined}
                  data-on={hoverIdx === idx ? "" : undefined}
                  aria-label={pos.explicacion}
                  onMouseEnter={() => setHoverIdx(idx)}
                  onMouseLeave={() => setHoverIdx(null)}
                  onFocus={() => setHoverIdx(idx)}
                  onBlur={() => setHoverIdx(null)}
                  onClick={(e) => {
                    if (
                      e.nativeEvent instanceof PointerEvent &&
                      e.nativeEvent.pointerType === "mouse"
                    ) {
                      return;
                    }
                    setHoverIdx((prev) => (prev === idx ? null : idx));
                  }}
                >
                  {pos.char}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="hz-rfc-nota">
        <h3>{seg ? seg.titulo : "\u00a0"}</h3>
        <p>
          {activo
            ? activo.explicacion
            : "Toca una letra para ver qué significa."}
        </p>
      </div>
    </div>
  );
}
