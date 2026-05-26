"use client";
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useClientes, aplicarCambioHonorarios } from '@/context/ClientesContext';
import {
  MESES_NOM,
  type Cliente,
  esIngresoGeneralCliente,
  estadoCumpleanos,
  fechaNacimientoDeRFC,
  formatearFechaNacimientoCorta,
} from '@/lib/clientes';
import {
  getHonorarioVigente,
  getTotalPendiente,
  getMontoMes,
  estaPagado,
  tienePagoParcial,
  getCompromisoMes,
  getSaldoMes,
  periodoKey,
  clienteActivoEnPeriodo,
  getTotalHonorariosCliente,
  getTotalAdicionalesAnio,
  type Periodo,
} from '@/lib/clientes';
import EstadoBadge from '@/components/EstadoBadge';
import EmailInput from '@/components/EmailInput';
import ModalAccesoPortal from '@/components/admin/ModalAccesoPortal';
import ClienteCardMovil from '@/components/admin/ClienteCardMovil';
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
import ModalImportarClientes from '@/components/admin/ModalImportarClientes';
import type { FilaProcesada } from '@/lib/clientes-importar';

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

export default function CRMClientes() {
  const { listaClientes, setListaClientes, periodo, periodoHoy, eliminarCliente } = useClientes();
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState('activos');
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [accesoCliente, setAccesoCliente] = useState<Cliente | null>(null);
  const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportarOpen, setIsImportarOpen] = useState(false);
  const [resumenImport, setResumenImport] = useState<string | null>(null);
  const [cardSwipeAbiertaId, setCardSwipeAbiertaId] = useState<number | null>(null);
  const notify = useNotify();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: 'razonSocial', direction: 'asc' });

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
    id: 0, razonSocial: '', rfc: '', email: '', honorarios: '',
    ...defaultsHoy(),
    esPersonaMoral: true, activo: true,
    portalUsuario: '', portalClave: '',
    cumplFederales: CONFIG_CUMPLIMIENTO_DEFAULT.federales,
    cumplImss: CONFIG_CUMPLIMIENTO_DEFAULT.imss,
    cumplEstatales: CONFIG_CUMPLIMIENTO_DEFAULT.estatales,
    repseHabilitado: false,
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

  const formatCurrencyInput = (value: string) => {
    const numericValue = value.toString().replace(/\D/g, "");
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    const cleanHonorarios = Number(formClient.honorarios.toString().replace(/,/g, ""));
    const email = normalizarEmail(formClient.email);
    
    if (isEditModalOpen) {
      const inicioMesNum = Number(formClient.inicioMes);
      setListaClientes(listaClientes.map(c => {
        if (c.id !== formClient.id) return c;
        const base = {
          ...c,
          razonSocial: formClient.razonSocial,
          rfc: formClient.rfc,
          email,
          fechaPago: formClient.fechaPago,
          inicioMes: inicioMesNum,
          inicioAnio: formClient.inicioAnio,
          esPersonaMoral: formClient.esPersonaMoral,
          activo: formClient.activo,
          configCumplimiento: {
            federales: formClient.cumplFederales,
            imss: formClient.cumplImss,
            estatales: formClient.cumplEstatales,
          },
          configRepse: { habilitado: formClient.repseHabilitado },
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
          fechaPago: formClient.fechaPago,
          inicioMes: Number(formClient.inicioMes),
          inicioAnio: formClient.inicioAnio,
          esPersonaMoral: formClient.esPersonaMoral,
          activo: formClient.activo,
          configCumplimiento: {
            federales: formClient.cumplFederales,
            imss: formClient.cumplImss,
            estatales: formClient.cumplEstatales,
          },
          configRepse: { habilitado: formClient.repseHabilitado },
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
      const clientToAdd = {
        ...formClient,
        id: newId,
        email,
        honorarios: cleanHonorarios,
        historialHonorarios: [{ mes: inicioMesNum, monto: cleanHonorarios }],
        inicioMes: inicioMesNum,
        estado: "AL CORRIENTE",
        pagosRealizados: [],
        configCumplimiento: {
          federales: formClient.cumplFederales,
          imss: formClient.cumplImss,
          estatales: formClient.cumplEstatales,
        },
        configRepse: { habilitado: formClient.repseHabilitado },
      };
      setListaClientes([clientToAdd, ...listaClientes]);
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
    setFormClient({
      id: 0, razonSocial: '', rfc: '', email: '', honorarios: '',
      ...defaultsHoy(),
      esPersonaMoral: true, activo: true,
      portalUsuario: '', portalClave: '',
      cumplFederales: CONFIG_CUMPLIMIENTO_DEFAULT.federales,
      cumplImss: CONFIG_CUMPLIMIENTO_DEFAULT.imss,
      cumplEstatales: CONFIG_CUMPLIMIENTO_DEFAULT.estatales,
      repseHabilitado: false,
    });
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
        body: JSON.stringify({ email: cli.email, nombreCliente: cli.razonSocial }),
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

  const openEdit = (e: React.MouseEvent, client: Cliente) => {
    e.stopPropagation();
    const cred = getCredencialPortal(client.id);
    if (!cred && !esIngresoGeneralCliente(client)) asegurarCredencialPortal(client);
    const credFinal = getCredencialPortal(client.id);
    const cfg = normalizarConfigCumplimiento(client.configCumplimiento);
    setFormClient({
      ...client,
      email: client.email ?? '',
      honorarios: client.honorarios.toLocaleString(),
      inicioMes: String(client.inicioMes),
      portalUsuario: credFinal?.usuario ?? usuarioPortalSugerido(client),
      portalClave: '',
      cumplFederales: cfg.federales,
      cumplImss: cfg.imss,
      cumplEstatales: cfg.estatales,
      repseHabilitado: client.configRepse?.habilitado === true,
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans relative overflow-hidden text-slate-800">
      
      {/* Overlay de Modales */}
      {(selectedClient || isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-[45] bg-slate-900/10 backdrop-blur-sm transition-all" onClick={() => { setSelectedClient(null); setIsAddModalOpen(false); setIsEditModalOpen(false); }} />
      )}

      <main className={`flex-1 p-3 sm:p-6 lg:p-12 transition-all duration-500 min-w-0 ${(selectedClient || isAddModalOpen || isEditModalOpen) ? 'blur-md scale-[0.98]' : ''}`}>
        <div className="max-w-7xl mx-auto w-full min-w-0">

          <header className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-end mb-8 lg:mb-16">
            <div>
              <h1 className="text-2xl lg:text-5xl font-black uppercase tracking-tighter leading-none text-slate-800">Cartera de Clientes</h1>
              <div className="flex gap-6 lg:gap-8 mt-4 lg:mt-8">
                <button onClick={() => setActiveTab('activos')} className={`text-[11px] font-black uppercase tracking-widest pb-3 border-b-4 transition-all ${activeTab === 'activos' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-300'}`}>Activos</button>
                <button onClick={() => setActiveTab('inactivos')} className={`text-[11px] font-black uppercase tracking-widest pb-3 border-b-4 transition-all ${activeTab === 'inactivos' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-300'}`}>Inactivos</button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              {/* Buscador (móvil siempre visible, escritorio expandible) */}
              <div className="relative w-full sm:w-auto group">
                <div className="flex items-center bg-white border border-slate-100 rounded-full h-12 lg:h-[60px] w-full sm:w-[280px] lg:w-[60px] lg:group-hover:w-[320px] lg:focus-within:w-[320px] shadow-sm transition-all duration-500 overflow-hidden">
                  <div className="absolute left-4 lg:left-0 lg:w-[60px] lg:h-[60px] flex items-center justify-center text-slate-400 lg:group-hover:left-4 lg:group-hover:w-auto lg:focus-within:left-4 lg:focus-within:w-auto pointer-events-none">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por nombre o RFC…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-full pl-12 lg:pl-[65px] pr-4 lg:pr-6 font-bold text-slate-600 outline-none text-sm placeholder:text-slate-300 bg-transparent lg:opacity-0 lg:group-hover:opacity-100 lg:focus:opacity-100 transition-opacity"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsImportarOpen(true)}
                title="Importar desde Excel"
                aria-label="Importar desde Excel"
                className="bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 h-12 w-12 lg:h-[60px] lg:w-[60px] rounded-full shadow-sm hover:shadow-md hover:shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="m8 13 8 8" />
                  <path d="m16 13-8 8" />
                </svg>
              </button>
              <button onClick={() => { resetForm(); setIsAddModalOpen(true); }} className="bg-violet-600 hover:bg-violet-700 text-white h-12 lg:h-[60px] px-5 lg:px-8 rounded-full font-black text-[11px] lg:text-[12px] uppercase tracking-widest shadow-lg shadow-violet-100 transition-all active:scale-95 flex items-center justify-center gap-2 lg:gap-3 w-full sm:w-auto">
                <span className="text-xl leading-none">+</span> Agregar Cliente
              </button>
            </div>
          </header>

          {resumenImport && (
            <div className="mb-6 px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-[12px] font-bold">
              {resumenImport}
            </div>
          )}

          {/* Vista móvil: lista de cards */}
          <div
            className="lg:hidden space-y-2"
            onClick={(e) => {
              if (cardSwipeAbiertaId !== null && e.target === e.currentTarget) {
                setCardSwipeAbiertaId(null);
              }
            }}
          >
            {sortedClientes.length === 0 ? (
              <div className="rounded-2xl bg-white border border-slate-100 p-8 text-center text-slate-300 font-bold uppercase tracking-widest text-[11px]">
                No se encontraron resultados{searchTerm ? ` para "${searchTerm}"` : ""}
              </div>
            ) : (
              sortedClientes.map((cli) => (
                <ClienteCardMovil
                  key={cli.id}
                  cliente={cli}
                  periodo={periodo}
                  swipeAbierto={cardSwipeAbiertaId === cli.id}
                  enviandoCumple={enviandoCumpleId === cli.id}
                  onSwipeAbrir={() => setCardSwipeAbiertaId(cli.id)}
                  onSwipeCerrar={() => {
                    setCardSwipeAbiertaId((actual) => (actual === cli.id ? null : actual));
                  }}
                  onSelect={(c) => setSelectedClient(listaClientes.find((x) => x.id === c.id) ?? c)}
                  onEditar={(c, e) => openEdit(e, c)}
                  onAccesoPortal={(c, e) => {
                    e.stopPropagation();
                    setAccesoCliente(c);
                  }}
                  onEliminar={(c, e) => {
                    e.stopPropagation();
                    setClienteAEliminar(c);
                  }}
                  onFelicitarCumple={(c, e) => {
                    e.stopPropagation();
                    void enviarFelicitacionCumple(c);
                  }}
                />
              ))
            )}
            <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <span>
                Clientes <strong className="text-slate-700 ml-1">{sortedClientes.length}</strong>
              </span>
              <span>
                Cobro <strong className="text-slate-900 ml-1 font-black text-sm">${sortedClientes.reduce((acc, curr) => acc + curr.honorarios, 0).toLocaleString()}</strong>
              </span>
            </div>
          </div>

          {/* Vista escritorio: tabla */}
          <div className="hidden lg:block bg-white rounded-[3rem] shadow-sm border border-slate-50 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#FBFBFF] text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-50">
                <tr>
                  <th onClick={() => handleSort('razonSocial')} className="px-10 py-5 cursor-pointer hover:text-indigo-600 transition-colors">Cliente / RFC {sortConfig.key === 'razonSocial' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('honorarios')} className="px-6 py-5 text-center cursor-pointer hover:text-indigo-600 transition-colors">Honorarios {sortConfig.key === 'honorarios' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('inicioMes')} className="px-6 py-5 text-center cursor-pointer hover:text-indigo-600 transition-colors">Inicio relación {sortConfig.key === 'inicioMes' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('fechaPago')} className="px-6 py-5 text-center cursor-pointer hover:text-indigo-600 transition-colors">Día Pago {sortConfig.key === 'fechaPago' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('estado')} className="px-6 py-5 text-center cursor-pointer hover:text-indigo-600 transition-colors">Estatus {sortConfig.key === 'estado' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-10 py-5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sortedClientes.length > 0 ? (
                  sortedClientes.map((cli) => (
                    <tr key={cli.id} onClick={() => setSelectedClient(listaClientes.find(c => c.id === cli.id) ?? cli)} className="hover:bg-slate-50/50 cursor-pointer group transition-all">
                      <td className="px-10 py-4">
                        <div className="font-bold text-lg text-slate-700 group-hover:text-indigo-600 transition-colors leading-tight">{cli.razonSocial}</div>
                        <div className="text-[11px] font-mono text-slate-300 uppercase mt-0.5 tracking-widest">{cli.rfc}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-black text-slate-700 text-base">
                        {esIngresoGeneralCliente(cli) ? (
                          <span className="text-violet-600 text-xs uppercase tracking-widest">Variable</span>
                        ) : (
                          `$${cli.honorarios.toLocaleString()}`
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-400 italic text-sm">{mesesNom[cli.inicioMes]} {cli.inicioAnio}</td>
                      <td className="px-6 py-4 text-center font-black text-slate-700 text-base">Día {cli.fechaPago}</td>
                      <td className="px-6 py-4 text-center">
                        <EstadoBadge cliente={cli} periodo={periodo} />
                      </td>
                      <td className="px-10 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {(() => {
                            if (esIngresoGeneralCliente(cli)) return null;
                            const estado = estadoCumpleanos(cli);
                            if (estado === 'sin_fecha') return null;
                            const enviando = enviandoCumpleId === cli.id;
                            const esHoy = estado === 'hoy';
                            const yaEnviado = estado === 'ya_notificado';
                            const fechaNac = fechaNacimientoDeRFC(cli.rfc, cli.esPersonaMoral);
                            const fechaTexto = fechaNac ? formatearFechaNacimientoCorta(fechaNac) : '';
                            const titulo = yaEnviado
                              ? `Felicitación de cumpleaños ya enviada este año`
                              : esHoy
                                ? `Enviar felicitación de cumpleaños a ${cli.razonSocial}`
                                : estado === 'mes_actual'
                                  ? `Cumpleaños este mes (${fechaTexto}) — se activa el día exacto`
                                  : `Cumpleaños: ${fechaTexto}`;
                            const color = yaEnviado
                              ? 'text-emerald-500 hover:bg-emerald-50'
                              : esHoy
                                ? 'text-violet-600 bg-violet-50 ring-1 ring-violet-200 hover:bg-violet-100 animate-pulse'
                                : estado === 'mes_actual'
                                  ? 'text-violet-500 hover:bg-violet-50'
                                  : 'text-slate-200 hover:text-slate-400';
                            const siempreVisible = esHoy || yaEnviado || estado === 'mes_actual';
                            return (
                              <button
                                type="button"
                                disabled={!esHoy || enviando}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void enviarFelicitacionCumple(cli);
                                }}
                                title={titulo}
                                aria-label={titulo}
                                className={`p-2 rounded-full transition-all ${color} ${siempreVisible ? '' : 'opacity-0 group-hover:opacity-100'} disabled:cursor-not-allowed`}
                              >
                                {yaEnviado ? <CheckIcon /> : <CakeIcon />}
                              </button>
                            );
                          })()}
                          {!esIngresoGeneralCliente(cli) ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAccesoCliente(cli);
                              }}
                              title="Acceso al portal"
                              className="p-2 rounded-full text-slate-200 hover:text-emerald-600 hover:bg-emerald-50 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                              </svg>
                            </button>
                          ) : null}
                          <button onClick={(e) => openEdit(e, cli)} title="Editar" className="p-2 rounded-full text-slate-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100">
                            <EditIcon />
                          </button>
                          {!esIngresoGeneralCliente(cli) ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setClienteAEliminar(cli);
                              }}
                              title="Eliminar cliente"
                              className="group/trash p-2 rounded-full text-slate-300 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover/trash:text-rose-600 transition-colors">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"></path>
                                <path d="M10 11v6"></path>
                                <path d="M14 11v6"></path>
                                <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-10 py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[11px]">
                      No se encontraron resultados para "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            <div className="px-10 py-6 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Clientes filtrados: <strong className="text-slate-700 ml-1">{sortedClientes.length}</strong>
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Cobro Total: <strong className="text-slate-900 ml-1 font-black text-sm">${sortedClientes.reduce((acc, curr) => acc + curr.honorarios, 0).toLocaleString()}</strong>
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL: FORMULARIO AGREGAR/EDITAR */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-6 pointer-events-none">
          <form onSubmit={handleSaveClient} className="bg-white w-full max-w-[550px] shadow-[0_30px_100px_rgba(0,0,0,0.15)] rounded-[4rem] flex flex-col pointer-events-auto border border-slate-100 animate-in zoom-in-95 duration-300 p-12 overflow-y-auto max-h-[90vh] scrollbar-hide">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">{isEditModalOpen ? 'Editar Cliente' : 'Nuevo Registro'}</h2>
              <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><CloseIcon /></button>
            </div>
            <div className="space-y-6 mb-10">
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
              {(!isEditModalOpen ||
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
              <button type="submit" disabled={!canSave} className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl transition-all ${canSave ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-slate-200 text-slate-400'}`}>
                {isEditModalOpen ? 'Actualizar Registro' : 'Guardar Registro'}
              </button>
              <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="w-full text-slate-300 hover:text-slate-500 py-2 font-bold text-[11px] uppercase tracking-widest text-center transition-colors">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: DETALLE DE PAGOS / HISTORIAL */}
      {selectedClient && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-2 sm:p-3 lg:p-4 pointer-events-none">
          <div className="bg-white w-full max-w-[480px] max-h-[min(96dvh,96vh)] lg:max-h-[88vh] shadow-[0_30px_100px_rgba(0,0,0,0.15)] rounded-[2rem] lg:rounded-[2.5rem] flex flex-col pointer-events-auto border border-slate-100 animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-6 sm:p-8 pb-3 flex-none border-b border-slate-50/50 shrink-0 overflow-y-auto max-h-[42vh] lg:max-h-none lg:overflow-visible scrollbar-hide">
              <div className="flex justify-between items-center mb-4">
                <button onClick={() => setSelectedClient(null)} className="text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-indigo-600 transition-colors">← Regresar</button>
                <button onClick={() => setSelectedClient(null)} className="p-2 text-slate-300 hover:text-red-500"><CloseIcon /></button>
              </div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-snug mb-0.5">{selectedClient.razonSocial}</h2>
              <p className="text-[10px] font-mono text-slate-300 uppercase tracking-widest mb-1">
                {selectedClient.rfc} · Relación desde {mesesNom[selectedClient.inicioMes]} {selectedClient.inicioAnio}
              </p>
              {selectedClient.email && (
                <p className="text-[10px] font-bold text-indigo-500 mb-3 truncate">{selectedClient.email}</p>
              )}
              {!selectedClient.email && <div className="mb-3" />}
              <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mb-3 bg-indigo-50 px-3 py-2 rounded-lg">
                Solo consulta — registra pagos en <Link href="/cobranza" onClick={(e) => e.stopPropagation()} className="underline hover:text-indigo-700">Cobranza</Link>
              </p>
              <div className="grid grid-cols-2 gap-2 mb-1">
                <div className="bg-indigo-600 px-4 py-3 rounded-2xl text-white shadow-md shadow-indigo-100">
                  <p className="text-[8px] font-bold uppercase opacity-70 tracking-widest">Honorarios</p>
                  <p className="text-lg font-black">${selectedClient.honorarios.toLocaleString()}</p>
                </div>
                <div className="bg-orange-50 px-4 py-3 rounded-2xl border border-orange-100">
                  <p className="text-[8px] font-bold uppercase text-orange-400 tracking-widest">Día de cobro</p>
                  <p className="text-lg font-black text-orange-500">Día {selectedClient.fechaPago}</p>
                </div>
              </div>
            </div>
            <p className="px-6 sm:px-8 pt-3 pb-1 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
              Año {periodo.anio}
            </p>
            <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-2 space-y-2 scrollbar-hide min-h-0">
              {mesesNom.map((m, i) => {
                const p: Periodo = { mes: i, anio: periodo.anio };
                const previoInicio = !clienteActivoEnPeriodo(selectedClient, p);
                const esFuturo = periodoKey(p) > periodoKey(periodo);
                const enVista = !previoInicio && !esFuturo;
                const pagado = estaPagado(selectedClient, p);
                const parcial = tienePagoParcial(selectedClient, p);
                const atrasado = enVista && !pagado && !parcial;
                const saldo = getSaldoMes(selectedClient, p);

                const montoDeEsteMes =
                  pagado || parcial
                    ? getMontoMes(selectedClient, p)
                    : getCompromisoMes(selectedClient, p);

                return (
                  <div
                    key={m}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-200 ${
                      enVista
                        ? "bg-white border-slate-100 shadow-sm"
                        : "bg-slate-50/50 opacity-30 border-transparent"
                    } ${i === periodo.mes ? "ring-2 ring-indigo-200" : ""}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-2 h-2 shrink-0 rounded-full ${
                          pagado
                            ? "bg-green-500"
                            : atrasado
                              ? "bg-red-500 animate-pulse"
                              : parcial
                                ? "bg-amber-500"
                                : "bg-slate-200"
                        }`}
                      />
                      <p className="text-sm font-black text-slate-700 uppercase tracking-tight truncate">{m}</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-base font-black text-slate-600">
                        {previoInicio ? "-" : `$${montoDeEsteMes.toLocaleString()}`}
                      </p>
                      {pagado && (
                        <p className="text-[8px] font-black text-green-500 uppercase tracking-widest">PAGADO</p>
                      )}
                      {parcial && (
                        <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest">
                          PARCIAL · ${saldo.toLocaleString()}
                        </p>
                      )}
                      {atrasado && (
                        <p className="text-[8px] font-black text-red-500 uppercase tracking-widest">PENDIENTE</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-[#0F172A] text-white rounded-t-[2rem] flex-none shrink-0 border-t border-slate-800/50 shadow-[0_-8px_24px_rgba(15,23,42,0.25)]">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Honorarios</p>
                  <p className="text-base font-black text-green-400">
                    ${getTotalHonorariosCliente(selectedClient).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Adicionales {periodo.anio}</p>
                  <p className="text-base font-black text-violet-400">
                    ${getTotalAdicionalesAnio(selectedClient, periodo.anio).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Pendiente</p>
                  <p className="text-base font-black text-indigo-400">
                    ${getTotalPendiente(selectedClient, periodo).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {accesoCliente && (
        <ModalAccesoPortal
          cliente={accesoCliente}
          onClose={() => setAccesoCliente(null)}
        />
      )}

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
          setClienteAEliminar(null);
        }}
        onCancelar={() => setClienteAEliminar(null)}
      />

      <style jsx global>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
    </div>
  );
}