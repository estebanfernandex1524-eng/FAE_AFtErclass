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
 *  6. Formulario de contacto (mailto)
 *  7. Particles canvas
 *  8. IntersectionObserver (fade-in)
 *  9. Smooth scroll
 */

'use strict';

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
   6. FORMULARIO DE CONTACTO — abre Gmail en nueva pestaña
═══════════════════════════════════════════════════════ */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('#contact-name').value.trim();
    const email = form.querySelector('#contact-email').value.trim();
    const message = form.querySelector('#contact-msg').value.trim();

    if (!name || !email || !message) return;

    const body = encodeURIComponent(
      `Nombre: ${name}\nCorreo de respuesta: ${email}\n\nMensaje:\n${message}\n\n---\nEnviado desde el sitio web FAE-AFtErclass.`
    );

    // Abrir Gmail en nueva pestaña con campos prellenados
    const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=estebanfernandex1524@gmail.com&su=Contacto%20FAE-AFtErclass&body=${body}`;
    window.open(gmailURL, '_blank', 'noopener,noreferrer');

    const btn = form.querySelector('[type="submit"]');
    btn.textContent = 'Abriendo Gmail...';
    btn.disabled = true;
    setTimeout(() => {
      form.reset();
      btn.textContent = 'Enviar mensaje';
      btn.disabled = false;
    }, 4000);
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
