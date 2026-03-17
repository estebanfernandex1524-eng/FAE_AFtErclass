# FAE-AFtErclass — Landing Page

> Iniciativa estudiantil de la Facultad de Administración de Empresas  
> Universidad Externado de Colombia

---

## Estructura del proyecto

```
FAE-AFtErclass/
├── index.html      ← Estructura HTML de la página
├── styles.css      ← Estilos (paleta y diseño)
├── app.js          ← Lógica JavaScript (Rounds, formularios, partículas)
├── assets/         ← SVGs y recursos gráficos
├── copy.txt        ← Textos finales del sitio (copy)
└── README.md       ← Este archivo
```

---

## Cómo ver el sitio localmente

Es un sitio estático puro (HTML + CSS + JS). No requiere compilación ni servidor dedicado.

**Opción 1 — Abrir directamente:**  
Doble clic en `index.html` o bien abrirlo desde el explorador de archivos.

**Opción 2 — Servidor local (recomendado para evitar restricciones CORS):**

```bash
# Con Python 3
python -m http.server 8080

# Con Node (si tienes npx)
npx serve .
```

Luego abre `http://localhost:8080` en el navegador.

---

## Despliegue en producción

El sitio puede alojarse en cualquier plataforma de hosting estático:

- **GitHub Pages**: sube los archivos al repositorio y activa Pages desde Settings.
- **Netlify / Vercel**: arrastra la carpeta al panel de control o conecta el repo.
- **Hosting tradicional (FTP)**: sube los archivos tal cual a la carpeta raíz del servidor.

No se requieren variables de entorno ni configuración adicional.

---

## Lista de cambios — Actualización Marzo 2026

### 1. Enlace de Discord actualizado
- **Antes:** `https://discord.gg/JebJy8gx`
- **Ahora:** `https://discord.gg/DaG2rDn68X`
- Afecta: navbar, mobile-nav, hero CTA, sección recursos, modal de Round, sección contacto, footer (todas las ocurrencias).

### 2. Formulario "Enviar mi idea" — abre Gmail (no mailto local)
- El formulario toma los campos (nombre y sugerencia) del usuario.
- Al enviar, construye el `body` del correo en JavaScript y **abre Gmail en una nueva pestaña** con `window.open()`.
- URL de destino:
  ```
  https://mail.google.com/mail/?view=cm&fs=1
    &to=estebanfernandex1524@gmail.com
    &su=Sugerencia%20FAE-AFtErclass
    &body=<texto codificado del formulario>
  ```
- **Nota técnica sobre el `body`:** Los navegadores modernos admiten pasar el parámetro `body` codificado en URL directamente a la interfaz de composición de Gmail (`view=cm`). Esto prefill funciona siempre que el usuario esté autenticado en Gmail en esa ventana del navegador. No hay restricciones de CORS porque es una redirección GET a `mail.google.com`, no una petición de API.

### 3. Link "Contacto por correo (asuntos formales)"
- Reemplaza el antiguo enlace `mailto:` por la URL de composición de Gmail.
- Se abre en nueva pestaña (`target="_blank" rel="noopener noreferrer"`).
- Aparece tanto en la sección de Sugerencias como en la de Contacto.

### 4. Sección Fundadores — fichas actualizadas
- **Eliminada** la ficha "El Equipo FAE" (mencionaba "el quipo fae" de forma genérica).
- **Reducida** la descripción de Esteban Fernández a 2–3 frases concisas.
- **Añadidas** dos fichas nuevas:
  - **Juan José Gómez** — Cofundador, estrategia y operaciones.
  - **Dulce Guerrero** — Cofundadora, comunicaciones y contenido.
- Las tres fichas tienen el mismo formato y longitud (2–3 frases, tono formal-joven, sin emojis).

### 5. Rounds — descripciones basadas en el pensum
- Se reemplazaron las 9 descripciones genéricas por descripciones derivadas del plan de estudios oficial de la Facultad de Administración de Empresas del Externado de Colombia.
- Cada descripción resume el objetivo y las áreas clave del semestre correspondiente.
- Las descripciones se encuentran en el array `ROUNDS_DATA` de `app.js`.

| Round | Semestre | Descripción (extracto) |
|-------|----------|------------------------|
| 1 | Semestre 1 | Relaciones empresa-Estado-sociedad; fundamentos de administración. |
| 2 | Semestre 2 | Áreas funcionales: contabilidad, economía, fundamentos organizacionales. |
| 3 | Semestre 3 | Variables y relaciones funcionales; métodos cuantitativos. |
| 4 | Semestre 4 | Modelado de fenómenos; análisis organizacional, mercados, producción. |
| 5 | Semestre 5 | Diagnóstico y solución de problemas; finanzas, mercadeo, operaciones. |
| 6 | Semestre 6 | Integración de áreas; soluciones empresariales y proyectos aplicados. |
| 7 | Semestre 7 | Planes gerenciales; innovación, emprendimiento, planes de negocio. |
| 8 | Semestre 8 | Énfasis de profundización; preparación directiva. |
| 9 | Semestre 9 | Práctica/grado: tesis, monografía, evaluación integral. |

### 6. Sección Recursos (ex-Biblioteca) — sin cambios estructurales
- La sección ya indica que todos los archivos se gestionan en Discord.
- No se agregó una "Biblioteca" separada. Los recursos viven en el servidor de Discord.

### 7. Sección Calendario
- Se conserva únicamente el botón "Ver calendario semestral" que abre el documento en Drive.
- URL: `https://drive.google.com/file/d/1Y2RH17AztJtbHiDvnZ9fTPJlC0EH-31c/view?usp=sharing`
- Se abre en nueva pestaña.

### 8. Footer limpiado
- Eliminados enlaces placeholder de "Video tutorial" y "Tutorial en YouTube".
- Se añadió enlace al calendario semestral y al contacto por Gmail.

### 9. Restricciones respetadas
- **Sin emojis** en ningún elemento de texto, botones ni etiquetas.
- **Español exclusivo** en todo el copy.
- **Sin imágenes IA** ni fondos generados; se usan SVGs y fondos planos.
- **Paleta de colores** previa mantenida intacta (`#0E082A`, `#39284B`, etc.).
- **Solo los enlaces externos indicados**: Discord y Drive (más Gmail para correo).

---

## Cómo funciona el redirect a Gmail

### Mecanismo técnico

La función en `app.js` para el formulario de sugerencias construye una URL de la forma:

```javascript
const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1` +
  `&to=estebanfernandex1524@gmail.com` +
  `&su=Sugerencia%20FAE-AFtErclass` +
  `&body=${encodeURIComponent(bodyTexto)}`;

window.open(gmailURL, '_blank', 'noopener,noreferrer');
```

Los parámetros:
- `view=cm` — abre la vista "Compose Mail" de Gmail.
- `fs=1` — fuerza pantalla completa del compositor.
- `to` — destinatario prellenado.
- `su` — asunto prellenado.
- `body` — cuerpo prellenado (codificado como URI component).

### Limitaciones conocidas

| Escenario | Resultado |
|-----------|-----------|
| Usuario autenticado en Gmail en el mismo navegador | Funciona: abre el compositor con todos los campos prellenados. |
| Usuario no autenticado en Gmail | Se muestra la pantalla de login; tras autenticarse, el composer puede no conservar los parámetros. |
| Cliente de correo alternativo (Outlook, etc.) | No aplica: esta URL solo funciona con Gmail web. |

### Alternativa con body dinámico más robusto

Si en el futuro se desea mayor compatibilidad o se migra a un backend:

1. **Opción backend (recomendada para producción):**  
   Enviar los datos del formulario mediante `fetch` a un endpoint (p. ej., Google Apps Script, un servidor Node.js o un servicio de formularios como Formspree / EmailJS) que procese el correo en el servidor. Esto elimina la dependencia del cliente de correo del usuario.

2. **Opción mailto como fallback:**  
   Mantener `mailto:` como enlace secundario visible para usuarios que prefieran su cliente de correo local. El `body` también se puede pasar mediante `encodeURIComponent` en el href de `mailto`.

---

## Contacto del proyecto

- Discord: [discord.gg/DaG2rDn68X](https://discord.gg/DaG2rDn68X)
- Correo: estebanfernandex1524@gmail.com

---

*FAE-AFtErclass — Iniciativa estudiantil independiente · Externado de Colombia*  
*Sin fines de lucro. Sin patrocinadores ni representación institucional oficial.*
