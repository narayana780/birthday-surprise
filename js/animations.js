(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || typeof gsap === 'undefined') return;

  const isMobile = window.innerWidth < 768 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  const rand = (min, max) => min + Math.random() * (max - min);

  /* ─── Loading Card Entrance ──────────────────────────────── */
  gsap.from('.loading-card', {
    y: 30, opacity: 0, scale: 0.94,
    duration: 0.9, ease: 'back.out(1.4)',
    force3D: true
  });

  /* ─── Spawn loading screen floating hearts ────────────────── */
  const loadingParticles = document.querySelector('.loading-particles');
  if (loadingParticles) {
    const syms  = ['♡','♥','❥','✦','✧'];
    const colors = ['rgba(233,30,140,0.65)','rgba(249,199,79,0.55)','rgba(206,147,216,0.6)'];

    // Reduce loading particles by 60% on mobile
    const particleCount = isMobile ? 7 : 18;
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('span');
      p.textContent = syms[i % syms.length];
      p.style.cssText = `
        position:absolute;
        left:${rand(0, 100)}%;
        top:-20px;
        font-size:${rand(0.6, 1.0)}rem;
        color:${colors[i % colors.length]};
        text-shadow: ${isMobile ? 'none' : '0 0 8px currentColor'};
        pointer-events:none;
        user-select:none;
      `;
      loadingParticles.appendChild(p);

      gsap.to(p, {
        y: '130vh',
        x: `${(i % 2 === 0 ? 1 : -1) * rand(15, 40)}px`,
        opacity: rand(0.3, 0.6),
        duration: rand(4, 8),
        ease: 'none',
        repeat: -1,
        delay: i * 0.2,
        force3D: true
      });
    }
  }

  /* ─── Loading heart icon bounce ────────────────────────────── */
  gsap.to('.loading-heart-icon', {
    y: -5, scale: 1.2,
    repeat: -1, yoyo: true,
    duration: 0.8, ease: 'sine.inOut',
    force3D: true
  });

  /* ─── Tree SVG breathing ──────────────────────────────────── */
  gsap.to('.tree-svg', {
    scale: 1.025, y: -8,
    repeat: -1, yoyo: true,
    duration: 3.8, ease: 'sine.inOut',
    transformOrigin: 'bottom center',
    force3D: true
  });

  /* ─── Tree branches gentle sway ──────────────────────────── */
  gsap.to('.tree-branch', {
    rotate: 2.5,
    transformOrigin: 'left center',
    repeat: -1, yoyo: true,
    duration: 4.5, ease: 'sine.inOut',
    stagger: { each: 0.6, from: 'random' },
    force3D: true
  });

  /* ─── Polaroid frame float ────────────────────────────────── */
  gsap.to('.polaroid-frame', {
    rotate: -1.5, y: -6,
    repeat: -1, yoyo: true,
    duration: 3.2, ease: 'sine.inOut',
    force3D: true
  });

  /* ─── Breeze elements ────────────────────────────────────── */
  gsap.to('.breeze', {
    x: 30, opacity: 0.35,
    repeat: -1, yoyo: true,
    duration: 4.2, ease: 'sine.inOut',
    force3D: true
  });

  /* ─── Keypad stagger entrance ────────────────────────────── */
  gsap.utils.toArray('.glass-key').forEach((key, i) => {
    gsap.fromTo(key,
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, delay: 0.07 * i, ease: 'power2.out', force3D: true }
    );
  });

  /* ─── Panda card float ───────────────────────────────────── */
  gsap.utils.toArray('.panda-card').forEach((card) => {
    gsap.fromTo(card,
      { y: 8, scale: 0.97 },
      { y: -5, scale: 1.01, duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut', force3D: true }
    );
  });

  /* ─── Countdown sparkles (Unused block, safety wrapper) ─── */
  gsap.utils.toArray('.sparkles-layer span').forEach((sparkle, i) => {
    gsap.set(sparkle, {
      left: `${rand(0, 92)}%`,
      top:  `${rand(0, 100)}%`
    });
    gsap.to(sparkle, {
      y: '-25px', opacity: 0, scale: rand(0.3, 1.8),
      duration: rand(1.5, 3),
      repeat: -1, yoyo: true, ease: 'sine.inOut',
      delay: i * 0.1,
      force3D: true
    });
  });

  /* ─── Scene One floating hearts (Unused block, safety wrapper) ─── */
  gsap.utils.toArray('#scene-one .floating-hearts-layer span').forEach((heart, i) => {
    gsap.set(heart, {
      left:    `${rand(0, 92)}%`,
      top:     `${rand(-20, -5)}%`,
      opacity: rand(0.5, 0.85)
    });
    gsap.to(heart, {
      y: '115vh',
      x: `${(i % 2 === 0 ? 1 : -1) * rand(20, 50)}px`,
      duration: rand(7, 14),
      repeat: -1, ease: 'none',
      delay: i * 0.35,
      force3D: true
    });
  });

  /* ─── Gift box gold shimmer ───────────────────────────────── */
  const giftRibbonV = document.querySelector('.gift-ribbon-v');
  const giftRibbonH = document.querySelector('.gift-ribbon-h');
  if (giftRibbonV) {
    if (isMobile) {
      // Avoid expensive box-shadow animations on mobile, animate opacity instead
      gsap.to(giftRibbonV, {
        opacity: 0.5,
        duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut'
      });
    } else {
      gsap.to(giftRibbonV, {
        opacity: 0.8,
        boxShadow: '0 0 30px rgba(249,199,79,0.9), 0 0 60px rgba(244,162,97,0.5)',
        duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut'
      });
    }
  }
  if (giftRibbonH) {
    if (isMobile) {
      // Avoid expensive box-shadow animations on mobile, animate opacity instead
      gsap.to(giftRibbonH, {
        opacity: 0.5,
        duration: 1.0, repeat: -1, yoyo: true, ease: 'sine.inOut',
        delay: 0.6
      });
    } else {
      gsap.to(giftRibbonH, {
        opacity: 0.8,
        boxShadow: '0 0 25px rgba(249,199,79,0.8), 0 0 50px rgba(244,162,97,0.4)',
        duration: 1.0, repeat: -1, yoyo: true, ease: 'sine.inOut',
        delay: 0.6
      });
    }
  }

  /* ─── Scene Five candle flicker ambient ──────────────────── */
  // Skip on mobile since CSS animations are active, saving CPU cycles
  const deskCandleFlame = document.querySelector('.candle-item .candle-flame');
  if (deskCandleFlame && !isMobile) {
    gsap.to(deskCandleFlame, {
      opacity: rand(0.7, 1), scaleY: rand(0.9, 1.1),
      duration: rand(0.1, 0.2), repeat: -1, yoyo: true,
      ease: 'none'
    });
  }

  /* ─── Quote decorative element ────────────────────────────── */
  const quoteDecor = document.querySelector('.quote-decorative');
  if (quoteDecor) {
    gsap.to(quoteDecor, {
      opacity: rand(0.3, 0.5),
      duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut',
      force3D: true
    });
  }

})();
