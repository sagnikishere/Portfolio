const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

// 1. Replace ABOUT ME SECTION block
const aboutStart = css.indexOf('/* ==========================================================================\n   ABOUT ME SECTION');
const aboutEnd = css.indexOf('/* ==========================================================================\n   TECH STACK & TOOLS');

if (aboutStart === -1 || aboutEnd === -1) {
  console.error('Could not find ABOUT ME SECTION boundaries', { aboutStart, aboutEnd });
  process.exit(1);
}

const newAboutCss = `/* ==========================================================================
   ABOUT ME SECTION (Ultra Sleek Bento Architecture)
   ========================================================================== */
.about-bento-grid {
  display: grid;
  grid-template-columns: 410px 1fr;
  gap: 3.5rem;
  align-items: stretch;
}

.about-bento-visual {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Interactive Photo Wrapper with Dynamic Glow */
.about-photo-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 4.8;
  background-color: var(--bg-panel);
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

/* Ambient glow spotlight under mouse */
.about-photo-wrapper::before {
  content: '';
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle at var(--about-spot-x, 50%) var(--about-spot-y, 50%), rgba(223, 255, 0, 0.35) 0%, rgba(223, 255, 0, 0.12) 35%, transparent 70%);
  border-radius: 12px;
  opacity: 0;
  pointer-events: none;
  z-index: 0;
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  filter: blur(20px);
}

.about-photo-wrapper:hover::before {
  opacity: 1;
}

.photo-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid var(--border-subtle);
  background: #000;
  transition: border-color 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Default state: strictly BLACK & WHITE */
.about-portrait-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  filter: grayscale(100%) contrast(1.18) brightness(0.9);
  transition: filter 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: filter, transform;
}

/* Hover state: FULL COLOR + RADIANT GLOW */
.about-photo-wrapper:hover .about-portrait-img {
  filter: grayscale(0%) contrast(1.06) brightness(1.08) saturate(1.18);
  transform: scale(1.035);
}

.about-photo-wrapper:hover .photo-container {
  border-color: rgba(223, 255, 0, 0.7);
  box-shadow: 0 0 40px rgba(223, 255, 0, 0.45), 0 0 85px rgba(223, 255, 0, 0.22), inset 0 0 25px rgba(223, 255, 0, 0.15);
}

.photo-accent-frame {
  position: absolute;
  top: -10px;
  left: -10px;
  width: 100%;
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  pointer-events: none;
  z-index: 1;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 6px;
}

.about-photo-wrapper:hover .photo-accent-frame {
  border-color: var(--neon-yellow);
  box-shadow: 0 0 25px rgba(223, 255, 0, 0.6), inset 0 0 15px rgba(223, 255, 0, 0.15);
  transform: translate(6px, 6px);
}

.photo-yellow-vignette {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(5, 5, 5, 0.65) 75%, rgba(5, 5, 5, 0.98) 92%, #050505 100%);
  pointer-events: none;
}

/* Floating Badges */
@keyframes badgeFloat {
  0% { transform: translateY(0); }
  100% { transform: translateY(-7px); }
}

.about-badge-card {
  position: absolute;
  background: rgba(10, 10, 10, 0.88);
  border: 1px solid var(--border-subtle);
  padding: 0.55rem 1rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  z-index: 2;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  filter: grayscale(100%);
  border-radius: 4px;
}

.badge-top {
  top: 1.2rem;
  right: -1.2rem;
  border-left: 2px solid var(--neon-yellow);
  animation: badgeFloat 4s ease-in-out infinite alternate;
}

.badge-bottom {
  bottom: 1.5rem;
  left: -1.2rem;
  border-right: 2px solid var(--neon-yellow);
  animation: badgeFloat 4.5s ease-in-out infinite alternate-reverse;
}

.about-photo-wrapper:hover .about-badge-card {
  filter: grayscale(0%);
  border-color: var(--neon-yellow);
  box-shadow: 0 0 20px rgba(223, 255, 0, 0.35);
}

.status-indicator-dot {
  width: 6px;
  height: 6px;
  background-color: var(--neon-yellow);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--neon-yellow);
}

/* Compact Identity Strip */
.about-identity-strip {
  padding: 1.1rem 1.4rem;
  background: rgba(13, 13, 13, 0.85);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.about-identity-strip:hover {
  border-color: rgba(223, 255, 0, 0.4);
  box-shadow: 0 0 24px rgba(223, 255, 0, 0.15);
  transform: translateY(-2px);
}

.about-crest-img {
  width: 44px;
  height: 44px;
  object-fit: contain;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.about-identity-strip:hover .about-crest-img {
  transform: scale(1.1) rotate(3deg);
}

.crest-title {
  display: block;
  font-family: var(--font-display);
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--text-primary);
}

.crest-desc {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--text-muted);
  letter-spacing: 0.12em;
  margin-top: 2px;
}

/* About Bento Content Column */
.about-bento-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  justify-content: space-between;
}

/* Intro Card */
.about-intro-card {
  padding: 1.8rem 2.2rem;
  background: rgba(13, 13, 13, 0.85);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  position: relative;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.about-intro-card:hover {
  border-color: rgba(223, 255, 0, 0.35);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(223, 255, 0, 0.08);
}

.about-lead-statement {
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--text-primary);
  margin-bottom: 0.85rem;
  letter-spacing: -0.01em;
}

.about-lead-statement strong {
  color: var(--neon-yellow);
  font-weight: 600;
}

.about-sub-statement {
  font-size: 0.95rem;
  line-height: 1.75;
  color: var(--text-muted);
  margin-bottom: 1.35rem;
}

.about-sub-statement strong {
  color: var(--text-secondary);
  font-weight: 500;
}

.about-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.about-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.85rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.about-chip:hover {
  border-color: var(--neon-yellow);
  color: var(--neon-yellow);
  background: rgba(223, 255, 0, 0.08);
  transform: translateY(-2px);
}

/* Dual Focus Cards */
.about-dual-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.about-focus-card {
  padding: 1.5rem 1.6rem;
  background: rgba(13, 13, 13, 0.85);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.about-focus-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--neon-yellow);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.about-focus-card:hover {
  border-color: rgba(223, 255, 0, 0.4);
  background: rgba(20, 20, 20, 0.95);
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 0 0 25px rgba(223, 255, 0, 0.12);
}

.about-focus-card:hover::before {
  opacity: 1;
}

.focus-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
}

.focus-num {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--neon-yellow);
  letter-spacing: 0.1em;
}

.focus-icon-box {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--neon-yellow);
  opacity: 0.8;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.focus-icon-box svg {
  width: 20px;
  height: 20px;
}

.about-focus-card:hover .focus-icon-box {
  transform: scale(1.15);
  opacity: 1;
}

.focus-title {
  font-family: var(--font-display);
  font-size: 0.98rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text-primary);
  margin-bottom: 0.45rem;
}

.focus-desc {
  font-size: 0.84rem;
  line-height: 1.65;
  color: var(--text-muted);
}

/* Stats Bento Row */
.about-stats-bento {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1.2rem 1.6rem;
  background: rgba(13, 13, 13, 0.85);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.about-stats-bento:hover {
  border-color: rgba(223, 255, 0, 0.3);
  box-shadow: 0 0 20px rgba(223, 255, 0, 0.08);
}

.stat-bento-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-bento-item .stat-number {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 2.5vw, 2.2rem);
  font-weight: 800;
  color: var(--neon-yellow);
  line-height: 1;
  text-shadow: 0 0 16px rgba(223, 255, 0, 0.3);
}

.stat-bento-item .stat-label {
  font-family: var(--font-mono);
  font-size: 0.64rem;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}

/* Actions and Social Bar */
.about-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.4rem;
  background: rgba(13, 13, 13, 0.85);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  flex-wrap: wrap;
}

.about-social-group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.about-social-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.8rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  text-decoration: none;
}

.about-social-pill:hover {
  background: rgba(223, 255, 0, 0.08);
  border-color: var(--neon-yellow);
  color: var(--neon-yellow);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(223, 255, 0, 0.25);
}

.about-social-pill .social-svg {
  width: 14px;
  height: 14px;
}

.about-cta-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--neon-yellow);
  text-decoration: none;
  padding: 0.45rem 0.9rem;
  border: 1px solid rgba(223, 255, 0, 0.3);
  border-radius: 4px;
  background: rgba(223, 255, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.about-cta-link:hover {
  background: var(--neon-yellow);
  color: #000;
  border-color: var(--neon-yellow);
  box-shadow: 0 0 20px rgba(223, 255, 0, 0.4);
  transform: translateY(-2px);
}

.about-cta-link .cta-arrow {
  transition: transform 0.3s ease;
}

.about-cta-link:hover .cta-arrow {
  transform: translate(2px, -2px);
}

`;

css = css.slice(0, aboutStart) + newAboutCss + css.slice(aboutEnd);

// 2. Remove PASSION & ESCAPE SECTION block
const passionStart = css.indexOf('/* ==========================================================================\n   PASSION & ESCAPE SECTION');
const passionEnd = css.indexOf('/* ==========================================================================\n   SELECTED PROJECTS SECTION');

if (passionStart !== -1 && passionEnd !== -1) {
  css = css.slice(0, passionStart) + css.slice(passionEnd);
}

// 3. Update 1200px media queries
const old1200About = `  .about-grid {
    grid-template-columns: 1.15fr 1fr;
    gap: 3.5rem;
  }
  .about-visual-col {
    max-width: 480px;
  }`;

const new1200About = `  .about-bento-grid {
    grid-template-columns: 360px 1fr;
    gap: 2.5rem;
  }`;

if (css.includes(old1200About)) {
  css = css.replace(old1200About, new1200About);
}

// Remove escape/passion from 1200px query if present
const old1200Escape = `  .escape-layout-grid {
    grid-template-columns: 38% 62%;
    gap: 2.5rem;
  }
  .escape-stories-grid {
    grid-template-columns: 1fr;
  }
  .passion-collab-card {
    grid-template-columns: 80px 1fr;
  }
  .collab-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    flex-wrap: wrap;
  }`;

if (css.includes(old1200Escape)) {
  css = css.replace(old1200Escape, '');
}

// 4. Update 900px media queries
const old900About = `  .about-grid {
    grid-template-columns: 1fr;
    gap: 3.5rem;
  }
  .about-visual-col {
    max-width: 480px;
    margin: 0 auto;
  }`;

const new900About = `  .about-bento-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
  .about-bento-visual {
    max-width: 420px;
    margin: 0 auto;
    width: 100%;
  }
  .about-dual-cards {
    grid-template-columns: 1fr;
  }`;

if (css.includes(old900About)) {
  css = css.replace(old900About, new900About);
}

// Clean up remaining escape/passion in 900px media query
const old900EscapeSection = `  /* Mobile Escape Section: Background photo stays firmly as a background behind content */
  .passion-section,
  .escape-section {
    padding: 5rem 0 4rem 0;
    position: relative;
    overflow: hidden;
  }
  .escape-backdrop-stage {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 1 !important;
    z-index: 0;
    pointer-events: none;
  }
  .escape-bg-photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 15%;
    opacity: 0.32;
    filter: brightness(0.65) contrast(1.15);
  }
  .escape-vignette-scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(5, 5, 5, 0.94) 0%, rgba(5, 5, 5, 0.72) 20%, rgba(5, 5, 5, 0.85) 60%, #050505 100%);
  }
  .escape-container {
    padding: 0 1.5rem;
    position: relative;
    z-index: 2;
  }
  .escape-layout-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
    min-height: auto;
  }
  .escape-man-clearance {
    display: none;
  }
  .escape-stories-grid {
    grid-template-columns: 1fr;
  }`;

if (css.includes(old900EscapeSection)) {
  css = css.replace(old900EscapeSection, '');
}

const old900Collab = `  .passion-collab-card {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 2.4rem 1.8rem;
    gap: 1.8rem;
  }`;

if (css.includes(old900Collab)) {
  css = css.replace(old900Collab, '');
}

// 5. Append mobile 600px helper styles
const mobile600Extra = `
@media (max-width: 600px) {
  .about-stats-bento {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .about-actions-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .about-cta-link {
    justify-content: center;
  }
}
`;

if (!css.includes('.about-stats-bento {')) {
  css += mobile600Extra;
} else if (!css.includes('@media (max-width: 600px) {\n  .about-stats-bento')) {
  css += mobile600Extra;
}

fs.writeFileSync('style.css', css);
console.log('Successfully updated style.css');
