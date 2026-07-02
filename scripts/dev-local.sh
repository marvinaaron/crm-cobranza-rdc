#!/usr/bin/env bash
# Arranca UN solo servidor de desarrollo en http://127.0.0.1:3000
# Uso: npm run dev:fresh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ Deteniendo procesos Next en puertos 3000 y 3099 (si existen)…"
for port in 3000 3099; do
  pids=$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)
  if [ -n "$pids" ]; then
    kill $pids 2>/dev/null || true
    sleep 0.5
  fi
done

echo "→ Limpiando caché de compilación (.next)…"
rm -rf .next

echo ""
echo "  Local:  http://127.0.0.1:3000"
echo "  Admin:  http://127.0.0.1:3000/acceso/consola-rdc"
echo "  Firmas: http://127.0.0.1:3000/efirmas"
echo ""
echo "  Usa SIEMPRE 127.0.0.1 (no localhost ni otro puerto)."
echo "  Recarga forzada: Cmd+Shift+R"
echo ""

exec npm run dev:local
