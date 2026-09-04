/**
 * LlévameQ — Contenido editable desde el panel admin (CMS)
 * ---------------------------------------------------------
 * Trae los textos e imágenes editables desde Supabase (tabla
 * sitio_web_contenido, lectura pública) y los aplica a cualquier
 * elemento marcado con data-cms="clave" en el HTML.
 *
 * También actualiza window.LLEVAMEQ_CONFIG con los campos de contacto
 * globales (teléfono, WhatsApp, correo, redes) para que main.js los
 * use igual que hace hoy con los valores de config.js.
 *
 * Si Supabase no está configurado (config.js aún dice "PENDIENTE_...")
 * o la petición falla, el sitio simplemente sigue mostrando el texto
 * que ya está escrito en el HTML — nunca se rompe la página por esto.
 */
(function () {
  "use strict";

  var cfg = window.LLEVAMEQ_CONFIG || {};

  // Mapa clave -> clave de window.LLEVAMEQ_CONFIG, para los campos
  // globales de contacto que main.js ya sabe usar.
  var MAPA_CONFIG_GLOBAL = {
    "global.contacto.telefono": "CONTACT_PHONE",
    "global.contacto.whatsapp": "WHATSAPP_NUMBER",
    "global.contacto.correo": "CONTACT_EMAIL",
    "global.redes.facebook": "FACEBOOK_URL",
    "global.redes.instagram": "INSTAGRAM_URL",
    "global.redes.tiktok": "TIKTOK_URL",
  };

  function aplicarContenido(filas) {
    var porClave = {};
    filas.forEach(function (fila) {
      porClave[fila.clave] = fila.valor;
    });

    // 1) Campos globales de contacto -> se mezclan en window.LLEVAMEQ_CONFIG
    Object.keys(MAPA_CONFIG_GLOBAL).forEach(function (clave) {
      if (porClave[clave]) {
        cfg[MAPA_CONFIG_GLOBAL[clave]] = porClave[clave];
      }
    });
    window.LLEVAMEQ_CONFIG = cfg;

    // 2) Cualquier elemento data-cms="clave" en la página actual.
    document.querySelectorAll("[data-cms]").forEach(function (el) {
      var clave = el.getAttribute("data-cms");
      var valor = porClave[clave];
      if (valor === undefined || valor === null || valor === "") return; // deja el texto original si no hay valor

      if (el.tagName === "IMG") {
        el.setAttribute("src", valor);
      } else if (el.hasAttribute("data-cms-html")) {
        // Solo para campos explícitamente marcados como HTML permitido
        // (por ejemplo, párrafos con saltos de línea <br>).
        el.innerHTML = valor;
      } else {
        el.textContent = valor;
      }
    });

    // 3) Enlaces cuyo destino (href) viene de una clave editable
    // (por ejemplo, el botón "Descargar para Android" con el link del APK).
    // Si no hay valor configurado, el elemento se oculta en vez de dejar
    // un enlace roto o un botón que no lleva a ningún lado.
    document.querySelectorAll("[data-cms-href]").forEach(function (el) {
      var clave = el.getAttribute("data-cms-href");
      var valor = porClave[clave];
      if (valor) {
        el.setAttribute("href", valor);
        el.style.display = "";
      } else if (el.hasAttribute("data-cms-oculta-si-vacio")) {
        el.style.display = "none";
      }
    });

    // 4) Códigos QR generados a partir de una clave editable con una URL.
    // Se dibujan con un servicio público de generación de QR (no requiere
    // librerías adicionales en el sitio). Si no hay URL configurada, todo
    // el bloque del QR se oculta.
    document.querySelectorAll("[data-cms-qr]").forEach(function (el) {
      var clave = el.getAttribute("data-cms-qr");
      var valor = porClave[clave];
      var contenedor = el.closest("[data-cms-qr-wrap]") || el.parentElement;
      if (valor) {
        var ancho = el.getAttribute("width") || "160";
        var alto = el.getAttribute("height") || "160";
        el.setAttribute(
          "src",
          "https://api.qrserver.com/v1/create-qr-code/?size=" + ancho + "x" + alto + "&data=" + encodeURIComponent(valor)
        );
        if (contenedor) contenedor.style.display = "";
      } else if (contenedor) {
        contenedor.style.display = "none";
      }
    });
  }

  function iniciar() {
    var url = cfg.SUPABASE_URL;
    var key = cfg.SUPABASE_ANON_KEY;

    if (!url || !key || url.indexOf("PENDIENTE") === 0 || key.indexOf("PENDIENTE") === 0) {
      // Supabase todavía no está configurado en config.js: no hacemos nada,
      // el sitio sigue funcionando con el texto fijo del HTML.
      return Promise.resolve();
    }

    var endpoint = url.replace(/\/$/, "") + "/rest/v1/sitio_web_contenido?select=clave,valor";

    return fetch(endpoint, {
      headers: {
        apikey: key,
        Authorization: "Bearer " + key,
      },
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Respuesta no válida de Supabase: " + res.status);
        return res.json();
      })
      .then(function (filas) {
        aplicarContenido(Array.isArray(filas) ? filas : []);
      })
      .catch(function (err) {
        // Nunca rompemos el sitio por esto: solo lo dejamos anotado en consola.
        console.warn("LlévameQ CMS: no se pudo cargar el contenido editable.", err);
      });
  }

  // main.js espera esta promesa antes de aplicar los valores de
  // contacto (data-contact-phone, data-whatsapp-link, etc.), así el
  // orden queda garantizado sin importar cuánto tarde la red.
  window.LLEVAMEQ_CMS_READY = iniciar();
})();
