"use client";
import "./globals.css"; // Ruta corregida
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ClientesProvider, useClientes } from "@/context/ClientesContext";
import PeriodoSelector from "@/components/PeriodoSelector";

// --- ICONOS MINIMALISTAS (NUEVOS) ---
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const CobranzaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);

const CumplimientoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg>
);

/** En Cumplimiento el periodo del sidebar es fiscal (mes vencido); al entrar se alinea con abril en mayo, etc. */
function AdminPeriodoSync() {
  const pathname = usePathname();
  const { irAPeriodoFiscalVigente } = useClientes();

  useEffect(() => {
    if (pathname === "/cumplimiento") {
      irAPeriodoFiscalVigente();
    }
  }, [pathname, irAPeriodoFiscalVigente]);

  return null;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const esCumplimientoAdmin = pathname === "/cumplimiento";

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
    { name: "Mis Clientes", href: "/clientes", icon: <UsersIcon /> },
    { name: "Cobranza", href: "/cobranza", icon: <CobranzaIcon /> },
    { name: "Cumplimiento", href: "/cumplimiento", icon: <CumplimientoIcon /> },
  ];

  const isPortal = pathname?.startsWith("/portal");

  if (isPortal) {
    return (
      <html lang="es">
        <body className="min-h-screen bg-slate-50 antialiased">
          <ClientesProvider>{children}</ClientesProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="es">
      <body className="flex bg-slate-50 min-h-screen">
        <ClientesProvider>
        <AdminPeriodoSync />
        {/* BARRA LATERAL IZQUIERDA */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full shadow-sm">
          <div className="p-6 text-2xl font-black text-blue-600 border-b border-slate-100">
            RDC CRM
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                  pathname === item.href 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <span className={`${pathname === item.href ? "text-white" : "text-slate-400"}`}>
                  {item.icon}
                </span>
                <span className="font-semibold text-[15px]">{item.name}</span>
              </Link>
            ))}
          </nav>

          <PeriodoSelector modoFiscal={esCumplimientoAdmin} />
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
        </ClientesProvider>
      </body>
    </html>
  );
}