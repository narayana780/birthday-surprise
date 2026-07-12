(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const container = document.getElementById('heart-particles');
  const heartsLayer = document.querySelector('#scene-one .floating-hearts-layer');

  if (prefersReducedMotion) {
    return;
  }

  // Populate background hearts for Scene One
  if (heartsLayer) {
    const heartSymbols = ['♡', '♥', '❥'];
    for (let i = 0; i < 18; i += 1) {
      const span = document.createElement('span');
      span.textContent = heartSymbols[i % heartSymbols.length];
      heartsLayer.appendChild(span);
    }
  }

  // Populate sparkles for Scene Three countdown background
  const sparklesLayer = document.querySelector('.sparkles-layer');
  if (sparklesLayer) {
    const sparkles = ['✦', '✶', '✺'];
    for (let i = 0; i < 24; i += 1) {
      const span = document.createElement('span');
      span.textContent = sparkles[i % sparkles.length];
      sparklesLayer.appendChild(span);
    }
  }

  // Support for tsParticles if present
  if (!container || typeof window.tsParticles === 'undefined') {
    return;
  }

  window.tsParticles.load('heart-particles', {
    fullScreen: { enable: false, zIndex: 1 },
    particles: {
      number: { value: 24, density: { enable: false } },
      color: { value: ['#ff8fb1', '#e7a9a2', '#e8dcff'] },
      shape: {
        type: ['image'],
        image: [
          { src: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=64&q=80', width: 32, height: 32 },
        ],
      },
      size: { value: 18, random: true },
      move: {
        enable: true,
        speed: 1.2,
        direction: 'top',
        random: true,
        straight: false,
        outModes: { default: 'out' },
      },
      opacity: {
        value: 0.75,
        random: true,
      },
    },
    interactivity: {
      events: {
        onHover: { enable: false },
        onClick: { enable: false },
      },
    },
    detectRetina: true,
  });
})();
