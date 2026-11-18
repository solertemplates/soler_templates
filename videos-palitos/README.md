# Muñequitos Video

Aplicación web que genera videos cortos verticales (1080×1920) de muñequitos de palitos sobre reflexiones y situaciones cotidianas: amistad, matrimonio, trabajo, emprendimiento, familia, dinero, hábitos y redes sociales. Sirve para Shorts, Reels y Facebook.

Todo se genera en el navegador: no hay servidor, ni claves de API, ni costos.

## Cómo usarla

1. Abre la carpeta con un servidor web local (los módulos de JavaScript no funcionan con `file://`):
   ```bash
   cd videos-palitos
   python3 -m http.server 8000
   # o:  npx serve .
   ```
   Luego entra a <http://localhost:8000> con **Chrome o Edge** (recomendado) o con Safari.
2. Elige el **tema**, la **cantidad de personajes** (1–4), el **entorno**, el **estilo** (color o blanco y negro) y el **idioma** (botón ES/EN arriba a la derecha).
3. Elige la **duración**: 12–25 s, 25–45 s o 45–60 s. La app ajusta el número de escenas, el ritmo de la voz y las pausas para quedar dentro del rango.
4. Elige una de las **3 situaciones cotidianas** sugeridas, uno de los **3 ganchos iniciales** y uno de los **3 llamados a la acción**. «Otras opciones» propone más ganchos y llamados.
   - En «Configurar página y enlace» puedes poner el nombre de tu página (sale en el video) y tu enlace. Con un enlace configurado aparecen los llamados de tipo «Enlace».
5. Elige la voz, la música y si quieres efectos de sonido.
6. Pulsa **Generar vista previa**, mírala con ▶ y, si quieres, edita el guion y pulsa «Aplicar cambios».
7. Pulsa **Exportar MP4**. También puedes descargar los subtítulos en `.srt`.

## Qué incluye cada video

- **Gancho** grande en pantalla al inicio (visible desde el primer fotograma, sirve de miniatura).
- **Estructura narrativa**: repetición que va subiendo de intensidad y giro final sorprendente, o alegoría de **dos caminos con letreros**.
- **Ritmo movido**: corte de plano cada 2–3 s, zooms, barridos entre escenas, cámara que siempre se mueve, vibración que sube con la intensidad y destello en el giro.
- **Frase de reflexión** al final, con un cambio de música a piano emotivo.
- **Llamado a la acción** animado: me gusta, seguir la página, apoyar con estrellas, enlace o combinado.
- **Subtítulos grandes**, con la palabra que se está diciendo resaltada.
- **Voz automática** en español o inglés, **música** generada (alegre, enérgica, lo-fi) que baja sola cuando habla la voz, y **efectos de sonido** (whoosh, pop, boing, scratch de disco en el giro, aplausos, caja registradora, etc.).

## Voz

- **Voz neural (Piper)**: natural, funciona dentro del navegador. La primera vez descarga unos 60–80 MB (modelo de voz y motor) y queda guardada en el navegador, así que después es rápida. Necesita internet solo esa primera vez.
- **Voz básica sin conexión (meSpeak)**: robótica, pero funciona siempre y sin internet. La app la usa automáticamente si la voz neural no se puede cargar.
- **Sin voz**: solo subtítulos y música.

## Exportación

- En Chrome, Edge y Safari el video se renderiza fotograma a fotograma (más rápido que tiempo real) a **MP4 H.264 1080×1920 a 30 fps**.
- El audio sale en **AAC** en Chrome/Edge de Windows y Mac, y en Safari. En Chrome para Linux sale en Opus dentro del MP4; la app avisa en ese caso.
- En navegadores sin WebCodecs se graba en tiempo real con MediaRecorder (MP4 si el navegador lo permite, si no WebM).

## Estructura

```
videos-palitos/
├── index.html          interfaz
├── css/app.css         estilos (claro/oscuro, móvil)
├── js/app.js           lógica de la interfaz, vista previa y exportación
├── js/content.js       temas, 24 situaciones, ganchos y llamados (ES/EN)
├── js/script.js        arma el guion y ajusta los tiempos a la duración
├── js/render.js        dibujo: muñecos, poses, entornos, cámara, subtítulos, CTA
├── js/audio.js         música procedural, efectos y mezcla
├── js/tts.js           voz (Piper neural + meSpeak sin conexión)
├── js/export.js        MP4 con WebCodecs + mp4-muxer
└── vendor/             mp4-muxer, pegamento de piper-phonemize y meSpeak
```

### Agregar tus propias situaciones

En `js/content.js`, añade una entrada al tema que quieras. Cada línea es
`L(textoES, textoEN, acciones, objeto, efecto)`:

- **acciones**: `"A:talk B:shrug"` o `"all:laugh"`. Disponibles: `idle talk walk run wave hug cheer jump facepalm shrug sad cry angry laugh think type phone sleep fall point sit give dance wait shock love tired strong lift`.
- **objeto** (aparece grande y animado): `clock:9:30 money pizza heart gift box chart_up chart_down trophy calendar coffee bulb rocket plant laptop phone confetti`.
- **efecto**: `pop boing ding whoosh scratch applause cash sad drum type heart alarm laugh notif`.

Para «dos caminos» usa `mode: 'caminos'`, pon en el inicio el objeto `sign:IzqES|DerES|IzqEN|DerEN` y marca cada repetición con `'left'` o `'right'`.

## Publicarla en internet

Como es una página estática, puedes subir la carpeta a GitHub Pages, Netlify o cualquier hosting. Con GitHub Pages activado en este repositorio quedaría en `https://<usuario>.github.io/<repo>/videos-palitos/`.

## Créditos

- [Piper](https://github.com/rhasspy/piper) (voces neuronales) mediante `@diffusionstudio/piper-wasm` y `onnxruntime-web`.
- [meSpeak / eSpeak](https://www.masswerk.at/mespeak/) (GPL) para la voz sin conexión.
- [mp4-muxer](https://github.com/Vanilagy/mp4-muxer) (MIT).
- Tipografía Fredoka (Google Fonts).
