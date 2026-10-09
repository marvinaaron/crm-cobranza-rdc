# Google Search Console · Propiedad de dominio (Opción C)

Cubre **www** y **sin www** con una sola propiedad: `rdcontadores.com`.

**Tiempo estimado:** 15–20 min (la verificación DNS puede tardar unos minutos u horas).

---

## Antes de empezar

- Tu sitio ya redirige `rdcontadores.com` → `www.rdcontadores.com` (Vercel).
- La versión canónica del código es **`https://www.rdcontadores.com`**.
- En Vercel → **Settings → Environment Variables**, confirma:
  - `NEXT_PUBLIC_DESPACHO_SITIO` = `https://www.rdcontadores.com`
- Si sigue en `https://rdcontadores.com` (sin www), cámbialo y redeploy.

---

## Paso 1 · Agregar la propiedad de dominio

1. Entra a [Google Search Console](https://search.google.com/search-console).
2. Arriba a la izquierda, abre el selector de propiedades.
3. **+ Añadir propiedad**.
4. Elige la pestaña **Dominio** (no “Prefijo de URL”).
5. Escribe solo:
   ```
   rdcontadores.com
   ```
   (sin `https://`, sin `www`, sin `/`).
6. **Continuar**.

---

## Paso 2 · Verificación por DNS (TXT)

Google te mostrará un registro **TXT** parecido a:

| Tipo | Nombre / Host | Valor |
|------|----------------|-------|
| TXT | `@` o `rdcontadores.com` | `google-site-verification=XXXXXXXX...` |

### Dónde agregarlo

En el panel donde compraste o administras el dominio (GoDaddy, Namecheap, Cloudflare, Google Domains, etc.):

1. **DNS** / **Zona DNS** / **Manage DNS**.
2. **Añadir registro** → tipo **TXT**.
3. **Host / Name:**
   - Muchos proveedores: `@` o dejar vacío = raíz del dominio.
   - Cloudflare: `@`.
4. **Valor:** pega **todo** el texto que dio Google (incluye `google-site-verification=`).
5. TTL: automático o 3600.
6. Guarda.

### Volver a Search Console

1. Espera **5–30 min** (a veces hasta 48 h).
2. En Search Console → **Verificar**.
3. Si falla: revisa que no haya otro TXT de verificación viejo en conflicto; espera propagación DNS.

---

## Paso 3 · Sitemap (una sola vez)

Con la propiedad **Dominio** ya verificada:

1. Menú izquierdo → **Sitemaps**.
2. En “Añadir un sitemap nuevo”, envía la URL completa:
   ```
   https://www.rdcontadores.com/sitemap.xml
   ```
   (también puedes probar solo `sitemap.xml` si Google lo acepta en tu cuenta).
3. Estado esperado: **Correcto** y ~13 URLs descubiertas.

---

## Paso 4 · Inspección de URLs (INPC y herramientas)

Usa siempre la versión **www** (coincide con la redirección y el sitemap):

| Página | URL a inspeccionar |
|--------|-------------------|
| INPC | `https://www.rdcontadores.com/herramientas/inpc` |
| ISR 2026 | `https://www.rdcontadores.com/herramientas/isr-2026` |
| UMA | `https://www.rdcontadores.com/herramientas/uma` |
| Salario mínimo | `https://www.rdcontadores.com/herramientas/salario-minimo-2026` |
| Recargos | `https://www.rdcontadores.com/herramientas/recargos-federales` |
| Tipo de cambio | `https://www.rdcontadores.com/herramientas/tipo-de-cambio` |
| Índice herramientas | `https://www.rdcontadores.com/herramientas` |

En cada una:

1. Barra superior → pegar URL → Enter.
2. Si dice **“La URL no está en Google”** → **Solicitar indexación**.
3. Si ya está indexada, no hace falta repetir.

**No hace falta** inspeccionar la misma página con y sin `www`: el dominio ya cubre ambas.

---

## Paso 5 · Propiedad antigua (sin www)

La propiedad **Prefijo de URL** `https://rdcontadores.com/` puede quedarse o eliminarse:

- **Recomendado:** usar solo **Dominio** `rdcontadores.com` para reportes y sitemap.
- La antigua puedes ignorarla o borrarla cuando la de dominio ya muestre datos (evita duplicar trabajo).

---

## Qué esperar después

| Plazo | Qué verás |
|-------|-----------|
| 24–48 h | Search Console deja de decir “procesando datos” en Indexación. |
| 2–5 días | URLs pasan a “Indexadas” tras solicitar indexación. |
| 2–4 semanas | Posibles impresiones/clics en búsquedas (“INPC 2026”, etc.). |

---

## Comprobaciones rápidas (producción)

Abre en el navegador:

- `https://www.rdcontadores.com/sitemap.xml` → debe listar URLs con `https://www.rdcontadores.com/...`
- `https://www.rdcontadores.com/robots.txt` → `Sitemap: https://www.rdcontadores.com/sitemap.xml`
- `https://rdcontadores.com/herramientas/inpc` → debe redirigir a la URL con `www`

---

## Si la verificación DNS no funciona

- ¿El dominio está en **Cloudflare** con proxy naranja? El TXT en la raíz `@` suele bastar; no hace falta proxy para TXT.
- ¿Compraste el dominio en **Vercel Domains**? DNS → añadir registro TXT ahí.
- Usa [https://dnschecker.org](https://dnschecker.org) → tipo TXT → `rdcontadores.com` y busca `google-site-verification`.

---

*Documento interno RDC · Mayo 2026*
