/**
 * FAE-AFtErclass — app.js
 * Logica principal del sitio
 * ─────────────────────────────────────────────────────
 * Modulos:
 *  1. Navbar scroll behavior
 *  2. Mobile menu
 *  3. Mapa de Rounds (desktop scroll + mobile)
 *  4. Modal de Round
 *  5. Formulario de sugerencias (mailto)
 *  6. Formulario de contacto (Supabase)
 *  7. Particles canvas
 *  8. IntersectionObserver (fade-in)
 *  9. Smooth scroll
 * 10. Calendario nativo
 * 11. Seccion de comentarios (Supabase)
 *
 * ─────────────────────────────────────────────────────
 * SQL para crear las tablas en Supabase:
 *
 * CREATE TABLE mensajes_contacto (
 *   id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 *   nombre TEXT NOT NULL,
 *   correo TEXT NOT NULL,
 *   mensaje TEXT NOT NULL,
 *   creado_en TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * CREATE TABLE comentarios (
 *   id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 *   apodo TEXT NOT NULL,
 *   comentario TEXT NOT NULL,
 *   creado_en TIMESTAMPTZ DEFAULT NOW(),
 *   reportado BOOLEAN DEFAULT FALSE
 * );
 *
 * -- Habilitar RLS y crear politicas de acceso:
 * ALTER TABLE mensajes_contacto ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Permitir inserts anonimos" ON mensajes_contacto FOR INSERT WITH CHECK (true);
 *
 * ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Permitir inserts anonimos" ON comentarios FOR INSERT WITH CHECK (true);
 * CREATE POLICY "Permitir lectura publica" ON comentarios FOR SELECT USING (true);
 * CREATE POLICY "Permitir update reportado" ON comentarios FOR UPDATE USING (true) WITH CHECK (true);
 * ─────────────────────────────────────────────────────
 */

'use strict';

/* ══════════════════════════════════════════════════════
   SUPABASE CONFIG
═══════════════════════════════════════════════════════ */
const SUPABASE_URL = 'https://bnmuyrdoobthzapjbhem.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0XFLO_3LaHcoyS7-lS70rg_qa5cvmCq';
let _supabase = null;

function getSupabase() {
  if (!_supabase && window.supabase) {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabase;
}

/* ══════════════════════════════════════════════════════
   FILTRO DE MODERACION — palabras ofensivas
═══════════════════════════════════════════════════════ */
const PALABRAS_BLOQUEADAS = [
  'idiota','estupido','estúpido','imbecil','imbécil','pendejo','maldito',
  'puta','puto','marica','mierda','verga','culo','cabron','cabrón',
  'bastardo','zorra','perra','malparido','gonorrea',
  'fuck','shit','bitch','asshole','dick','damn','bastard','crap','slut','whore'
];

function contieneOfensas(texto) {
  const lower = texto.toLowerCase();
  return PALABRAS_BLOQUEADAS.some(p => lower.includes(p));
}

/* ══════════════════════════════════════════════════════
   TOAST SYSTEM
═══════════════════════════════════════════════════════ */
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

/* ══════════════════════════════════════════════════════
   DATA LAYER — Rounds con descripciones en español
   (sin emojis, tono formal-joven)
═══════════════════════════════════════════════════════ */

/** Enlace de invitacion al servidor de Discord */
const DISCORD_URL = 'https://discord.gg/DaG2rDn68X';

/** Rounds: 9 semestres de la carrera FAE — descripciones basadas en el pensum */
const ROUNDS_DATA = [
  {
    id: 1,
    name: 'Round 1',
    label: 'Semestre 1',
    description: 'Identifica las relaciones entre empresa, Estado y sociedad; fundamentos básicos de administración y herramientas de estudio.',
  },
  {
    id: 2,
    name: 'Round 2',
    label: 'Semestre 2',
    description: 'Identifica los elementos de las áreas funcionales: contabilidad, economía y fundamentos organizacionales.',
  },
  {
    id: 3,
    name: 'Round 3',
    label: 'Semestre 3',
    description: 'Comprende variables y relaciones en cada área funcional; énfasis en métodos cuantitativos y análisis.',
  },
  {
    id: 4,
    name: 'Round 4',
    label: 'Semestre 4',
    description: 'Modela fenómenos empresariales por área: análisis organizacional, mercados y procesos productivos.',
  },
  {
    id: 5,
    name: 'Round 5',
    label: 'Semestre 5',
    description: 'Diagnostica y resuelve problemas funcionales; toma de decisiones en finanzas, mercadeo y operaciones.',
  },
  {
    id: 6,
    name: 'Round 6',
    label: 'Semestre 6',
    description: 'Integra áreas funcionales para diseñar soluciones empresariales; proyectos aplicados y operaciones.',
  },
  {
    id: 7,
    name: 'Round 7',
    label: 'Semestre 7',
    description: 'Diseña planes gerenciales: innovación, emprendimiento y formulación de planes de negocio.',
  },
  {
    id: 8,
    name: 'Round 8',
    label: 'Semestre 8',
    description: 'Profundiza en énfasis (estrategia, finanzas, mercadeo, etc.) y prepara la gestión directiva.',
  },
  {
    id: 9,
    name: 'Round 9',
    label: 'Semestre 9',
    description: 'Cierra con práctica o trabajo de grado: tesis, monografía y evaluación integral de competencias.',
  },
];

/* ══════════════════════════════════════════════════════
   1. NAVBAR SCROLL BEHAVIOR
═══════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════════
   2. MOBILE MENU
═══════════════════════════════════════════════════════ */
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Cerrar al hacer click en link
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });
})();

/* ══════════════════════════════════════════════════════
   3. MAPA DE ROUNDS — Desktop horizontal scroll
═══════════════════════════════════════════════════════ */
(function initCityMap() {
  const mapTrack = document.getElementById('map-track');
  const mapMobile = document.getElementById('map-mobile');
  if (!mapTrack && !mapMobile) return;

  // Icono SVG para el nodo de cada Round (sin emojis)
  function roundSVG(id) {
    // Icono abstracto basado en numero del round
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="12" cy="12" r="9"/>
      <text x="12" y="16.5" text-anchor="middle" fill="currentColor" stroke="none"
        style="font-size:10px;font-weight:700;font-family:Inter,sans-serif">${id}</text>
    </svg>`;
  }

  // Desktop map
  if (mapTrack) {
    ROUNDS_DATA.forEach(round => {
      const district = document.createElement('div');
      district.className = 'round-district';
      district.dataset.roundId = round.id;
      district.setAttribute('tabindex', '0');
      district.setAttribute('role', 'button');
      district.setAttribute('aria-label', `${round.name}: ${round.description}`);
      district.innerHTML = `
        <div class="round-connector"></div>
        <div class="district-node">
          <div class="district-icon" aria-hidden="true">${roundSVG(round.id)}</div>
          <span class="district-number">${round.name}</span>
        </div>
        <div class="district-label">
          <h4>${round.label}</h4>
          <p class="district-desc">${round.description}</p>
        </div>
      `;
      district.addEventListener('click', () => openRoundModal(round.id));
      district.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRoundModal(round.id); }
      });
      mapTrack.appendChild(district);
    });
  }

  // Mobile map
  if (mapMobile) {
    ROUNDS_DATA.forEach(round => {
      const card = document.createElement('div');
      card.className = 'round-card-mobile';
      card.dataset.roundId = round.id;
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `${round.name}: ${round.description}`);
      card.innerHTML = `
        <div class="m-icon" aria-hidden="true">${roundSVG(round.id)}</div>
        <div class="m-info">
          <h4>${round.name} — ${round.label}</h4>
          <p class="m-desc">${round.description}</p>
        </div>
        <div class="m-arrow" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"/>
          </svg>
        </div>
      `;
      card.addEventListener('click', () => openRoundModal(round.id));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRoundModal(round.id); }
      });
      mapMobile.appendChild(card);
    });
  }

  // Nav buttons desktop
  const VISIBLE_DISTRICTS = 4;
  let currentOffset = 0;
  const btnPrev = document.getElementById('map-prev');
  const btnNext = document.getElementById('map-next');

  function updateMapPosition() {
    if (!mapTrack) return;
    const districtWidth = 200;
    mapTrack.style.transform = `translateX(-${currentOffset * districtWidth}px)`;
    if (btnPrev) btnPrev.disabled = currentOffset === 0;
    if (btnNext) btnNext.disabled = currentOffset >= ROUNDS_DATA.length - VISIBLE_DISTRICTS;
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentOffset > 0) { currentOffset--; updateMapPosition(); }
    });
  }
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (currentOffset < ROUNDS_DATA.length - VISIBLE_DISTRICTS) { currentOffset++; updateMapPosition(); }
    });
  }
  updateMapPosition();
})();

/* ══════════════════════════════════════════════════════
   4. MODAL DE ROUND
═══════════════════════════════════════════════════════ */
function openRoundModal(roundId) {
  const round = ROUNDS_DATA.find(r => r.id === roundId);
  if (!round) return;
  const overlay = document.getElementById('round-modal');
  if (!overlay) return;

  overlay.querySelector('#modal-title').textContent = round.name;
  overlay.querySelector('#modal-round-label').textContent = round.label;
  overlay.querySelector('#modal-desc').textContent = round.description;

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Focus en cerrar
  setTimeout(() => overlay.querySelector('.modal-close').focus(), 100);
}

function closeRoundModal() {
  const overlay = document.getElementById('round-modal');
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Cerrar modal
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('round-modal');
  if (overlay) {
    overlay.querySelector('.modal-close').addEventListener('click', closeRoundModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeRoundModal(); });
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeRoundModal(); });
});

/* ══════════════════════════════════════════════════════
   5. FORMULARIO DE SUGERENCIAS — abre Gmail en nueva pestaña
═══════════════════════════════════════════════════════ */
(function initSuggestionsForm() {
  const form = document.getElementById('suggestion-form');
  const successMsg = document.getElementById('suggestion-success');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('#suggestion-name').value.trim();
    const suggestion = form.querySelector('#suggestion-text').value.trim();
    const isAnon = form.querySelector('#suggestion-anon').checked;

    if (!suggestion) {
      form.querySelector('#suggestion-text').focus();
      return;
    }

    // Construir cuerpo del correo
    const fromLabel = isAnon ? 'Anonimo' : (name || 'Sin nombre');
    const body = encodeURIComponent(
      `Sugerencia de: ${fromLabel}\n\n${suggestion}\n\n---\nEnviado desde el sitio web FAE-AFtErclass.`
    );

    // Abrir Gmail en nueva pestaña con destinatario, asunto y body prellenados
    const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=estebanfernandex1524@gmail.com&su=Sugerencia%20FAE-AFtErclass&body=${body}`;
    window.open(gmailURL, '_blank', 'noopener,noreferrer');

    // Mostrar confirmacion
    form.style.display = 'none';
    if (successMsg) successMsg.style.display = 'block';

    // Reset despues de 6s
    setTimeout(() => {
      form.reset();
      form.style.display = 'block';
      if (successMsg) successMsg.style.display = 'none';
    }, 6000);
  });
})();

/* ══════════════════════════════════════════════════════
   6. FORMULARIO DE CONTACTO — Supabase
═══════════════════════════════════════════════════════ */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = form.querySelector('#contact-name').value.trim();
    const correo = form.querySelector('#contact-email').value.trim();
    const mensaje = form.querySelector('#contact-msg').value.trim();
    const btn = form.querySelector('[type="submit"]');

    // Validaciones
    if (!nombre) { showToast('El nombre es requerido.', 'error'); form.querySelector('#contact-name').focus(); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) { showToast('Ingresa un correo válido.', 'error'); form.querySelector('#contact-email').focus(); return; }
    if (mensaje.length < 20) { showToast('El mensaje debe tener al menos 20 caracteres.', 'error'); form.querySelector('#contact-msg').focus(); return; }

    btn.textContent = 'Enviando...';
    btn.disabled = true;

    try {
      const sb = getSupabase();
      if (!sb) throw new Error('No se pudo conectar con el servidor.');
      const { error } = await sb.from('mensajes_contacto').insert([{ nombre, correo, mensaje }]);
      if (error) throw error;
      showToast('Mensaje enviado correctamente. Te responderemos pronto.');
      form.reset();
    } catch (err) {
      console.error(err);
      showToast('Error al enviar el mensaje. Intenta de nuevo.', 'error');
    } finally {
      btn.textContent = 'Enviar mensaje';
      btn.disabled = false;
    }
  });
})();

/* ══════════════════════════════════════════════════════
   7. CANVAS PARTICLES (decorativo sutil)
═══════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Colores tomados de la paleta (sin neon)
  const COLORS = ['#39284B', '#7B7483', '#200A27'];
  let particles = [];
  let animId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 0.2,
      vy: -Math.random() * 0.3 - 0.05,
      alpha: Math.random() * 0.4 + 0.05,
    };
  }

  for (let i = 0; i < 60; i++) particles.push(createParticle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.0002;
      if (p.y < -5 || p.alpha <= 0) particles[i] = createParticle();
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    animId = requestAnimationFrame(animate);
  }
  animate();

  // Pausa si la pestana no es visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animId);
    else animate();
  });
})();

/* ══════════════════════════════════════════════════════
   8. INTERSECTION OBSERVER — Fade-in secciones
═══════════════════════════════════════════════════════ */
(function initFadeIn() {
  const style = document.createElement('style');
  style.textContent = `
    .fade-in { opacity: 0; transform: translateY(24px); transition: opacity 0.65s ease, transform 0.65s ease; }
    .fade-in.visible { opacity: 1; transform: none; }
    .fade-in.delay-1 { transition-delay: 0.1s; }
    .fade-in.delay-2 { transition-delay: 0.2s; }
    .fade-in.delay-3 { transition-delay: 0.3s; }
    .fade-in.delay-4 { transition-delay: 0.4s; }
  `;
  document.head.appendChild(style);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════════════════════
   9. SMOOTH SCROLL para nav links
═══════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ══════════════════════════════════════════════════════
   10. CALENDARIO NATIVO — Grilla visual por meses
═══════════════════════════════════════════════════════ */
(function initCalendar() {
  const container = document.getElementById('calendar-native');
  if (!container) return;

  const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DAY_NAMES = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

  // Fechas destacadas — Cronograma FAE 2026-I
  const HIGHLIGHTS = {
    // Semana de inducción (Ene 19-24)
    '2026-01-19': { type: 'evento', label: 'Semana de inducción' },
    '2026-01-20': { type: 'evento', label: 'Semana de inducción' },
    '2026-01-21': { type: 'evento', label: 'Semana de inducción' },
    '2026-01-22': { type: 'evento', label: 'Semana de inducción' },
    '2026-01-23': { type: 'evento', label: 'Semana de inducción' },
    '2026-01-24': { type: 'evento', label: 'Semana de inducción' },
    // Inicio de clases
    '2026-01-26': { type: 'inicio', label: 'Inicio de clases 2026-I' },
    // Festivo Epifanía
    '2026-01-12': { type: 'festivo', label: 'Epifanía' },
    // Primer Corte — Reporte 25%
    '2026-03-03': { type: 'corte', label: 'Primer corte — Reporte 25%' },
    // Cancelación materias/semestre
    '2026-03-22': { type: 'cancelacion', label: 'Cancelación de materias / semestre' },
    // Festivo San José
    '2026-03-23': { type: 'festivo', label: 'Día de San José' },
    // Semana Santa (Mar 29 – Abr 5)
    '2026-03-29': { type: 'festivo', label: 'Semana Santa' },
    '2026-03-30': { type: 'festivo', label: 'Semana Santa' },
    '2026-03-31': { type: 'festivo', label: 'Semana Santa' },
    '2026-04-01': { type: 'festivo', label: 'Semana Santa' },
    '2026-04-02': { type: 'festivo', label: 'Semana Santa' },
    '2026-04-03': { type: 'festivo', label: 'Semana Santa' },
    '2026-04-04': { type: 'festivo', label: 'Semana Santa' },
    '2026-04-05': { type: 'festivo', label: 'Semana Santa' },
    // Segundo Corte — Reporte 25%
    '2026-04-07': { type: 'corte', label: 'Segundo corte — Reporte 25%' },
    // Festivo Día del Trabajo
    '2026-05-01': { type: 'festivo', label: 'Día del Trabajo' },
    // Festivo Ascensión
    '2026-05-18': { type: 'festivo', label: 'Ascensión del Señor' },
    // Fin de clases
    '2026-05-22': { type: 'fin', label: 'Fin de clases 2026-I' },
    // Exámenes finales (May 25 – Jun 4)
    '2026-05-25': { type: 'examen', label: 'Exámenes finales' },
    '2026-05-26': { type: 'examen', label: 'Exámenes finales' },
    '2026-05-27': { type: 'examen', label: 'Exámenes finales' },
    '2026-05-28': { type: 'examen', label: 'Exámenes finales' },
    '2026-05-29': { type: 'examen', label: 'Exámenes finales' },
    '2026-05-30': { type: 'examen', label: 'Exámenes finales' },
    '2026-06-01': { type: 'examen', label: 'Exámenes finales' },
    '2026-06-02': { type: 'examen', label: 'Exámenes finales' },
    '2026-06-03': { type: 'examen', label: 'Exámenes finales' },
    '2026-06-04': { type: 'examen', label: 'Exámenes finales' },
    // Tercer y Cuarto Corte
    '2026-06-05': { type: 'corte', label: 'Tercer y cuarto corte — Reporte 25%' },
    // Festivos junio
    '2026-06-08': { type: 'festivo', label: 'Corpus Christi' },
    '2026-06-15': { type: 'festivo', label: 'Sagrado Corazón' },
    '2026-06-29': { type: 'festivo', label: 'San Pedro y San Pablo' },
  };

  // Meses a mostrar (semestre 2026-I: enero a junio)
  const MONTHS_TO_SHOW = [
    { year: 2026, month: 0 },  // Enero
    { year: 2026, month: 1 },  // Febrero
    { year: 2026, month: 2 },  // Marzo
    { year: 2026, month: 3 },  // Abril
    { year: 2026, month: 4 },  // Mayo
    { year: 2026, month: 5 },  // Junio
  ];

  const legend = document.createElement('div');
  legend.className = 'cal-legend';
  legend.innerHTML = `
    <span class="cal-legend-item"><span class="cal-dot cal-dot-inicio"></span> Inicio / Fin de clases</span>
    <span class="cal-legend-item"><span class="cal-dot cal-dot-evento"></span> Inducción / Eventos</span>
    <span class="cal-legend-item"><span class="cal-dot cal-dot-corte"></span> Cortes (Reporte 25%)</span>
    <span class="cal-legend-item"><span class="cal-dot cal-dot-examen"></span> Exámenes finales</span>
    <span class="cal-legend-item"><span class="cal-dot cal-dot-cancelacion"></span> Cancelación</span>
    <span class="cal-legend-item"><span class="cal-dot cal-dot-festivo"></span> Festivos</span>
  `;
  container.appendChild(legend);

  const grid = document.createElement('div');
  grid.className = 'cal-months-grid';

  MONTHS_TO_SHOW.forEach(({ year, month }) => {
    const card = document.createElement('div');
    card.className = 'cal-month-card';

    const title = document.createElement('h4');
    title.className = 'cal-month-title';
    title.textContent = `${MONTH_NAMES[month]} ${year}`;
    card.appendChild(title);

    // Day headers
    const headerRow = document.createElement('div');
    headerRow.className = 'cal-day-headers';
    DAY_NAMES.forEach(d => {
      const dh = document.createElement('span');
      dh.className = 'cal-day-header';
      dh.textContent = d;
      headerRow.appendChild(dh);
    });
    card.appendChild(headerRow);

    // Days grid
    const daysGrid = document.createElement('div');
    daysGrid.className = 'cal-days-grid';

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // JS getDay(): 0=Sun. We want Mon=0
    let startOffset = (firstDay.getDay() + 6) % 7;

    for (let i = 0; i < startOffset; i++) {
      const empty = document.createElement('span');
      empty.className = 'cal-day cal-day-empty';
      daysGrid.appendChild(empty);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const el = document.createElement('span');
      el.className = 'cal-day';
      el.textContent = day;

      const hl = HIGHLIGHTS[dateStr];
      if (hl) {
        el.classList.add(`cal-hl-${hl.type}`);
        el.setAttribute('title', hl.label);
        el.setAttribute('aria-label', `${day}: ${hl.label}`);
      }

      // Mark today
      const today = new Date();
      if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === day) {
        el.classList.add('cal-today');
      }

      daysGrid.appendChild(el);
    }

    card.appendChild(daysGrid);
    grid.appendChild(card);
  });

  container.appendChild(grid);
})();

/* ══════════════════════════════════════════════════════
   11. SECCION DE COMENTARIOS — Supabase
═══════════════════════════════════════════════════════ */
(function initComentarios() {
  const form = document.getElementById('comentario-form');
  const listEl = document.getElementById('comentarios-list');
  const charCount = document.getElementById('char-count');
  const textArea = document.getElementById('comentario-text');
  if (!form || !listEl) return;

  // Contador de caracteres
  if (textArea && charCount) {
    textArea.addEventListener('input', () => {
      const len = textArea.value.length;
      charCount.textContent = `${len}/280`;
      charCount.classList.toggle('limit-near', len > 250);
    });
  }

  // Cargar comentarios
  async function loadComentarios() {
    try {
      const sb = getSupabase();
      if (!sb) return;
      const { data, error } = await sb
        .from('comentarios')
        .select('*')
        .eq('reportado', false)
        .order('creado_en', { ascending: false })
        .limit(20);
      if (error) throw error;
      renderComentarios(data || []);
    } catch (err) {
      console.error(err);
      listEl.innerHTML = '<p class="com-empty">No se pudieron cargar los comentarios.</p>';
    }
  }

  function renderComentarios(items) {
    if (!items.length) {
      listEl.innerHTML = '<p class="com-empty">Aún no hay comentarios. Sé el primero en participar.</p>';
      return;
    }
    listEl.innerHTML = items.map(c => {
      const fecha = new Date(c.creado_en).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
      return `
        <div class="com-card" data-id="${c.id}">
          <div class="com-header">
            <span class="com-apodo">${escapeHTML(c.apodo)}</span>
            <span class="com-fecha">${fecha}</span>
          </div>
          <p class="com-texto">${escapeHTML(c.comentario)}</p>
          <button class="com-report-btn" aria-label="Reportar comentario" onclick="reportarComentario(${c.id}, this)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
            Reportar
          </button>
        </div>`;
    }).join('');
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Enviar comentario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const apodo = form.querySelector('#comentario-apodo').value.trim();
    const comentario = form.querySelector('#comentario-text').value.trim();
    const btn = form.querySelector('[type="submit"]');

    if (!apodo) { showToast('El apodo es requerido.', 'error'); return; }
    if (!comentario || comentario.length < 3) { showToast('El comentario es muy corto.', 'error'); return; }
    if (contieneOfensas(apodo) || contieneOfensas(comentario)) {
      showToast('Tu comentario contiene lenguaje no permitido.', 'error');
      return;
    }

    btn.textContent = 'Publicando...';
    btn.disabled = true;

    try {
      const sb = getSupabase();
      if (!sb) throw new Error('No se pudo conectar.');
      const { error } = await sb.from('comentarios').insert([{ apodo, comentario }]);
      if (error) throw error;
      showToast('Comentario publicado.');
      form.reset();
      if (charCount) charCount.textContent = '0/280';
      await loadComentarios();
    } catch (err) {
      console.error(err);
      showToast('Error al publicar. Intenta de nuevo.', 'error');
    } finally {
      btn.textContent = 'Publicar comentario';
      btn.disabled = false;
    }
  });

  // Cargar al inicio
  loadComentarios();
})();

// Reportar comentario (global)
async function reportarComentario(id, btnEl) {
  try {
    const sb = getSupabase();
    if (!sb) throw new Error('No se pudo conectar.');
    const { error } = await sb.from('comentarios').update({ reportado: true }).eq('id', id);
    if (error) throw error;
    showToast('Comentario reportado. Será revisado por moderadores.');
    if (btnEl) {
      const card = btnEl.closest('.com-card');
      if (card) card.style.display = 'none';
    }
  } catch (err) {
    console.error(err);
    showToast('Error al reportar. Intenta de nuevo.', 'error');
  }
}

/* ══════════════════════════════════════════════════════
   12. RE-OBSERVER — detectar fade-in de secciones nuevas
═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => observer.observe(el));
  }, 200);
});

