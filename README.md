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
3. En **SQL Editor**, ejecutar `supabase.sql`, que crea la tabla independiente `liga_tildes_players` y sus permisos, sin modificar las tablas de otras aplicaciones.
4. En **Project Settings > API**, copiar **Project URL** y **publishable/anon key**, NO `service_role` ni claves secretas.
5. `config.js` ya está configurado con la URL y la clave pública. No incluir claves secretas. Recargar la web después del despliegue.

**Privacidad y limitaciones:** los apodos y puntuaciones son visibles públicamente en la clasificación. No pedir nombre real, escuela, correo, foto ni fecha de nacimiento. La clasificación es compartida entre ordenadores, pero cada perfil anónimo queda ligado a la sesión de navegador; si se borran los datos del navegador, se puede perder el acceso a ese perfil. La tabla tiene seguridad por fila (RLS) para que cada sesión modifique solo su fila, pero la puntuación se calcula en el cliente y no es resistente a trampas. Una competición formal necesitaría validar partidas desde un servicio de servidor. Para menores, administrar la web con supervisión adulta y política de privacidad apropiada.

## Selección de palabras

El banco incluye 60 entradas de agudas, llanas y esdrújulas. Se comprobaron reglas y ejemplos frente a material educativo público de **INTEF**: https://descargas.intef.es/recursos_educativos/It_didac/Leng_Pri/5/05/01_Reglas_generales_acentuacion/reglas_generales_de_acentuacin.html. No se ha aplicado BM25 ni Jaccard como validación lingüística: son técnicas de recuperación y deduplicación textual; un umbral Jaccard 0,9 puede aplicarse si se amplía el banco con fuentes nuevas, pero no certifica ortografía ni nivel escolar.
## Recuperar un jugador desde otro ordenador

1. Ejecutar [login-pin.sql](login-pin.sql) una sola vez en el SQL Editor del proyecto Supabase (sin eliminar la tabla existente).
2. Cada jugador que ya existía debe entrar una vez desde **su ordenador original** y configurar un PIN privado de 1–4 cifras en «Acceder desde otro ordenador». Sus puntos no se reinician.
3. En el nuevo dispositivo, escribir el mismo apodo y PIN y pulsar «Ya tengo jugador · Entrar con PIN».
4. Para un jugador completamente nuevo, crear el apodo con un PIN; no compartas los PIN de los menores.

## Acceso privado de administración para un adulto

1. Ejecutar [admin.sql](admin.sql) en Supabase SQL Editor (crea exclusivamente recursos de esta liga).
2. En Supabase **Authentication > Users > Add user**, crear una cuenta adulta con correo personal y contraseña propia. Esta cuenta es distinta de los perfiles de los niños.
3. Copiar el **User UID** de la cuenta adulta y ejecutar en SQL Editor la instrucción siguiente, sustituyendo el marcador por su UUID real:

```sql
insert into public.liga_tildes_admins(user_id)
values ('AQUI_TU_USER_UID');
```

4. Abrir https://ricard1977.github.io/aventura-de-las-tildes/#admin y acceder con el correo y contraseña de esa cuenta.
5. En el panel puedes borrar **perfiles locales de ese navegador** o borrar **jugadores globales de la clasificación compartida**. La eliminación global es definitiva y requiere confirmación. Borrar usuarios de otro navegador solo es posible de forma global; el almacenamiento local de otros dispositivos no puede borrarse remotamente.

**Seguridad:** el borrado global está protegido por una función de Supabase con comprobación explícita de administrador. No publiques tu contraseña, tu UID ni claves secretas en el código o en mensajes. Los perfiles antiguos necesitan configurar su PIN desde un navegador autorizado antes de poder recuperarlos en otro dispositivo.
