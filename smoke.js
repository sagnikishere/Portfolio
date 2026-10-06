/**
 * Volumetric Neon Yellow Smoke & Atmospheric Fog Simulation
 * Highly optimized Canvas 2D engine with organic curl drift
 * and subtle cursor fluid displacement.
 */

export class SmokeSimulation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.particles = [];
    this.particleCount = 42;
    this.smokeSprite = null;

    this.mouse = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.5,
      lastX: window.innerWidth * 0.5,
      lastY: window.innerHeight * 0.5,
      vx: 0,
      vy: 0,
      active: false
    };

    this.time = 0;
    this.rafId = null;
    this.boundResize = this.resize.bind(this);
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseLeave = this.onMouseLeave.bind(this);

    this.init();
  }

  init() {
    this.resize();
    this.createSmokeSprite();
    this.spawnParticles();

    window.addEventListener('resize', this.boundResize);
    window.addEventListener('mousemove', this.boundMouseMove, { passive: true });
    document.addEventListener('mouseleave', this.boundMouseLeave);

    this.animate();
  }

  // Pre-render soft volumetric smoke puff texture to offscreen canvas
  createSmokeSprite() {
    const size = 512;
    const offscreen = document.createElement('canvas');
    offscreen.width = size;
    offscreen.height = size;
    const offCtx = offscreen.getContext('2d');

    const center = size / 2;
    const radius = size / 2;

    // Multi-stop radial gradient for soft volumetric cloud depth
    const grad = offCtx.createRadialGradient(
      center, center, 0,
      center, center, radius
    );

    // Neon Yellow core (#DFFF00) blending into warm golden yellow (#FFC72C) and fading to transparent
    grad.addColorStop(0, 'rgba(223, 255, 0, 0.45)');
    grad.addColorStop(0.2, 'rgba(235, 245, 40, 0.28)');
    grad.addColorStop(0.45, 'rgba(255, 205, 40, 0.12)');
    grad.addColorStop(0.75, 'rgba(180, 150, 0, 0.04)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    offCtx.fillStyle = grad;
    offCtx.beginPath();
    offCtx.arc(center, center, radius, 0, Math.PI * 2);
    offCtx.fill();

    this.smokeSprite = offscreen;
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || window.innerWidth;
    this.height = rect.height || window.innerHeight;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  spawnParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      const p = this.createParticle(true);
      this.particles.push(p);
    }
  }

  createParticle(randomPos = false) {
    const radius = 220 + Math.random() * 260;
    return {
      x: randomPos ? Math.random() * this.width : Math.random() * this.width,
      y: randomPos ? Math.random() * this.height : this.height + radius * 0.5,
      radius: radius,
      baseVx: (Math.random() - 0.48) * 0.35,
      baseVy: -0.25 - Math.random() * 0.45, // Slow natural upward/lateral drift
      vx: 0,
      vy: 0,
      alpha: 0.03 + Math.random() * 0.12,
      baseAlpha: 0.03 + Math.random() * 0.12,
      angle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.003,
      seed: Math.random() * 1000
    };
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
      this.mouse.active = true;
      this.mouse.vx = (e.clientX - this.mouse.lastX) * 0.5;
      this.mouse.vy = (e.clientY - this.mouse.lastY) * 0.5;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.lastX = e.clientX;
      this.mouse.lastY = e.clientY;
    }
  }

  onMouseLeave() {
    this.mouse.active = false;
    this.mouse.vx = 0;
    this.mouse.vy = 0;
  }

  animate() {
    this.time += 0.015;

    // Decay mouse velocity
    this.mouse.vx *= 0.92;
    this.mouse.vy *= 0.92;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.globalCompositeOperation = 'screen';

    const pLen = this.particles.length;
    for (let i = 0; i < pLen; i++) {
      const p = this.particles[i];

      // Subtle organic curling current
      const curl = Math.sin(this.time + p.seed) * 0.2;
      p.x += p.baseVx + p.vx + curl;
      p.y += p.baseVy + p.vy;
      p.angle += p.rotSpeed;

      // Mouse influence displacement
      if (this.mouse.active) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.hypot(dx, dy);
        const radiusOfInfluence = 260;

        if (dist < radiusOfInfluence && dist > 1) {
          const force = (1 - dist / radiusOfInfluence) * 0.03;
          // Displace gently along mouse vector + slight outward push
          p.vx += (this.mouse.vx * 0.25 + (dx / dist) * 1.8) * force;
          p.vy += (this.mouse.vy * 0.25 + (dy / dist) * 1.8) * force;
        }
      }

      // Smooth friction return to baseline drift
      p.vx *= 0.95;
      p.vy *= 0.95;

      // Boundary wraps with seamless margins
      if (p.x < -p.radius) p.x = this.width + p.radius;
      if (p.x > this.width + p.radius) p.x = -p.radius;
      if (p.y < -p.radius) {
        p.y = this.height + p.radius;
        p.x = Math.random() * this.width;
      }
      if (p.y > this.height + p.radius) p.y = -p.radius;

      // Draw particle sprite
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.angle);
      this.ctx.globalAlpha = p.alpha;
      this.ctx.drawImage(
        this.smokeSprite,
        -p.radius,
        -p.radius,
        p.radius * 2,
        p.radius * 2
      );
      this.ctx.restore();
    }

    this.rafId = requestAnimationFrame(this.animate.bind(this));
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.boundResize);
    window.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseleave', this.boundMouseLeave);
  }
}
