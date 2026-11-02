/**
 * Placeholders de carga del portal (skeleton).
 * Solo UI: no cambia datos ni rutas. Respeta prefers-reduced-motion vía CSS.
 */

import { portalInicioPage, portalPage } from "@/components/portal/portal-ui";

function Bone({ className = "" }: { className?: string }) {
  return <div className={`portal-skel-bone ${className}`} aria-hidden />;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-3">
      {children}
    </div>
  );
}

/** Inicio: saludo + cards, misma sensación de layout. */
export function PortalSkeletonInicio() {
  return (
    <div
      className={portalInicioPage}
      role="status"
      aria-busy="true"
      aria-label="Cargando inicio"
    >
      <header className="px-1 space-y-2">
        <Bone className="h-9 w-[72%] max-w-sm rounded-xl" />
        <Bone className="h-4 w-28 rounded-lg" />
      </header>

      <Card>
        <Bone className="h-3.5 w-24 rounded-md" />
        <div className="flex gap-3 pt-1">
          <Bone className="h-16 w-16 rounded-full shrink-0" />
          <Bone className="h-16 w-16 rounded-full shrink-0" />
          <Bone className="h-16 w-16 rounded-full shrink-0" />
          <Bone className="h-16 w-16 rounded-full shrink-0" />
        </div>
      </Card>

      <Card>
        <Bone className="h-3.5 w-28 rounded-md" />
        <Bone className="h-8 w-36 rounded-lg" />
        <Bone className="h-10 w-full rounded-xl" />
      </Card>

      <Card>
        <Bone className="h-3.5 w-32 rounded-md" />
        <Bone className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Bone key={i} className="h-8 rounded-lg" />
          ))}
        </div>
      </Card>
    </div>
  );
}

/** Declaraciones / cumplimiento. */
export function PortalSkeletonCumplimiento() {
  return (
    <div
      className={portalPage}
      role="status"
      aria-busy="true"
      aria-label="Cargando declaraciones"
    >
      <div className="px-1 space-y-2 mb-2">
        <Bone className="h-8 w-48 rounded-xl" />
        <Bone className="h-4 w-40 rounded-lg" />
      </div>
      <Card>
        <Bone className="h-4 w-36 rounded-md" />
        <Bone className="h-20 w-full rounded-xl" />
        <Bone className="h-12 w-full rounded-xl" />
        <Bone className="h-12 w-full rounded-xl" />
      </Card>
      <Card>
        <Bone className="h-4 w-28 rounded-md" />
        <Bone className="h-28 w-full rounded-xl" />
      </Card>
    </div>
  );
}

/** Honorarios. */
export function PortalSkeletonHonorarios() {
  return (
    <div
      className={portalPage}
      role="status"
      aria-busy="true"
      aria-label="Cargando honorarios"
    >
      <div className="px-1 space-y-2 mb-2">
        <Bone className="h-8 w-44 rounded-xl" />
        <Bone className="h-4 w-52 rounded-lg" />
      </div>
      <Card>
        <Bone className="h-3.5 w-24 rounded-md" />
        <Bone className="h-10 w-40 rounded-lg" />
        <Bone className="h-11 w-full rounded-xl" />
      </Card>
      <Card>
        <Bone className="h-4 w-32 rounded-md" />
        <div className="space-y-2">
          <Bone className="h-14 w-full rounded-xl" />
          <Bone className="h-14 w-full rounded-xl" />
          <Bone className="h-14 w-full rounded-xl" />
        </div>
      </Card>
    </div>
  );
}
