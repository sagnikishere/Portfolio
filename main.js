import { SmokeSimulation } from './smoke.js';
import { AmbientSynth } from './sound.js';
import Lenis from 'lenis';

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. SMOOTH SCROLLING (Lenis)
  // =========================================================================
  let lenis;
  try {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  } catch (err) {
    console.warn('Lenis fallback to native scroll', err);
  }

  // =========================================================================
  // 2. VOLUMETRIC SMOKE SIMULATION
  // =========================================================================
  const smokeCanvas = document.getElementById('smoke-canvas');
  if (smokeCanvas) {
    new SmokeSimulation(smokeCanvas);
  }

  // =========================================================================
  // 3. AMBIENT AUDIO SYNTHESIZER
  // =========================================================================
  const synth = new AmbientSynth();
  const soundBtn = document.getElementById('sound-toggle-btn');
  const navSoundBtn = document.getElementById('nav-sound-btn');
  const soundStateText = document.getElementById('sound-state-text');
  const navSoundStateText = document.querySelector('.sound-state-nav');

  async function handleSoundToggle() {
    try {
      const isPlaying = await synth.toggle();
      [soundBtn, navSoundBtn].forEach((btn) => {
        if (!btn) return;
        if (isPlaying) {
          btn.classList.add('playing');
        } else {
          btn.classList.remove('playing');
        }
      });

      if (soundStateText) soundStateText.textContent = isPlaying ? 'ON' : 'OFF';
      if (navSoundStateText) navSoundStateText.textContent = isPlaying ? 'ON' : 'OFF';
    } catch (err) {
      console.error('Audio toggle error:', err);
    }
  }

  soundBtn?.addEventListener('click', handleSoundToggle);
  navSoundBtn?.addEventListener('click', handleSoundToggle);

  // =========================================================================
  // 4. CUSTOM MINIMAL CIRCULAR CURSOR
  // =========================================================================
  const cursor = document.getElementById('custom-cursor');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let isMouseMoving = false;
  let lastMoveTime = Date.now();

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    lastMoveTime = Date.now();
    isMouseMoving = true;
  }, { passive: true });

  function updateCursor() {
    // Lerp cursor ring position smoothly
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;

    if (cursor) {
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    }
    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);

  // Interactive Hover Targets for Cursor Expansion & Audio Blips
  const interactiveElements = document.querySelectorAll(
    'a, button, .skill-pill, .budget-pill, input, textarea, .mode-btn'
  );

  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor?.classList.add('cursor-hover');
      synth.playHoverBlip();
    });
    el.addEventListener('mouseleave', () => {
      cursor?.classList.remove('cursor-hover');
    });
  });

  // Project Panels trigger "VIEW" label
  const projectBoxes = document.querySelectorAll('.project-image-box, .project-panel');
  projectBoxes.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor?.classList.add('cursor-view');
    });
    el.addEventListener('mouseleave', () => {
      cursor?.classList.remove('cursor-view');
    });
  });

  // =========================================================================
  // 5. HERO FLASHLIGHT SPOTLIGHT & PORTRAIT PARALLAX
  // =========================================================================
  const portraitStage = document.getElementById('hero-portrait-stage');
  const portraitReveal = document.getElementById('portrait-reveal-img');
  const portraitBase = document.getElementById('portrait-base-img');
  const spotlightBeam = document.getElementById('spotlight-beam');
  const bgTypographyRows = document.querySelectorAll('.hero-text-row');

  let spotCurrentX = 50;
  let spotCurrentY = 45;
  let spotTargetX = 50;
  let spotTargetY = 45;

  let tiltCurrentX = 0;
  let tiltCurrentY = 0;
  let tiltTargetX = 0;
  let tiltTargetY = 0;

  // Track coordinates relative to portrait stage
  window.addEventListener('mousemove', (e) => {
    if (!portraitStage) return;
    const rect = portraitStage.getBoundingClientRect();

    // Spot coordinates as percentage inside stage
    const relX = ((e.clientX - rect.left) / rect.width) * 100;
    const relY = ((e.clientY - rect.top) / rect.height) * 100;

    spotTargetX = Math.max(0, Math.min(100, relX));
    spotTargetY = Math.max(0, Math.min(100, relY));

    // Parallax tilt from screen center (-1 to 1)
    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    const normY = (e.clientY / window.innerHeight) * 2 - 1;
    tiltTargetX = normX;
    tiltTargetY = normY;
  }, { passive: true });

  // Touch screen support for flashlight
  window.addEventListener('touchmove', (e) => {
    if (!portraitStage || !e.touches[0]) return;
    const touch = e.touches[0];
    const rect = portraitStage.getBoundingClientRect();
    const relX = ((touch.clientX - rect.left) / rect.width) * 100;
    const relY = ((touch.clientY - rect.top) / rect.height) * 100;

    spotTargetX = Math.max(0, Math.min(100, relX));
    spotTargetY = Math.max(0, Math.min(100, relY));

    const normX = (touch.clientX / window.innerWidth) * 2 - 1;
    const normY = (touch.clientY / window.innerHeight) * 2 - 1;
    tiltTargetX = normX;
    tiltTargetY = normY;
    lastMoveTime = Date.now();
  }, { passive: true });

  // Smooth spotlight & parallax render loop
  let idleAngle = 0;
  function renderHeroStage() {
    const isIdle = Date.now() - lastMoveTime > 3200;

    if (isIdle) {
      // Gentle automatic organic sweep when idle or on mobile load
      idleAngle += 0.012;
      spotTargetX = 50 + Math.cos(idleAngle) * 24;
      spotTargetY = 42 + Math.sin(idleAngle * 1.6) * 20;
      tiltTargetX = Math.cos(idleAngle) * 0.25;
      tiltTargetY = Math.sin(idleAngle) * 0.2;
    }

    // Smooth Lerp (0.08 factor for silky flashlight inertia)
    spotCurrentX += (spotTargetX - spotCurrentX) * 0.08;
    spotCurrentY += (spotTargetY - spotCurrentY) * 0.08;

    tiltCurrentX += (tiltTargetX - tiltCurrentX) * 0.06;
    tiltCurrentY += (tiltTargetY - tiltCurrentY) * 0.06;

    if (portraitStage) {
      // Update CSS custom properties for radial mask & flashlight beam
      portraitStage.style.setProperty('--spot-x', `${spotCurrentX.toFixed(2)}%`);
      portraitStage.style.setProperty('--spot-y', `${spotCurrentY.toFixed(2)}%`);

      // 3D Parallax tilt on portrait
      const portraitTilt = `perspective(1000px) rotateY(${(tiltCurrentX * 7).toFixed(2)}deg) rotateX(${(-tiltCurrentY * 7).toFixed(2)}deg) translate3d(${(-tiltCurrentX * 12).toFixed(1)}px, ${(-tiltCurrentY * 12).toFixed(1)}px, 0)`;
      if (portraitReveal) portraitReveal.style.transform = portraitTilt;
      if (portraitBase) portraitBase.style.transform = portraitTilt;
    }

    // Deep parallax on oversized background typography
    bgTypographyRows.forEach((row) => {
      const speed = parseFloat(row.querySelector('span')?.getAttribute('data-parallax') || '0.1');
      const offsetX = (tiltCurrentX * 50 * speed).toFixed(1);
      const offsetY = (tiltCurrentY * 35 * speed).toFixed(1);
      row.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
    });

    requestAnimationFrame(renderHeroStage);
  }
  requestAnimationFrame(renderHeroStage);

  // Portrait Switcher Toggle
  const togglePortraitBtn = document.getElementById('toggle-portrait-style');
  const modeTags = document.querySelectorAll('.portrait-mode-pill .mode-tag');

  if (togglePortraitBtn) {
    let currentMode = 'editorial';
    togglePortraitBtn.addEventListener('click', () => {
      currentMode = currentMode === 'editorial' ? 'photographic' : 'editorial';
      const targetSrc = currentMode === 'editorial'
        ? 'assets/portrait_cutout_ref.png'
        : 'assets/portrait_real_enhanced.png';

      if (portraitReveal) portraitReveal.src = targetSrc;
      if (portraitBase) portraitBase.src = targetSrc;

      modeTags.forEach((tag) => {
        tag.classList.toggle('active', tag.getAttribute('data-mode') === currentMode);
      });
    });
  }

  // =========================================================================
  // 6. CINEMATIC PAGE TRANSITIONS & NAVIGATION
  // =========================================================================
  const sweepOverlay = document.getElementById('page-sweep-overlay');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const navTracker = document.getElementById('nav-active-tracker');

  function triggerPageTransition(targetHref) {
    if (!sweepOverlay) return;
    sweepOverlay.classList.add('active');

    setTimeout(() => {
      if (targetHref.startsWith('#')) {
        const targetEl = document.querySelector(targetHref);
        if (targetEl) {
          if (lenis) {
            lenis.scrollTo(targetEl, { offset: -70 });
          } else {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    }, 280);

    setTimeout(() => {
      sweepOverlay.classList.remove('active');
    }, 650);
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        closeMobileMenu();
        triggerPageTransition(href);
      }
    });
  });

  // Track active section on scroll
  const sections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('.nav-menu .nav-link');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 200;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        desktopNavLinks.forEach((link) => {
          const match = link.getAttribute('data-section') === id;
          link.classList.toggle('active', match);

          if (match && navTracker) {
            const rect = link.getBoundingClientRect();
            const parentRect = link.closest('.nav-container').getBoundingClientRect();
            navTracker.style.width = `${rect.width}px`;
            navTracker.style.transform = `translateX(${rect.left - parentRect.left}px)`;
          }
        });
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // Mobile Menu Drawer
  const menuToggleBtn = document.getElementById('menu-toggle-btn');
  const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileMenuBackdrop = document.querySelector('.mobile-menu-backdrop');

  function openMobileMenu() {
    mobileMenuDrawer?.classList.add('open');
    menuToggleBtn?.setAttribute('aria-expanded', 'true');
  }

  function closeMobileMenu() {
    mobileMenuDrawer?.classList.remove('open');
    menuToggleBtn?.setAttribute('aria-expanded', 'false');
  }

  menuToggleBtn?.addEventListener('click', openMobileMenu);
  mobileMenuClose?.addEventListener('click', closeMobileMenu);
  mobileMenuBackdrop?.addEventListener('click', closeMobileMenu);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
      closeModal();
    }
  });

  // =========================================================================
  // 7. STATS COUNTER ANIMATION (About Section)
  // =========================================================================
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsTriggered = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !statsTriggered) {
        statsTriggered = true;
        statNumbers.forEach((stat) => {
          const targetStr = stat.getAttribute('data-target') || '0';
          const target = parseInt(targetStr, 10);
          const plusSpan = stat.querySelector('.stat-plus');
          const plusChar = plusSpan ? plusSpan.textContent : '';

          let count = 0;
          const duration = 1600;
          const startTime = performance.now();

          function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            const val = Math.floor(ease * target);
            const formatted = val < 10 && target < 10 ? `0${val}` : val;
            stat.innerHTML = `${formatted}<span class="stat-plus">${plusChar}</span>`;

            if (progress < 1) {
              requestAnimationFrame(step);
            }
          }
          requestAnimationFrame(step);
        });
      }
    });
  }, { threshold: 0.3 });

  const statsRow = document.querySelector('.editorial-stats-row');
  if (statsRow) statsObserver.observe(statsRow);

  // =========================================================================
  // 8. SKILLS MATRIX & LIVE AUDIT HUD
  // =========================================================================
  const skillCategoryButtons = document.querySelectorAll('.cat-tab-btn');
  const disciplinePanels = document.querySelectorAll('.skill-discipline-panel');
  const skillPills = document.querySelectorAll('.skill-pill');

  const hudSkillTitle = document.getElementById('hud-skill-title');
  const hudSkillDesc = document.getElementById('hud-skill-desc');
  const hudSkillExp = document.getElementById('hud-skill-exp');

  // Category Filtering
  skillCategoryButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      skillCategoryButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      disciplinePanels.forEach((panel) => {
        if (filter === 'all' || panel.getAttribute('data-category') === filter) {
          panel.style.display = 'flex';
        } else {
          panel.style.display = 'none';
        }
      });
    });
  });

  // Pill Hover / Click updates HUD
  skillPills.forEach((pill) => {
    const updateHud = () => {
      skillPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');

      const name = pill.querySelector('.skill-name')?.textContent || '';
      const desc = pill.getAttribute('data-desc') || '';
      const exp = pill.getAttribute('data-exp') || '';

      if (hudSkillTitle) hudSkillTitle.textContent = name;
      if (hudSkillDesc) hudSkillDesc.textContent = desc;
      if (hudSkillExp) hudSkillExp.textContent = exp;
    };

    pill.addEventListener('mouseenter', updateHud);
    pill.addEventListener('click', updateHud);
  });

  // =========================================================================
  // 9. SELECTED PROJECTS & INTERACTIVE CASE STUDY MODAL
  // =========================================================================
  const projectDatabase = {
    lumen: {
      title: 'KINETIC LUMEN',
      category: '01 — BRAND EXPERIENCE & SPATIAL WEBGL',
      year: '2026',
      img: 'assets/project_lumen.jpg',
      client: 'KINETIC ARCHITECTS / AURA COLLABORATIVE',
      desc: 'An architectural brand experience merging geometric 3D monoliths with real-time neon raymarching shaders. Engineered for spatial luxury and interactive discovery, featuring continuous camera interpolation, depth-of-field post-processing, and multi-tier lighting models running at a locked 60 FPS.',
      highlights: [
        'Custom GLSL raymarching shader generating volumetric neon yellow illumination along faceted monolith edges.',
        'Zero layout shifts with responsive WebGL viewport scaling across ultra-wide, desktop, and mobile displays.',
        'Seamless scroll-driven camera choreography powered by GSAP timeline bindings and Lenis smooth momentum.'
      ],
      tags: ['WebGL', 'Three.js', 'GLSL Shaders', 'GSAP', 'Vite', 'Custom Audio']
    },
    aura: {
      title: 'ONYX & LUMINAR',
      category: '02 — HIGH FASHION DIGITAL SHOWCASE',
      year: '2025',
      img: 'assets/project_aura.jpg',
      client: 'LUMINAR EDITORIAL / MILAN PARIS',
      desc: 'A futuristic digital runway showcase where fluid chrome and sculptural textiles react organically to cursor velocity. High-contrast neon yellow rim illumination on deep matte obsidian surfaces evokes experimental haute couture and high-tech digital craft.',
      highlights: [
        'Interactive fluid particle mesh mimicking aerodynamic cloth drape and reactive chrome specular highlights.',
        'Editorial typography grid inspired by Swiss brutalism and avant-garde luxury magazines.',
        'Sub-1.2s first contentful paint utilizing progressive texture streaming and AVIF compression.'
      ],
      tags: ['Creative Direction', 'React', 'Canvas 2D', 'Lenis Scroll', 'Figma', 'Blender']
    },
    neural: {
      title: 'AURAL WAVES',
      category: '03 — AUDIO-REACTIVE GENERATIVE INSTALLATION',
      year: '2025',
      img: 'assets/project_neural.jpg',
      client: 'DARKVOID GALLERY / LONDON',
      desc: 'A generative audio-reactive installation with volumetric yellow laser beams cutting through pitch black exhibition halls. The system performs real-time Fast Fourier Transform (FFT) analysis on live spatial microphone inputs, projecting complex Lissajous waveforms across architectural spaces.',
      highlights: [
        'Custom Web Audio API analyzer pipeline processing 2048 FFT bins with negligible audio latency.',
        'Dynamic laser beam divergence simulation rendered through custom GPU fragment passes.',
        'Interactive frequency dashboard allowing visitors to modulate room resonances via mobile WebSockets.'
      ],
      tags: ['Web Audio API', 'Custom Shaders', 'TouchDesigner', 'GLSL', 'Canvas', 'WebGL']
    },
    chronos: {
      title: 'CHRONOS VOID',
      category: '04 — ATMOSPHERIC LANDSCAPE STUDY',
      year: '2025',
      img: 'assets/project_chronos.jpg',
      client: 'INDEPENDENT PHOTOGRAMMETRY & MONUMENT ARCHIVE',
      desc: 'An ambient photographic study examining the intersection of golden hour illumination, historic Kolkata monuments, and real-time atmospheric particle simulation. Incorporates authentic high-resolution field photography captured during twilight over the Maidan.',
      highlights: [
        'Multi-plane parallax depth mapping isolating historical Victoria Memorial contours and tree canopies.',
        'Atmospheric yellow particulate drift mirroring natural dusk humidity and golden sun dispersal.',
        'High dynamic range tone mapping calibrated for OLED and HDR digital display systems.'
      ],
      tags: ['Photography', 'Color Grading', 'Parallax Stage', 'Editorial CSS', 'Canvas 2D']
    }
  };

  const projectModal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalImg = document.getElementById('modal-img');
  const modalIndex = document.getElementById('modal-index');
  const modalYear = document.getElementById('modal-year');
  const modalTitle = document.getElementById('modal-title');
  const modalCatDesc = document.getElementById('modal-category-desc');
  const modalFullDesc = document.getElementById('modal-full-desc');
  const modalHighlights = document.getElementById('modal-highlights');
  const modalTags = document.getElementById('modal-tags');
  const modalClient = document.getElementById('modal-client');
  const modalDemoBtn = document.getElementById('modal-demo-btn');

  function openProjectModal(projectId) {
    const data = projectDatabase[projectId];
    if (!data || !projectModal) return;

    if (modalImg) modalImg.src = data.img;
    if (modalIndex) modalIndex.textContent = data.category.split('—')[0].trim();
    if (modalYear) modalYear.textContent = data.year;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalCatDesc) modalCatDesc.textContent = data.category;
    if (modalFullDesc) modalFullDesc.textContent = data.desc;
    if (modalClient) modalClient.textContent = data.client;

    if (modalHighlights) {
      modalHighlights.innerHTML = data.highlights
        .map((h) => `<li>${h}</li>`)
        .join('');
    }

    if (modalTags) {
      modalTags.innerHTML = data.tags
        .map((t) => `<span>${t}</span>`)
        .join('');
    }

    projectModal.classList.add('active');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!projectModal) return;
    projectModal.classList.remove('active');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.project-modal-trigger-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-project-id');
      if (id) openProjectModal(id);
    });
  });

  modalCloseBtn?.addEventListener('click', closeModal);
  modalBackdrop?.addEventListener('click', closeModal);

  modalDemoBtn?.addEventListener('click', () => {
    alert('Prototype sandbox instance initializing for selected project showcase.');
  });

  // =========================================================================
  // 10. CONTACT FORM, EMAIL COPY & LIVE IST CLOCK
  // =========================================================================
  // Live IST Clock (Kolkata: Asia/Kolkata)
  const istClockEl = document.getElementById('ist-live-clock');
  function updateISTClock() {
    if (!istClockEl) return;
    try {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const timeStr = new Intl.DateTimeFormat('en-GB', options).format(now);
      istClockEl.textContent = `${timeStr} IST`;
    } catch (e) {
      istClockEl.textContent = '19:42:00 IST';
    }
  }
  setInterval(updateISTClock, 1000);
  updateISTClock();

  // One-Click Email Copy
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const copyText = document.getElementById('copy-text');
  copyEmailBtn?.addEventListener('click', () => {
    const email = 'sagnik.creative@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      if (copyText) copyText.textContent = 'COPIED TO CLIPBOARD ✓';
      copyEmailBtn.style.background = 'var(--neon-yellow)';
      copyEmailBtn.style.color = 'var(--bg-deep)';

      setTimeout(() => {
        if (copyText) copyText.textContent = 'COPY EMAIL';
        copyEmailBtn.style.background = '';
        copyEmailBtn.style.color = '';
      }, 2500);
    }).catch(() => {
      alert(`Email: ${email}`);
    });
  });

  // Inquiry Form Validation & Submission
  const contactForm = document.getElementById('contact-form');
  const nameInput = document.getElementById('form-name');
  const emailInput = document.getElementById('form-email');
  const messageInput = document.getElementById('form-message');
  const feedbackMsg = document.getElementById('form-feedback-message');
  const submitBtn = document.getElementById('form-submit-btn');

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Reset errors
    if (nameError) nameError.textContent = '';
    if (emailError) emailError.textContent = '';
    if (messageError) messageError.textContent = '';
    if (feedbackMsg) {
      feedbackMsg.textContent = '';
      feedbackMsg.className = 'form-feedback-msg';
    }

    if (!nameInput.value.trim()) {
      if (nameError) nameError.textContent = 'Please enter your name.';
      isValid = false;
    }

    if (!emailInput.value.trim() || !validateEmail(emailInput.value.trim())) {
      if (emailError) emailError.textContent = 'Please enter a valid email address.';
      isValid = false;
    }

    if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
      if (messageError) messageError.textContent = 'Please provide details about the project vision (min 10 chars).';
      isValid = false;
    }

    if (!isValid) return;

    // Simulate Transmission
    if (submitBtn) {
      submitBtn.disabled = true;
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span>ENCRYPTING & TRANSMITTING...</span>`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        contactForm.reset();

        if (feedbackMsg) {
          feedbackMsg.className = 'form-feedback-msg success';
          feedbackMsg.textContent = 'TRANSMISSION RECEIVED. SAGNIK WILL RESPOND WITHIN 24 HOURS.';
        }
      }, 1200);
    }
  });

  // Back to Top Button
  const backToTopBtn = document.getElementById('back-to-top-btn');
  backToTopBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
});
