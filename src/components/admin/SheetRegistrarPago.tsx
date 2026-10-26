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
  CUENTAS_BANCO_DESPACHO,
  esIngresoGeneralCliente,
  esPrefijoDeudaAntigua,
  listarDeudasCobrables,
  periodoLabel,
  prefijoDeudaAntigua,
  repartirAbono,
  type Cliente,
  type CuentaBancoDespacho,
  type DeudaCobrable,
} from "@/lib/clientes";
import PillDeslizable from "@/components/ui/PillDeslizable";
import { CampoNotaPago } from "@/components/admin/CamposPago";
import { useClientes } from "@/context/ClientesContext";
import { useScrollLock } from "@/hooks/useScrollLock";
import {
  caparImporteMx,
  formatMontoDesdeNumero,
  parseMontoInput,
} from "@/lib/monto-input";
import MontoInput from "@/components/MontoInput";
import AvatarCliente from "@/components/admin/AvatarCliente";

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

function CheckCirculo({ activo }: { activo: boolean }) {
  return (
    <span
      className={`shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
        activo
          ? "bg-emerald-600 border-emerald-600 text-white"
          : "border-slate-300 bg-white dark:border-white/30 dark:bg-transparent"
      }`}
      aria-hidden
    >
      {activo ? (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : null}
    </span>
  );
}

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
          const capped = caparImporteMx(v);
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
    registrarAbonoExtraEsperado,
  } = useClientes();

  const [montoInput, setMontoInput] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [soloExtra, setSoloExtra] = useState(false);
  const [avisoFifo, setAvisoFifo] = useState(false);
  const [sacudir, setSacudir] = useState(0);
  const [nota, setNota] = useState("");
  const [cuentaBanco, setCuentaBanco] =
    useState<CuentaBancoDespacho>("bbva");
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

  const deudas = useMemo<DeudaCobrable[]>(() => {
    if (!cliente) return [];
    return listarDeudasCobrables(cliente, periodoHoy);
  }, [cliente, periodoHoy]);

  useEffect(() => {
    setSeleccion(new Set());
    setSoloExtra(false);
    setAvisoFifo(false);
  }, [clienteId]);

  useEffect(() => {
    if (!avisoFifo) return;
    const t = window.setTimeout(() => setAvisoFifo(false), 3000);
    return () => window.clearTimeout(t);
  }, [avisoFifo, sacudir]);

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
  const puedeGuardar = monto > 0 && cliente != null && !guardando;

  function llenarImporte(keys: Set<string>) {
    const suma = deudas
      .filter((item) => keys.has(item.key))
      .reduce((acc, item) => acc + item.saldo, 0);
    setMontoInput(suma > 0 ? caparImporteMx(formatMontoDesdeNumero(suma)) : "");
  }

  function marcarSaltoFifo() {
    setSacudir((n) => n + 1);
    setAvisoFifo(true);
  }

  const etiquetaCta = soloExtra
    ? "Registrar ingreso extra"
    : seleccion.size === 1
      ? `Aplicar a ${deudas.find((d) => seleccion.has(d.key))?.label ?? "selección"}`
      : seleccion.size > 1
        ? `Aplicar a ${seleccion.size} deudas`
        : deudas.length > 0
          ? "Registrar pago"
          : "Registrar ingreso extra";

  function elegirCliente(c: Cliente) {
    setClienteId(c.id);
    setBusqueda("");
  }

  function toggleDeuda(d: DeudaCobrable) {
    const next = new Set(seleccion);
    if (next.has(d.key)) next.delete(d.key);
    else next.add(d.key);
    setSoloExtra(false);
    if (next.size > 0 && !esPrefijoDeudaAntigua(deudas, next)) {
      const corregida = prefijoDeudaAntigua(deudas, next.size);
      setSeleccion(corregida);
      llenarImporte(corregida);
      marcarSaltoFifo();
      return;
    }
    setSeleccion(next);
    llenarImporte(next);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!puedeGuardar || !cliente) return;
    setGuardando(true);
    const notaTrim = nota.trim() || undefined;
    const partes = soloExtra ? [] : repartirAbono(deudas, monto);
    const aplicado = partes.reduce((acc, p) => acc + p.aplicar, 0);
    const suelto = Math.max(0, monto - aplicado);

    let ok = partes.length === 0 && suelto > 0;
    for (const parte of partes) {
      const res =
        parte.deuda.tipo === "honorarios"
          ? registrarPago(cliente.id, parte.deuda.periodo, parte.aplicar, notaTrim, {
              metodoPago: "transferencia",
              cuentaBanco,
            })
          : registrarAbonoExtraEsperado(
              cliente.id,
              parte.deuda.extraId,
              parte.deuda.periodo,
              parte.aplicar,
              notaTrim,
              { metodoPago: "transferencia", cuentaBanco }
            );
      if (res) ok = true;
    }
    if (suelto > 0) {
      const extra = registrarServicioAdicional(
        cliente.id,
        periodoHoy,
        suelto,
        "Ingreso extra",
        notaTrim,
        { metodoPago: "transferencia", cuentaBanco }
      );
      if (extra) ok = true;
    }
    if (!ok) {
      setGuardando(false);
      return;
    }
    const nHonorarios = partes.filter((p) => p.deuda.tipo === "honorarios").length;
    const nExtras = partes.filter((p) => p.deuda.tipo === "extra").length;
    const trozos: string[] = [];
    if (nHonorarios === 1) {
      const mes = partes.find((p) => p.deuda.tipo === "honorarios")?.deuda;
      trozos.push(mes && mes.tipo === "honorarios" ? periodoLabel(mes.periodo) : "honorarios");
    } else if (nHonorarios > 1) {
      trozos.push(`${nHonorarios} meses`);
    }
    if (nExtras === 1) {
      const extra = partes.find((p) => p.deuda.tipo === "extra")?.deuda;
      trozos.push(extra && extra.tipo === "extra" ? extra.concepto : "extra");
    } else if (nExtras > 1) {
      trozos.push(`${nExtras} extras`);
    }
    if (suelto > 0) trozos.push("ingreso extra");
    onAplicado(
      `${mxn(monto)} en ${cliente.razonSocial}${trozos.length ? ` · ${trozos.join(" · ")}` : ""}`
    );
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
            <PillDeslizable
              acento="claro"
              size="sm"
              className="mb-3"
              value={cuentaBanco}
              onChange={setCuentaBanco}
              opciones={CUENTAS_BANCO_DESPACHO.map((c) => ({
                value: c.id,
                label: c.label,
              }))}
            />
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
                  setSeleccion(new Set());
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
              {deudas.length === 0 ? (
                <p className="px-4 mb-2 text-[13px] text-slate-500">
                  Este cliente no tiene honorarios ni extras pendientes. El
                  importe se registra como ingreso extra.
                </p>
              ) : (
                <p className="px-4 mb-2 text-[13px] text-slate-500">
                  Palomea de lo más viejo a lo más nuevo: el importe se suma
                  solo. O escribe el monto y se abona igual, de antiguo a
                  nuevo.
                </p>
              )}
              <div
                key={sacudir}
                className={sacudir > 0 ? "rdc-shake-x" : ""}
              >
              <ul className="rounded-2xl bg-white dark:bg-[#333336] overflow-hidden divide-y divide-slate-100">
                {deudas.map((d) => {
                  const activo = !soloExtra && seleccion.has(d.key);
                  return (
                    <li key={d.key}>
                      <button
                        type="button"
                        onClick={() => toggleDeuda(d)}
                        aria-pressed={activo}
                        className="relative flex w-full items-center gap-3 px-4 min-h-[56px] py-2.5 active:bg-slate-50 text-left"
                      >
                        <CheckCirculo activo={activo} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[16px] font-semibold text-slate-900 dark:text-white leading-tight">
                            {d.label}
                          </span>
                          <span className="block text-[13px] text-slate-500 mt-0.5">
                            {d.detalle} · {mxn(d.saldo)}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setSoloExtra((v) => !v);
                      setSeleccion(new Set());
                    }}
                    aria-pressed={soloExtra}
                    className="relative flex w-full items-center gap-3 px-4 min-h-[56px] py-2.5 active:bg-slate-50 text-left"
                  >
                    <CheckCirculo activo={soloExtra} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-semibold text-slate-900 dark:text-white leading-tight">
                        Ingreso extra
                      </span>
                      <span className="block text-[13px] text-slate-500 mt-0.5">
                        No descuenta honorarios ni extras pendientes
                      </span>
                    </span>
                  </button>
                </li>
              </ul>
              </div>
            </section>
          ) : null}

          <section>
            <CampoNotaPago
              value={nota}
              onChange={setNota}
              variante="sheet"
            />
          </section>
        </div>

        {avisoFifo ? (
          <div className="absolute inset-x-5 top-[42%] z-40 pointer-events-none">
            <div
              role="status"
              className="rounded-2xl bg-slate-900/95 px-4 py-3.5 text-center text-[14px] font-semibold text-white shadow-2xl"
            >
              Abonaremos de la deuda más antigua a la más nueva.
            </div>
          </div>
        ) : null}

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
