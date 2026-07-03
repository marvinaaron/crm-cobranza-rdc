#!/usr/bin/env bash
# Arranca el sitio en local de forma confiable (build + next start).
# next dev se cuelga en este entorno; este script siempre responde.
#
# Uso:
#   npm run local          → compila y arranca
#   npm run local:quick    → arranca sin recompilar (si ya existe .next)

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT=3000
HOST="0.0.0.0"
BASE="http://127.0.0.1:${PORT}"

echo "→ Deteniendo procesos en puertos 3000 y 3099…"
for port in 3000 3099; do
  pids=$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)
  if [ -n "$pids" ]; then
    kill $pids 2>/dev/null || true
    sleep 0.5
  fi
done

if [ "${SKIP_BUILD:-}" = "1" ] && [ -d .next ]; then
  echo "→ Usando compilación existente (.next)"
else
  echo "→ Compilando (npm run build)…"
  npm run build
fi

echo ""
echo "  ✓ Servidor listo. Abre en Safari:"
echo ""
echo "    ${BASE}/herramientas/rfc"
echo "    ${BASE}/"
echo ""
echo "  También funciona: http://localhost:${PORT}"
echo "  Detener: Ctrl+C"
echo ""

exec node node_modules/next/dist/bin/next start -H "$HOST" -p "$PORT"
