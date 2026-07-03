-- Uso por calculadora (3 intentos gratis por herramienta)
CREATE TABLE IF NOT EXISTS herramientas_calculadora_uso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  herramienta TEXT NOT NULL CHECK (herramienta IN ('rfc', 'resico', 'facturacion', 'vencimiento')),
  identificador TEXT NOT NULL,
  intentos_usados INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (herramienta, identificador)
);

CREATE INDEX IF NOT EXISTS idx_herramientas_calculadora_uso_lookup
  ON herramientas_calculadora_uso (herramienta, identificador);
