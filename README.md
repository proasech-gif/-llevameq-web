# LlévameQ — Sitio web oficial

Sitio web corporativo de LlévameQ, plataforma de movilidad urbana en taxi y moto para Quibdó, Chocó, Colombia. Construido como sitio estático (HTML + CSS + JS), sin frameworks ni build step, para que sea 100% funcional de inmediato y fácil de desplegar en cualquier hosting.

## 0. Qué se revisó antes de construir (auditoría)

Se analizaron los proyectos reales subidos por el equipo:
- **App Pasajero** (Expo / React Native + Supabase): de aquí salió el logo oficial (`assets/logo-llevameq.png`), la paleta de marca real (`constants/theme.ts` → objeto `Brand`), y el modelo de negocio real: el pasajero recibe **propuestas de precio de varios conductores** (no asignación automática), hay **dos tipos de vehículo (Taxi y Moto)**, los conductores tienen **categorías por calificación** (Cobre → Diamante), y **no existe pasarela de pago en línea** (pago directo/efectivo).
- **App Admin** (Next.js + Supabase): confirmó el modelo de datos y la regla de negocio de "sin Wompi para pagos de la plataforma".
- No se abrió ni se copió ningún archivo `.env.local` ni credencial privada. Ninguna clave secreta fue incluida en este sitio.

Este sitio web es un proyecto nuevo (no existía previamente); se construyó desde cero respetando esa identidad y ese modelo de negocio real, sin inventar funciones que la plataforma no tiene todavía.

## 1. Estructura del proyecto

```
/
├── index.html            Inicio
├── pasajeros.html
├── conductores.html      Incluye el formulario de registro de conductor (#registro)
├── seguridad.html
├── nosotros.html
├── ayuda.html             Centro de ayuda + FAQ con buscador
├── contacto.html
├── noticias.html          Placeholder listo para conectar un CMS/blog
├── terminos.html
├── privacidad.html
├── cookies.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── css/styles.css         Sistema de diseño (colores, tipografía, componentes)
├── js/main.js             Menú móvil, acordeón FAQ, validación y envío de formularios
├── js/config.js           Variables configurables (ver sección 3)
├── assets/                Logo y favicon oficiales (tomados de la app real)
└── partials/, build.sh    Plantillas fuente usadas para generar las páginas
                            (header, footer y contenido de cada página por separado,
                            útiles si vas a seguir editando el sitio)
```

## 2. Cómo ejecutarlo localmente

No requiere instalación. Dos opciones:

1. Abrir `index.html` directamente en el navegador, **o**
2. Servirlo con cualquier servidor estático simple, por ejemplo:
   ```bash
   npx serve .
   # o
   python3 -m http.server 8080
   ```

## 3. Variables configurables (`js/config.js`)

Antes de publicar a producción, reemplaza los valores `"PENDIENTE_..."` con la información oficial:

| Variable | Uso |
|---|---|
| `CONTACT_PHONE`, `CONTACT_EMAIL` | Se muestran en Contacto y Footer |
| `WHATSAPP_NUMBER` | Formato E.164 (ej: `573001234567`). Activa todos los botones de WhatsApp del sitio |
| `FACEBOOK_URL`, `INSTAGRAM_URL`, `TIKTOK_URL` | Redes sociales |
| `GOOGLE_PLAY_URL`, `APP_STORE_URL` | Mientras estén vacíos, los botones muestran "Próximamente disponible" y quedan deshabilitados |
| `API_BASE_URL` | URL del backend propio, cuando se conecten los formularios |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | **Solo la clave pública (anon)**, nunca la `service_role` |
| `MAPS_PROVIDER_KEY` | Restringir por dominio en la consola del proveedor (Google Maps/Mapbox) |
| `GOOGLE_ANALYTICS_ID` | Medición de visitas y conversiones |

**Nunca** se debe colocar una `service_role key`, un token privado o un secreto de backend en este archivo: es código que corre en el navegador del usuario.

## 4. Funcionalidades terminadas y REALES (ya conectadas a Supabase)

- Navegación completa entre las 12 páginas, menú móvil funcional.
- Acordeón de preguntas frecuentes + buscador de FAQ en tiempo real.
- **Formulario de registro de conductor**: guarda de verdad en la tabla `conductor_solicitudes` de Supabase, incluyendo la subida de licencia, tarjeta de propiedad y SOAT al bucket privado `conductor-documentos`.
- **Formulario de contacto**: guarda de verdad en la tabla `mensajes_contacto` de Supabase.
- **Contenido editable (CMS)**: los textos principales del sitio (marcados con `data-cms`) se cargan desde la tabla `sitio_web_contenido` de Supabase, editable desde App Admin.
- **Noticias**: la página consulta la tabla `noticias_sitio` (solo artículos con `publicado = true`) y muestra el mensaje "Muy pronto" automáticamente mientras esté vacía.
- Botones de WhatsApp, descarga de app y redes sociales que se activan/desactivan automáticamente según `config.js`.
- SEO on-page, sitemap, robots.txt, 404 personalizada, accesibilidad y diseño responsive.

## 5. Funcionalidades que requieren backend (pendientes)

Los formularios están **listos para conectarse** pero hoy solo simulan el envío (no se pierden datos, pero tampoco se guardan). El punto exacto de integración está marcado con `TODO(backend)` en `js/main.js`, dentro de `initFormValidation`.

Pendiente de conectar:
- [ ] Pantalla en App Admin para ver y **aceptar/rechazar** las solicitudes de `conductor_solicitudes` (siguiente paso que vamos a construir).
- [ ] Pantalla en App Admin para ver los mensajes de `mensajes_contacto`.
- [ ] Publicar artículos reales en la tabla `noticias_sitio` (desde Supabase directamente o desde App Admin).
- [ ] Autenticación de usuarios (si el sitio llega a tener zona de cuenta).
- [ ] Mapa real (Google Maps/Mapbox) en las secciones visuales — hoy son ilustraciones/fotos, no mapas interactivos.
- [ ] Analítica real (Google Analytics / Search Console) — falta el ID de medición.

## 6. Cómo desplegarlo a producción

Es un sitio 100% estático: cualquiera de estas opciones funciona sin cambios de código:

1. **Netlify / Vercel (estático)**: arrastra la carpeta o conéctala a un repositorio Git. Build command: ninguno. Publish directory: `/`.
2. **Hosting tradicional (cPanel, etc.)**: sube todos los archivos vía FTP/SFTP a la raíz del dominio.
3. **Supabase Storage / bucket estático + CDN**: también es compatible.

Recomendación de infraestructura para producción:
- Hosting estático con CDN (Netlify, Vercel o Cloudflare Pages) para el sitio.
- Backend/API y base de datos: reutilizar el proyecto Supabase existente de LlévameQ (no crear uno nuevo).
- Dominio propio con HTTPS (certificado automático en cualquiera de las opciones anteriores).

## 7. Checklist de lanzamiento

- [ ] Reemplazar todos los valores `PENDIENTE_...` en `js/config.js`
- [ ] Confirmar enlaces oficiales de Google Play / App Store
- [ ] Conectar los formularios al backend/Supabase real
- [ ] Revisar los textos legales (`terminos.html`, `privacidad.html`, `cookies.html`) con un abogado colombiano
- [ ] Configurar Google Analytics y Google Search Console
- [ ] Configurar dominio propio y HTTPS
- [ ] Probar navegación, formularios y menú móvil en un dispositivo real
- [ ] Verificar SEO (title, description, sitemap) en Search Console tras publicar
