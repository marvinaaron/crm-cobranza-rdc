"use client";

import { useEffect, useMemo, useState } from "react";
import ImporteConZoom from "@/components/ImporteConZoom";
import IconoFacturacionNav from "@/components/publico/IconoFacturacionNav";
import { useCalculadoraUso } from "@/context/CalculadoraUsoContext";
import { fmtMxn } from "@/lib/fiscal/facturacion-neto";
import {
  OPERACIONES_META,
  type RegimenEmisor,
  type TipoEmisor,
  type TipoOperacion,
  type TipoReceptor,
} from "@/lib/fiscal/facturacion-tablas";
import { formatMontoDesdeNumero, parseMontoInput } from "@/lib/monto-input";

type ResultadoApi = {
  subtotal: number;
  iva: number;
  retIva: number;
  retIsr: number;
  totalCfdi: number;
  netoVerificado: number;
  diferencialRedondeo: number;
  lineas: Array<{ concepto: string; monto: number; aplica: boolean; texto?: string }>;
  fundamentos: Array<{ ley: string; articulo: string; nota?: string }>;
  advertencias: string[];
  textoCopiar: string;
};

type GrupoOperacion =
  | "honorarios"
  | "venta_bienes"
  | "comisionista"
  | "autotransporte"
  | "agapes"
  | "arrendamiento";

type TipoArrendamiento = "domestico" | "amueblado" | "comercial";

function operacionDesdeGrupo(
  grupo: GrupoOperacion,
  arrendamiento: TipoArrendamiento,
): TipoOperacion {
  if (grupo === "arrendamiento") {
    if (arrendamiento === "amueblado") return "arrendamiento_amueblado";
    if (arrendamiento === "comercial") return "arrendamiento_comercial";
    return "arrendamiento_domestico";
  }
  return grupo;
}

const GRUPOS_OPERACION: GrupoOperacion[] = [
  "honorarios",
  "venta_bienes",
  "comisionista",
  "arrendamiento",
  "autotransporte",
  "agapes",
];

const ETIQUETAS_GRUPO: Record<GrupoOperacion, string> = {
  honorarios: "Honorarios",
  venta_bienes: "Venta",
  comisionista: "Comisiones",
  arrendamiento: "Arrendamiento",
  autotransporte: "Autotransporte",
  agapes: "AGAPES",
};

const MUESTRA_NETO = [5_000, 10_000, 25_000, 50_000];

export default function PanelCalculadoraFacturacion() {
  const [emisor, setEmisor] = useState<TipoEmisor>("pf");
  const [regimen, setRegimen] = useState<RegimenEmisor>("resico");
  const [receptor, setReceptor] = useState<TipoReceptor>("pm");
  const [grupoOperacion, setGrupoOperacion] = useState<GrupoOperacion>("honorarios");
  const [tipoArrendamiento, setTipoArrendamiento] =
    useState<TipoArrendamiento>("domestico");
  const operacion = useMemo(
    () => operacionDesdeGrupo(grupoOperacion, tipoArrendamiento),
    [grupoOperacion, tipoArrendamiento],
  );

  const [netoTexto, setNetoTexto] = useState("");
  const [ivaFrontera, setIvaFrontera] = useState(false);
  const [agapesExento, setAgapesExento] = useState(false);

  const { cargarUso, abrirPaywall } = useCalculadoraUso();
  const [resultado, setResultado] = useState<ResultadoApi | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    setResultado(null);
    setError(null);
  }, [emisor, regimen, receptor, operacion, netoTexto, ivaFrontera, agapesExento]);

  useEffect(() => {
    if (grupoOperacion === "agapes" && emisor === "pf" && regimen === "pfae") {
      setRegimen("resico");
    }
  }, [grupoOperacion, emisor, regimen]);

  const netoNum = parseMontoInput(netoTexto);
  const formularioCompleto = Number.isFinite(netoNum) && netoNum > 0;

  const calcular = async () => {
    if (!formularioCompleto) return;
    setCargando(true);
    setError(null);
    setResultado(null);

    try {
      const res = await fetch("/api/herramientas/facturacion/calcular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emisor,
          regimen: emisor === "pf" ? regimen : undefined,
          receptor,
          operacion,
          netoDeseado: netoNum,
          ivaFrontera,
          agapesExento,
        }),
      });

      const data = await res.json();

      if (res.status === 402) {
        abrirPaywall();
        setError(data.error ?? "Límite de consultas alcanzado.");
        void cargarUso();
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "No se pudo calcular.");
        return;
      }

      setResultado(data.resultado as ResultadoApi);
      if (data.uso) void cargarUso();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const limpiar = () => {
    setNetoTexto("");
    setResultado(null);
    setError(null);
  };

  const copiar = async () => {
    if (!resultado?.textoCopiar) return;
    try {
      await navigator.clipboard.writeText(resultado.textoCopiar);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // silencioso
    }
  };

  const fmt = (n: number | undefined, aplica = true) =>
    aplica && n !== undefined ? fmtMxn(n) : "$ —";

  return (
    <div className="space-y-6">
      <div className="hz-cols">
        <div className="hz-col">
          <div className="hz-fila" data-2="">
            <div>
              <p className="hz-label">Quién factura</p>
              <div className="hz-chips">
                <Chip
                  on={emisor === "pf"}
                  onClick={() => setEmisor("pf")}
                >
                  Persona física
                </Chip>
                <Chip
                  on={emisor === "pm"}
                  onClick={() => setEmisor("pm")}
                >
                  Persona moral
                </Chip>
              </div>
            </div>
            <div>
              <p className="hz-label">Quién recibe</p>
              <div className="hz-chips">
                <Chip
                  on={receptor === "pm"}
                  onClick={() => setReceptor("pm")}
                >
                  Persona moral
                </Chip>
                <Chip
                  on={receptor === "pf"}
                  onClick={() => setReceptor("pf")}
                >
                  Persona física
                </Chip>
              </div>
            </div>
          </div>

          {emisor === "pf" ? (
            <div>
              <p className="hz-label">Régimen del emisor</p>
              <div className="hz-chips">
                <Chip
                  on={regimen === "resico"}
                  onClick={() => setRegimen("resico")}
                >
                  RESICO
                </Chip>
                <Chip
                  on={regimen === "pfae"}
                  disabled={grupoOperacion === "agapes"}
                  onClick={() => setRegimen("pfae")}
                >
                  PFAE
                </Chip>
              </div>
            </div>
          ) : null}

          <div>
            <p className="hz-label">Tipo de operación</p>
            <div className="hz-chips">
              {GRUPOS_OPERACION.map((g) => (
                <Chip
                  key={g}
                  on={grupoOperacion === g}
                  onClick={() => setGrupoOperacion(g)}
                >
                  {ETIQUETAS_GRUPO[g]}
                </Chip>
              ))}
            </div>
            {grupoOperacion === "arrendamiento" ? (
              <div className="hz-chips" style={{ marginTop: "0.45rem" }}>
                <Chip
                  on={tipoArrendamiento === "domestico"}
                  onClick={() => setTipoArrendamiento("domestico")}
                >
                  Casa doméstica
                </Chip>
                <Chip
                  on={tipoArrendamiento === "amueblado"}
                  onClick={() => setTipoArrendamiento("amueblado")}
                >
                  Casa amueblada
                </Chip>
                <Chip
                  on={tipoArrendamiento === "comercial"}
                  onClick={() => setTipoArrendamiento("comercial")}
                >
                  Local comercial
                </Chip>
              </div>
            ) : null}
            <p className="hz-ayuda">
              {OPERACIONES_META[operacion].label}. Tasas LISR y LIVA 2026.
            </p>
          </div>

          <div>
            <label className="hz-label" htmlFor="neto-facturacion">
              Neto que quieres recibir
            </label>
            <ImporteConZoom
              id="neto-facturacion"
              value={netoTexto}
              onChange={setNetoTexto}
              onEnter={calcular}
              ariaLabel="Neto deseado en pesos"
            />
            <div className="hz-chips" style={{ marginTop: "0.55rem" }}>
              {MUESTRA_NETO.map((m) => (
                <Chip
                  key={m}
                  on={netoNum === m}
                  onClick={() => setNetoTexto(formatMontoDesdeNumero(m))}
                >
                  {fmtMxn(m)}
                </Chip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="hz-check">
              <input
                type="checkbox"
                checked={ivaFrontera}
                onChange={(e) => setIvaFrontera(e.target.checked)}
              />
              IVA 8% zona frontera
            </label>
            {grupoOperacion === "agapes" ? (
              <label className="hz-check">
                <input
                  type="checkbox"
                  checked={agapesExento}
                  onChange={(e) => setAgapesExento(e.target.checked)}
                />
                AGAPES exento (Regla 3.13.26 RMF 2026)
              </label>
            ) : null}
          </div>

          <div className="hz-acciones">
            <button type="button" onClick={limpiar} className="hz-btn" data-ghost="">
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => void calcular()}
              disabled={!formularioCompleto || cargando}
              className="hz-btn"
              data-calcular=""
            >
              <IconoFacturacionNav size={18} />
              {cargando
                ? "Calculando…"
                : formularioCompleto
                  ? "Calcular factura"
                  : "Captura el neto"}
            </button>
          </div>
        </div>

        <div className="hz-col">
          <p className="hz-label">Total del CFDI</p>
          {resultado ? (
            <div className="hz-resultado space-y-3">
              <div className="hz-caja" data-cinta="">
                <div className="flex items-center gap-1.5">
                  <p className="hz-monto">{fmtMxn(resultado.totalCfdi)}</p>
                  <button
                    type="button"
                    onClick={() => void copiar()}
                    className="hz-copiar"
                    aria-label={copiado ? "Desglose copiado" : "Copiar desglose"}
                    title={copiado ? "Copiado" : "Copiar"}
                  >
                    {copiado ? <CheckCopiar /> : <IconoCopiar />}
                  </button>
                </div>
                <p className="hz-ayuda">
                  Para recibir {fmtMxn(resultado.netoVerificado)} en tu cuenta.
                </p>
              </div>
            </div>
          ) : (
            <div className="hz-vacio">
              <p>
                {error
                  ? error
                  : formularioCompleto
                    ? "Listo. Calcula tu factura."
                    : "Captura el neto y calcula el CFDI."}
              </p>
              <span>
                Subtotal = neto ÷ (1 + IVA − ret. IVA − ret. ISR)
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="hz-cfdi">
        <div className="hz-cfdi-top">
          <p>Desglose del CFDI</p>
        </div>
        <div className="hz-cfdi-filas">
          <FilaCfdi
            etiqueta="Subtotal"
            valor={fmt(resultado?.subtotal)}
            vacio={!resultado}
          />
          <FilaCfdi
            etiqueta="IVA"
            valor={
              resultado
                ? resultado.iva > 0
                  ? fmt(resultado.iva)
                  : "No aplica"
                : "$ —"
            }
            vacio={!resultado}
          />
          <FilaCfdi
            etiqueta="Ret. IVA"
            valor={
              resultado
                ? resultado.retIva > 0
                  ? fmt(resultado.retIva)
                  : "No aplica"
                : "$ —"
            }
            vacio={!resultado}
          />
          <FilaCfdi
            etiqueta="Ret. ISR"
            valor={
              resultado
                ? resultado.retIsr > 0
                  ? fmt(resultado.retIsr)
                  : "No aplica"
                : "$ —"
            }
            vacio={!resultado}
          />
          <FilaCfdi
            etiqueta="Total CFDI"
            valor={fmt(resultado?.totalCfdi)}
            vacio={!resultado}
          />
          <FilaCfdi
            etiqueta="Neto que recibes"
            valor={fmt(resultado?.netoVerificado)}
            vacio={!resultado}
            neto
          />
        </div>
        <p className="hz-cfdi-nota">
          {resultado ? (
            <>
              {resultado.fundamentos.map((f, i) => (
                <span key={`${f.ley}-${f.articulo}-${i}`}>
                  {i > 0 ? " " : null}
                  <strong>
                    {f.ley} {f.articulo}
                  </strong>
                  {f.nota ? ` — ${f.nota}` : "."}
                </span>
              ))}
              {Math.abs(resultado.diferencialRedondeo) > 0.01 ? (
                <>
                  {" "}
                  Diferencia por redondeo:{" "}
                  {resultado.diferencialRedondeo >= 0 ? "+" : ""}
                  {resultado.diferencialRedondeo.toFixed(2)} MXN.
                </>
              ) : null}
              {resultado.advertencias.map((a) => (
                <span key={a}> {a}</span>
              ))}
            </>
          ) : (
            <>
              El SAT retiene sobre el subtotal. Partimos del{" "}
              <strong>neto</strong> y armamos el CFDI al revés para que te
              quede esa cantidad en la cuenta.
            </>
          )}
        </p>
      </div>

      <p className="hz-ayuda">
        Cálculo de referencia conforme a LISR, LIVA y RMF 2026. El CFDI oficial
        lo emite el SAT con tu e.firma.
      </p>
    </div>
  );
}

function Chip({
  on,
  onClick,
  disabled,
  children,
}: {
  on?: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="hz-chip"
      data-on={on ? "" : undefined}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function FilaCfdi({
  etiqueta,
  valor,
  vacio,
  neto,
}: {
  etiqueta: string;
  valor: string;
  vacio?: boolean;
  neto?: boolean;
}) {
  return (
    <div
      className="hz-cfdi-fila"
      data-mute={vacio ? "" : undefined}
      data-neto={neto ? "" : undefined}
    >
      <span>{etiqueta}</span>
      <b>{valor}</b>
    </div>
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
