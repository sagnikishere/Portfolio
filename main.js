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
  let lastMoveTime = Date.now();

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    lastMoveTime = Date.now();
  }, { passive: true });

  function updateCursor() {
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;

    if (cursor) {
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    }
    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);

  // Interactive Hover Targets
  const interactiveElements = document.querySelectorAll(
    'a, button, .skill-pill, .tech-badge, input, textarea, .trip-story-card, .passion-collab-card, .about-photo-wrapper, .pillar-item, .about-monogram-box, .social-pill-btn, .about-stat-item, .wip-sketch-wrapper'
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

  // Trip story cards trigger "VIEW" label on cursor
  const tripCards = document.querySelectorAll('.trip-story-card');
  tripCards.forEach((el) => {
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
  const bgTypographyRows = document.querySelectorAll('.hero-text-row');

  let spotCurrentX = 50;
  let spotCurrentY = 45;
  let spotTargetX = 50;
  let spotTargetY = 45;

  let tiltCurrentX = 0;
  let tiltCurrentY = 0;
  let tiltTargetX = 0;
  let tiltTargetY = 0;

  window.addEventListener('mousemove', (e) => {
    if (!portraitStage) return;
    const rect = portraitStage.getBoundingClientRect();

    const relX = ((e.clientX - rect.left) / rect.width) * 100;
    const relY = ((e.clientY - rect.top) / rect.height) * 100;

    spotTargetX = Math.max(0, Math.min(100, relX));
    spotTargetY = Math.max(0, Math.min(100, relY));

    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    const normY = (e.clientY / window.innerHeight) * 2 - 1;
    tiltTargetX = normX;
    tiltTargetY = normY;
  }, { passive: true });

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

  let idleAngle = 0;
  function renderHeroStage() {
    const isIdle = Date.now() - lastMoveTime > 3000;

    if (isIdle) {
      idleAngle += 0.012;
      spotTargetX = 50 + Math.cos(idleAngle) * 22;
      spotTargetY = 42 + Math.sin(idleAngle * 1.5) * 18;
      tiltTargetX = Math.cos(idleAngle) * 0.2;
      tiltTargetY = Math.sin(idleAngle) * 0.15;
    }

    spotCurrentX += (spotTargetX - spotCurrentX) * 0.08;
    spotCurrentY += (spotTargetY - spotCurrentY) * 0.08;

    tiltCurrentX += (tiltTargetX - tiltCurrentX) * 0.06;
    tiltCurrentY += (tiltTargetY - tiltCurrentY) * 0.06;

    if (portraitStage) {
      portraitStage.style.setProperty('--spot-x', `${spotCurrentX.toFixed(2)}%`);
      portraitStage.style.setProperty('--spot-y', `${spotCurrentY.toFixed(2)}%`);

      const portraitTilt = `perspective(1000px) rotateY(${(tiltCurrentX * 6).toFixed(2)}deg) rotateX(${(-tiltCurrentY * 6).toFixed(2)}deg) translate3d(${(-tiltCurrentX * 10).toFixed(1)}px, ${(-tiltCurrentY * 10).toFixed(1)}px, 0)`;
      if (portraitReveal) portraitReveal.style.transform = portraitTilt;
      if (portraitBase) portraitBase.style.transform = portraitTilt;
    }

    bgTypographyRows.forEach((row) => {
      const speed = parseFloat(row.querySelector('span')?.getAttribute('data-parallax') || '0.1');
      const offsetX = (tiltCurrentX * 45 * speed).toFixed(1);
      const offsetY = (tiltCurrentY * 30 * speed).toFixed(1);
      row.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
    });

    requestAnimationFrame(renderHeroStage);
  }
  requestAnimationFrame(renderHeroStage);

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
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileMenuDrawer?.classList.remove('open');
    menuToggleBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  menuToggleBtn?.addEventListener('click', openMobileMenu);
  mobileMenuClose?.addEventListener('click', closeMobileMenu);
  mobileMenuBackdrop?.addEventListener('click', closeMobileMenu);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
      closeSuccessModal();
    }
  });

  // =========================================================================
  // 6B. ABOUT ME INTERACTIVE 3D TILT, VOLUMETRIC SPOTLIGHT & STATS COUNTER
  // =========================================================================
  const aboutPhotoWrapper = document.getElementById('about-photo-wrapper');
  if (aboutPhotoWrapper) {
    let aboutTiltX = 0;
    let aboutTiltY = 0;
    let targetAboutTiltX = 0;
    let targetAboutTiltY = 0;
    let isHoveringPhoto = false;

    aboutPhotoWrapper.addEventListener('mousemove', (e) => {
      isHoveringPhoto = true;
      const rect = aboutPhotoWrapper.getBoundingClientRect();
      const xPct = ((e.clientX - rect.left) / rect.width) * 100;
      const yPct = ((e.clientY - rect.top) / rect.height) * 100;
      aboutPhotoWrapper.style.setProperty('--about-spot-x', `${xPct.toFixed(1)}%`);
      aboutPhotoWrapper.style.setProperty('--about-spot-y', `${yPct.toFixed(1)}%`);

      // Ultra-smooth lerped 3D tilt
      targetAboutTiltX = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
      targetAboutTiltY = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    });

    aboutPhotoWrapper.addEventListener('mouseleave', () => {
      isHoveringPhoto = false;
      targetAboutTiltX = 0;
      targetAboutTiltY = 0;
      aboutPhotoWrapper.style.setProperty('--about-spot-x', '50%');
      aboutPhotoWrapper.style.setProperty('--about-spot-y', '50%');
    });

    function renderAboutTilt() {
      aboutTiltX += (targetAboutTiltX - aboutTiltX) * 0.1;
      aboutTiltY += (targetAboutTiltY - aboutTiltY) * 0.1;

      if (isHoveringPhoto || Math.abs(aboutTiltX) > 0.05 || Math.abs(aboutTiltY) > 0.05) {
        aboutPhotoWrapper.style.transform = `perspective(900px) rotateX(${aboutTiltX.toFixed(2)}deg) rotateY(${aboutTiltY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
      } else {
        aboutPhotoWrapper.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      }
      requestAnimationFrame(renderAboutTilt);
    }
    requestAnimationFrame(renderAboutTilt);
  }

  // Animated Numbers Counter for About Me Stats
  const aboutStatsContainer = document.getElementById('about-stats-counter');
  let aboutStatsAnimated = false;
  if (aboutStatsContainer) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !aboutStatsAnimated) {
          aboutStatsAnimated = true;
          const statItems = aboutStatsContainer.querySelectorAll('.stat-number');
          statItems.forEach((statEl) => {
            const targetVal = parseInt(statEl.getAttribute('data-target') || '0', 10);
            const originalText = statEl.textContent;
            const hasPlus = originalText.includes('+');
            const hasPct = originalText.includes('%');
            let current = 0;
            const duration = 1500;
            const stepMs = Math.max(25, Math.floor(duration / (targetVal || 1)));

            const timer = setInterval(() => {
              current += Math.max(1, Math.ceil(targetVal / 25));
              if (current >= targetVal) {
                current = targetVal;
                clearInterval(timer);
              }
              let displayVal = current < 10 && !hasPct ? `0${current}` : `${current}`;
              if (hasPlus) displayVal += '+';
              if (hasPct) displayVal += '%';
              statEl.textContent = displayVal;
            }, stepMs);
          });
        }
      });
    }, { threshold: 0.3 });
    statsObserver.observe(aboutStatsContainer);
  }

  // =========================================================================
  // 7. ULTRA SMOOTH SKILLS MATRIX & INTERACTIVE HUD
  // =========================================================================
  const skillCategoryButtons = document.querySelectorAll('.cat-tab-btn');
  const disciplinePanels = document.querySelectorAll('.skill-discipline-panel');
  const skillPills = document.querySelectorAll('.skill-pill');

  const hudSkillTitle = document.getElementById('hud-skill-title');
  const hudSkillDesc = document.getElementById('hud-skill-desc');
  const hudSkillExp = document.getElementById('hud-skill-exp');

  // Category Filtering with Smooth Transition
  skillCategoryButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      skillCategoryButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      disciplinePanels.forEach((panel) => {
        if (filter === 'all' || panel.getAttribute('data-category') === filter) {
          panel.style.display = 'flex';
          panel.style.opacity = '0';
          setTimeout(() => {
            panel.style.transition = 'opacity 0.4s ease';
            panel.style.opacity = '1';
          }, 10);
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

  // Animate skill progress bars smoothly on scroll into view
  const skillsSection = document.getElementById('skills');
  let skillsAnimated = false;
  if (skillsSection) {
    const skillsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !skillsAnimated) {
          skillsAnimated = true;
          document.querySelectorAll('.skill-pill').forEach((pill) => {
            const fill = pill.querySelector('.bar-fill');
            const targetWidth = pill.getAttribute('data-exp') || '90%';
            if (fill) {
              fill.style.width = '0%';
              setTimeout(() => {
                fill.style.transition = 'width 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
                fill.style.width = targetWidth;
              }, 150);
            }
          });
        }
      });
    }, { threshold: 0.2 });
    skillsObserver.observe(skillsSection);
  }

  // =========================================================================
  // 8. PROJECTS "WORK IN PROGRESS" DYNAMIC LOADING ANIMATION
  // =========================================================================
  const wipPctEl = document.getElementById('wip-numeric-pct');
  const wipActionTxt = document.getElementById('wip-action-txt');
  const wipBarFill = document.getElementById('wip-bar-fill');

  const statusMessages = [
    '> GOOD THING TAKES TIME...',
    '> 95% COMPLETED — FINALIZING POLISH...',
    '> DEPLOYING FULL-STACK & GRAPHIC ASSETS...',
    '> COMPILING HIGH-PERFORMANCE WEB APPS...',
    '> POLISHING BRAND IDENTITY & LOGO ASSETS...',
    '> PREPARING INTERACTIVE 60FPS DEMOS...'
  ];

  let statusMsgIndex = 0;
  setInterval(() => {
    if (wipActionTxt) {
      statusMsgIndex = (statusMsgIndex + 1) % statusMessages.length;
      wipActionTxt.style.opacity = '0';
      setTimeout(() => {
        wipActionTxt.textContent = statusMessages[statusMsgIndex];
        wipActionTxt.style.transition = 'opacity 0.4s ease';
        wipActionTxt.style.opacity = '1';
      }, 300);
    }
  }, 3200);

  // Dynamic live progress percentage pulse
  let currentPct = 96;
  setInterval(() => {
    // Gently breathe between 95 and 98%
    const offsets = [95, 96, 97, 98, 97, 96];
    currentPct = offsets[Math.floor(Math.random() * offsets.length)];
    if (wipPctEl) wipPctEl.textContent = `${currentPct}%`;
    if (wipBarFill) wipBarFill.style.width = `${currentPct}%`;
  }, 4000);

  // =========================================================================
  // 9. LIVE IST CLOCK & ONE-CLICK EMAIL COPY
  // =========================================================================
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

  // =========================================================================
  // 10. SOOTHING CONTACT FORM SUBMISSION & CONFIRMATION POPUP MODAL
  // =========================================================================
  const contactForm = document.getElementById('contact-form');
  const nameInput = document.getElementById('form-name');
  const emailInput = document.getElementById('form-email');
  const messageInput = document.getElementById('form-message');
  const submitBtn = document.getElementById('form-submit-btn');

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');

  const successModal = document.getElementById('contact-success-modal');
  const successCloseBtn = document.getElementById('success-modal-close');
  const successDismissBtn = document.getElementById('success-dismiss-btn');
  const successBackdrop = document.getElementById('success-modal-backdrop');

  function openSuccessModal() {
    if (!successModal) return;
    successModal.classList.add('active');
    successModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    synth.playHoverBlip();
  }

  function closeSuccessModal() {
    if (!successModal) return;
    successModal.classList.remove('active');
    successModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  successCloseBtn?.addEventListener('click', closeSuccessModal);
  successDismissBtn?.addEventListener('click', closeSuccessModal);
  successBackdrop?.addEventListener('click', closeSuccessModal);

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    if (nameError) nameError.textContent = '';
    if (emailError) emailError.textContent = '';
    if (messageError) messageError.textContent = '';

    if (!nameInput?.value.trim()) {
      if (nameError) nameError.textContent = 'Please provide your name.';
      isValid = false;
    }

    if (!emailInput?.value.trim() || !validateEmail(emailInput.value.trim())) {
      if (emailError) emailError.textContent = 'Please provide a valid email address.';
      isValid = false;
    }

    if (!messageInput?.value.trim() || messageInput.value.trim().length < 6) {
      if (messageError) messageError.textContent = 'Please tell me a little about your project or message.';
      isValid = false;
    }

    if (!isValid) return;

    if (submitBtn) {
      submitBtn.disabled = true;
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span>SENDING...</span>`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        contactForm.reset();
        // Show soothing pop-up as requested by the user
        openSuccessModal();
      }, 700);
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

  // =========================================================================
  // ESCAPE SECTION — Fixed background activation + drag-scroll on cards
  // =========================================================================
  const escapeSection = document.getElementById('passion');

  // Toggle bg-active class so the fixed backdrop fades in/out
  if (escapeSection) {
    const escapeObserver = new IntersectionObserver(
      ([entry]) => {
        escapeSection.classList.toggle('bg-active', entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    escapeObserver.observe(escapeSection);
  }

  // Mouse drag-to-scroll for horizontal trip cards track
  const hscroll = document.getElementById('escape-hscroll');
  if (hscroll) {
    let isDown = false;
    let startX;
    let scrollLeft;

    hscroll.addEventListener('mousedown', (e) => {
      isDown = true;
      hscroll.style.cursor = 'grabbing';
      startX = e.pageX - hscroll.offsetLeft;
      scrollLeft = hscroll.scrollLeft;
      if (lenis) lenis.stop();
    });
    hscroll.addEventListener('mouseleave', () => {
      if (isDown && lenis) lenis.start();
      isDown = false;
      hscroll.style.cursor = 'grab';
    });
    hscroll.addEventListener('mouseup', () => {
      if (lenis) lenis.start();
      isDown = false;
      hscroll.style.cursor = 'grab';
    });
    hscroll.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - hscroll.offsetLeft;
      const walk = (x - startX) * 1.5;
      hscroll.scrollLeft = scrollLeft - walk;
    });
  }
});
