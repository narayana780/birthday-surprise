(() => {
  /* ─── DOM References ─────────────────────────────────────── */
  const loadingScreen   = document.getElementById('loading-screen');
  const sceneOne        = document.getElementById('scene-one');
  const sceneTwo        = document.getElementById('scene-two');
  const sceneThree      = document.getElementById('scene-three');
  const sceneFour       = document.getElementById('scene-four');
  const sceneFive       = document.getElementById('scene-five');
  const progressFill    = document.querySelector('.loading-progress-fill');
  const progressHeart   = document.querySelector('.loading-heart-icon');
  const digitSlots      = Array.from(document.querySelectorAll('[data-digit-slot]'));
  const keypadButtons   = Array.from(document.querySelectorAll('.glass-key'));
  const pandaMessage    = document.getElementById('panda-message');
  const countdownNumber = document.getElementById('countdown-number');

  /* ─── Configuration ──────────────────────────────────────── */
  const correctPassword = '18072007';
  const birthdayGirlName = "KEERTHI";
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scenes = [sceneOne, sceneTwo, sceneThree, sceneFour, sceneFive];
  let enteredDigits         = '';
  let loadingHidden         = false;
  let pandaHideTimer        = null;
  let sceneTwoInitialized   = false;
  let sceneThreeInitialized = false;
  let sceneFourInitialized  = false;
  let sceneFiveInitialized  = false;
  let audioContext          = null;
  let ambientOscillator     = null;
  let ambientGain           = null;
  let fireworkInterval      = null;

  /* ─── Helpers ────────────────────────────────────────────── */
  const rand = (min, max) => min + Math.random() * (max - min);

  const isMobile = window.innerWidth < 768 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  const spanPool = {
    pool: [],
    get(parent, className) {
      let el;
      if (this.pool.length > 0) {
        el = this.pool.pop();
        if (className) el.className = className;
        el.style.cssText = '';
        el.style.display = 'inline-block';
        if (el.parentNode !== parent) {
          parent.appendChild(el);
        }
      } else {
        el = document.createElement('span');
        if (className) el.className = className;
        parent.appendChild(el);
      }
      return el;
    },
    release(el) {
      if (el) {
        el.style.display = 'none';
        this.pool.push(el);
      }
    }
  };

  const clearLayerToPool = (layer) => {
    if (!layer) return;
    const spans = Array.from(layer.querySelectorAll('span'));
    spans.forEach((span) => {
      gsap.killTweensOf(span);
      spanPool.release(span);
    });
    layer.innerHTML = '';
  };

  const toggleSceneTweens = (scene, shouldPlay) => {
    if (!scene) return;
    const elements = scene.querySelectorAll('*');
    elements.forEach((el) => {
      const tweens = gsap.getTweensOf(el);
      tweens.forEach((t) => {
        if (shouldPlay) {
          t.play();
        } else {
          t.pause();
        }
      });
    });
  };

  const setSceneClass = (sceneName) => {
    document.body.classList.remove(
      'scene-one-active','scene-two-active','scene-three-active',
      'scene-four-active','scene-five-active'
    );
    document.body.classList.add(sceneName);
  };

  const setSceneState = (visibleScene) => {
    scenes.forEach((scene) => {
      if (!scene) return;
      const shouldShow = scene === visibleScene;
      scene.hidden           = !shouldShow;
      scene.style.visibility = shouldShow ? 'visible' : 'hidden';
      scene.style.opacity    = shouldShow ? '1' : '0';
      if (shouldShow) gsap.set(scene, { y: 0, scale: 1 });
      toggleSceneTweens(scene, shouldShow);
    });
  };

  /* ─── Cinematic Scene Transition ─────────────────────────── */
  const transitionScene = (incomingScene, outgoingScene, onComplete) => {
    if (!incomingScene) return;

    incomingScene.hidden           = false;
    incomingScene.style.visibility = 'visible';
    gsap.set(incomingScene, { opacity: 0, scale: 0.98, filter: 'blur(8px)' });
    toggleSceneTweens(incomingScene, true);

    const tl = gsap.timeline({
      onComplete: () => {
        if (outgoingScene) {
          outgoingScene.hidden           = true;
          outgoingScene.style.visibility = 'hidden';
          gsap.set(outgoingScene, { opacity: 0 });
          toggleSceneTweens(outgoingScene, false);
        }
        if (onComplete) onComplete();
        tl.kill();
      }
    });

    if (outgoingScene) {
      tl.to(outgoingScene, {
        opacity: 0, scale: 0.98, filter: 'blur(8px)',
        duration: 0.88, ease: 'power2.inOut' // 15% longer than 0.75s
      }, 0);
    }

    tl.to(incomingScene, {
      opacity: 1, scale: 1, filter: 'blur(0px)',
      duration: 0.88, ease: 'power3.out'
    }, 0);
  };

  /* ─── Generate Cinematic Opening (Priority 1) ──────────────── */
  const generateCinematicOpening = () => {
    const fog = sceneOne.querySelector('.bg-fog');
    const goldSparkles = sceneOne.querySelector('.gold-sparkles');
    const magicalParticles = sceneOne.querySelector('.magical-particles');

    if (!prefersReducedMotion) {
      // Floating hearts (Magical Particles)
      if (magicalParticles) {
        const syms = ['♥','✦','✧','♡'];
        const colors = ['rgba(233,30,140,0.6)', 'rgba(249,199,79,0.5)', 'rgba(255,182,193,0.7)'];
        const heartCount = isMobile ? 16 : 40;
        for (let i = 0; i < heartCount; i++) {
          const p = spanPool.get(magicalParticles, 'magical-particle-piece');
          p.textContent = syms[i % syms.length];
          p.style.cssText = `
            position:absolute; display:inline-block;
            font-size:${rand(0.6, 1.4)}rem;
            color:${colors[i % colors.length]};
            text-shadow: ${isMobile ? 'none' : '0 0 12px currentColor'};
            left:${rand(0, 100)}%; top:${rand(0, 100)}%;
            pointer-events:none;
            opacity: 0;
          `;

          gsap.to(p, {
            y: `-=${rand(40, 100)}vh`,
            x: `+=${rand(-30, 30)}px`,
            rotate: rand(0, 360),
            opacity: rand(0.3, 0.8),
            duration: rand(6, 14),
            repeat: -1, yoyo: true, ease: 'sine.inOut',
            delay: rand(0, 5),
            force3D: true
          });
        }
      }

      // Gold Sparkles
      if (goldSparkles) {
        const sparkleCount = isMobile ? 12 : 30;
        for (let s = 0; s < sparkleCount; s++) {
          const dot = spanPool.get(goldSparkles, 'gold-sparkle-dot');
          dot.style.cssText = `
            position:absolute;
            width:${rand(2,5)}px; height:${rand(2,5)}px;
            left:${rand(10,90)}%; top:${rand(10,90)}%;
            background: #f9c74f;
            border-radius:50%;
            box-shadow: ${isMobile ? '0 0 4px #f9c74f' : '0 0 ' + rand(8,16) + 'px #f9c74f'};
            opacity: 0;
          `;
          gsap.to(dot, {
            opacity: rand(0.2, 0.9),
            scale: rand(0.5, 2.0),
            duration: rand(1.0, 3.0),
            repeat: -1, yoyo: true, ease: 'sine.inOut',
            delay: rand(0, 4),
            force3D: true
          });
        }
      }
    }
  };

  /* ─── Passcode: Show / Hide ───────────────────────────────── */
  const showPasscodePanel = () => {
    const passcodePanel = sceneOne.querySelector('.passcode-panel');
    const giftContainer = document.getElementById('gift-box-container');
    if (!passcodePanel) return;

    if (giftContainer) {
      gsap.killTweensOf(giftContainer);
      gsap.to(giftContainer, {
        opacity: 0, y: -20, scale: 0.9, duration: 0.4, ease: 'power2.in',
        force3D: true,
        onComplete: () => {
          giftContainer.style.visibility = 'hidden';
          giftContainer.style.display    = 'none';
        }
      });
    }

    passcodePanel.classList.remove('passcode-panel--hidden');
    gsap.set(passcodePanel, { opacity: 0, y: 30, scale: 0.96, visibility: 'visible', pointerEvents: 'auto' });

    // Animate particles inside passcode panel
    const particles = passcodePanel.querySelector('.passcode-particles');
    if (particles && !prefersReducedMotion) {
      const syms = ['✦','♥','✧','♡'];
      const panelParticleCount = isMobile ? 5 : 12;
      for (let i = 0; i < panelParticleCount; i++) {
        const p = spanPool.get(particles, 'passcode-particle-piece');
        p.textContent = syms[i % syms.length];
        p.style.cssText = `
          position:absolute;
          font-size:${rand(0.5, 0.9)}rem;
          left:${rand(0,100)}%;
          top:${rand(100,120)}%;
          color: ${Math.random() > 0.5 ? 'rgba(249,199,79,0.5)' : 'rgba(233,30,140,0.5)'};
          pointer-events:none;
        `;
        gsap.to(p, {
          y: `-${rand(120, 160)}vh`,
          x: `${rand(-30, 30)}px`,
          opacity: 0,
          duration: rand(4, 8),
          repeat: -1,
          delay: i * 0.4,
          ease: 'none',
          force3D: true
        });
      }
    }

    gsap.to(passcodePanel, { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: 'power3.out', force3D: true });
  };

  /* ─── Gift Box Open — Premium Disney/Apple Sequence ─── */
  const openGiftBox = () => {
    const giftBox       = document.getElementById('gift-box');
    const giftContainer = document.getElementById('gift-box-container');
    if (!giftBox || !giftContainer) return;

    giftContainer.style.pointerEvents = 'none';

    // Image references
    const closedImg = giftBox.querySelector('#gift-box-closed-img');
    const bottomImg = giftBox.querySelector('#gift-box-bottom-img');
    const lidImg    = giftBox.querySelector('#gift-box-lid-img');
    const glowSource = giftBox.querySelector('#gift-glow-source');
    const textWrap   = giftContainer.querySelector('.gift-text-wrap');

    const tl = gsap.timeline({
      onComplete: () => gsap.delayedCall(0.1, showPasscodePanel)
    });

    // Stop any float animations on container to begin precise open sequence
    gsap.killTweensOf(giftContainer);
    gsap.killTweensOf(giftBox);
    gsap.killTweensOf(closedImg);

    // Step 1: Scale 1 -> 1.04, duration 0.23s
    // Step 2: Glow increases slightly
    tl.to(giftBox, {
      scale: 1.04,
      duration: 0.23,
      ease: 'power3.out'
    }, 0)
    .to(glowSource, {
      opacity: 0.9,
      scale: 1.1,
      duration: 0.23,
      ease: 'power3.out'
    }, 0)

    // Swap closed image for base & lid layers
    .call(() => {
      if (closedImg) closedImg.style.display = 'none';
      if (bottomImg) {
        bottomImg.style.display = 'block';
        gsap.set(bottomImg, { opacity: 1 });
      }
      if (lidImg) {
        lidImg.style.display = 'block';
        gsap.set(lidImg, { opacity: 1, y: 0, scale: 1 });
      }
    }, null, 0.23)

    // Step 3: Wait 0.17s (starts at 0.40s overall)
    // Step 4: Lift ONLY the lid. Translate Y: -35px, scale 1.02, duration 0.52s, ease power3.out
    .to(lidImg, {
      y: -35,
      scale: 1.02,
      duration: 0.52,
      ease: 'power3.out'
    }, 0.40)

    // Step 5: Soft pink magical light: opacity 0 -> 1, scale 0.8 -> 1.3, duration 0.46s, ease power3.out
    .fromTo(glowSource, 
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1.3, duration: 0.46, ease: 'power3.out' },
      0.40
    )

    // Step 6: Around 20 small hearts and 20 gold sparkles float upward slowly. (Reduced to 8 on mobile)
    .call(() => {
      const hearts = ['♥','💜','💕','💖','♥'];
      const sparkles = ['✦','✧','★','✨','⭐'];

      const spawnDriftingParticle = (symbols, colorArray, count) => {
        const adjustedCount = isMobile ? Math.round(count * 0.4) : count;
        for (let i = 0; i < adjustedCount; i++) {
          const el = spanPool.get(sceneOne, 'gift-drift-particle');
          el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
          el.style.cssText = `
            position: absolute;
            left: ${rand(38, 62)}%;
            top: 48%;
            font-size: ${rand(0.7, 1.25)}rem;
            color: ${colorArray[Math.floor(Math.random() * colorArray.length)]};
            pointer-events: none;
            z-index: 25;
            text-shadow: ${isMobile ? 'none' : '0 0 10px currentColor'};
            opacity: 0;
          `;

          // Natural slow vertical rise with gentle horizontal wave sway
          const tlPart = gsap.timeline({ onComplete: () => spanPool.release(el) });
          const riseDist = rand(80, 180);
          const driftX = rand(-30, 30);

          tlPart.to(el, {
            opacity: rand(0.65, 0.9),
            scale: rand(0.8, 1.3),
            duration: 0.4,
            ease: 'sine.out',
            force3D: true
          }, 0)
          .to(el, {
            y: -riseDist,
            x: driftX,
            duration: rand(2.1, 3.0),
            ease: 'power3.out',
            force3D: true
          }, 0)
          .to(el, {
            opacity: 0,
            duration: 0.7,
            ease: 'power2.inOut',
            force3D: true
          }, '>-0.7');
        }
      };

      // 20 small hearts
      spawnDriftingParticle(hearts, ['#ff5dae', '#ff80c0', '#e040fb', '#ff80ab'], 20);
      // 20 gold sparkles
      spawnDriftingParticle(sparkles, ['#f9c74f', '#ffe066', '#ffc107', '#ffffff'], 20);
    }, null, 0.40)

    // Step 7: Fade entire gift out. Opacity 1 -> 0, scale 1 -> 1.03, duration 0.4s (starts after 0.92s, so at 1.32s)
    .to(giftBox, {
      opacity: 0,
      scale: 1.03,
      duration: 0.4,
      ease: 'power2.inOut',
      force3D: true
    }, 1.32)
    .to(textWrap, {
      opacity: 0,
      y: 8,
      duration: 0.35,
      ease: 'power2.inOut',
      force3D: true
    }, 1.32);
  };

  /* ─── Show Gift Box ───────────────────────────────────────── */
  const showGiftBox = () => {
    const giftContainer = document.getElementById('gift-box-container');
    if (!giftContainer) {
      showPasscodePanel();
      return;
    }

    giftContainer.style.visibility = 'visible';
    giftContainer.style.display    = 'flex';

    gsap.fromTo(giftContainer,
      { opacity: 0, scale: 0.95, y: 25 },
      { opacity: 1, scale: 1, y: 0, duration: 1.0, ease: 'power3.out', force3D: true }
    );

    // Gently float up and down forever (only 5px movement, duration: 3s)
    gsap.to(giftContainer, {
      y: -5,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 0.4,
      force3D: true
    });

    // Subtle breathing drop shadow glow pulse
    if (!prefersReducedMotion) {
      const closedImg = document.getElementById('gift-box-closed-img');
      const giftBox = document.getElementById('gift-box');
      if (closedImg && giftBox) {
        // Idle tilt animation
        gsap.to(closedImg, {
          rotateY: 6,
          rotateX: 3,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          force3D: true
        });

        // Breathing drop shadow glow pulse
        if (!isMobile) {
          gsap.to(giftBox, {
            filter: 'drop-shadow(0 0 60px rgba(240, 98, 146, 0.7)) drop-shadow(0 32px 64px rgba(0,0,0,0.5))',
            duration: 2.0,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          });
        } else {
          gsap.set(giftBox, { filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))' });
        }

        // Glow source gentle pulse
        const glowSrc = giftBox.querySelector('#gift-glow-source');
        if (glowSrc) {
          gsap.to(glowSrc, {
            scale: 1.15, opacity: 0.8, duration: 2.0,
            repeat: -1, yoyo: true, ease: 'sine.inOut',
            force3D: true
          });
        }
      }
    }

    giftContainer.addEventListener('click', openGiftBox, { once: true });
  };

  /* ─── Loading Screen ──────────────────────────────────────── */
  const hideLoadingScreen = () => {
    if (loadingHidden || !loadingScreen) return;
    loadingHidden = true;

    document.body.classList.add('is-ready', 'scene-one-active');
    setSceneState(sceneOne);

    if (sceneOne) {
      gsap.set(sceneOne, { opacity: 0, y: 20 });
      gsap.to(loadingScreen, {
        opacity: 0, scale: 1.03, duration: 0.6, ease: 'power2.inOut',
        onComplete: () => {
          loadingScreen.classList.add('is-hidden');
          loadingScreen.style.display = 'none';
          showGiftBox();
        }
      });
      gsap.to(sceneOne, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
    }
  };

  const animateLoading = () => {
    if (!progressFill || !progressHeart) return;

    const tl = gsap.timeline({ onComplete: hideLoadingScreen });
    tl.to(progressFill,  { width: '100%', duration: 2.2, ease: 'power2.out' })
      .to(progressHeart, { left: '100%',  duration: 2.2, ease: 'power2.out' }, '<');
  };

  /* ─── Digit Display ───────────────────────────────────────── */
  const updateDisplay = () => {
    digitSlots.forEach((slot, idx) => {
      const val = enteredDigits[idx] || '';
      slot.textContent = val;
      slot.classList.toggle('has-value', !!val);
    });
  };

  const resetInput = () => {
    enteredDigits = '';
    updateDisplay();
  };

  /* ─── Panda / Error Message ─────────────────────────────── */
  const showPandaMessage = () => {
    if (!pandaMessage) return;
    if (pandaHideTimer) window.clearTimeout(pandaHideTimer);

    resetInput();
    pandaMessage.style.display = 'grid';
    pandaMessage.hidden        = false;

    gsap.killTweensOf(pandaMessage);
    gsap.fromTo(pandaMessage,
      { opacity: 0, scale: 0.8, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'back.out(1.6)' }
    );

    pandaHideTimer = window.setTimeout(() => {
      gsap.to(pandaMessage, {
        opacity: 0, scale: 0.9, y: 15, duration: 0.4, ease: 'power2.in',
        onComplete: () => { pandaMessage.style.display = 'none'; pandaMessage.hidden = true; }
      });
    }, 2800);
  };

  /* ─── Scene Transitions ────────────────────────────────────── */
  const revealSceneTwo = () => {
    if (!sceneOne || !sceneTwo) return;
    setSceneClass('scene-two-active');
    transitionScene(sceneTwo, sceneOne, () => {
      clearLayerToPool(sceneOne.querySelector('.magical-particles'));
      clearLayerToPool(sceneOne.querySelector('.gold-sparkles'));
      clearLayerToPool(sceneOne.querySelector('.passcode-particles'));
      initSceneTwo();
    });
  };

  const revealSceneThree = () => {
    if (!sceneTwo || !sceneThree) return;
    setSceneClass('scene-three-active');
    transitionScene(sceneThree, sceneTwo, () => {
      clearLayerToPool(sceneTwo.querySelector('.quote-hearts'));
      clearLayerToPool(sceneTwo.querySelector('.heart-particles-layer'));
      initSceneThree();
    });
  };

  const revealSceneFour = () => {
    if (!sceneThree || !sceneFour) return;
    setSceneClass('scene-four-active');
    transitionScene(sceneFour, sceneThree, () => initSceneFour());
  };

  const revealSceneFive = () => {
    if (!sceneFour || !sceneFive) return;
    setSceneClass('scene-five-active');
    transitionScene(sceneFive, sceneFour, () => initSceneFive());
  };

  /* ─── Keypad ─────────────────────────────────────────────── */
  const handleKeyPress = (key) => {
    if (key === 'clear') { resetInput(); return; }

    if (key === 'delete') {
      enteredDigits = enteredDigits.slice(0, -1);
      updateDisplay(); return;
    }

    if (key === 'enter') {
      if (enteredDigits === correctPassword) {
        // Success flash
        const treeSvg = sceneOne.querySelector('.tree-svg');
        if (treeSvg) treeSvg.classList.add('tree-glow');

        // Burst leaves gold/white
        document.querySelectorAll('.heart-leaf').forEach((leaf) => {
          gsap.to(leaf, {
            scale: '+=0.4', fill: '#ffe066', opacity: 1,
            duration: rand(0.4, 0.7), yoyo: true, repeat: 1, ease: 'power2.inOut'
          });
        });

        // Heart shower
        const layer = sceneOne.querySelector('.floating-hearts-layer');
        if (layer) {
          for (let i = 0; i < 36; i++) {
            const h = document.createElement('span');
            h.textContent = ['♥','✦','♡','★'][i % 4];
            h.style.cssText = `
              position:absolute;
              left:${rand(20, 80)}%;
              top:65%;
              font-size:${rand(0.7, 1.2)}rem;
              color:${['#e91e8c','#f9c74f','#ce93d8','#ffffff'][i % 4]};
              text-shadow: 0 0 10px currentColor;
            `;
            layer.appendChild(h);
            gsap.to(h, {
              y: '-85vh',
              x: `${rand(-120, 120)}px`,
              opacity: 0, scale: 0.4,
              duration: rand(1.8, 3.0),
              ease: 'power1.out',
              onComplete: () => h.remove()
            });
          }
        }

        gsap.delayedCall(1.8, revealSceneTwo);
      } else {
        showPandaMessage();
      }
      return;
    }

    if (enteredDigits.length >= correctPassword.length) return;
    enteredDigits += key;
    updateDisplay();
  };

  const initKeypad = () => {
    if (!keypadButtons.length) return;
    keypadButtons.forEach((btn) => {
      btn.addEventListener('click', () => handleKeyPress(btn.dataset.key));
    });

    window.addEventListener('keydown', (e) => {
      if (/^[0-9]$/.test(e.key))    { handleKeyPress(e.key); return; }
      if (e.key === 'Backspace')     { handleKeyPress('delete'); }
      if (e.key === 'Enter')         { handleKeyPress('enter'); }
      if (e.key === 'Escape')        { handleKeyPress('clear'); }
    });
  };

  /* ─── SCENE TWO — Magical Forest Quotes ───────────────────── */
  const initSceneTwo = () => {
    if (!sceneTwo || sceneTwoInitialized) return;
    sceneTwoInitialized = true;

    // Floating hearts
    const heartsLayer = sceneTwo.querySelector('.quote-hearts');
    if (heartsLayer) {
      heartsLayer.innerHTML = '';
      const syms = ['♡','♥','❥','✦','✧'];
      const cols = [
        'rgba(233,30,140,0.6)','rgba(249,199,79,0.5)',
        'rgba(206,147,216,0.6)','rgba(255,255,255,0.4)'
      ];
      const heartCount = isMobile ? 10 : 24;
      for (let i = 0; i < heartCount; i++) {
        const s = spanPool.get(heartsLayer, 'magical-heart-piece');
        s.textContent = syms[i % syms.length];
        s.style.cssText = `
          position:absolute; display:inline-block;
          font-size:${rand(0.8, 1.5)}rem;
          color:${cols[i % cols.length]};
          text-shadow: ${isMobile ? 'none' : '0 0 10px currentColor'};
          filter: ${isMobile ? 'none' : 'blur(' + (Math.random() > 0.7 ? 0.5 : 0) + 'px)'};
        `;

        gsap.set(s, { left: `${rand(0, 95)}%`, top: `${rand(-20, -5)}%` });
        gsap.to(s, {
          y: '120vh',
          x: `${(i % 2 === 0 ? 1 : -1) * rand(15, 50)}px`,
          rotate: rand(0, 360),
          duration: rand(6, 12),
          repeat: -1, ease: 'none',
          delay: i * 0.18,
          force3D: true
        });
      }
    }

    // Tiny butterflies
    const particlesLayer = sceneTwo.querySelector('.heart-particles-layer');
    if (particlesLayer) {
      particlesLayer.innerHTML = '';
      const butterflies = ['🦋','✿','❋'];
      const butterflyCount = isMobile ? 3 : 8;
      for (let i = 0; i < butterflyCount; i++) {
        const b = spanPool.get(particlesLayer, 'butterfly');
        b.textContent = butterflies[i % butterflies.length];
        b.style.cssText = `
          font-size:${rand(0.7, 1.2)}rem;
          left:${rand(5, 90)}%;
          top:${rand(10, 70)}%;
          opacity:${rand(0.4, 0.7)};
        `;

        gsap.to(b, {
          x: `${rand(-80, 80)}px`,
          y: `${rand(-60, 60)}px`,
          duration: rand(5, 10),
          repeat: -1, yoyo: true,
          ease: 'sine.inOut',
          delay: rand(0, 4),
          force3D: true
        });
      }

      // Tiny glowing particles
      const tinyParticleCount = isMobile ? 8 : 20;
      for (let i = 0; i < tinyParticleCount; i++) {
        const p = spanPool.get(particlesLayer, 'tiny-glow-piece');
        p.textContent = '♥';
        p.style.cssText = `
          position:absolute; display:inline-block;
          font-size:${rand(0.35, 0.65)}rem;
          color:rgba(233,30,140,${rand(0.3, 0.6)});
          text-shadow: ${isMobile ? 'none' : '0 0 8px rgba(233,30,140,0.5)'};
        `;

        gsap.set(p, { left: `${rand(0, 100)}%`, top: `${rand(100, 115)}%` });
        gsap.to(p, {
          y: '-115vh',
          x: `${rand(-50, 50)}px`,
          duration: rand(4, 7),
          repeat: -1, ease: 'none',
          delay: i * 0.12,
          force3D: true
        });
      }
    }

    // Quote cycling
    const quotes = [
      'You unlocked a little surprise made just for you ❤️',
      'Every memory with you holds a beautiful story…',
      'Ready? ✨',
      "Let's celebrate your most special day 💜"
    ];

    const quoteEl = document.getElementById('quote-text');
    if (!quoteEl) return;

    const tl = gsap.timeline({ onComplete: revealSceneThree });

    quotes.forEach((text) => {
      tl.call(() => { quoteEl.textContent = text; })
        .fromTo(quoteEl,
          { opacity: 0, y: 15, filter: 'blur(4px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.88, ease: 'power3.out' }
        )
        .to(quoteEl, {
          opacity: 0, y: -15, filter: 'blur(4px)',
          duration: 0.7, delay: 2.5, ease: 'power2.inOut'
        });
    });
  };

  /* ─── SCENE THREE — Countdown ─────────────────────────────── */
  const emitCountdownParticles = () => {
    const symbols = ['❤️', '💖', '✨', '✦', '🌸', '💝'];
    const colors = ['#ff5dae', '#ffe066', '#ff80c0', '#ffffff', '#f9c74f'];
    const container = document.getElementById('scene-three');
    if (!container) return;

    const count = isMobile ? 9 : 22;
    for (let i = 0; i < count; i++) {
      const el = spanPool.get(container, 'countdown-particle');
      el.textContent = symbols[i % symbols.length];
      el.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: ${rand(1.2, 2.0)}rem;
        color: ${colors[i % colors.length]};
        text-shadow: ${isMobile ? 'none' : '0 0 12px ' + colors[i % colors.length]};
        pointer-events: none;
        z-index: 10;
      `;

      const angle = rand(0, Math.PI * 2);
      const distance = rand(60, 180);
      const xDest = Math.cos(angle) * distance;
      const yDest = Math.sin(angle) * distance;

      gsap.fromTo(el,
        { scale: 0.2, opacity: 1, x: 0, y: 0 },
        {
          x: xDest,
          y: yDest,
          scale: rand(0.5, 1.4),
          opacity: 0,
          rotate: rand(-180, 180),
          duration: rand(0.8, 1.4),
          ease: 'power2.out',
          force3D: true,
          onComplete: () => spanPool.release(el)
        }
      );
    }
  };

  const initSceneThree = () => {
    if (!sceneThree || sceneThreeInitialized) return;
    sceneThreeInitialized = true;

    const inner   = sceneThree.querySelector('.countdown-inner');
    const svg     = sceneThree.querySelector('.countdown-svg');
    const numEl   = countdownNumber;
    if (!svg || !inner) return;

    const numbers = [3, 2, 1];
    let idx = 0;

    const playStep = () => {
      // Rebuild SVG ring each tick
      svg.innerHTML = `
        <defs>
          <linearGradient id="neonRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff5dae" />
            <stop offset="50%" stop-color="#f9c74f" />
            <stop offset="100%" stop-color="#ff5dae" />
          </linearGradient>
          <filter id="neonGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
        <!-- Track ring (dim) -->
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,93,174,0.15)" stroke-width="3"/>
        <!-- Progress ring -->
        <circle cx="50" cy="50" r="44" fill="none" stroke="url(#neonRingGrad)" stroke-width="4.5"
          stroke-linecap="round"
          stroke-dasharray="276.5"
          stroke-dashoffset="276.5"
          filter="url(#neonGlow)"
          transform="rotate(-90 50 50)"/>
      `;

      // Show large glowing number centered inside ring
      if (numEl) {
        numEl.textContent = numbers[idx];
        numEl.classList.remove('get-ready-text');
        gsap.killTweensOf(numEl);
        // Scale in with bounce
        gsap.fromTo(numEl,
          { opacity: 0, scale: 0.85, filter: 'blur(12px)' },
          { opacity: 1, scale: 1.05, filter: 'blur(0px)', duration: 0.46, ease: 'power3.out' }
        );
        // Pulse
        gsap.to(numEl, {
          scale: 0.97, duration: 0.28, delay: 0.58, ease: 'power2.inOut', yoyo: true, repeat: 1
        });
        // Exit
        gsap.to(numEl, { opacity: 0, scale: 1.25, filter: 'blur(14px)', duration: 0.46, delay: 1.04, ease: 'power2.inOut' });
      }

      // Animate neon ring drawing itself (fills over 1.15 seconds)
      const ring = svg.querySelectorAll('circle')[1];
      if (ring) {
        gsap.fromTo(ring,
          { strokeDashoffset: 276.5 },
          { strokeDashoffset: 0, duration: 1.15, ease: 'power2.inOut' }
        );
      }
      // SVG slow spin
      gsap.fromTo(svg,
        { rotate: 0 },
        { rotate: 360, transformOrigin: '50% 50%', duration: 1.38, ease: 'power2.out' }
      );

      // Inner element scale pulse (camera zoom feel)
      gsap.fromTo(inner,
        { scale: 0.95 },
        { scale: 1.05, duration: 0.4, ease: 'power3.out',
          onComplete: () => gsap.to(inner, { scale: 1.0, duration: 0.46, ease: 'power3.out' }) }
      );

      // Particle explosions on each tick
      emitCountdownParticles();

      idx++;
      if (idx < numbers.length) {
        gsap.delayedCall(1.5, playStep);
      } else {
        gsap.delayedCall(1.55, () => {
          // Magical pink-gold glow flash transition
          const flash = sceneFour.querySelector('.scene-flash');
          if (flash) {
            // Make sceneFour ready
            sceneFour.hidden = false;
            sceneFour.style.visibility = 'visible';
            sceneFour.style.opacity = '1';
            gsap.set(sceneFour, { y: 0, scale: 1 });

            gsap.fromTo(flash,
              { opacity: 0, scale: 1.0 },
              {
                opacity: 1,
                scale: 1.0,
                duration: 0.6,
                ease: 'power3.out',
                onComplete: () => {
                  setSceneClass('scene-four-active');

                  sceneThree.hidden = true;
                  sceneThree.style.visibility = 'hidden';
                  sceneThree.style.opacity = '0';

                  // Clear Scene Three particles to the pool to free up memory!
                  clearLayerToPool(sceneThree.querySelector('.rotating-particles-layer'));
                  clearLayerToPool(sceneThree.querySelector('.tiny-hearts-layer'));

                  initSceneFour();

                  gsap.to(flash, {
                    opacity: 0,
                    duration: 1.15,
                    ease: 'power2.inOut',
                    force3D: true
                  });
                }
              }
            );
          } else {
            revealSceneFour();
          }
        });
      }
    };

    /* ── Expanding light pulse rings ── */
    const pulseLayer = sceneThree.querySelector('.expanding-light-pulse');
    const spawnPulse = () => {
      if (!pulseLayer) return;
      const pr = document.createElement('div');
      pr.className = 'light-pulse-ring';
      pulseLayer.appendChild(pr);
      gsap.fromTo(pr, { scale: 0.2, opacity: 0.75 }, {
        scale: 7, opacity: 0, duration: 2.1, ease: 'power3.out',
        force3D: true,
        onComplete: () => pr.remove()
      });
    };
    const pulseTimer = setInterval(spawnPulse, 900);
    gsap.delayedCall(7.5, () => clearInterval(pulseTimer));

    /* ── Rotating particles ── */
    const rotLayer = sceneThree.querySelector('.rotating-particles-layer');
    if (rotLayer && !prefersReducedMotion) {
      const rotParticleCount = isMobile ? 7 : 18;
      for (let ri = 0; ri < rotParticleCount; ri++) {
        const rp = spanPool.get(rotLayer, 'countdown-rotating-particle');
        rp.textContent = ['♥','✦','✧','♡'][ri % 4];
        const rRadius = rand(90, 170);
        const rAngle  = (ri / rotParticleCount) * Math.PI * 2;
        rp.style.cssText = `
          position:absolute; left:50%; top:50%;
          margin-left:-8px; margin-top:-8px;
          font-size:${rand(0.5, 1.0)}rem;
          color:${ri % 2 === 0 ? 'rgba(233,30,140,0.6)' : 'rgba(249,199,79,0.6)'};
          text-shadow: ${isMobile ? 'none' : '0 0 10px currentColor'};
          pointer-events:none; opacity:0;
        `;
        gsap.set(rp, { x: Math.cos(rAngle) * rRadius, y: Math.sin(rAngle) * rRadius });
        gsap.to(rp, { opacity: rand(0.4, 0.85), duration: 0.5, delay: ri * 0.07, force3D: true });
      }
    }

    /* ── "Get Ready" intro before 3-2-1 ── */
    if (numEl) {
      numEl.textContent = 'Get Ready ❤️';
      numEl.classList.add('get-ready-text');
      gsap.fromTo(numEl,
        { opacity: 0, scale: 0.85, filter: 'blur(16px)' },
        { opacity: 1, scale: 1.0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' }
      );
      gsap.to(numEl, {
        opacity: 0, scale: 1.15, filter: 'blur(12px)',
        duration: 0.6, delay: 1.7, ease: 'power2.inOut',
        onComplete: () => { numEl.classList.remove('get-ready-text'); playStep(); }
      });
    } else {
      playStep();
    }
  };

  /* ─── SCENE FOUR — Birthday Wishes ───────────────────────── */
  const typeText = (container, text, delay = 0.04) => {
    if (!container) return;
    container.innerHTML = '';
    Array.from(text).forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.opacity = '0';
      span.style.display = 'inline-block';
      container.appendChild(span);
      gsap.to(span, { opacity: 1, duration: 0.02, delay: delay * i, ease: 'power1.out' });
    });
  };

  const initSceneFour = () => {
    if (!sceneFour || sceneFourInitialized) return;
    sceneFourInitialized = true;

    const flash      = sceneFour.querySelector('.scene-flash');
    const cakeRise   = sceneFour.querySelector('.cake-rise');
    const introEl    = document.getElementById('wish-intro');
    const greetingEl = document.getElementById('wish-greeting');
    const nameEl     = document.getElementById('wish-name');
    const heartEl    = document.getElementById('wish-heart');

    /* ── Magical Fog ── */
    const startMagicalFog = () => {
      const layer = sceneFour.querySelector('.magical-fog-layer');
      if (!layer) return;
      layer.innerHTML = '';

      const colors = ['rgba(233,30,140,0.06)', 'rgba(156,39,176,0.04)', 'rgba(30,136,229,0.05)'];
      for (let i = 0; i < 4; i++) {
        const cloud = document.createElement('div');
        cloud.style.cssText = `
          position: absolute;
          left: ${rand(-20, 80)}%;
          bottom: ${rand(-10, 20)}%;
          width: ${rand(300, 500)}px;
          height: ${rand(180, 280)}px;
          background: radial-gradient(circle, ${colors[i % colors.length]} 0%, transparent 70%);
          filter: blur(40px);
          pointer-events: none;
        `;
        layer.appendChild(cloud);

        gsap.to(cloud, {
          x: `+=${rand(80, 160)}px`,
          y: `+=${rand(-30, 30)}px`,
          duration: rand(15, 25),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 2
        });
      }
    };

    /* ── Fireworks — Premium, elegant, DOM particles behind cake ── */
    /* ── Fireworks — Premium, elegant, DOM particles behind cake ── */
    const startFireworks = () => {
      const layer = sceneFour.querySelector('.fireworks-layer');
      if (!layer) return;
      layer.innerHTML = '';

      const colors = [
        '#f9c74f', // Gold
        '#ff5dae', // Pink
        '#d78efc', // Purple
        '#ffffff'  // White
      ];

      let activeFireworksCount = 0;

      const triggerBurst = (leftPx, topPx, color) => {
        const particleCount = Math.floor(rand(isMobile ? 12 : 20, isMobile ? 18 : 40));
        const explosionRadius = rand(60, 120);

        for (let i = 0; i < particleCount; i++) {
          const dot = spanPool.get(layer, 'firework-particle');
          const size = rand(3.5, 6);
          dot.style.left = `${leftPx}px`;
          dot.style.top = `${topPx}px`;
          dot.style.width = `${size}px`;
          dot.style.height = `${size}px`;
          dot.style.background = color;
          dot.style.borderRadius = '50%';
          dot.style.transform = 'translate(-50%, -50%)';
          
          if (isMobile) {
            dot.style.boxShadow = `0 0 4px ${color}`;
          } else {
            dot.style.boxShadow = `0 0 8px ${color}, 0 0 16px ${color}`;
          }

          gsap.set(dot, { x: 0, y: 0, scale: 1, opacity: 0.95 });

          const angle = (i / particleCount) * Math.PI * 2 + rand(-0.25, 0.25);
          const dist = rand(0.3, 1.0) * explosionRadius;
          const destX = Math.cos(angle) * dist;
          const destY = Math.sin(angle) * dist;

          gsap.to(dot, {
            x: destX,
            y: destY + 25, // soft gravity drift
            opacity: 0,
            scale: 0.2,
            duration: rand(1.2, 1.6),
            ease: 'power2.out',
            force3D: true,
            onComplete: () => {
              spanPool.release(dot);
            }
          });
        }

        // Clean up active count tracking
        gsap.delayedCall(1.6, () => {
          activeFireworksCount = Math.max(0, activeFireworksCount - 1);
        });
      };

      const spawnFirework = () => {
        const maxActive = isMobile ? 2 : 3;
        if (activeFireworksCount >= maxActive) return;
        activeFireworksCount++;

        const positions = ['left', 'center', 'right'];
        const posType = positions[Math.floor(Math.random() * 3)];
        let targetLeftPercent;
        if (posType === 'left') {
          targetLeftPercent = rand(15, 35);
        } else if (posType === 'center') {
          targetLeftPercent = rand(40, 60);
        } else {
          targetLeftPercent = rand(65, 85);
        }

        const targetTopPercent = rand(12, 38);
        const baseColor = colors[Math.floor(Math.random() * colors.length)];

        const containerWidth = layer.clientWidth || window.innerWidth;
        const containerHeight = layer.clientHeight || window.innerHeight;

        const targetLeftPx = containerWidth * (targetLeftPercent / 100);
        const targetTopPx = containerHeight * (targetTopPercent / 100);

        // Create launcher element (thin line: width 2px, height 30px with gradient)
        const launcher = document.createElement('div');
        launcher.className = 'firework-launcher';
        launcher.style.cssText = `
          position: absolute;
          left: ${targetLeftPx}px;
          top: ${containerHeight}px;
          width: 2px; height: 30px;
          background: linear-gradient(to bottom, ${baseColor}, transparent);
          box-shadow: ${isMobile ? 'none' : '0 0 10px ' + baseColor + ', 0 0 20px ' + baseColor};
          opacity: 0.95;
          pointer-events: none;
          z-index: 2;
        `;
        layer.appendChild(launcher);

        const travelDuration = rand(0.65, 0.95);

        gsap.to(launcher, {
          y: -(containerHeight - targetTopPx),
          scaleY: 0.6,
          duration: travelDuration,
          ease: 'power2.out',
          force3D: true,
          onComplete: () => {
            launcher.remove();
            triggerBurst(targetLeftPx, targetTopPx, baseColor);
          }
        });
      };

      // Launch immediately
      spawnFirework();

      // Launch ticks using the global fireworkInterval (spawn interval: 1100ms on mobile)
      const fireworkSpawnInterval = isMobile ? 1100 : 700;
      fireworkInterval = window.setInterval(spawnFirework, fireworkSpawnInterval);
    };

    const stopFireworks = () => {
      if (fireworkInterval) {
        window.clearInterval(fireworkInterval);
        fireworkInterval = null;
      }
      // Recycle all active Scene Four particles to pool
      clearLayerToPool(sceneFour.querySelector('.confetti-layer'));
      clearLayerToPool(sceneFour.querySelector('.heart-orbit-layer'));
      clearLayerToPool(sceneFour.querySelector('.stars-layer'));
      clearLayerToPool(sceneFour.querySelector('.fireworks-layer'));
    };

    /* ── Confetti ── */
    const startConfetti = () => {
      const layer = sceneFour.querySelector('.confetti-layer');
      if (!layer) return;
      layer.innerHTML = '';

      const colors = ['#ffd4e3','#ffe2a3','#e91e8c','#ffffff','#e8dcff','#f9c74f','#ba68c8'];
      const confettiCount = isMobile ? 25 : 50;
      for (let i = 0; i < confettiCount; i++) {
        const piece = spanPool.get(layer, 'confetti-piece');
        piece.style.position   = 'absolute';
        piece.style.left       = `${rand(0, 100)}%`;
        piece.style.top        = `${rand(-25, -5)}%`;
        piece.style.background = colors[i % colors.length];
        piece.style.transform  = `rotate(${rand(0, 360)}deg)`;
        piece.style.borderRadius = `${Math.random() > 0.5 ? '50%' : '2px'}`;
        piece.style.opacity    = `${rand(0.7, 1)}`;

        gsap.to(piece, {
          y: '120vh',
          x: `+=${rand(-100, 100)}px`,
          rotateX: rand(0, 720),
          rotateY: rand(0, 720),
          rotateZ: rand(0, 720),
          duration: rand(3, 6),
          ease: 'power1.inOut',
          repeat: -1,
          delay: i * 0.04,
          force3D: true
        });
      }
    };

    /* ── Floating Hearts ── */
    const startHearts = () => {
      const layer = sceneFour.querySelector('.heart-orbit-layer');
      if (!layer) return;
      layer.innerHTML = '';

      const heartCount = isMobile ? 7 : 18;
      for (let i = 0; i < heartCount; i++) {
        const heartPiece = spanPool.get(layer, 'heart-orbit-particle');
        heartPiece.textContent = '❤️';
        heartPiece.style.cssText = `
          position: absolute;
          left: ${rand(5, 95)}%;
          top: ${rand(15, 85)}%;
          font-size: ${rand(14, 24)}px;
          opacity: ${rand(0.2, 0.45)};
          pointer-events: none;
        `;

        gsap.to(heartPiece, {
          y: `-=${rand(60, 140)}px`,
          x: `+=${rand(-40, 40)}px`,
          rotation: rand(-35, 35),
          duration: rand(4.5, 7.5),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: rand(0, 4),
          force3D: true
        });
      }
    };

    /* ── Magical Sparkles ── */
    const startSparkles = () => {
      const layer = sceneFour.querySelector('.stars-layer');
      if (!layer) return;
      layer.innerHTML = '';

      const sparkleCount = isMobile ? 12 : 30;
      for (let i = 0; i < sparkleCount; i++) {
        const star = spanPool.get(layer, 'sparkle-particle');
        star.style.cssText = `
          position: absolute;
          left: ${rand(5, 95)}%;
          top: ${rand(5, 95)}%;
          width: ${rand(3, 7)}px;
          height: ${rand(3, 7)}px;
          background: #fff;
          border-radius: 50%;
          box-shadow: ${isMobile ? '0 0 4px #fff' : '0 0 12px #fff, 0 0 20px #ffb3d9'};
          opacity: 0;
          pointer-events: none;
        `;

        gsap.to(star, {
          opacity: rand(0.5, 0.95),
          scale: rand(1.2, 2.2),
          duration: rand(0.8, 2.2),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: rand(0, 3),
          force3D: true
        });
      }
    };

    // Start magical fog immediately
    startMagicalFog();

    /* ── Sequential text reveal — blur/fade/glow/scale ── */
    const textTl = gsap.timeline({
      delay: 1.73, // Start after the cake rises (which has 1.75s duration)
      onComplete: () => {
        // Hold the complete composition for 4.0 seconds, then stop fireworks and transition
        gsap.delayedCall(4.0, () => {
          stopFireworks();
          revealSceneFive();
        });
      }
    });

    if (introEl)    gsap.set(introEl,    { opacity: 0, scale: 0.9, filter: 'blur(15px)', y: 15 });
    if (greetingEl) gsap.set(greetingEl, { opacity: 0, scale: 0.9, filter: 'blur(15px)', y: 15 });
    if (nameEl)     gsap.set(nameEl,     { opacity: 0, scale: 0.9, filter: 'blur(20px)', y: 15 });
    if (heartEl)    gsap.set(heartEl,    { opacity: 0, scale: 0.85, filter: 'blur(15px)', y: 15 });

    textTl
      // 1. Today's your day ❤️
      .call(() => { if (introEl) introEl.textContent = "Today's your day ❤️"; })
      .to(introEl, {
        opacity: 1, scale: 1.0, filter: 'blur(0px)', y: 0,
        letterSpacing: '0.06em',
        textShadow: '0 0 20px rgba(255,93,174,0.8), 0 0 40px rgba(255,93,174,0.4)',
        duration: 1.38, ease: 'power3.out'
      })
      // Start fireworks, sparkles, hearts, and confetti exactly 350ms after Today's your day starts appearing
      .add(() => {
        startSparkles();
        startConfetti();
        startHearts();
        startFireworks();
      }, 0.35)
      .to(introEl, { opacity: 0, filter: 'blur(10px)', scale: 1.1, y: -15, duration: 0.7, delay: 1.7, ease: 'power2.inOut' })

      // 2. Happy Birthday
      .call(() => { if (greetingEl) greetingEl.textContent = 'Happy Birthday'; })
      .to(greetingEl, {
        opacity: 1, scale: 1.0, filter: 'blur(0px)', y: 0,
        letterSpacing: '0.08em',
        textShadow: '0 0 25px rgba(255,255,255,0.8), 0 0 50px rgba(255,255,255,0.4)',
        duration: 1.38, ease: 'power3.out'
      })

      // 3. KEERTHI
      .add(() => { if (nameEl) nameEl.textContent = birthdayGirlName; }, '+=1.15')
      .to(nameEl, {
        opacity: 1, scale: 1.0, filter: 'blur(0px)', y: 0,
        duration: 1.38, ease: 'power3.out'
      }, '<')

      // 4. Heart ❤️
      .to(heartEl, {
        opacity: 1, scale: 1.0, filter: 'blur(0px)', y: 0,
        textShadow: '0 0 30px rgba(255,51,102,0.9), 0 0 60px rgba(255,51,102,0.5)',
        duration: 1.15, ease: 'power3.out' // Smoother entry, no snapping
      }, '+=0.92');

    // Flash transition fade
    if (flash) {
      gsap.fromTo(flash, { opacity: 0.35 }, { opacity: 0, duration: 0.7, ease: 'power3.out' });
    }

    // Bloom lighting fades in
    const bloomEl = sceneFour.querySelector('.bloom-lighting');
    if (bloomEl) {
      gsap.fromTo(bloomEl, { opacity: 0 }, { opacity: 1, duration: 3.45, ease: 'power3.out' });
    }

    // Cake rises from bottom with bounce, candles light sequentially, cake gently bounces, glow increases
    if (cakeRise) {
      gsap.fromTo(cakeRise,
        { y: 320, opacity: 0, scale: 0.95 },
        {
          y: 0, opacity: 1, scale: 1, duration: 1.73, ease: 'power3.out',
          onComplete: () => {
            // Candles light sequentially
            const candles = Array.from(sceneFour.querySelectorAll('.candle'));
            const candlesTl = gsap.timeline({
              onComplete: () => {
                // Cake squash and stretch bounce (smoother)
                gsap.timeline()
                  .to(cakeRise, { scaleY: 0.96, scaleX: 1.04, duration: 0.23, ease: 'sine.inOut' })
                  .to(cakeRise, { y: -12, scaleY: 1.02, scaleX: 0.98, duration: 0.4, ease: 'power3.out' })
                  .to(cakeRise, { y: 0, scaleY: 1, scaleX: 1, duration: 0.52, ease: 'sine.out' })
                  .call(() => {
                    // Ambient glow swell
                    gsap.to(cakeRise, {
                      filter: 'drop-shadow(0 20px 45px rgba(0,0,0,0.6)) drop-shadow(0 0 35px rgba(249,199,79,0.5))',
                      duration: 1.73,
                      ease: 'power3.out'
                    });

                    // Very tiny breathing animation (scale 1 -> 1.015 -> 1, repeat forever, no y drift)
                    gsap.to(cakeRise, {
                      scale: 1.015,
                      duration: 1.44,
                      repeat: -1,
                      yoyo: true,
                      ease: 'sine.inOut',
                      transformOrigin: 'center bottom'
                    });
                  });
              }
            });

            candles.forEach((candle, ci) => {
              candlesTl.call(() => {
                const fl = candle.querySelector('.flame');
                if (fl) {
                  gsap.set(fl, { opacity: 0, scaleY: 0 });
                  gsap.to(fl, { opacity: 1, scaleY: 1, duration: 0.46, ease: 'power3.out' });
                }
                const gl = candle.querySelector('.candle-glow');
                if (gl) gsap.to(gl, { opacity: 1, duration: 0.35 });
              }, null, `+=${ci === 0 ? 0 : 0.4}`);
            });
          }
        }
      );
    }

    // Real flame animations on cake candles
    sceneFour.querySelectorAll('.flame-core').forEach((core) => {
      gsap.to(core, {
        scaleX: 0.9, duration: rand(0.09, 0.14),
        repeat: -1, yoyo: true, ease: 'sine.inOut'
      });
    });

    // Candle glow pulses
    sceneFour.querySelectorAll('.candle-glow').forEach((glow) => {
      gsap.to(glow, {
        opacity: rand(0.5, 1.0), scale: rand(1.1, 1.5),
        duration: rand(0.3, 0.7), repeat: -1, yoyo: true, ease: 'sine.inOut',
        delay: Math.random() * 0.5
      });
    });

  };

  /* ─── Ambient Tone ────────────────────────────────────────── */
  const startAmbientTone = () => {
    if (typeof window === 'undefined') return;
    if (!window.AudioContext && !window.webkitAudioContext) return;
    if (audioContext) return;

    try {
      const AC       = window.AudioContext || window.webkitAudioContext;
      audioContext   = new AC();
      ambientOscillator = audioContext.createOscillator();
      ambientGain    = audioContext.createGain();
      ambientOscillator.type = 'sine';
      ambientOscillator.frequency.value = 220;
      ambientOscillator.connect(ambientGain);
      ambientGain.connect(audioContext.destination);
      ambientGain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      ambientOscillator.start();
      ambientGain.gain.exponentialRampToValueAtTime(0.016, audioContext.currentTime + 0.9);
    } catch (e) {
      // Silently ignore audio errors
    }
  };

  const fadeAmbientTone = () => {
    if (!ambientGain || !audioContext) return;
    try {
      ambientGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.4);
      gsap.delayedCall(1.5, () => {
        try { ambientOscillator?.stop(); audioContext?.close(); } catch(e) {}
        audioContext = null; ambientGain = null; ambientOscillator = null;
      });
    } catch (e) {}
  };

  /* ─── Dust Particles (Scene Five) ────────────────────────── */
  const createDustParticles = (layer) => {
    if (!layer) return;
    layer.innerHTML = '';
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('span');
      p.style.cssText = `
        position:absolute;
        left:${rand(0, 100)}%;
        top:${rand(0, 100)}%;
        opacity:${rand(0.2, 0.7)};
        width:${rand(1, 3)}px;
        height:${rand(1, 3)}px;
        border-radius:50%;
        background:rgba(255,220,150,${rand(0.4, 0.9)});
        box-shadow: 0 0 ${rand(4,10)}px rgba(255,200,100,0.5);
      `;
      layer.appendChild(p);
      gsap.to(p, {
        y: `${rand(-18, 18)}px`,
        x: `${rand(-12, 12)}px`,
        repeat: -1, yoyo: true,
        duration: rand(2, 5),
        ease: 'sine.inOut',
        delay: Math.random() * 3
      });
    }
  };

  /* ─── Rose Petals (Scene Five) ───────────────────────────── */
  const createRosePetals = () => {
    const container = document.getElementById('rose-petals');
    if (!container) return;

    const petalPositions = [
      { left:'42%', top:'55%', rotate:-20, w:14, h:10 },
      { left:'38%', top:'60%', rotate:35,  w:12, h: 9 },
      { left:'47%', top:'58%', rotate:-50, w:11, h: 8 },
      { left:'44%', top:'63%', rotate:15,  w:13, h:10 },
      { left:'36%', top:'65%', rotate:-30, w:10, h: 8 },
      { left:'50%', top:'61%', rotate:60,  w:12, h: 9 }
    ];

    petalPositions.forEach((pos) => {
      const petal = document.createElement('div');
      petal.className = 'rose-petal';
      petal.style.cssText = `
        position:absolute;
        left:${pos.left}; top:${pos.top};
        width:${pos.w}px; height:${pos.h}px;
        transform:rotate(${pos.rotate}deg);
      `;
      container.appendChild(petal);
    });
  };

  /* ─── SCENE FIVE — Vintage Letter ────────────────────────── */
  const openVintageLetter = () => {
    if (!sceneFive) return;

    const letter     = sceneFive.querySelector('.desk-letter');
    const letterText = sceneFive.querySelector('[data-letter-text]');
    const signoff    = sceneFive.querySelector('[data-signoff]');
    const stage      = sceneFive.querySelector('.scene-five-stage');
    const caption    = document.getElementById('scene-five-caption');
    const fadeOverlay = sceneFive.querySelector('.scene-five-fade');

    if (!letter || !letterText || !stage) return;

    startAmbientTone();

    // Mobile scroll scaling setup
    const updateScrollScale = () => {
      if (window.innerWidth < 768) {
        const targetWidth = 0.82 * window.innerWidth;
        const targetHeightLimit = 0.68 * window.innerHeight;
        
        const scaleWidth = targetWidth / 450;
        const scaleHeight = targetHeightLimit / 620;
        const scaleLimitBySpace = (window.innerHeight - 140) / 620;
        
        const scale = Math.min(scaleWidth, scaleHeight, Math.max(0.1, scaleLimitBySpace));
        document.documentElement.style.setProperty('--scroll-scale', scale);
      } else {
        document.documentElement.style.setProperty('--scroll-scale', 1);
      }
    };
    
    // Add resize listener if not already added
    if (!window.scrollScaleListenerAdded) {
      window.addEventListener('resize', updateScrollScale);
      window.scrollScaleListenerAdded = true;
    }
    updateScrollScale();

    // Reset styles and ensure scroll starts rolled up
    letter.style.pointerEvents = 'auto';
    const topRoller = letter.querySelector('.scroll-roller-top');
    const bottomRoller = letter.querySelector('.scroll-roller-bottom');
    const wrapper = letter.querySelector('.scroll-body-wrapper');

    // Centered start rolled up positions
    if (topRoller) gsap.set(topRoller, { top: 302, rotateX: 0 });
    if (bottomRoller) gsap.set(bottomRoller, { top: 302, rotateX: 0 });
    if (wrapper) gsap.set(wrapper, { top: 310, height: 0 });

    // Simple scroll container fade-in (scroll container stays fixed, no resizing/scaling)
    gsap.fromTo(letter,
      { opacity: 0 },
      { opacity: 1, duration: 0.95, ease: 'power2.out', force3D: true }
    );

    // Smooth opening unroll animation (unrolls outward over 1.35 seconds)
    gsap.delayedCall(0.95, () => {
      if (topRoller) gsap.to(topRoller, { top: 0, rotateX: -360, duration: 1.35, ease: 'power3.out', force3D: true });
      if (bottomRoller) gsap.to(bottomRoller, { top: 604, rotateX: 360, duration: 1.35, ease: 'power3.out', force3D: true });
      if (wrapper) gsap.to(wrapper, { top: 14, height: 592, duration: 1.35, ease: 'power3.out', force3D: true });
    });

    // Typewriter animation starts right after unrolling completes (0.95s + 1.35s = 2.30s -> delay to 2.45s)
    gsap.delayedCall(2.45, () => {
      const bodyTextStr = "Thank you for being the gentle light in my life.\n\nYour kindness, warmth, and steady love have always made every ordinary day feel special.\n\nI hope this little note reminds you how deeply cherished you are.";

      letterText.innerHTML = '';
      const charSpans = [];

      // Pre-populate character spans to prevent any text reflow or wrapping jumps
      for (let i = 0; i < bodyTextStr.length; i++) {
        const char = bodyTextStr[i];
        if (char === '\n') {
          const br = document.createElement('br');
          letterText.appendChild(br);
        } else {
          const span = document.createElement('span');
          span.textContent = char;
          span.style.cssText = 'opacity: 0; display: inline; will-change: opacity;';
          letterText.appendChild(span);
          charSpans.push({ element: span, char: char });
        }
      }
      
      let charIndex = 0;
      let lastTime = performance.now();
      let currentDelay = 35;

      const startSignature = () => {
        const sigLine1 = signoff.querySelector('.signoff-line-1');
        const sigLine2 = signoff.querySelector('.signoff-line-2');
        
        gsap.set(signoff, { opacity: 1 });
        
        // Fade in With Lots of Love,
        if (sigLine1) {
          gsap.fromTo(sigLine1,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 1.15, ease: 'power3.out', force3D: true }
          );
        }
        
        // Wait 300ms
        gsap.delayedCall(0.3, () => {
          // Fade in Prashanth ❤️
          if (sigLine2) {
            gsap.fromTo(sigLine2,
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 1.15, ease: 'power3.out', force3D: true }
            );
          }
        });
      };

      const typeFrame = (now) => {
        if (charIndex >= charSpans.length) {
          // Trigger the next step (Wait 500ms after body completes)
          gsap.delayedCall(0.5, startSignature);
          return;
        }

        const elapsed = now - lastTime;
        if (elapsed >= currentDelay) {
          const item = charSpans[charIndex];
          item.element.style.opacity = '1';
          charIndex++;
          lastTime = now;

          // Compute delay for the next character
          if (charIndex < charSpans.length) {
            const nextItem = charSpans[charIndex];
            currentDelay = 35;
            if (nextItem.char === '.' || nextItem.char === '!' || nextItem.char === '?') {
              currentDelay = 300;
            } else if (nextItem.char === ',') {
              currentDelay = 150;
            }
          }
        }
        requestAnimationFrame(typeFrame);
      };

      requestAnimationFrame(typeFrame);
    });

    // Zoom out + caption after typing completes (adjusted offset to 12.8s)
    gsap.delayedCall(12.8, () => {
      gsap.to(stage, { scale: 0.94, duration: 3.2, ease: 'power3.out' });
      if (caption) {
        caption.style.pointerEvents = 'auto';
        gsap.fromTo(caption,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 1.4, ease: 'power3.out' }
        );
      }
      fadeAmbientTone();
    });

    // Show Continue button (adjusted offset to 14.2s)
    gsap.delayedCall(14.2, () => {
      // Create the beautiful Continue button
      const continueBtn = document.createElement('button');
      continueBtn.id = 'letter-continue-btn';
      continueBtn.innerHTML = 'Continue &#10084;&#65039;';
      continueBtn.type = 'button';
      continueBtn.setAttribute('aria-label', 'Continue to thank you screen');
      continueBtn.style.cssText = `
        position: absolute;
        bottom: 1.8rem;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        z-index: 20;
        padding: 0.75rem 2.4rem;
        font-family: 'Poppins', sans-serif;
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        color: #ffffff;
        background: linear-gradient(135deg, #e91e8c 0%, #c2185b 45%, #9c27b0 100%);
        border: none;
        border-radius: 999px;
        cursor: pointer;
        box-shadow:
          0 0 28px rgba(233,30,140,0.6),
          0 0 55px rgba(233,30,140,0.3),
          0 8px 24px rgba(0,0,0,0.4),
          inset 0 1px 0 rgba(255,255,255,0.25);
        opacity: 0;
        pointer-events: none;
        transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
      `;
      sceneFive.appendChild(continueBtn);

      // Floating animation on button using GSAP
      gsap.to(continueBtn, {
        y: -8, duration: 1.4,
        repeat: -1, yoyo: true, ease: 'sine.inOut',
        delay: 0.8
      });

      // Hover effects
      continueBtn.addEventListener('mouseenter', () => {
        continueBtn.style.background = 'linear-gradient(135deg, #ff4db8 0%, #e91e8c 45%, #ab47bc 100%)';
        continueBtn.style.boxShadow = '0 0 40px rgba(233,30,140,0.85), 0 0 80px rgba(233,30,140,0.4), 0 12px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.35)';
      });
      continueBtn.addEventListener('mouseleave', () => {
        continueBtn.style.background = 'linear-gradient(135deg, #e91e8c 0%, #c2185b 45%, #9c27b0 100%)';
        continueBtn.style.boxShadow = '0 0 28px rgba(233,30,140,0.6), 0 0 55px rgba(233,30,140,0.3), 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)';
      });

      // Fade button in
      gsap.to(continueBtn, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'back.out(1.5)',
        onComplete: () => { continueBtn.style.pointerEvents = 'auto'; }
      });

      // Function to go to ending screen
      const goToEnding = () => {
        continueBtn.style.pointerEvents = 'none';
        gsap.to(continueBtn, { opacity: 0, scale: 0.9, duration: 0.35, ease: 'power2.in' });
        if (fadeOverlay) {
          gsap.to(fadeOverlay, { opacity: 1, duration: 2.2, ease: 'power2.inOut',
            onComplete: () => {
              // Ending screen
              const ending = document.createElement('div');
              ending.style.cssText = `
                position:absolute; inset:0;
                display:flex; flex-direction:column;
                align-items:center; justify-content:center;
                gap:1.2rem; opacity:0; z-index:10;
                pointer-events:none;
                background: #0d0520;
              `;
              const t1 = document.createElement('p');
              t1.textContent = 'Thank You';
              t1.style.cssText = `margin:0; font-family:'Great Vibes',cursive; font-size:3.5rem; color:#f9c74f; text-shadow:0 0 30px rgba(249,199,79,0.7);`;
              const t2 = document.createElement('p');
              t2.textContent = 'for being part of this beautiful journey ❤️';
              t2.style.cssText = `margin:0; font-family:'Cormorant Garamond',serif; font-size:1.1rem; font-style:italic; color:rgba(252,228,236,0.8); text-align:center; max-width:280px; line-height:1.7;`;
              const t3 = document.createElement('p');
              t3.textContent = 'Made with ❤️ by MEMORIS';
              t3.style.cssText = `margin:0; font-family:'Poppins',sans-serif; font-size:0.8rem; color:rgba(249,199,79,0.6); letter-spacing:0.08em;`;
              ending.appendChild(t1); ending.appendChild(t2); ending.appendChild(t3);
              document.body.appendChild(ending);
              gsap.to(ending, { opacity: 1, duration: 1.73, ease: 'power3.out' });

              // Gentle floating hearts on ending
              const syms = ['♥','✦','♡'];
              for (let ei = 0; ei < 20; ei++) {
                const eh = document.createElement('span');
                eh.textContent = syms[ei % syms.length];
                eh.style.cssText = `
                  position:absolute;
                  left:${rand(5,95)}%; top:${rand(20,90)}%;
                  font-size:${rand(0.6,1.2)}rem;
                  color:rgba(233,30,140,${rand(0.2,0.5)});
                  opacity:0; pointer-events:none;
                  text-shadow:0 0 10px currentColor;
                `;
                ending.appendChild(eh);
                gsap.to(eh, { opacity: 1, y: `-=${rand(30,80)}px`, duration: rand(4,9), repeat:-1, yoyo:true, ease:'sine.inOut', delay: rand(0,3) });
              }
            }
          });
        }
      };

      // Button click handler
      continueBtn.addEventListener('click', goToEnding, { once: true });

      // Auto-continue after 20 seconds if button not clicked
      const autoTimer = window.setTimeout(() => {
        if (continueBtn.style.pointerEvents !== 'none') {
          goToEnding();
        }
      }, 20000);

      // Cancel auto-timer if user clicks manually
      continueBtn.addEventListener('click', () => window.clearTimeout(autoTimer), { once: true });
    });
  };

  /* ─── SCENE FIVE — Initialization ────────────────────────── */
  const initSceneFive = () => {
    if (!sceneFive || sceneFiveInitialized) return;
    sceneFiveInitialized = true;

    createDustParticles(sceneFive.querySelector('.scene-five-dust-layer'));

    // Automatically open/unroll the scroll after a short delay
    gsap.delayedCall(0.5, openVintageLetter);
  };

  /* ─── Initialize ─────────────────────────────────────────── */
  const initialize = () => {
    // Generate Cinematic Opening (Priority 1)
    generateCinematicOpening();

    initKeypad();
    updateDisplay();
    animateLoading();
  };

  document.addEventListener('DOMContentLoaded', initialize);
})();
