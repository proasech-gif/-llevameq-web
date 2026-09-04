#!/bin/bash
set -e
cd "$(dirname "${BASH_SOURCE[0]}")"

declare -A TITLES=(
  [index]="Inicio"
  [pasajeros]="Pasajeros"
  [conductores]="Conductores"
  [seguridad]="Seguridad"
  [nosotros]="Sobre nosotros"
  [ayuda]="Centro de ayuda y preguntas frecuentes"
  [contacto]="Contacto"
  [noticias]="Noticias"
  [terminos]="Términos y condiciones"
  [privacidad]="Política de privacidad"
  [cookies]="Política de cookies"
  [404]="Página no encontrada"
)

declare -A DESCS=(
  [index]="LlévameQ: plataforma de transporte urbano en taxi y moto para Quibdó, Chocó. Pide tu viaje, compara propuestas y viaja seguro."
  [pasajeros]="Pide tu viaje en taxi o moto, compara propuestas de conductores y viaja con seguimiento en tiempo real con LlévameQ en Quibdó."
  [conductores]="Únete como conductor de LlévameQ en Quibdó. Recibe solicitudes, envía tu propuesta de precio y genera ingresos con tu taxi o moto."
  [seguridad]="Conoce las herramientas de seguridad de LlévameQ: botón SOS, compartir viaje, identificación del conductor y protección de datos."
  [nosotros]="Conoce la historia, misión, visión y valores de LlévameQ, la plataforma de movilidad urbana de Quibdó, Chocó."
  [ayuda]="Encuentra respuestas a las preguntas más frecuentes sobre LlévameQ para pasajeros y conductores."
  [contacto]="Contáctanos por WhatsApp, correo o formulario. LlévameQ opera en Quibdó, Chocó, Colombia."
  [noticias]="Noticias, novedades y actualizaciones de LlévameQ, la plataforma de transporte urbano de Quibdó."
  [terminos]="Términos y condiciones de uso de la plataforma LlévameQ."
  [privacidad]="Política de privacidad y tratamiento de datos personales de LlévameQ."
  [cookies]="Política de cookies del sitio web de LlévameQ."
  [404]="La página que buscas no existe o fue movida."
)

declare -A NAVKEY=(
  [index]="inicio"
  [pasajeros]="pasajeros"
  [conductores]="conductores"
  [seguridad]="seguridad"
  [nosotros]="nosotros"
  [ayuda]="ayuda"
  [contacto]="contacto"
)

for page in index pasajeros conductores seguridad nosotros ayuda contacto noticias terminos privacidad cookies 404; do
  title="${TITLES[$page]}"
  desc="${DESCS[$page]}"
  canonical="https://www.llevameq.com/${page}.html"
  if [ "$page" = "index" ]; then canonical="https://www.llevameq.com/"; fi

  head=$(sed -e "s#__TITLE__#${title}#g" -e "s#__DESC__#${desc}#g" -e "s#__CANONICAL__#${canonical}#g" -e "s#__ROOT__##g" partials/_head_header.html)
  content=$(cat "partials/content_${page}.html")
  footer=$(sed -e "s#__ROOT__##g" partials/_footer.html)

  nav="${NAVKEY[$page]:-}"
  if [ -n "$nav" ]; then
    head=$(printf '%s' "$head" | sed "s#data-nav=\"${nav}\"#data-nav=\"${nav}\" aria-current=\"page\"#")
  fi

  printf '%s\n%s\n%s\n' "$head" "$content" "$footer" > "${page}.html"
  echo "built ${page}.html"
done
