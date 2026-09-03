/**
 * LlévameQ — Configuración / Variables de entorno (frontend)
 * -----------------------------------------------------------
 * NINGÚN valor sensible (service_role key, tokens privados, API secrets)
 * debe colocarse aquí. Solo claves PÚBLICAS o placeholders.
 *
 * Reemplaza los valores marcados como "PENDIENTE_" con la información
 * oficial de LlévameQ antes de publicar a producción.
 */

window.LLEVAMEQ_CONFIG = {
  // Contacto oficial
  CONTACT_PHONE: "+57 321 795 5639",
  WHATSAPP_NUMBER: "573217955639", // formato E.164
  CONTACT_EMAIL: "LlevameQ@gmail.com",

  // Redes sociales — aún no creadas, se completan cuando existan
  FACEBOOK_URL: "PENDIENTE_FACEBOOK_URL",
  INSTAGRAM_URL: "PENDIENTE_INSTAGRAM_URL",
  TIKTOK_URL: "PENDIENTE_TIKTOK_URL",

  // Apps móviles
  GOOGLE_PLAY_URL: "", // dejar vacío hasta tener el enlace oficial -> se mostrará "Próximamente"
  APP_STORE_URL: "",   // dejar vacío hasta tener el enlace oficial -> se mostrará "Próximamente"

  // Backend / Supabase (SOLO valores públicos)
  API_BASE_URL: "PENDIENTE_API_BASE_URL",
  SUPABASE_URL: "https://hrtvetpxaviexbgqojic.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_LkNnfXN05j2k21ZPtGAtzA_38rdyJOp", // clave pública (anon), nunca la service_role

  // Mapas (la key real se recomienda restringir por dominio en la consola del proveedor)
  MAPS_PROVIDER_KEY: "PENDIENTE_MAPS_PROVIDER_KEY",

  // Analítica
  GOOGLE_ANALYTICS_ID: "PENDIENTE_GA_MEASUREMENT_ID",

  // Operación
  CIUDAD_OPERACION: "Quibdó, Chocó, Colombia",
};
