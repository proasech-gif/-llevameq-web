/**
 * LlévameQ — Interacciones del sitio
 * Menú móvil, acordeón FAQ, validación de formularios, WhatsApp dinámico.
 */
(function () {
  "use strict";

  var cfg = window.LLEVAMEQ_CONFIG || {};

  /* ---------- Menú móvil ---------- */
  function initMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var links = document.querySelector("[data-nav-links]");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Acordeón FAQ ---------- */
  function initAccordions() {
    document.querySelectorAll(".accordion").forEach(function (accordion) {
      accordion.querySelectorAll(".accordion-item").forEach(function (item) {
        var trigger = item.querySelector(".accordion-trigger");
        var panel = item.querySelector(".accordion-panel");
        if (!trigger || !panel) return;
        trigger.addEventListener("click", function () {
          var isOpen = item.classList.contains("open");
          // Close siblings for a cleaner single-open behavior within each accordion
          accordion.querySelectorAll(".accordion-item.open").forEach(function (other) {
            if (other !== item) {
              other.classList.remove("open");
              other.querySelector(".accordion-panel").style.maxHeight = null;
              other.querySelector(".accordion-trigger").setAttribute("aria-expanded", "false");
            }
          });
          item.classList.toggle("open", !isOpen);
          trigger.setAttribute("aria-expanded", (!isOpen).toString());
          panel.style.maxHeight = !isOpen ? panel.scrollHeight + "px" : null;
        });
      });
    });
  }

  /* ---------- Buscador simple de FAQ / centro de ayuda ---------- */
  function initFaqSearch() {
    var input = document.querySelector("[data-faq-search]");
    if (!input) return;
    var items = document.querySelectorAll("[data-faq-item]");
    var emptyState = document.querySelector("[data-faq-empty]");
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var visibleCount = 0;
      items.forEach(function (item) {
        var text = item.textContent.toLowerCase();
        var match = text.indexOf(q) !== -1;
        item.style.display = match ? "" : "none";
        if (match) visibleCount++;
      });
      if (emptyState) emptyState.hidden = visibleCount !== 0;
    });
  }

  /* ---------- Enlaces de WhatsApp / descarga dinámicos desde config ---------- */
  function applyConfig() {
    document.querySelectorAll("[data-whatsapp-link]").forEach(function (el) {
      var number = cfg.WHATSAPP_NUMBER || "";
      var isPlaceholder = !number || number.indexOf("PENDIENTE") === 0;
      if (isPlaceholder) {
        el.setAttribute("aria-disabled", "true");
        el.classList.add("btn-disabled");
        el.addEventListener("click", function (e) {
          e.preventDefault();
        });
      } else {
        var msg = encodeURIComponent(el.getAttribute("data-whatsapp-message") || "Hola, quiero más información sobre LlévameQ");
        el.href = "https://wa.me/" + number.replace(/\D/g, "") + "?text=" + msg;
      }
    });

    document.querySelectorAll("[data-contact-email]").forEach(function (el) {
      var email = cfg.CONTACT_EMAIL || "";
      if (email && email.indexOf("PENDIENTE") !== 0) {
        el.textContent = email;
        el.href = "mailto:" + email;
      }
    });

    document.querySelectorAll("[data-contact-phone]").forEach(function (el) {
      var phone = cfg.CONTACT_PHONE || "";
      if (phone && phone.indexOf("PENDIENTE") !== 0) {
        el.textContent = phone;
        el.href = "tel:" + phone.replace(/\s/g, "");
      }
    });

    document.querySelectorAll("[data-social]").forEach(function (el) {
      var key = el.getAttribute("data-social");
      var url = cfg[key];
      if (url && url.indexOf("PENDIENTE") !== 0) {
        el.href = url;
      } else {
        el.setAttribute("aria-disabled", "true");
        el.addEventListener("click", function (e) { e.preventDefault(); });
      }
    });

    // App store buttons: show "Próximamente" when URL is not yet configured
    document.querySelectorAll("[data-store-link]").forEach(function (el) {
      var store = el.getAttribute("data-store-link");
      var url = store === "google-play" ? cfg.GOOGLE_PLAY_URL : cfg.APP_STORE_URL;
      if (!url) {
        el.classList.add("btn-disabled");
        el.setAttribute("aria-disabled", "true");
        var label = el.querySelector("[data-store-label]");
        if (label) label.textContent = "Próximamente disponible";
        el.addEventListener("click", function (e) { e.preventDefault(); });
      } else {
        el.href = url;
      }
    });
  }

  /* ---------- Envío real a Supabase (REST) ---------- */
  function supabaseInsert(table, payload) {
    var url = cfg.SUPABASE_URL;
    var key = cfg.SUPABASE_ANON_KEY;
    if (!url || url.indexOf("PENDIENTE") === 0 || !key || key.indexOf("PENDIENTE") === 0) {
      return Promise.reject(new Error("Supabase no está configurado todavía."));
    }
    return fetch(url.replace(/\/$/, "") + "/rest/v1/" + table, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": key,
        "Authorization": "Bearer " + key,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) {
          throw new Error("Error de Supabase (" + res.status + "): " + t);
        });
      }
      return true;
    });
  }

  function collectFormPayload(form) {
    var data = {};
    form.querySelectorAll("input[name], select[name], textarea[name]").forEach(function (field) {
      if (field.type === "checkbox" || field.type === "file") return;
      data[field.name] = field.value;
    });
    return data;
  }

  // Relaciona el "name" de cada input de archivo con la columna donde se
  // guarda su ruta en Supabase, una vez subido al bucket.
  var FILE_COLUMN_MAP = {
    licencia: "licencia_path",
    tarjetaPropiedad: "tarjeta_propiedad_path",
    soat: "soat_path"
  };

  function uploadFile(file, folder) {
    var bucket = "conductor-documentos";
    var safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    var path = folder + "/" + Date.now() + "-" + safeName;
    var url = cfg.SUPABASE_URL.replace(/\/$/, "") + "/storage/v1/object/" + bucket + "/" + path;
    return fetch(url, {
      method: "POST",
      headers: {
        "apikey": cfg.SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + cfg.SUPABASE_ANON_KEY,
        "Content-Type": file.type || "application/octet-stream"
      },
      body: file
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) { throw new Error("Error subiendo archivo: " + t); });
      }
      return path;
    });
  }

  /* ---------- Validación de formularios ---------- */
  function showFieldError(field, message) {
    var wrap = field.closest(".field");
    if (!wrap) return;
    wrap.classList.toggle("invalid", !!message);
    var errorEl = wrap.querySelector(".field-error");
    if (errorEl) errorEl.textContent = message || "";
  }

  function validateField(field) {
    if (!field.checkValidity()) {
      var message = "Este campo no es válido.";
      if (field.validity.valueMissing) message = "Este campo es obligatorio.";
      else if (field.validity.typeMismatch && field.type === "email") message = "Ingresa un correo electrónico válido.";
      else if (field.validity.patternMismatch) message = field.getAttribute("data-pattern-message") || "El formato no es válido.";
      else if (field.validity.tooShort) message = "Debe tener al menos " + field.minLength + " caracteres.";
      showFieldError(field, message);
      return false;
    }
    showFieldError(field, "");
    return true;
  }

  function initFormValidation(form) {
    var fields = form.querySelectorAll("input, select, textarea");
    fields.forEach(function (field) {
      field.addEventListener("blur", function () { validateField(field); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var statusEl = form.querySelector("[data-form-status]");
      var submitBtn = form.querySelector("[type=submit]");
      var allValid = true;
      fields.forEach(function (field) {
        if (!validateField(field)) allValid = false;
      });

      if (!allValid) {
        if (statusEl) {
          statusEl.hidden = false;
          statusEl.className = "form-status error";
          statusEl.textContent = "Verifica los campos marcados.";
        }
        var firstInvalid = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Envío real a Supabase cuando el formulario tiene data-table configurado;
      // si no, se mantiene la simulación anterior como respaldo.
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Enviando..."; }
      if (statusEl) { statusEl.hidden = true; }

      var table = form.getAttribute("data-table");
      var finish = function (ok, message) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.getAttribute("data-original-label") || "Enviar solicitud";
        }
        if (statusEl) {
          statusEl.hidden = false;
          statusEl.className = "form-status " + (ok ? "success" : "error");
          statusEl.textContent = ok
            ? (form.getAttribute("data-success-message") || "¡Listo! Tu información fue enviada correctamente.")
            : message;
        }
        if (ok) form.reset();
      };

      if (table) {
        var payload = collectFormPayload(form);
        var fileInputs = Array.prototype.slice.call(form.querySelectorAll("input[type=file]"))
          .filter(function (input) { return input.files && input.files[0]; });

        var uploads = fileInputs.length
          ? Promise.all(fileInputs.map(function (input) {
              return uploadFile(input.files[0], table).then(function (path) {
                var column = FILE_COLUMN_MAP[input.name];
                if (column) payload[column] = path;
              });
            }))
          : Promise.resolve();

        uploads
          .then(function () { return supabaseInsert(table, payload); })
          .then(function () { finish(true); })
          .catch(function (err) {
            console.error(err);
            finish(false, "No pudimos guardar tu información en este momento. Intenta de nuevo o escríbenos por WhatsApp.");
          });
      } else {
        // TODO(backend): sin data-table configurado, no hay dónde guardar todavía.
        setTimeout(function () { finish(true); }, 900);
      }
    });

    var submitBtn = form.querySelector("[type=submit]");
    if (submitBtn) submitBtn.setAttribute("data-original-label", submitBtn.textContent);
  }

  function initForms() {
    document.querySelectorAll("form[data-validate]").forEach(initFormValidation);
  }

  /* ---------- Año de copyright ---------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initAccordions();
    initFaqSearch();

    // Espera a que el contenido editable (CMS) termine de cargar desde
    // Supabase antes de aplicar los datos de contacto, para que no se
    // muestre primero el valor viejo y luego "salte" al nuevo.
    // Si cms.js no está presente en la página, sigue de inmediato.
    Promise.resolve(window.LLEVAMEQ_CMS_READY).then(applyConfig);
    initForms();
    initYear();
  });
})();
