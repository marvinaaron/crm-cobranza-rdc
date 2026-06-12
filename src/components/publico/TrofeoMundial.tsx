/**
 * Representación gráfica del trofeo de la Copa del Mundo: un globo terráqueo
 * sostenido por dos figuras humanas estilizadas que se elevan en espiral
 * desde una base con bandas verde malaquita. Es una interpretación vectorial
 * (no la imagen literal) muy apegada a la silueta original.
 *
 * Animación opcional vía la clase `.mundial-trofeo` (flotación) definida en
 * globals.css. Pasa `animado` para activarla.
 */
export default function TrofeoMundial({
  className = "h-32 w-32",
  animado = false,
}: {
  className?: string;
  animado?: boolean;
}) {
  return (
    <svg
      className={`${className} ${animado ? "mundial-trofeo" : ""} drop-shadow-[0_10px_18px_rgba(146,90,10,0.35)]`}
      viewBox="0 0 200 380"
      fill="none"
      role="img"
      aria-label="Trofeo de la Copa del Mundo"
    >
      <defs>
        <linearGradient id="tm-oro" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="40%" stopColor="#fbbf24" />
          <stop offset="75%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id="tm-oro-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a16207" />
          <stop offset="18%" stopColor="#f59e0b" />
          <stop offset="45%" stopColor="#fde68a" />
          <stop offset="62%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>
        <linearGradient id="tm-oro-claro" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="100%" stopColor="#fcd34d" />
        </linearGradient>
        <radialGradient id="tm-globo" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="45%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
        <linearGradient id="tm-verde" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#065f46" />
        </linearGradient>
      </defs>

      {/* ── Base con bandas de malaquita ── */}
      <path d="M74 302 L126 302 L136 354 L64 354 Z" fill="url(#tm-oro)" />
      <path d="M72 312 L128 312 L131 328 L69 328 Z" fill="url(#tm-verde)" />
      <rect x="83" y="316" width="34" height="10" rx="1.5" fill="url(#tm-oro-claro)" />
      <path d="M68 334 L132 334 L135 348 L65 348 Z" fill="url(#tm-verde)" />
      <path d="M62 354 L138 354 L140 362 L60 362 Z" fill="url(#tm-oro)" />
      {/* Anillo de unión cuerpo-base */}
      <rect x="78" y="296" width="44" height="8" rx="3" fill="url(#tm-oro)" />

      {/* ── Cuerpo en espiral ── */}
      <path
        d="M58 96 C66 150 86 190 88 228 C89 255 82 272 78 298 L122 298 C118 272 111 255 112 228 C114 190 134 150 142 96 C128 108 112 113 100 113 C88 113 72 108 58 96 Z"
        fill="url(#tm-oro-body)"
      />
      {/* Costura central (efecto torcido) */}
      <path
        d="M100 113 C97 170 95 235 100 298"
        stroke="#92400e"
        strokeWidth="1.6"
        opacity="0.3"
        fill="none"
      />
      {/* Brillo de la espiral izquierda */}
      <path
        d="M83 109 C78 160 92 212 88 268"
        stroke="#fffbeb"
        strokeWidth="3.4"
        opacity="0.45"
        strokeLinecap="round"
        fill="none"
      />
      {/* Sombra de la espiral derecha */}
      <path
        d="M119 109 C125 160 110 212 114 270"
        stroke="#92400e"
        strokeWidth="2.6"
        opacity="0.25"
        strokeLinecap="round"
        fill="none"
      />
      {/* Figuras: brazos alzados que sostienen el globo */}
      <path
        d="M85 116 C88 104 95 100 100 105 C105 100 112 104 115 116"
        stroke="#fde68a"
        strokeWidth="2.2"
        opacity="0.7"
        fill="none"
        strokeLinecap="round"
      />

      {/* ── Globo terráqueo ── */}
      <circle cx="100" cy="62" r="47" fill="url(#tm-globo)" />
      {/* Líneas de meridiano/paralelo */}
      <path d="M100 15 A47 47 0 0 1 100 109" stroke="#92400e" strokeWidth="0.9" opacity="0.28" fill="none" />
      <path d="M100 15 A30 47 0 0 0 100 109" stroke="#92400e" strokeWidth="0.9" opacity="0.22" fill="none" />
      <path d="M55 62 A47 30 0 0 0 145 62" stroke="#92400e" strokeWidth="0.9" opacity="0.22" fill="none" />
      {/* Continentes insinuados */}
      <path
        d="M72 50 C82 44 92 48 94 58 C96 68 88 74 80 72 C70 70 66 58 72 50 Z"
        fill="#92400e"
        opacity="0.32"
      />
      <path
        d="M108 44 C120 42 128 50 124 60 C120 70 110 70 106 62 C103 56 103 48 108 44 Z"
        fill="#92400e"
        opacity="0.28"
      />
      <path
        d="M104 74 C112 72 118 78 114 86 C110 92 102 90 100 84 C99 80 100 76 104 74 Z"
        fill="#92400e"
        opacity="0.25"
      />
      {/* Reflejo del globo */}
      <ellipse cx="82" cy="44" rx="15" ry="11" fill="#fffbeb" opacity="0.5" />
    </svg>
  );
}
