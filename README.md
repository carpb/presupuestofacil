# PresupuestoFácil — versión de lanzamiento

Aplicación web para crear presupuestos profesionales en PDF, sin registro y con almacenamiento local en el navegador.

## Antes de publicar

1. Copia `.env.example` como `.env.local`.
2. Sustituye `NEXT_PUBLIC_SITE_URL` por el dominio definitivo.
3. Sustituye los datos `[NOMBRE/EMPRESA]`, `[NIF]`, `[DOMICILIO]` y `[EMAIL]` de las páginas legales/contacto.
4. Revisa las políticas legales con tus datos y tu situación real antes de publicar.
5. Ejecuta `npm install` y después `npm run build`.
6. Ejecuta `npm test`.
7. Publica la aplicación con HTTPS.
8. Añade el dominio a Google Search Console y envía `/sitemap.xml`.

## AdSense

La aplicación ya tiene los espacios publicitarios y la integración preparada, pero los anuncios permanecen desactivados mientras `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` esté vacío.

Cuando AdSense apruebe el sitio:

- Configura el ID de editor.
- Puedes usar Auto ads o rellenar los IDs de bloques manuales.
- Configura Google Privacy & messaging/CMP para usuarios del EEE, Reino Unido y Suiza según la configuración real del sitio.
- Configura Ad blocking recovery desde AdSense si quieres usarlo.
- `/ads.txt` se genera automáticamente cuando existe `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`.

## SEO

Incluye metadata, canonical, Open Graph, JSON-LD de WebApplication, `robots.txt` y `sitemap.xml`. El dominio definitivo debe configurarse antes de enviar el sitemap a Search Console.

## Importante

Los textos legales incluidos son plantillas editables y no constituyen asesoramiento jurídico. Deben completarse y revisarse antes del lanzamiento.
