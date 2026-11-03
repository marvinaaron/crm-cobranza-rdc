/**
 * Skeleton de navegación admin: se muestra mientras Next carga la ruta
 * (loading.tsx). Mantiene el chrome (sidebar/topbar) y evita el “pop” vacío.
 */

function Bone({ className = "" }: { className?: string }) {
  return <div className={`portal-skel-bone ${className}`} aria-hidden />;
}

export default function AdminPageSkeleton() {
  return (
    <div
      className="w-full max-w-7xl mx-auto"
      role="status"
      aria-busy="true"
      aria-label="Cargando página"
    >
      <header className="flex flex-col gap-3 mb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2 min-w-0">
          <Bone className="h-8 w-40 sm:w-52 rounded-xl" />
          <Bone className="h-4 w-28 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Bone className="h-10 w-10 rounded-full shrink-0" />
          <Bone className="h-10 w-10 rounded-full shrink-0" />
          <Bone className="h-10 w-28 rounded-full hidden sm:block" />
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[1.25rem] bg-white dark:bg-[#333336] p-4 space-y-3"
          >
            <Bone className="h-3 w-16 rounded-md" />
            <Bone className="h-7 w-24 rounded-lg" />
            <Bone className="h-3 w-20 rounded-md" />
          </div>
        ))}
      </div>

      <div className="rounded-[1.25rem] bg-white dark:bg-[#333336] overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100/80 dark:border-transparent flex gap-3">
          <Bone className="h-4 w-24 rounded-md" />
          <Bone className="h-4 w-16 rounded-md" />
          <Bone className="h-4 w-20 rounded-md hidden sm:block" />
        </div>
        <ul className="divide-y divide-slate-50 dark:divide-transparent">
          {Array.from({ length: 8 }).map((_, i) => (
            <li
              key={i}
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ animationDelay: `${40 + i * 35}ms` }}
            >
              <Bone className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <Bone className="h-3.5 w-[55%] max-w-[14rem] rounded-md" />
                <Bone className="h-3 w-[35%] max-w-[9rem] rounded-md" />
              </div>
              <Bone className="h-6 w-16 rounded-full shrink-0" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
