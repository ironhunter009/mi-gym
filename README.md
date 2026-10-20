# Mi Gym

App web (PWA) para ver ejercicios por zona, con pasos en español, consejos de técnica y una rutina semanal.

- 1.324 ejercicios de [exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) (MIT).
- Las miniaturas y animaciones se cargan una a una desde ese repositorio (commit fijo) y el service worker las guarda en el dispositivo: cada imagen se descarga una sola vez.
- Rutina, favoritos y perfil se guardan en el navegador. Para pasarlos a otro dispositivo: Perfil → Copia de seguridad.
- Animaciones © Gym visual — https://gymvisual.com/

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La app completa (HTML, CSS y JS) |
| `data.json` | Los ejercicios: nombre, músculo, equipo y pasos en español |
| `sw.js` | Service worker: caché de la app y de las imágenes, uso sin conexión |
| `manifest.webmanifest`, `icons/` | Para instalarla en la pantalla de inicio |

No necesita build: es un sitio estático.

## Publicar

**Vercel:** sube esta carpeta a un repositorio de GitHub → en vercel.com, *Add New → Project* → importa el repositorio → *Deploy* (Framework Preset: Other, sin comando de build). Cada `git push` vuelve a publicar.

**GitHub Pages:** en el repositorio, *Settings → Pages → Deploy from a branch → main / (root)*.

## Probar en local

Sirve la carpeta con cualquier servidor estático (el service worker no funciona abriendo el archivo con doble clic).
