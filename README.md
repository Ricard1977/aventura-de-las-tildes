# 🌟 La Liga de las Tildes

Juego para alumnado de 5.º–6.º de Primaria. 60 palabras revisadas, partidas de 10 tarjetas aleatorias, cuatro actividades (sílaba tónica, poner tilde, corregir y clasificar), puntuación +1/−0,5 y clasificación.

## Jugar en local

Abre `index.html` en un navegador o sirve la carpeta con `python -m http.server 8000`. Sin Supabase, los puntos solo se guardan en ese dispositivo mediante localStorage.

## Publicar en GitHub Pages

1. Crear repositorio **público** llamado `aventura-de-las-tildes` en GitHub.
2. Subir los archivos de esta carpeta a la rama `main`.
3. En **Settings > Pages > Build and deployment**, seleccionar **Deploy from a branch**, rama **main**, carpeta **/(root)** y guardar.
4. La web estará en `https://Ricard1977.github.io/aventura-de-las-tildes/` una vez finalizado el despliegue. **No afirmar que esta URL está activa hasta comprobarla.**

## Clasificación compartida (Supabase)

1. Crear proyecto gratuito en https://supabase.com/dashboard.
2. En **Authentication > Sign In / Providers**, habilitar **Anonymous Sign-ins** (usuarios anónimos, sin correo).
3. En **SQL Editor**, ejecutar `supabase.sql`.
4. En **Project Settings > API**, copiar **Project URL** y **publishable/anon key**, NO `service_role` ni claves secretas.
5. Pegar ambos valores en `config.js`, subir esa modificación a GitHub y recargar la web.

**Privacidad y limitaciones:** los apodos y puntuaciones son visibles públicamente en la clasificación. No pedir nombre real, escuela, correo, foto ni fecha de nacimiento. El perfil anónimo queda ligado a la sesión de navegador; si se borran los datos del navegador, se puede perder el acceso a ese perfil. La tabla tiene seguridad por fila (RLS) para que cada sesión modifique solo su fila, pero la puntuación se calcula en el cliente y no es resistente a trampas. Una competición formal necesitaría validar partidas desde un servicio de servidor. Para menores, administrar la web con supervisión adulta y política de privacidad apropiada.

## Selección de palabras

El banco incluye 60 entradas de agudas, llanas y esdrújulas. Se comprobaron reglas y ejemplos frente a material educativo público de **INTEF**: https://descargas.intef.es/recursos_educativos/It_didac/Leng_Pri/5/05/01_Reglas_generales_acentuacion/reglas_generales_de_acentuacin.html. No se ha aplicado BM25 ni Jaccard como validación lingüística: son técnicas de recuperación y deduplicación textual; un umbral Jaccard 0,9 puede aplicarse si se amplía el banco con fuentes nuevas, pero no certifica ortografía ni nivel escolar.