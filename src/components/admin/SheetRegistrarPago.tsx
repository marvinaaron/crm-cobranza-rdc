"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import {
  esIngresoGeneralCliente,
  listarMesesImpagos,
  periodoLabel,
  type Cliente,
  type MesCobrable,
  type Periodo,
} from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { useScrollLock } from "@/hooks/useScrollLock";
import { parseMontoInput } from "@/lib/monto-input";
import MontoInput from "@/components/MontoInput";
import AvatarCliente from "@/components/admin/AvatarCliente";

type Destino = { tipo: "honorarios"; periodo: Periodo } | { tipo: "extra" };

type Props = {
  onClose: () => void;
  onAplicado: (mensaje: string) => void;
};

function mxn(n: number): string {
  return `$${n.toLocaleString("es-MX")}`;
}

function quitarAcentos(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export const EVENTO_ABRIR_REGISTRAR_PAGO = "rdc-abrir-registrar-pago";

export function abrirSheetRegistrarPago() {
  window.dispatchEvent(new Event(EVENTO_ABRIR_REGISTRAR_PAGO));
}

const CheckIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const MAX_DIGITOS_IMPORTE = 6;

function caparImporte(v: string): string {
  const digits = v.replace(/\D/g, "").slice(0, MAX_DIGITOS_IMPORTE);
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function ImporteGrande({
  value,
  onChange,
  inputRef,
  onFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  onFocus?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const [pop, setPop] = useState(0);
  const prevDigits = useRef(value.replace(/\D/g, "").length);

  const visible = value || "0";
  const vacio = !value;

  return (
    <div className="relative min-h-[4.25rem] flex items-center justify-center">
      <MontoInput
        ref={inputRef}
        value={value}
        onChange={(v) => {
          const capped = caparImporte(v);
          const ahora = capped.replace(/\D/g, "").length;
          if (ahora > prevDigits.current) setPop((n) => n + 1);
          prevDigits.current = ahora;
          onChange(capped);
        }}
        aria-label="Importe del pago"
        enterKeyHint="done"
        onFocus={() => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={() => setFocused(false)}
        className="absolute inset-0 z-10 w-full h-full opacity-0"
        style={{ fontSize: 16 }}
      />
      <div
        aria-hidden
        className={`flex items-center justify-center font-extrabold tabular-nums tracking-tight leading-none pointer-events-none ${
          vacio
            ? "text-slate-300 dark:text-white/35"
            : "text-slate-900 dark:text-white"
        }`}
        style={{ fontSize: 48 }}
      >
        <span>$</span>
        {visible.split("").map((ch, i) => {
          const esNuevo = !vacio && i === visible.length - 1 && pop > 0;
          return (
            <span
              key={`${i}-${ch}-${esNuevo ? pop : "s"}`}
              className={esNuevo ? "rdc-digit-pop" : "inline-block"}
            >
              {ch}
            </span>
          );
        })}
        {focused ? <span className="rdc-importe-caret" /> : null}
      </div>
    </div>
  );
}

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export default function SheetRegistrarPago({ onClose, onAplicado }: Props) {
  useScrollLock(true);
  const {
    listaClientes,
    periodoHoy,
    registrarPago,
    registrarServicioAdicional,
  } = useClientes();

  const [montoInput, setMontoInput] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [destino, setDestino] = useState<Destino | null>(null);
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [altoVisible, setAltoVisible] = useState<number | null>(null);
  const [tecladoPx, setTecladoPx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const montoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => {
      const cubierto = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setTecladoPx(cubierto);
      setAltoVisible(cubierto > 48 ? Math.round(vv.height) : null);
    };
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, []);

  const clientes = useMemo(
    () =>
      listaClientes
        .filter((c) => c.activo && !esIngresoGeneralCliente(c))
        .slice()
        .sort((a, b) => a.razonSocial.localeCompare(b.razonSocial, "es")),
    [listaClientes]
  );

  const cliente = useMemo(
    () => clientes.find((c) => c.id === clienteId) ?? null,
    [clientes, clienteId]
  );

  const mesesPendientes = useMemo<MesCobrable[]>(() => {
    if (!cliente) return [];
    return listarMesesImpagos(cliente, periodoHoy).slice().reverse();
  }, [cliente, periodoHoy]);

  useEffect(() => {
    if (!cliente) {
      setDestino(null);
      return;
    }
    const primero = listarMesesImpagos(cliente, periodoHoy).at(-1);
    setDestino(
      primero
        ? { tipo: "honorarios", periodo: primero.periodo }
        : { tipo: "extra" }
    );
  }, [cliente, periodoHoy]);

  const filtrados = useMemo(() => {
    const q = quitarAcentos(busqueda.trim());
    if (!q) return clientes;
    return clientes.filter((c) => {
      const nombre = quitarAcentos(c.razonSocial);
      const rfc = quitarAcentos(c.rfc ?? "");
      return nombre.includes(q) || rfc.includes(q);
    });
  }, [busqueda, clientes]);

  const monto = parseMontoInput(montoInput);
  const puedeGuardar =
    monto > 0 && cliente != null && destino != null && !guardando;

  const etiquetaCta = destino?.tipo === "extra"
    ? `Registrar ingreso extra`
    : destino?.tipo === "honorarios"
      ? `Aplicar a ${periodoLabel(destino.periodo)}`
      : "Registrar pago";

  function elegirCliente(c: Cliente) {
    setClienteId(c.id);
    setBusqueda("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!puedeGuardar || !cliente || !destino) return;
    setGuardando(true);
    const notaTrim = nota.trim() || undefined;
    const actualizado =
      destino.tipo === "extra"
        ? registrarServicioAdicional(
            cliente.id,
            periodoHoy,
            monto,
            "Ingreso extra",
            notaTrim
          )
        : registrarPago(cliente.id, destino.periodo, monto, notaTrim, {
            metodoPago: "transferencia",
          });
    if (!actualizado) {
      setGuardando(false);
      return;
    }
    const donde =
      destino.tipo === "extra"
        ? "ingreso extra"
        : periodoLabel(destino.periodo);
    onAplicado(`${mxn(monto)} en ${cliente.razonSocial} · ${donde}`);
  }

  const modal = (
    <div
      className="rdc-admin fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-pago-titulo"
      style={tecladoPx > 48 ? { paddingBottom: tecladoPx } : undefined}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
      />

      <form
        onSubmit={handleSubmit}
        className="rdc-glass-sheet rdc-sheet-anim rdc-sheet-up relative w-full sm:max-w-lg max-h-[min(92dvh,760px)] flex flex-col overflow-hidden bg-white dark:bg-[#333336] sm:rounded-2xl"
        style={altoVisible ? { maxHeight: `${altoVisible}px` } : undefined}
      >
        <div className="rdc-sheet-handle mt-2.5 mb-0 sm:hidden shrink-0" aria-hidden />

        <div className="shrink-0 px-5 pt-4 pb-2 sm:px-6 sm:pt-6 flex items-start justify-between gap-3">
          <div className="min-w-0 pt-1">
            <h2
              id="sheet-pago-titulo"
              className="text-[22px] font-bold leading-tight text-slate-900 dark:text-white"
            >
              Registrar pago
            </h2>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Registra pagos fácil y rápido desde este atajo
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 h-9 w-9 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        </div>

        <div
          ref={scrollRef}
          data-rdc-scroll-allow
          className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 space-y-5 bg-[#f2f2f7] dark:bg-[#1c1c1e] [overflow-anchor:none]"
        >
          <section className="bg-white dark:bg-[#333336] rounded-2xl px-4 pt-4 pb-3 text-center">
            <p className="text-[13px] font-semibold text-slate-500 mb-1">
              Importe
            </p>
            <ImporteGrande
              value={montoInput}
              onChange={setMontoInput}
              inputRef={montoRef}
              onFocus={() => {
                requestAnimationFrame(() => scrollRef.current?.scrollTo(0, 0));
              }}
            />
          </section>

          <section>
            <p className="px-4 mb-2 text-[13px] font-semibold text-slate-500">
              Cliente
            </p>
            {cliente ? (
              <button
                type="button"
                onClick={() => {
                  setClienteId(null);
                  setDestino(null);
                }}
                className="relative flex w-full items-center gap-2.5 px-4 min-h-[48px] py-2 rounded-2xl bg-white dark:bg-[#333336] active:bg-slate-50"
              >
                <AvatarCliente cliente={cliente} size="xs" />
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-[16px] font-semibold text-slate-900 dark:text-white leading-tight truncate">
                    {cliente.razonSocial}
                  </span>
                  {cliente.rfc ? (
                    <span className="block text-[13px] text-slate-500 mt-0.5 truncate">
                      {cliente.rfc}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-[13px] font-semibold text-emerald-600">
                  Cambiar
                </span>
              </button>
            ) : (
              <div className="rounded-2xl bg-white dark:bg-[#333336] overflow-hidden">
                <label className="flex items-center gap-2 px-4 min-h-[48px] border-b border-slate-100">
                  <span className="text-slate-400">
                    <SearchIcon />
                  </span>
                  <input
                    type="search"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar cliente o RFC"
                    autoComplete="off"
                    className="w-full bg-transparent py-3 text-[16px] text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
                  />
                </label>
                <ul
                  data-rdc-scroll-allow
                  className="divide-y divide-slate-100 max-h-[min(36vh,280px)] overflow-y-auto"
                >
                  {filtrados.length === 0 ? (
                    <li className="px-4 py-5 text-[14px] text-slate-500">
                      Ningún cliente coincide
                    </li>
                  ) : (
                    filtrados.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => elegirCliente(c)}
                          className="relative flex w-full items-center gap-2.5 px-4 min-h-[44px] py-1.5 active:bg-slate-50 text-left"
                        >
                          <AvatarCliente cliente={c} size="xs" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[15px] font-semibold text-slate-900 dark:text-white leading-tight truncate">
                              {c.razonSocial}
                            </span>
                            {c.rfc ? (
                              <span className="block text-[12px] text-slate-500 mt-0.5 truncate">
                                {c.rfc}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </section>

          {cliente ? (
            <section>
              <p className="px-4 mb-2 text-[13px] font-semibold text-slate-500">
                Aplicar a
              </p>
              {mesesPendientes.length === 0 ? (
                <p className="px-4 mb-2 text-[13px] text-slate-500">
                  Este cliente no tiene meses pendientes. Puedes registrarlo
                  como ingreso extra.
                </p>
              ) : null}
              <ul className="rounded-2xl bg-white dark:bg-[#333336] overflow-hidden divide-y divide-slate-100">
                {mesesPendientes.map((m) => {
                  const activo =
                    destino?.tipo === "honorarios" &&
                    destino.periodo.mes === m.periodo.mes &&
                    destino.periodo.anio === m.periodo.anio;
                  return (
                    <li key={`${m.periodo.anio}-${m.periodo.mes}`}>
                      <button
                        type="button"
                        onClick={() =>
                          setDestino({
                            tipo: "honorarios",
                            periodo: m.periodo,
                          })
                        }
                        className="relative flex w-full items-center gap-3 px-4 min-h-[56px] py-2.5 active:bg-slate-50 text-left"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-[16px] font-semibold text-slate-900 dark:text-white leading-tight">
                            {m.label}
                          </span>
                          <span className="block text-[13px] text-slate-500 mt-0.5">
                            Saldo {mxn(m.saldo)}
                            {m.parcial ? " · abono parcial" : ""}
                          </span>
                        </span>
                        {activo ? (
                          <span className="shrink-0 text-emerald-600">
                            <CheckIcon />
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
                <li>
                  <button
                    type="button"
                    onClick={() => setDestino({ tipo: "extra" })}
                    className="relative flex w-full items-center gap-3 px-4 min-h-[56px] py-2.5 active:bg-slate-50 text-left"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-semibold text-slate-900 dark:text-white leading-tight">
                        Ingreso extra
                      </span>
                      <span className="block text-[13px] text-slate-500 mt-0.5">
                        No descuenta honorarios pendientes
                      </span>
                    </span>
                    {destino?.tipo === "extra" ? (
                      <span className="shrink-0 text-emerald-600">
                        <CheckIcon />
                      </span>
                    ) : null}
                  </button>
                </li>
              </ul>
            </section>
          ) : null}

          <section>
            <p className="px-4 mb-2 text-[13px] font-semibold text-slate-500">
              Nota
            </p>
            <input
              type="text"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Opcional · folio, banco, referencia"
              className="w-full rounded-2xl bg-white dark:bg-[#333336] px-4 min-h-[52px] text-[16px] text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
            />
          </section>
        </div>

        <div className="shrink-0 px-5 sm:px-6 pt-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] bg-white dark:bg-[#333336] border-t border-slate-100">
          <button
            type="submit"
            disabled={!puedeGuardar}
            className="w-full py-3.5 rounded-xl text-[16px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-white/10 dark:disabled:text-white/30 transition-colors"
          >
            {guardando ? "Registrando…" : etiquetaCta}
          </button>
        </div>
      </form>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
