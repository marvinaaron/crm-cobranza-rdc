# Checklist de pruebas antes de abrir a clientes

Marca cada ítem cuando lo hayas probado en **producción** (www.rdcontadores.com), no solo en local.

**Responsable:** _______________  
**Fecha:** _______________

---

## A. Infraestructura (una sola vez)

| # | Prueba | ✓ | Notas |
|---|--------|---|-------|
| A1 | Migración SQL `cliente_efirma` aplicada en Supabase producción | ☐ | |
| A2 | Bucket `efirmas` creado (`node scripts/setup-storage.mjs`) | ☐ | |
| A3 | Variables Vercel: VAPID, BANXICO, RESEND, Supabase OK | ☐ | |
| A4 | `/aviso-de-privacidad` carga correctamente | ☐ | |
| A5 | Footer del sitio enlaza a aviso de privacidad | ☐ | |

---

## B. Admin — sesión y navegación

| # | Prueba | ✓ | Notas |
|---|--------|---|-------|
| B1 | Login admin: `/acceso/consola-rdc` | ☐ | |
| B2 | Menú móvil abre/cierra sin tapar contenido | ☐ | |
| B3 | Campana de notificaciones arriba a la derecha (móvil) | ☐ | |
| B4 | Cierre de sesión tras 30 min inactividad (opcional: esperar) | ☐ | |

---

## C. Admin — E.firmas (nueva sección)

| # | Prueba | ✓ | Notas |
|---|--------|---|-------|
| C1 | Entrar a **E.firmas** en el menú lateral | ☐ | |
| C2 | Subir `.cer` de un cliente de prueba → lee titular y fecha de vencimiento | ☐ | |
| C3 | Subir `.key` opcional del mismo cliente | ☐ | |
| C4 | Barra amarillo→rojo aparece si vence en ≤30 días | ☐ | |
| C5 | Botón **Avisar** envía correo al email del cliente | ☐ | |
| C6 | Cliente recibe notificación en campana (portal) si está en ventana 30d | ☐ | |
| C7 | Eliminar registro de e.firma funciona | ☐ | |

---

## D. Portal cliente — acceso

| # | Prueba | ✓ | Notas |
|---|--------|---|-------|
| D1 | Login con usuario/contraseña de cliente de prueba | ☐ | |
| D2 | **Recuperar contraseña:** `/portal/recuperar` con tu correo de prueba | ☐ | |
| D3 | Llega correo con clave temporal (revisar spam) | ☐ | |
| D4 | Entrar con clave temporal y cambiar contraseña | ☐ | |
| D5 | Enlace a aviso de privacidad en pie del portal | ☐ | |

---

## E. Portal cliente — funcionalidad

| # | Prueba | ✓ | Notas |
|---|--------|---|-------|
| E1 | Inicio muestra resumen sin errores | ☐ | |
| E2 | Si e.firma por vencer: banner + barra en Inicio | ☐ | |
| E3 | Cumplimiento: ver periodo, documentos | ☐ | |
| E4 | Honorarios: ver estado / subir comprobante | ☐ | |
| E5 | Perfil: activar notificaciones push (iPhone Safari) | ☐ | |
| E6 | Añadir portal a pantalla de inicio (PWA) | ☐ | |

---

## F. Flujo completo punta a punta (recomendado contigo mismo)

Usa **un cliente ficticio** o tu propia cuenta de prueba:

| # | Paso | ✓ | Notas |
|---|------|---|-------|
| F1 | Admin: dar de alta / activar cliente con email real tuyo | ☐ | |
| F2 | Admin: crear acceso al portal y enviar credenciales | ☐ | |
| F3 | Cliente: primer login y cambio de clave | ☐ | |
| F4 | Admin: subir e.firma .cer del cliente de prueba | ☐ | |
| F5 | Admin: pulsar Avisar → revisar correo y portal cliente | ☐ | |
| F6 | Admin: registrar pago en Cobranza | ☐ | |
| F7 | Cliente: ver notificación de pago / comprobante | ☐ | |
| F8 | Admin: avance en Cumplimiento → cliente ve actualización | ☐ | |

---

## G. Móvil (iPhone recomendado)

| # | Prueba | ✓ | Notas |
|---|--------|---|-------|
| G1 | Cumplimiento admin: tarjetas, sin bloque blanco a la izquierda | ☐ | |
| G2 | Cobranza admin: tarjetas responsivas | ☐ | |
| G3 | Clientes admin: tarjetas responsivas | ☐ | |
| G4 | Ícono PWA admin (violeta) tras reinstalar en modo claro/oscuro | ☐ | |

---

## H. Sitio público (SEO / Google)

| # | Prueba | ✓ | Notas |
|---|--------|---|-------|
| H1 | `/herramientas/inpc` carga | ☐ | |
| H2 | `/sitemap.xml` sin error 500 | ☐ | |
| H3 | Search Console: propiedad **Dominio** `rdcontadores.com` verificada (TXT DNS) | ☐ | Ver `docs/SEO-SEARCH-CONSOLE-DOMINIO.md` |
| H4 | Sitemap enviado: `https://www.rdcontadores.com/sitemap.xml` | ☐ | |
| H5 | INPC inspeccionado + indexación solicitada (URL con **www**) | ☐ | |

---

## Incidencias encontradas

| Fecha | Qué falló | Severidad | Resuelto |
|-------|-----------|-----------|----------|
| | | | ☐ |
| | | | ☐ |

---

## Veredicto

- [ ] **Listo para piloto** (3–5 clientes reales con soporte cercano)
- [ ] **Falta corregir** (anotar arriba antes de abrir)

---

*Documento interno RDC · Actualizado mayo 2026*
