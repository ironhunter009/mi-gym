# Mi Gym

App web (PWA) para ver ejercicios por zona, con pasos en español, consejos de técnica y una rutina semanal.

- 1.324 ejercicios de [exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) (MIT).
- Las miniaturas y animaciones se cargan una a una desde ese repositorio (commit fijo) y el service worker las guarda en el dispositivo: cada imagen se descarga una sola vez.
- Rutina y entreno separados: la rutina es la plantilla; "Empezar entreno" crea una copia donde se quita, agrega o cambia sin tocar la rutina. Al terminar, se puede pasar los cambios a la rutina.
- Inicio con el entreno que toca (y lo que hiciste la última vez), la semana y el último entreno; ficha de cada día con todas las series y la comparación con la vez anterior.
- Tipos de rutina: Empuje/Tirón/Pierna, Full body, Torso/Pierna, por músculo, glúteos y piernas o desde cero; la app arma las sesiones según nivel y equipo.
- Superseries, triseries y circuitos: ejercicios unidos que se hacen sin descanso entre ellos.
- Registro de peso, repeticiones y minutos por ejercicio (con notas) y de otras actividades (bici, cerro, caminata…), con gráfico de progreso.
- Tipos de serie: calentamiento, drop set, al fallo y rest-pause, y pirámide (subir o bajar el peso en cada serie).
- Rutina, registros, favoritos y perfil se guardan en el navegador. Para pasarlos a otro dispositivo: Perfil → Copia de seguridad.
- Animaciones © Gym visual — https://gymvisual.com/

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La app completa (HTML, CSS y JS) |
| `data.json` | Los ejercicios: nombre, músculo, equipo y pasos en español |
| `es.js` | Traducción al español de los nombres de ejercicios (diccionario de frases) |
| `search.js` | Búsqueda: español e inglés, sinónimos, plurales y errores de tipeo |
| `coach.js` | Revisión de sesiones: patrones de movimiento, qué falta y sugerencias (reglas, sin IA) |
| `sw.js` | Service worker: caché de la app y de las imágenes, uso sin conexión |
| `manifest.webmanifest`, `icons/` | Para instalarla en la pantalla de inicio |

No necesita build: es un sitio estático.

## Publicar

**Vercel:** sube esta carpeta a un repositorio de GitHub → en vercel.com, *Add New → Project* → importa el repositorio → *Deploy* (Framework Preset: Other, sin comando de build). Cada `git push` vuelve a publicar.

**GitHub Pages:** en el repositorio, *Settings → Pages → Deploy from a branch → main / (root)*.

## Probar en local

Sirve la carpeta con cualquier servidor estático (el service worker no funciona abriendo el archivo con doble clic).
