"use client";
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useClientes, aplicarCambioHonorarios } from '@/context/ClientesContext';
import {
  MESES_NOM,
  type Cliente,
  esIngresoGeneralCliente,
  estadoCumpleanos,
  fechaNacimientoDeRFC,
  formatearFechaNacimientoCorta,
  alertasFichaCliente,
} from '@/lib/clientes';
import { montoMensualPresupuesto } from '@/lib/presupuestos';
import EmailInput from '@/components/EmailInput';
import ModalAccesoPortal from '@/components/admin/ModalAccesoPortal';
import ClienteCardMovil from '@/components/admin/ClienteCardMovil';
import {
  regimenesParaPersona,
  etiquetaRegimenCliente,
  etiquetaRegimenCorto,
  claseChipRegimen,
} from '@/lib/regimenes-fiscales';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useNotify } from '@/components/ConfirmProvider';
import { isValidEmail, normalizarEmail } from '@/lib/email';
import {
  guardarCredencialPortal,
  getCredencialPortal,
  usuarioPortalSugerido,
  clavePortalDefault,
  asegurarCredencialPortal,
  asignarClaveTemporal,
} from '@/lib/portal-auth';
import { enviarCorreoClaveTemporal } from '@/lib/correo-portal';
import {
  CONFIG_CUMPLIMIENTO_DEFAULT,
  normalizarConfigCumplimiento,
} from '@/lib/config-cumplimiento-cliente';
import {
  configPortalDesdeAlta,
  cumplimientoDesdeModoPortal,
  etiquetaModoPortal,
  normalizarConfigPortal,
} from '@/lib/config-portal-cliente';
import ModalImportarClientes from '@/components/admin/ModalImportarClientes';
import ModalImportarContactos from '@/components/admin/ModalImportarContactos';
import { normalizarTelefonoDisplay, waLinkTelefono } from '@/lib/telefono';
import type { FilaProcesada } from '@/lib/clientes-importar';
import { exportarClientesCsv } from '@/lib/clientes-export';
import AdminPageHeading, { adminBtnPrimario, adminBtnIcono } from '@/components/admin/AdminPageHeading';
import DeslizadorDosOpciones from '@/components/admin/DeslizadorDosOpciones';
import MenuMasAcciones from '@/components/admin/MenuMasAcciones';
import FichaClienteCartera from '@/components/admin/FichaClienteCartera';
import AvatarCliente from '@/components/admin/AvatarCliente';
import WorkflowCircleMini from '@/components/admin/WorkflowCircleMini';
import PildoraPendientesCliente from '@/components/admin/PildoraPendientesCliente';
import { getWorkflowMesCliente } from '@/lib/cobranza-workflow';
import { pendientesAbiertosDeCliente } from '@/lib/pendientes';

// --- ICONOS ---
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const ChevronUpDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const CakeIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
    <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
    <path d="M2 21h20" />
    <path d="M7 8v2" />
    <path d="M12 8v2" />
    <path d="M17 8v2" />
    <path d="M7 4v2" />
    <path d="M12 4v2" />
    <path d="M17 4v2" />
  </svg>
);
const CheckIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const FILA_LISTA =
  "grid grid-cols-[minmax(13rem,1.15fr)_auto_3.25rem_minmax(9rem,1fr)_minmax(7.5rem,0.8fr)_8rem_4.5rem] items-center gap-x-4 px-5";

const IcoFila = {
  wa: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  mail: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  lock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
};

export default function CRMClientes() {
  const {
    listaClientes,
    setListaClientes,
    periodo,
    periodoHoy,
    eliminarCliente,
    actualizarCliente,
    getCumplimientoPeriodo,
    pendientes,
    presupuestos,
    actualizarPresupuesto,
  } = useClientes();
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState<"activos" | "inactivos">("activos");
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [accesoCliente, setAccesoCliente] = useState<Cliente | null>(null);
  const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportarOpen, setIsImportarOpen] = useState(false);
  const [isImportarContactosOpen, setIsImportarContactosOpen] = useState(false);
  const [resumenImport, setResumenImport] = useState<string | null>(null);
  /** Si el alta viene de «Convertir presupuesto», arrastramos el aviso de privacidad. */
  const [origenPresupuestoId, setOrigenPresupuestoId] = useState<string | null>(null);
  const [origenLeadId, setOrigenLeadId] = useState<string | null>(null);
  const [origenLeadNota, setOrigenLeadNota] = useState<string | null>(null);
  const notify = useNotify();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: 'razonSocial', direction: 'asc' });
  const [destacarId, setDestacarId] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const filaDestacadaRef = useRef<HTMLElement | null>(null);

  // Lectura del query `?destacar=<id>` (típicamente desde la push de
  // cumpleaños). Destaca la fila durante unos segundos, hace scroll y
  // limpia el query para que no quede pegado al refrescar.
  useEffect(() => {
    if (!searchParams) return;
    const raw = searchParams.get('destacar');
    if (!raw) return;
    const id = Number(raw);
    if (!Number.isFinite(id)) return;
    setDestacarId(id);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('destacar');
    router.replace(`/clientes${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
    const timeout = setTimeout(() => setDestacarId(null), 6000);
    return () => clearTimeout(timeout);
  }, [searchParams, router]);

  useEffect(() => {
    if (destacarId === null) return;
    // Espera un tick para que la fila esté en el DOM tras render.
    const t = setTimeout(() => {
      if (filaDestacadaRef.current) {
        filaDestacadaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
    return () => clearTimeout(t);
  }, [destacarId]);

  // Trae al CRM las fotos que el cliente ya subió en el portal.
  useEffect(() => {
    let cancel = false;
    void (async () => {
      try {
        const r = await fetch("/api/admin/clientes/foto?hidratar=1", {
          cache: "no-store",
        });
        if (!r.ok || cancel) return;
        const data = (await r.json()) as {
          fotos?: Array<{
            id: number;
            fotoPerfilUrl: string;
            fotoPerfilPath?: string;
          }>;
        };
        if (!data.fotos?.length || cancel) return;
        const map = new Map(data.fotos.map((f) => [f.id, f]));
        setListaClientes((prev) =>
          prev.map((c) => {
            const f = map.get(c.id);
            if (!f || c.fotoPerfilUrl) return c;
            return {
              ...c,
              fotoPerfilUrl: f.fotoPerfilUrl,
              fotoPerfilPath: f.fotoPerfilPath,
            };
          })
        );
        setSelectedClient((prev) => {
          if (!prev) return prev;
          const f = map.get(prev.id);
          if (!f || prev.fotoPerfilUrl) return prev;
          return {
            ...prev,
            fotoPerfilUrl: f.fotoPerfilUrl,
            fotoPerfilPath: f.fotoPerfilPath,
          };
        });
      } catch {
        // sin red: se queda la lista como está
      }
    })();
    return () => {
      cancel = true;
    };
  }, [setListaClientes]);

  // Prellenado al convertir un presupuesto aceptado en cliente:
  // /clientes?prePresupuesto=<id> autollena el formulario de nuevo cliente.
  useEffect(() => {
    if (!searchParams) return;
    const preId = searchParams.get('prePresupuesto');
    if (!preId) return;
    const pre = presupuestos.find((p) => p.id === preId);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('prePresupuesto');
    router.replace(`/clientes${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
    if (!pre) return;
    setOrigenPresupuestoId(pre.id);
    setFormClient((prev) => ({
      ...prev,
      id: 0,
      razonSocial: pre.cliente.razonSocial || '',
      rfc: pre.cliente.rfc || '',
      email: pre.cliente.email || '',
      honorarios: String(montoMensualPresupuesto(pre)),
      esPersonaMoral: pre.cliente.rfc ? pre.cliente.rfc.replace(/\s/g, '').length <= 12 : true,
    }));
    setIsAddModalOpen(true);
  }, [searchParams, presupuestos, router]);

  useEffect(() => {
    if (!searchParams) return;
    const preLead = searchParams.get("preLead");
    if (!preLead) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("preLead");
    router.replace(
      `/clientes${params.toString() ? `?${params.toString()}` : ""}`,
      { scroll: false }
    );
    let cancel = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/site-leads/${preLead}`);
        const data = await res.json();
        if (!res.ok || cancel || !data?.lead) return;
        const lead = data.lead as {
          id: string;
          nombre: string;
          email: string;
          telefono: string | null;
          mensaje: string | null;
          ingresos_mensuales: number | null;
          ingresos_mas_300: boolean;
          cfdi_mensuales: number | null;
          cfdi_mas_50: boolean;
        };
        const { volumenDesdeLeadRow, formatearFacturacionLead, formatearCfdiLead } =
          await import("@/lib/lead-volumen");
        const { partirMensajeLead } = await import("@/lib/lead-mensaje");
        const vol = volumenDesdeLeadRow(lead);
        const chips = [
          formatearFacturacionLead(vol),
          formatearCfdiLead(vol),
        ].filter(Boolean);
        const libre = partirMensajeLead(lead.mensaje).libre || lead.mensaje || "";
        setOrigenLeadId(lead.id);
        setOrigenLeadNota(
          [libre, chips.length ? chips.join(" · ") : ""]
            .filter(Boolean)
            .join("\n")
        );
        setFormClient((prev) => ({
          ...prev,
          id: 0,
          razonSocial: lead.nombre || "",
          email: lead.email || "",
          whatsapp: lead.telefono || "",
          esPersonaMoral: false,
        }));
        setIsAddModalOpen(true);
      } catch {
        // el admin puede dar de alta a mano
      }
    })();
    return () => {
      cancel = true;
    };
  }, [searchParams, router]);

  // Soporte para auto-abrir un cliente desde la paleta de comandos (/clientes#cliente=ID)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const aplicarHash = () => {
      const hash = window.location.hash;
      const m = hash.match(/cliente=(\d+)/);
      if (!m) return;
      const id = Number(m[1]);
      const cliente = listaClientes.find((c) => c.id === id);
      if (cliente) {
        setSelectedClient(cliente);
        history.replaceState(null, "", window.location.pathname);
      }
    };
    aplicarHash();
    window.addEventListener("hashchange", aplicarHash);
    return () => window.removeEventListener("hashchange", aplicarHash);
  }, [listaClientes]);

  const mesesNom = MESES_NOM;

  const defaultsHoy = () => {
    const ahora = new Date();
    return {
      fechaPago: String(ahora.getDate()).padStart(2, '0'),
      /** Enero del año actual: práctico al migrar clientes con historial en el CRM. */
      inicioMes: '0',
      inicioAnio: String(ahora.getFullYear()),
    };
  };

  const [formClient, setFormClient] = useState(() => ({
    id: 0, razonSocial: '', rfc: '', email: '', whatsapp: '', honorarios: '',
    ...defaultsHoy(),
    esPersonaMoral: true, activo: true,
    portalUsuario: '', portalClave: '',
    cumplFederales: CONFIG_CUMPLIMIENTO_DEFAULT.federales,
    cumplImss: CONFIG_CUMPLIMIENTO_DEFAULT.imss,
    cumplEstatales: CONFIG_CUMPLIMIENTO_DEFAULT.estatales,
    repseHabilitado: false,
    regimenFiscalClave: '' as string,
    soloVisorFiscal: false,
    asalariadoSoloAnual: false,
  }));
  const [enviandoCumpleId, setEnviandoCumpleId] = useState<number | null>(null);

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
  const sortedClientes = useMemo(() => {
    const filteredItems = listaClientes.filter(c => {
      const matchesTab = activeTab === 'activos' ? c.activo : !c.activo;
      const matchesSearch = c.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.rfc.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });

    if (sortConfig.key !== null) {
      filteredItems.sort((a: any, b: any) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (sortConfig.key === 'inicioMes') {
          valA = Number(a.inicioAnio) * 12 + Number(a.inicioMes);
          valB = Number(b.inicioAnio) * 12 + Number(b.inicioMes);
        }
        if (sortConfig.key === 'regimenFiscalClave') {
          valA = etiquetaRegimenCorto(a.regimenFiscalClave);
          valB = etiquetaRegimenCorto(b.regimenFiscalClave);
        }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Ingresos Diversos siempre al final, sin importar el ordenamiento elegido.
    filteredItems.sort((a, b) => {
      const aGen = esIngresoGeneralCliente(a) ? 1 : 0;
      const bGen = esIngresoGeneralCliente(b) ? 1 : 0;
      return aGen - bGen;
    });

    return filteredItems;
  }, [listaClientes, sortConfig, activeTab, searchTerm]);

  const conteoCartera = useMemo(() => ({
    activos: listaClientes.filter((c) => c.activo).length,
    inactivos: listaClientes.filter((c) => !c.activo).length,
  }), [listaClientes]);

  const fichasIncompletas = useMemo(
    () => sortedClientes.filter((c) => alertasFichaCliente(c).length > 0),
    [sortedClientes]
  );

  // --- HANDLERS ---
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const isRfcValid = useMemo(() => {
    const len = formClient.rfc.length;
    return formClient.esPersonaMoral ? len === 12 : len === 13;
  }, [formClient.rfc, formClient.esPersonaMoral]);

  const isEmailValid = useMemo(() => isValidEmail(formClient.email), [formClient.email]);

  const canSave = isRfcValid && isEmailValid;

  const extrasPortalForm = (fc: typeof formClient) => {
    const configPortal = configPortalDesdeAlta({
      soloVisorFiscal: fc.soloVisorFiscal,
      asalariadoSoloAnual: fc.asalariadoSoloAnual,
      regimenFiscalClave: fc.regimenFiscalClave,
    });
    const configCumplimiento = cumplimientoDesdeModoPortal({
      soloVisorFiscal: fc.soloVisorFiscal,
      asalariadoSoloAnual: fc.asalariadoSoloAnual,
      regimenFiscalClave: fc.regimenFiscalClave,
      federales: fc.cumplFederales,
      imss: fc.cumplImss,
      estatales: fc.cumplEstatales,
    });
    const configRepse = {
      habilitado:
        configPortal.soloVisorFiscal || configPortal.asalariadoSoloAnual
          ? false
          : fc.repseHabilitado,
    };
    return { configPortal, configCumplimiento, configRepse };
  };

  const formatCurrencyInput = (value: string) => {
    const numericValue = value.toString().replace(/\D/g, "");
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    const cleanHonorarios = Number(formClient.honorarios.toString().replace(/,/g, ""));
    const email = normalizarEmail(formClient.email);
    const whatsapp = formClient.whatsapp.trim()
      ? normalizarTelefonoDisplay(formClient.whatsapp)
      : undefined;
    const { configPortal, configCumplimiento, configRepse } = extrasPortalForm(formClient);
    
    if (isEditModalOpen) {
      const inicioMesNum = Number(formClient.inicioMes);
      setListaClientes(listaClientes.map(c => {
        if (c.id !== formClient.id) return c;
        const base = {
          ...c,
          razonSocial: formClient.razonSocial,
          rfc: formClient.rfc,
          email,
          whatsapp,
          fechaPago: formClient.fechaPago,
          inicioMes: inicioMesNum,
          inicioAnio: formClient.inicioAnio,
          esPersonaMoral: formClient.esPersonaMoral,
          activo: formClient.activo,
          regimenFiscalClave: formClient.regimenFiscalClave || undefined,
          configCumplimiento,
          configPortal,
          configRepse,
        };
        return aplicarCambioHonorarios(base, cleanHonorarios, periodoHoy.mes);
      }));

      if (selectedClient && selectedClient.id === formClient.id) {
        const clienteLista = listaClientes.find(c => c.id === formClient.id)!;
        const base = {
          ...clienteLista,
          razonSocial: formClient.razonSocial,
          rfc: formClient.rfc,
          email,
          whatsapp,
          fechaPago: formClient.fechaPago,
          inicioMes: Number(formClient.inicioMes),
          inicioAnio: formClient.inicioAnio,
          esPersonaMoral: formClient.esPersonaMoral,
          activo: formClient.activo,
          regimenFiscalClave: formClient.regimenFiscalClave || undefined,
          configCumplimiento,
          configPortal,
          configRepse,
        };
        setSelectedClient(aplicarCambioHonorarios(base, cleanHonorarios, periodoHoy.mes));
      }

      const clienteEditado = listaClientes.find((c) => c.id === formClient.id);
      if (clienteEditado && !esIngresoGeneralCliente(clienteEditado)) {
        const usuario =
          formClient.portalUsuario.trim() || usuarioPortalSugerido(clienteEditado);
        guardarCredencialPortal(
          formClient.id,
          usuario,
          formClient.portalClave.trim() || undefined,
          formClient.portalClave.trim()
            ? { debeCambiarClave: true, esClaveTemporal: false }
            : undefined
        );
      }

      setIsEditModalOpen(false);
    } else {
      const inicioMesNum = Number(formClient.inicioMes);
      const newId = Date.now();
      const avisoDesdePresupuesto = origenPresupuestoId
        ? presupuestos.find((p) => p.id === origenPresupuestoId)?.avisoPrivacidad
        : undefined;
      const clientToAdd = {
        ...formClient,
        id: newId,
        email,
        whatsapp,
        honorarios: cleanHonorarios,
        historialHonorarios: [{ mes: inicioMesNum, monto: cleanHonorarios }],
        inicioMes: inicioMesNum,
        estado: "AL CORRIENTE",
        pagosRealizados: [],
        configCumplimiento,
        configPortal,
        configRepse,
        ...(avisoDesdePresupuesto
          ? { avisoPrivacidad: avisoDesdePresupuesto }
          : {}),
      };
      setListaClientes([clientToAdd, ...listaClientes]);
      if (origenPresupuestoId) {
        actualizarPresupuesto(origenPresupuestoId, {
          convertidoClienteId: newId,
        });
        setOrigenPresupuestoId(null);
      }
      if (origenLeadId) {
        void fetch(`/api/admin/site-leads/${origenLeadId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clienteId: newId }),
        });
        setOrigenLeadId(null);
        setOrigenLeadNota(null);
      }
      if (!esIngresoGeneralCliente(clientToAdd)) {
        const usuario = formClient.portalUsuario.trim() || usuarioPortalSugerido(clientToAdd);
        const clave = formClient.portalClave.trim() || clavePortalDefault(clientToAdd);
        guardarCredencialPortal(newId, usuario, clave, {
          debeCambiarClave: true,
          esClaveTemporal: false,
        });
      }
      setIsAddModalOpen(false);
    }
    resetForm();
  };

  const resetForm = () => {
    setOrigenPresupuestoId(null);
    setOrigenLeadId(null);
    setOrigenLeadNota(null);
    setFormClient({
      id: 0, razonSocial: '', rfc: '', email: '', whatsapp: '', honorarios: '',
      ...defaultsHoy(),
      esPersonaMoral: true, activo: true,
      portalUsuario: '', portalClave: '',
      cumplFederales: CONFIG_CUMPLIMIENTO_DEFAULT.federales,
      cumplImss: CONFIG_CUMPLIMIENTO_DEFAULT.imss,
      cumplEstatales: CONFIG_CUMPLIMIENTO_DEFAULT.estatales,
      repseHabilitado: false,
      regimenFiscalClave: '',
      soloVisorFiscal: false,
      asalariadoSoloAnual: false,
    });
  };

  const importarContactos = (clientes: Cliente[]) => {
    setListaClientes(clientes);
    setResumenImport('Contactos actualizados (WhatsApp y correo por RFC).');
    setTimeout(() => setResumenImport(null), 8000);
  };

  const importarMasivo = (filas: FilaProcesada[]) => {
    if (filas.length === 0) return;
    const ahora = Date.now();
    const nuevos: Cliente[] = filas.map((f, i) => {
      const id = ahora + i;
      const cli: Cliente = {
        id,
        razonSocial: f.fila.razonSocial,
        rfc: f.fila.rfc,
        email: f.fila.email,
        honorarios: f.fila.honorarios,
        historialHonorarios: [
          { mes: f.fila.inicioMes, monto: f.fila.honorarios },
        ],
        fechaPago: f.fila.diaPago,
        estado: 'AL CORRIENTE',
        activo: true,
        inicioMes: f.fila.inicioMes,
        inicioAnio: f.fila.inicioAnio,
        pagosRealizados: [],
        esPersonaMoral: f.fila.esPersonaMoral,
        configCumplimiento: {
          federales: f.fila.federales,
          imss: f.fila.imss,
          estatales: f.fila.estatales,
        },
        configRepse: { habilitado: f.fila.repse },
      };
      return cli;
    });
    setListaClientes([...nuevos, ...listaClientes]);
    nuevos.forEach((c) => {
      const usuario = usuarioPortalSugerido(c);
      const clave = clavePortalDefault(c);
      guardarCredencialPortal(c.id, usuario, clave, {
        debeCambiarClave: true,
        esClaveTemporal: false,
      });
    });
    setResumenImport(
      `Se importaron ${nuevos.length} cliente${nuevos.length === 1 ? '' : 's'} correctamente.`
    );
    setTimeout(() => setResumenImport(null), 4500);
  };

  const enviarFelicitacionCumple = async (cli: Cliente) => {
    if (esIngresoGeneralCliente(cli)) return;
    const fecha = fechaNacimientoDeRFC(cli.rfc, cli.esPersonaMoral);
    if (!fecha) return;
    const hoy = new Date();
    if (fecha.mes !== hoy.getMonth() || fecha.dia !== hoy.getDate()) {
      void notify({
        titulo: 'Aún no es el día',
        mensaje: 'Solo puedes enviar la felicitación el mismo día del cumpleaños.',
        tono: 'info',
      });
      return;
    }
    const anio = hoy.getFullYear();
    if ((cli.cumpleNotificadoAnios ?? []).includes(anio)) {
      void notify({
        titulo: 'Ya enviado',
        mensaje: `Ya se le envió la felicitación a ${cli.razonSocial} en ${anio}.`,
        tono: 'info',
      });
      return;
    }
    if (!cli.email || !isValidEmail(cli.email)) {
      void notify({
        titulo: 'Sin correo válido',
        mensaje: `${cli.razonSocial} no tiene un correo válido para enviar la felicitación.`,
        tono: 'warning',
      });
      return;
    }
    setEnviandoCumpleId(cli.id);
    try {
      const res = await fetch('/api/admin/cumpleanos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cli.email,
          nombreCliente: cli.razonSocial,
          esPersonaMoral: cli.esPersonaMoral === true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        void notify({
          titulo: 'No se pudo enviar',
          mensaje: data.error ?? 'Error al enviar la felicitación.',
          tono: 'danger',
        });
        return;
      }
      setListaClientes(listaClientes.map((c) =>
        c.id === cli.id
          ? {
              ...c,
              cumpleNotificadoAnios: [...(c.cumpleNotificadoAnios ?? []), anio],
            }
          : c
      ));
      void notify({
        titulo: '🎂 Felicitación enviada',
        mensaje: `Se envió la felicitación de cumpleaños a ${cli.razonSocial}.`,
        tono: 'info',
      });
    } finally {
      setEnviandoCumpleId(null);
    }
  };

  const abrirEdicion = (client: Cliente) => {
    const cred = getCredencialPortal(client.id);
    if (!cred && !esIngresoGeneralCliente(client)) asegurarCredencialPortal(client);
    const credFinal = getCredencialPortal(client.id);
    const cfg = normalizarConfigCumplimiento(client.configCumplimiento);
    const portalCfg = normalizarConfigPortal(client.configPortal);
    setFormClient({
      ...client,
      email: client.email ?? '',
      whatsapp: client.whatsapp ?? '',
      honorarios: client.honorarios.toLocaleString(),
      inicioMes: String(client.inicioMes),
      portalUsuario: credFinal?.usuario ?? usuarioPortalSugerido(client),
      portalClave: '',
      cumplFederales: cfg.federales,
      cumplImss: cfg.imss,
      cumplEstatales: cfg.estatales,
      repseHabilitado: client.configRepse?.habilitado === true,
      regimenFiscalClave: client.regimenFiscalClave ?? '',
      soloVisorFiscal: portalCfg.soloVisorFiscal === true,
      asalariadoSoloAnual: portalCfg.asalariadoSoloAnual === true,
    });
    setSelectedClient(null);
    setIsEditModalOpen(true);
  };

  const openEdit = (e: React.MouseEvent, client: Cliente) => {
    e.stopPropagation();
    abrirEdicion(client);
  };

  const exportarLista = useCallback(() => {
    const etiqueta = activeTab === 'activos' ? 'activos' : 'inactivos';
    exportarClientesCsv(sortedClientes, etiqueta);
    void notify({
      titulo: 'Lista exportada',
      mensaje: `${sortedClientes.length} cliente${sortedClientes.length === 1 ? '' : 's'} en CSV.`,
      tono: 'info',
    });
  }, [sortedClientes, activeTab, notify]);

  return (
    <div className="font-sans relative text-slate-800">
      
      {/* Overlay de Modales */}
      {(selectedClient || isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-[45] bg-slate-900/10 backdrop-blur-sm transition-all" onClick={() => { setSelectedClient(null); setIsAddModalOpen(false); setIsEditModalOpen(false); }} />
      )}

      <div className={`max-w-7xl mx-auto w-full min-w-0 transition-all duration-500 ${(selectedClient || isAddModalOpen || isEditModalOpen) ? 'blur-md scale-[0.98]' : ''}`}>

          <AdminPageHeading
            titulo="Mis clientes"
            acciones={
              <>
                <div className="relative flex items-center bg-white ring-1 ring-black/[0.06] rounded-full h-10 overflow-hidden w-full sm:w-56">
                  <div className="absolute left-0 w-10 h-10 flex items-center justify-center text-slate-400 pointer-events-none">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 font-medium text-slate-900 outline-none text-[13px] bg-transparent placeholder:text-slate-400"
                  />
                </div>
                <DeslizadorDosOpciones
                  valor={activeTab === "inactivos" ? "inactivos" : "activos"}
                  onChange={setActiveTab}
                  opciones={[
                    {
                      id: "activos",
                      label: `Activos${conteoCartera.activos ? ` ${conteoCartera.activos}` : ""}`,
                      thumbClass: "bg-white",
                      labelActivaClass: "text-slate-900",
                    },
                    {
                      id: "inactivos",
                      label: `Inactivos${conteoCartera.inactivos ? ` ${conteoCartera.inactivos}` : ""}`,
                      thumbClass: "bg-orange-500",
                      labelActivaClass: "text-white",
                    },
                  ]}
                />
                <MenuMasAcciones
                  items={[
                    {
                      id: "contactos",
                      label: "Actualizar contactos",
                      onClick: () => setIsImportarContactosOpen(true),
                    },
                    {
                      id: "excel",
                      label: "Importar Excel",
                      onClick: () => setIsImportarOpen(true),
                    },
                    { id: "csv", label: "Exportar CSV", onClick: exportarLista },
                  ]}
                />
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsAddModalOpen(true);
                  }}
                  className={adminBtnPrimario}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span className="hidden sm:inline">Agregar</span>
                </button>
              </>
            }
          />

          {fichasIncompletas.length > 0 ? (
            <div
              role="status"
              className="mb-4 flex items-start gap-2.5 rounded-[1.25rem] bg-orange-50 px-4 py-3 text-[13px] text-orange-900"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" aria-hidden>
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
              <p>
                <span className="font-semibold">
                  {fichasIncompletas.length} cliente{fichasIncompletas.length === 1 ? "" : "s"}
                </span>
                {" "}sin correo, WhatsApp o régimen. Completa la ficha para contactar y facturar sin errores.
              </p>
            </div>
          ) : null}

          {resumenImport && (
            <div className="mb-6 px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-[12px] font-bold">
              {resumenImport}
            </div>
          )}

          {/* Vista móvil: lista de cards */}
          <div className="lg:hidden space-y-2">
            {sortedClientes.length === 0 ? (
              <div className="rounded-[1.25rem] bg-white border border-slate-100 p-8 text-center text-slate-300 font-bold uppercase tracking-widest text-[11px]">
                No se encontraron resultados{searchTerm ? ` para "${searchTerm}"` : ""}
              </div>
            ) : (
              sortedClientes.map((cli) => (
                <div
                  key={cli.id}
                  ref={destacarId === cli.id ? (el) => { filaDestacadaRef.current = el; } : undefined}
                  className={
                    destacarId === cli.id
                      ? 'rounded-2xl ring-2 ring-violet-300 animate-pulse'
                      : ''
                  }
                >
                <ClienteCardMovil
                  cliente={cli}
                  enviandoCumple={enviandoCumpleId === cli.id}
                  onSelect={(c) => setSelectedClient(listaClientes.find((x) => x.id === c.id) ?? c)}
                  onEditar={(c, e) => openEdit(e, c)}
                  onFelicitarCumple={(c, e) => {
                    e.stopPropagation();
                    void enviarFelicitacionCumple(c);
                  }}
                  workflow={
                    esIngresoGeneralCliente(cli)
                      ? null
                      : getWorkflowMesCliente(
                          cli,
                          periodo,
                          getCumplimientoPeriodo(cli.id, periodo)
                        )
                  }
                  pendientesAbiertos={
                    esIngresoGeneralCliente(cli)
                      ? []
                      : pendientesAbiertosDeCliente(pendientes, cli.id)
                  }
                />
                </div>
              ))
            )}
            <div className="rounded-[1.25rem] bg-white ring-1 ring-black/[0.04] px-4 py-3 flex justify-between items-center text-[13px] text-slate-500">
              <span>{sortedClientes.length} clientes</span>
              <span className="font-semibold tabular-nums text-slate-800">
                ${sortedClientes.reduce((acc, curr) => acc + curr.honorarios, 0).toLocaleString()}
                <span className="ml-1 font-normal text-slate-400">/mes</span>
              </span>
            </div>
          </div>

          {/* Vista escritorio: lista en columnas equilibradas, sin hueco al centro. */}
          <div className="hidden lg:block bg-white rounded-[1.25rem] shadow-sm ring-1 ring-black/[0.04] overflow-hidden">
            <div className={`${FILA_LISTA} py-2.5 text-[12px] font-semibold text-slate-400 border-b border-slate-100`}>
              <button type="button" onClick={() => handleSort('razonSocial')} className="text-left hover:text-slate-700">
                Cliente {sortConfig.key === 'razonSocial' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
              <span className="text-center">Contacto</span>
              <span className="text-center">Flujo</span>
              <span>Pendientes</span>
              <button type="button" onClick={() => handleSort('regimenFiscalClave')} className="text-left hover:text-slate-700">
                Régimen {sortConfig.key === 'regimenFiscalClave' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
              <button type="button" onClick={() => handleSort('honorarios')} className="text-right hover:text-slate-700">
                Cobro {sortConfig.key === 'honorarios' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
              <span aria-hidden />
            </div>
            {sortedClientes.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {sortedClientes.map((cli) => {
                  const alertas = alertasFichaCliente(cli);
                  const estadoCumple = esIngresoGeneralCliente(cli) ? "sin_fecha" : estadoCumpleanos(cli);
                  const mostrarCumple =
                    estadoCumple === "hoy" ||
                    estadoCumple === "mes_actual" ||
                    estadoCumple === "ya_notificado";
                  const enviando = enviandoCumpleId === cli.id;
                  const fechaNac = fechaNacimientoDeRFC(cli.rfc, cli.esPersonaMoral);
                  const fechaTexto = fechaNac ? formatearFechaNacimientoCorta(fechaNac) : "";
                  const regimenCorto = etiquetaRegimenCorto(cli.regimenFiscalClave);
                  const wa = cli.whatsapp ? waLinkTelefono(cli.whatsapp) : null;
                  const esIngreso = esIngresoGeneralCliente(cli);
                  const pendientesCli = esIngreso
                    ? []
                    : pendientesAbiertosDeCliente(pendientes, cli.id);
                  const workflow = esIngreso
                    ? null
                    : getWorkflowMesCliente(
                        cli,
                        periodo,
                        getCumplimientoPeriodo(cli.id, periodo)
                      );
                  return (
                    <div
                      key={cli.id}
                      ref={destacarId === cli.id ? (el) => { filaDestacadaRef.current = el; } : undefined}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedClient(listaClientes.find(c => c.id === cli.id) ?? cli)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedClient(listaClientes.find(c => c.id === cli.id) ?? cli);
                        }
                      }}
                      className={`${FILA_LISTA} py-3 cursor-pointer group transition-colors hover:bg-slate-50/80 ${
                        destacarId === cli.id ? 'bg-violet-50 ring-2 ring-violet-300' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <AvatarCliente cliente={cli} size="sm" />
                        <div className="min-w-0">
                          <div className="font-semibold text-[15px] text-slate-900 group-hover:text-violet-700 transition-colors leading-tight truncate">{cli.razonSocial}</div>
                          <div className="text-[12px] font-mono text-slate-500 uppercase mt-0.5 tracking-wide truncate">{cli.rfc}</div>
                          {alertas.length > 0 ? (
                            <p className="mt-0.5 text-[12px] text-orange-600">Falta {alertas.join(", ")}</p>
                          ) : etiquetaModoPortal(cli) ? (
                            <span className="inline-flex items-center mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                              {etiquetaModoPortal(cli)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div
                        className="flex items-center justify-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {wa ? (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="WhatsApp"
                            aria-label={`WhatsApp ${cli.razonSocial}`}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          >
                            {IcoFila.wa}
                          </a>
                        ) : (
                          <button
                            type="button"
                            title="Sin WhatsApp"
                            aria-label={`Falta WhatsApp de ${cli.razonSocial}`}
                            onClick={() => {
                              void notify({
                                titulo: "Falta WhatsApp",
                                mensaje: `${cli.razonSocial} no tiene WhatsApp. Ábrelo con Editar para no perder el contacto.`,
                                tono: "warning",
                              });
                            }}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-orange-50 text-orange-500 ring-1 ring-orange-200 hover:bg-orange-100"
                          >
                            {IcoFila.wa}
                          </button>
                        )}
                        {cli.email ? (
                          <a
                            href={`mailto:${cli.email}`}
                            title={cli.email}
                            aria-label={`Correo ${cli.razonSocial}`}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-violet-50 text-violet-600 hover:bg-violet-100"
                          >
                            {IcoFila.mail}
                          </a>
                        ) : (
                          <button
                            type="button"
                            title="Sin correo"
                            aria-label={`Falta correo de ${cli.razonSocial}`}
                            onClick={() => {
                              void notify({
                                titulo: "Falta correo",
                                mensaje: `${cli.razonSocial} no tiene correo. Ábrelo con Editar para enviar avisos y el portal.`,
                                tono: "warning",
                              });
                            }}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-orange-50 text-orange-500 ring-1 ring-orange-200 hover:bg-orange-100"
                          >
                            {IcoFila.mail}
                          </button>
                        )}
                        {!esIngreso ? (
                          <button
                            type="button"
                            title="Portal"
                            aria-label={`Portal ${cli.razonSocial}`}
                            onClick={() => setAccesoCliente(cli)}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                          >
                            {IcoFila.lock}
                          </button>
                        ) : (
                          <span className="h-9 w-9" aria-hidden />
                        )}
                      </div>
                      <div
                        className="flex justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {workflow ? (
                          <Link
                            href={`/cumplimiento?cliente=${cli.id}`}
                            title={`Cumplimiento · ${workflow.labelCorto}`}
                            aria-label={`Abrir cumplimiento de ${cli.razonSocial}, paso ${workflow.paso}`}
                            className="inline-flex rounded-full hover:scale-105 transition-transform"
                          >
                            <WorkflowCircleMini
                              resumen={workflow}
                              size="xs"
                              sinPopover
                            />
                          </Link>
                        ) : (
                          <span className="h-8 w-8" aria-hidden />
                        )}
                      </div>
                      <div
                        className="min-w-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PildoraPendientesCliente
                          clienteId={cli.id}
                          pendientes={pendientesCli}
                        />
                      </div>
                      <div className="min-w-0">
                        <span
                          title={etiquetaRegimenCliente(cli.regimenFiscalClave)}
                          className={`inline-flex max-w-full truncate px-2.5 py-1 rounded-full text-[12px] font-semibold ${claseChipRegimen(cli.regimenFiscalClave)}`}
                        >
                          {regimenCorto}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold tabular-nums text-slate-900">
                          {esIngreso ? (
                            <span className="text-violet-600 text-[12px] font-semibold">Variable</span>
                          ) : (
                            `$${cli.honorarios.toLocaleString()}`
                          )}
                        </p>
                        <p className="text-[12px] text-slate-500 mt-0.5">Día {cli.fechaPago}</p>
                      </div>
                      <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                        {mostrarCumple ? (
                          <button
                            type="button"
                            disabled={estadoCumple !== "hoy" || enviando}
                            onClick={() => void enviarFelicitacionCumple(cli)}
                            title={
                              estadoCumple === "ya_notificado"
                                ? "Felicitación ya enviada este año"
                                : estadoCumple === "hoy"
                                  ? `Enviar felicitación a ${cli.razonSocial}`
                                  : `Cumpleaños este mes (${fechaTexto})`
                            }
                            aria-label="Felicitación de cumpleaños"
                            className={`p-2 rounded-full ${
                              estadoCumple === "ya_notificado"
                                ? "text-emerald-500 hover:bg-emerald-50"
                                : estadoCumple === "hoy"
                                  ? "text-violet-600 bg-violet-50 ring-1 ring-violet-200 hover:bg-violet-100"
                                  : "text-violet-500 hover:bg-violet-50"
                            } disabled:cursor-not-allowed`}
                          >
                            {estadoCumple === "ya_notificado" ? <CheckIcon /> : <CakeIcon />}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={(e) => openEdit(e, cli)}
                          title="Editar"
                          aria-label="Editar cliente"
                          className={`${adminBtnIcono} !h-9 !w-9`}
                        >
                          <EditIcon />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="px-5 py-16 text-center text-slate-400 text-[13px]">
                No se encontraron resultados{searchTerm ? ` para “${searchTerm}”` : ""}
              </p>
            )}
            <div className="px-5 py-3 flex justify-between items-center border-t border-slate-100 text-[13px] text-slate-500">
              <span>{sortedClientes.length} clientes</span>
              <span className="font-semibold tabular-nums text-slate-800">
                ${sortedClientes.reduce((acc, curr) => acc + curr.honorarios, 0).toLocaleString()}
                <span className="ml-1 font-normal text-slate-400">/mes</span>
              </span>
            </div>
          </div>
        </div>

      {/* MODAL: FORMULARIO AGREGAR/EDITAR */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-6 pointer-events-none">
          <form onSubmit={handleSaveClient} className="bg-white w-full max-w-[550px] shadow-[0_30px_100px_rgba(0,0,0,0.15)] rounded-[4rem] flex flex-col pointer-events-auto border border-slate-100 animate-in zoom-in-95 duration-300 p-12 overflow-y-auto max-h-[90vh] scrollbar-hide">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">{isEditModalOpen ? 'Editar Cliente' : 'Nuevo Registro'}</h2>
              <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><CloseIcon /></button>
            </div>
            <div className="space-y-6 mb-10">
              {origenLeadNota && !isEditModalOpen && (
                <div className="rounded-3xl bg-violet-50 border border-violet-100 p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-violet-600 mb-1">
                    Viene de un prospecto
                  </p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {origenLeadNota}
                  </p>
                  <p className="mt-2 text-[11px] text-slate-400">
                    Completa RFC y honorarios. Al guardar, el prospecto pasa a Aceptado.
                  </p>
                </div>
              )}
              {isEditModalOpen && (
                <div className="bg-slate-50 p-6 rounded-3xl flex items-center justify-between border border-slate-100">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Estado del Cliente</p>
                    <p className={`text-sm font-black uppercase ${formClient.activo ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {formClient.activo ? 'Cliente Activo' : 'Cliente Inactivo'}
                    </p>
                  </div>
                  <button type="button" onClick={() => setFormClient({...formClient, activo: !formClient.activo})} className={`w-14 h-8 rounded-full transition-all relative ${formClient.activo ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formClient.activo ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              )}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Razón Social</label>
                <input required type="text" value={formClient.razonSocial} onChange={(e) => setFormClient({...formClient, razonSocial: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Ej. Empresa S.A. de C.V." />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2 px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">RFC</label>
                  <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl">
                    <button type="button" onClick={() => setFormClient({...formClient, esPersonaMoral: true})} className={`px-3 py-1 text-[9px] font-black rounded-lg transition-all ${formClient.esPersonaMoral ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>PM (12)</button>
                    <button type="button" onClick={() => setFormClient({...formClient, esPersonaMoral: false})} className={`px-3 py-1 text-[9px] font-black rounded-lg transition-all ${!formClient.esPersonaMoral ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>PF (13)</button>
                  </div>
                </div>
                <input required type="text" maxLength={formClient.esPersonaMoral ? 12 : 13} value={formClient.rfc} onChange={(e) => setFormClient({...formClient, rfc: e.target.value.toUpperCase()})} className={`w-full bg-slate-50 rounded-2xl px-6 py-4 font-mono text-slate-700 outline-none transition-all border-2 ${isRfcValid ? 'border-emerald-500 bg-emerald-50/30' : 'border-transparent focus:ring-2 focus:ring-indigo-100'}`} placeholder={formClient.esPersonaMoral ? "ABC120101XXX" : "ABCD120101XXX"} />
              </div>
              <EmailInput
                value={formClient.email}
                onChange={(email) => setFormClient({ ...formClient, email })}
              />
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">WhatsApp / teléfono</label>
                <input
                  type="tel"
                  value={formClient.whatsapp}
                  onChange={(e) => setFormClient({ ...formClient, whatsapp: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                  placeholder="Ej. 33 1234 5678"
                />
              </div>
              {!formClient.esPersonaMoral && (() => {
                const fechaNac = fechaNacimientoDeRFC(formClient.rfc, false);
                return (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                      Fecha de nacimiento <span className="text-slate-300 font-bold normal-case tracking-normal">(leída del RFC)</span>
                    </label>
                    <div className={`w-full rounded-2xl px-6 py-4 font-black text-base tracking-wider border ${fechaNac ? 'bg-violet-50/60 text-violet-700 border-violet-100' : 'bg-slate-50 text-slate-300 border-transparent'}`}>
                      {fechaNac ? formatearFechaNacimientoCorta(fechaNac) : 'Completa el RFC para detectarla'}
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 mt-2 ml-1 leading-relaxed">
                      El día exacto aparecerá un pastelito violeta en la lista para enviar la felicitación de cumpleaños.
                    </p>
                  </div>
                );
              })()}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Régimen fiscal SAT</label>
                <div className="relative flex items-center">
                  <select
                    value={formClient.regimenFiscalClave}
                    onChange={(e) => setFormClient({ ...formClient, regimenFiscalClave: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 pr-10 py-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 appearance-none cursor-pointer"
                  >
                    <option value="">— Sin especificar —</option>
                    {regimenesParaPersona(formClient.esPersonaMoral).map((r) => (
                      <option key={r.clave} value={r.clave}>
                        {r.clave} · {r.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 pointer-events-none text-slate-400"><ChevronUpDown /></div>
                </div>
                <p className="text-[9px] font-bold text-slate-400 mt-2 ml-1 leading-relaxed">
                  El cliente lo verá en su portal como referencia de su régimen actual.
                </p>
              </div>
              <div className="rounded-3xl border border-violet-100 bg-violet-50/40 p-6 space-y-4">
                <p className="text-[10px] font-black text-violet-700 uppercase tracking-widest">
                  Portal · Visor CFDI
                </p>
                <p className="text-[9px] font-bold text-slate-500 leading-relaxed -mt-2">
                  Define qué módulos verá el cliente. Alta rápida: marca solo Visor y listo.
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                      formClient.soloVisorFiscal
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {formClient.soloVisorFiscal && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formClient.soloVisorFiscal}
                    onChange={(e) => {
                      const solo = e.target.checked;
                      setFormClient({
                        ...formClient,
                        soloVisorFiscal: solo,
                        asalariadoSoloAnual: solo ? false : formClient.asalariadoSoloAnual,
                        cumplFederales: solo ? false : formClient.cumplFederales,
                        cumplImss: solo ? false : formClient.cumplImss,
                        cumplEstatales: solo ? false : formClient.cumplEstatales,
                        repseHabilitado: solo ? false : formClient.repseHabilitado,
                      });
                    }}
                  />
                  <span>
                    <span className="text-sm font-bold text-slate-800 block">
                      Solo Visor fiscal (CFDI)
                    </span>
                    <span className="text-[10px] text-slate-500 leading-relaxed block mt-1">
                      Sin cumplimiento, honorarios ni solicitudes en el portal. Solo consulta CFDI.
                    </span>
                  </span>
                </label>
                {formClient.regimenFiscalClave === "605" && !formClient.soloVisorFiscal && (
                  <label className="flex items-start gap-3 cursor-pointer">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                        formClient.asalariadoSoloAnual
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {formClient.asalariadoSoloAnual && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formClient.asalariadoSoloAnual}
                      onChange={(e) => {
                        const anual = e.target.checked;
                        setFormClient({
                          ...formClient,
                          asalariadoSoloAnual: anual,
                          cumplFederales: anual ? false : formClient.cumplFederales,
                          cumplImss: anual ? false : formClient.cumplImss,
                          cumplEstatales: anual ? false : formClient.cumplEstatales,
                          repseHabilitado: anual ? false : formClient.repseHabilitado,
                        });
                      }}
                    />
                    <span>
                      <span className="text-sm font-bold text-slate-800 block">
                        Sueldos y salarios · Visor + declaración anual
                      </span>
                      <span className="text-[10px] text-slate-500 leading-relaxed block mt-1">
                        Sin cumplimiento mensual. Portal centrado en Visor fiscal; en Mi Cuenta solo la anual.
                      </span>
                    </span>
                  </label>
                )}
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Honorarios ($)</label>
                  <input required type="text" value={formClient.honorarios} onChange={(e) => setFormClient({...formClient, honorarios: formatCurrencyInput(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-black text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100" placeholder="0.00" />
                  {isEditModalOpen && (
                    <p className="text-[9px] font-bold text-slate-400 mt-2 ml-1 leading-relaxed">
                      Si cambias el monto, aplica desde {mesesNom[periodoHoy.mes]} {periodoHoy.anio} en adelante. Los pagos ya registrados conservan su monto.
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Día de Pago</label>
                  <div className="relative flex items-center">
                    <select value={formClient.fechaPago} onChange={(e) => setFormClient({...formClient, fechaPago: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-6 pr-10 py-4 font-black text-slate-700 outline-none appearance-none cursor-pointer">
                      {Array.from({ length: 31 }, (_, i) => <option key={i+1} value={(i+1).toString().padStart(2,'0')}>Día {(i+1).toString().padStart(2,'0')}</option>)}
                    </select>
                    <div className="absolute right-4 pointer-events-none text-slate-400"><ChevronUpDown /></div>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50/60 p-5 space-y-4">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Inicio de la relación comercial
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 leading-relaxed mt-1.5">
                    Desde qué mes le cobras honorarios en el CRM (no es la fecha de alta en el sistema).
                    Si ya era tu cliente antes, puedes poner enero del año actual y registrar pagos pasados en Cobranza.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Mes</label>
                    <div className="relative flex items-center">
                      <select value={formClient.inicioMes} onChange={(e) => setFormClient({...formClient, inicioMes: e.target.value})} className="w-full bg-white border-none rounded-2xl px-6 pr-10 py-4 font-bold text-slate-700 outline-none appearance-none cursor-pointer">
                        {mesesNom.map((m, i) => <option key={m} value={i}>{m}</option>)}
                      </select>
                      <div className="absolute right-4 pointer-events-none text-slate-400"><ChevronUpDown /></div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Año</label>
                    <input required type="text" value={formClient.inicioAnio} onChange={(e) => setFormClient({...formClient, inicioAnio: e.target.value})} className="w-full bg-white border-none rounded-2xl px-6 py-4 font-black text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100" placeholder="2026" />
                  </div>
                </div>
              </div>
              {!formClient.soloVisorFiscal &&
                !formClient.asalariadoSoloAnual &&
                (!isEditModalOpen ||
                !listaClientes.some(
                  (c) => c.id === formClient.id && esIngresoGeneralCliente(c)
                )) && (
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Categorías de cumplimiento (impuestos)
                </p>
                <p className="text-[9px] font-bold text-slate-400 leading-relaxed">
                  Solo las categorías marcadas aparecerán en previo, portal y carga de documentos.
                </p>
                {(
                  [
                    ['cumplFederales', 'SAT', 'text-blue-700'],
                    ['cumplImss', 'IMSS', 'text-emerald-700'],
                    ['cumplEstatales', 'Impuestos estatales', 'text-violet-700'],
                  ] as const
                ).map(([key, label, color]) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formClient[key]}
                      onChange={(e) => setFormClient({ ...formClient, [key]: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className={`text-xs font-bold ${color}`}>{label}</span>
                  </label>
                ))}
                <div className="pt-3 mt-1 border-t border-slate-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formClient.repseHabilitado}
                      onChange={(e) =>
                        setFormClient({ ...formClient, repseHabilitado: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="text-xs font-bold text-amber-700">
                      REPSE (ICSOE y SISUB cuatrimestrales)
                    </span>
                  </label>
                  <p className="text-[9px] font-bold text-slate-400 leading-relaxed mt-1 ml-7">
                    Solo si el cliente está inscrito en REPSE y necesita
                    declaraciones informativas cuatrimestrales.
                  </p>
                </div>
              </div>
              )}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 space-y-4">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                  Acceso al portal del cliente
                </p>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                    Usuario portal
                  </label>
                  <input
                    type="text"
                    value={formClient.portalUsuario}
                    onChange={(e) =>
                      setFormClient({ ...formClient, portalUsuario: e.target.value.toLowerCase() })
                    }
                    className="w-full bg-white border-none rounded-2xl px-6 py-4 font-mono text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="rfc del cliente"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                    Contraseña portal
                  </label>
                  <input
                    type="text"
                    value={formClient.portalClave}
                    onChange={(e) => setFormClient({ ...formClient, portalClave: e.target.value })}
                    className="w-full bg-white border-none rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder={isEditModalOpen ? "Dejar vacío para no cambiar" : "Se generará si está vacío"}
                  />
                  <p className="text-[9px] font-bold text-slate-400 mt-2 ml-1 leading-relaxed">
                    En su primer acceso deberá crear su contraseña personal. Enlace: /portal/login
                    {formClient.id ? `?cliente=${formClient.id}` : ""}
                  </p>
                </div>
                {isEditModalOpen && formClient.id > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const c = listaClientes.find((x) => x.id === formClient.id);
                      if (!c || esIngresoGeneralCliente(c)) return;
                      const { clavePlana, usuario } = asignarClaveTemporal(c.id);
                      const ok = enviarCorreoClaveTemporal(c, usuario, clavePlana);
                      void notify(
                        ok
                          ? {
                              titulo: "Correo listo para enviar",
                              mensaje: `Se abrió Gmail con la contraseña temporal para ${c.email}. El cliente deberá cambiarla al ingresar.`,
                              tono: "info",
                            }
                          : {
                              titulo: "Sin correo válido",
                              mensaje: `Contraseña temporal: ${clavePlana}\n\nComunícala al cliente manualmente y pídele que la cambie al ingresar.`,
                              tono: "warning",
                            }
                      );
                    }}
                    className="w-full py-3 rounded-xl bg-white border border-indigo-200 text-[9px] font-black uppercase tracking-widest text-indigo-700 hover:bg-indigo-50"
                  >
                    Enviar contraseña temporal por correo
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <button type="submit" disabled={!canSave} className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest transition-all ${canSave ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25' : 'bg-slate-200 text-slate-400'}`}>
                {isEditModalOpen ? 'Actualizar Registro' : 'Guardar Registro'}
              </button>
              <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="w-full text-slate-300 hover:text-slate-500 py-2 font-bold text-[11px] uppercase tracking-widest text-center transition-colors">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {selectedClient && (
        <FichaClienteCartera
          cliente={selectedClient}
          periodo={periodo}
          getCumplimientoPeriodo={getCumplimientoPeriodo}
          onClose={() => setSelectedClient(null)}
          onEditar={() => abrirEdicion(selectedClient)}
          onPortal={() => setAccesoCliente(selectedClient)}
          onEliminar={() => setClienteAEliminar(selectedClient)}
          onFotoCambio={(foto) => {
            const next: Cliente = {
              ...selectedClient,
              fotoPerfilUrl: foto.fotoPerfilUrl,
              fotoPerfilPath: foto.fotoPerfilPath,
            };
            actualizarCliente(next);
            setSelectedClient(next);
          }}
        />
      )}

      {accesoCliente && (
        <ModalAccesoPortal
          cliente={accesoCliente}
          onClose={() => setAccesoCliente(null)}
        />
      )}

      <ModalImportarContactos
        abierto={isImportarContactosOpen}
        clientesExistentes={listaClientes}
        onCerrar={() => setIsImportarContactosOpen(false)}
        onAplicar={importarContactos}
      />

      <ModalImportarClientes
        abierto={isImportarOpen}
        clientesExistentes={listaClientes}
        onCerrar={() => setIsImportarOpen(false)}
        onImportar={importarMasivo}
      />

      <ConfirmDialog
        open={Boolean(clienteAEliminar)}
        titulo="¿Eliminar cliente?"
        mensaje={
          clienteAEliminar
            ? `Vas a eliminar a "${clienteAEliminar.razonSocial}" de forma definitiva.\n\nSe borrará su acceso al portal y todo su historial (comprobantes, pagos, facturas, cumplimiento y notificaciones). Esta acción no se puede deshacer.`
            : undefined
        }
        textoConfirmar="Eliminar"
        textoCancelar="Cancelar"
        tono="danger"
        onConfirmar={async () => {
          if (!clienteAEliminar) return;
          await eliminarCliente(clienteAEliminar.id);
          setSelectedClient(null);
          setClienteAEliminar(null);
        }}
        onCancelar={() => setClienteAEliminar(null)}
      />

      <style jsx global>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
    </div>
  );
}