// ── Detect touch/mobile ──
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // ── Dino Game Canvas: scale down on small screens ──
    (function() {
      const capsule = document.getElementById('dino-capsule');
      const canvas = document.getElementById('dino-canvas');
      const maxW = Math.min(520, window.innerWidth - 28);
      const scale = maxW / 520;
      canvas.width = maxW;
      canvas.height = Math.round(60 * scale);

      const ctx = canvas.getContext('2d');
      const W = canvas.width;
      const H = canvas.height;
      const P = Math.max(1, Math.round(2 * scale));
      const GROUND_Y = H - Math.round(8 * scale);
      const DINO_X = Math.round(36 * scale);
      const COL = '#000080';

      const dinoStand = [
        '00000000001111110000',
        '00000000011111111100',
        '00000000011011111100',
        '00000000011111111100',
        '00000000011111111100',
        '00000000011111100000',
        '00000000011111110000',
        '01000000111111100000',
        '01100001111111111000',
        '01110001111111110000',
        '01111011111111100000',
        '01111111111111100000',
        '01111111111111000000',
        '00111111111111000000',
        '00011111111110000000',
        '00001111111100000000',
        '00000111111000000000',
        '00000011110000000000',
        '00000001100000000000',
        '00000001010000000000',
      ];
      const dinoRun1 = [
        '00000000001111110000',
        '00000000011111111100',
        '00000000011011111100',
        '00000000011111111100',
        '00000000011111111100',
        '00000000011111100000',
        '00000000011111110000',
        '01000000111111100000',
        '01100001111111111000',
        '01110001111111110000',
        '01111011111111100000',
        '01111111111111100000',
        '01111111111111000000',
        '00111111111111000000',
        '00011111111110000000',
        '00001111111100000000',
        '00000111111000000000',
        '00000011100000000000',
        '00000010000000000000',
        '00000000100000000000',
      ];
      const dinoRun2 = [
        '00000000001111110000',
        '00000000011111111100',
        '00000000011011111100',
        '00000000011111111100',
        '00000000011111111100',
        '00000000011111100000',
        '00000000011111110000',
        '01000000111111100000',
        '01100001111111111000',
        '01110001111111110000',
        '01111011111111100000',
        '01111111111111100000',
        '01111111111111000000',
        '00111111111111000000',
        '00011111111110000000',
        '00001111111100000000',
        '00000111111000000000',
        '00000001110000000000',
        '00000000010000000000',
        '00000010000000000000',
      ];

      const DINO_SPRITE_W = 20;
      const DINO_SPRITE_H = 20;
      const DINO_DRAW_W = DINO_SPRITE_W * P;
      const DINO_DRAW_H = DINO_SPRITE_H * P;

      let dinoY = GROUND_Y - DINO_DRAW_H;
      let velY = 0;
      let jumping = false;
      const GRAVITY = 0.28 * scale;
      const JUMP_VEL = -5.0 * Math.sqrt(scale);
      let speed = 1.6 * Math.sqrt(scale);
      let frame = 0;

      let groundBumps = [];
      for (let i = 0; i < 80; i++) {
        groundBumps.push({
          x: Math.random() * W,
          w: Math.max(1, Math.round((1 + Math.random() * 3) * scale)),
          h: Math.max(1, Math.round((1 + Math.random() * 1.5) * scale))
        });
      }

      let cacti = [];
      let cactusTimer = 0;
      const CACTUS_MIN_GAP = 180 * scale;
      const CACTUS_MAX_GAP = 320 * scale;
      let nextCactus = 240 * scale;

      let clouds = [];
      for (let i = 0; i < 3; i++) {
        clouds.push({
          x: 80 + Math.random() * (W - 80),
          y: 4 + Math.random() * 12
        });
      }

      function spawnCactus() {
        const type = Math.random();
        if (type < 0.35) cacti.push({ x: W + 10, type: 'small', count: 1 });
        else if (type < 0.6) cacti.push({ x: W + 10, type: 'small', count: 2 });
        else if (type < 0.85) cacti.push({ x: W + 10, type: 'large', count: 1 });
        else cacti.push({ x: W + 10, type: 'large', count: 2 });
      }

      function drawSprite(sprite, x, y) {
        ctx.fillStyle = COL;
        for (let row = 0; row < sprite.length; row++) {
          for (let col = 0; col < sprite[row].length; col++) {
            if (sprite[row][col] === '1') {
              ctx.fillRect(x + col * P, y + row * P, P, P);
            }
          }
        }
      }

      function drawSmallCactus(x) {
        const w = 3 * P, h = 14 * P;
        const bx = x, by = GROUND_Y - h;
        ctx.fillStyle = COL;
        ctx.fillRect(bx, by + 3*P, w, h - 3*P);
        ctx.fillRect(bx + 0.5*P, by, w - 1*P, 4*P);
        ctx.fillRect(bx - 2*P, by + 4*P, 2*P, 1*P);
        ctx.fillRect(bx - 2*P, by + 4*P, 1*P, 3*P);
        ctx.fillRect(bx - 2*P, by + 7*P, 2*P, 1*P);
        ctx.fillRect(bx + w, by + 6*P, 2*P, 1*P);
        ctx.fillRect(bx + w + 1*P, by + 6*P, 1*P, 3*P);
        ctx.fillRect(bx + w, by + 8*P, 2*P, 1*P);
        return 3 * P + 4 * P;
      }

      function drawLargeCactus(x) {
        const w = 4 * P, h = 18 * P;
        const bx = x, by = GROUND_Y - h;
        ctx.fillStyle = COL;
        ctx.fillRect(bx, by + 3*P, w, h - 3*P);
        ctx.fillRect(bx + 0.5*P, by, w - 1*P, 4*P);
        ctx.fillRect(bx - 3*P, by + 5*P, 3*P, 1*P);
        ctx.fillRect(bx - 3*P, by + 5*P, 1*P, 4*P);
        ctx.fillRect(bx - 3*P, by + 9*P, 3*P, 1*P);
        ctx.fillRect(bx + w, by + 8*P, 3*P, 1*P);
        ctx.fillRect(bx + w + 2*P, by + 8*P, 1*P, 4*P);
        ctx.fillRect(bx + w, by + 11*P, 3*P, 1*P);
        return 4 * P + 6 * P;
      }

      function drawCactusGroup(c) {
        let totalW = 0;
        for (let i = 0; i < c.count; i++) {
          const offset = i * (c.type === 'small' ? 8 * P : 10 * P);
          if (c.type === 'small') totalW = offset + drawSmallCactus(c.x + offset);
          else totalW = offset + drawLargeCactus(c.x + offset);
        }
        c._hitW = totalW;
      }

      function drawCloud(cl) {
        ctx.fillStyle = 'rgba(0, 0, 128, 0.10)';
        const s = 1.2 * scale;
        ctx.fillRect(cl.x, cl.y + 3*s, 24*s, 2*s);
        ctx.fillRect(cl.x + 2*s, cl.y + 2*s, 20*s, 1*s);
        ctx.fillRect(cl.x + 4*s, cl.y + 1*s, 6*s, 1*s);
        ctx.fillRect(cl.x + 14*s, cl.y, 6*s, 2*s);
      }

      function update() {
        frame++;
        if (jumping) {
          velY += GRAVITY;
          dinoY += velY;
          if (dinoY >= GROUND_Y - DINO_DRAW_H) {
            dinoY = GROUND_Y - DINO_DRAW_H;
            velY = 0;
            jumping = false;
          }
        }
        for (let c of cacti) {
          const cactusLeft = c.x;
          const dinoRight = DINO_X + DINO_DRAW_W * 0.6;
          const dist = cactusLeft - dinoRight;
          if (dist > 0 && dist < 42 * scale && !jumping) {
            jumping = true;
            velY = JUMP_VEL;
            break;
          }
        }
        cacti.forEach(c => c.x -= speed);
        cacti = cacti.filter(c => c.x > -60);
        cactusTimer += speed;
        if (cactusTimer >= nextCactus) {
          spawnCactus();
          cactusTimer = 0;
          nextCactus = CACTUS_MIN_GAP + Math.random() * (CACTUS_MAX_GAP - CACTUS_MIN_GAP);
        }
        groundBumps.forEach(b => {
          b.x -= speed;
          if (b.x < -4) b.x = W + Math.random() * 30;
        });
        clouds.forEach(cl => {
          cl.x -= speed * 0.2;
          if (cl.x < -40) {
            cl.x = W + 20 + Math.random() * 80;
            cl.y = 4 + Math.random() * 12;
          }
        });
      }

      function draw() {
        ctx.clearRect(0, 0, W, H);
        clouds.forEach(drawCloud);
        ctx.fillStyle = COL;
        ctx.fillRect(0, GROUND_Y, W, 1);
        ctx.fillStyle = 'rgba(0, 0, 128, 0.25)';
        groundBumps.forEach(b => ctx.fillRect(b.x, GROUND_Y + 1, b.w, b.h));
        cacti.forEach(drawCactusGroup);
        const runCycle = Math.floor(frame / 8) % 2;
        let sprite = jumping ? dinoStand : (runCycle === 0 ? dinoRun1 : dinoRun2);
        drawSprite(sprite, DINO_X, dinoY);
      }

      function drawIdle() {
        ctx.clearRect(0, 0, W, H);
        clouds.forEach(drawCloud);
        ctx.fillStyle = COL;
        ctx.fillRect(0, GROUND_Y, W, 1);
        ctx.fillStyle = 'rgba(0, 0, 128, 0.25)';
        groundBumps.forEach(b => ctx.fillRect(b.x, GROUND_Y + 1, b.w, b.h));
        drawSprite(dinoStand, DINO_X, GROUND_Y - DINO_DRAW_H);
      }

      let isIdle = false;

      function loop() {
        if (isIdle) {
          drawIdle();
        } else {
          update();
          draw();
        }
        requestAnimationFrame(loop);
      }

      setTimeout(() => { spawnCactus(); loop(); }, 600);

      window._dinoGame = {
        setIdle(v) { isIdle = v; },
        get idle() { return isIdle; }
      };
    })();

    // ── SVG loader ──
    function loadSVG() {
      const container = document.getElementById('svg-container');
      if (container && !container.querySelector('object')) {
        const obj = document.createElement('object');
        obj.type = 'image/svg+xml';
        obj.data = '/Soham.svg';
        obj.className = 'hero-svg';
        obj.textContent = 'Soham';
        container.appendChild(obj);
      }
    }
    window.addEventListener('message', function(e) {
      if (e.data === 'start-svg') loadSVG();
    });
    setTimeout(loadSVG, 7500);

    // ── Smooth Stacked Cards Scroll ──
    const hero = document.querySelector('.hero');
    const stackCards = Array.from(document.querySelectorAll('.stack-card'));
    let ticking = false;
    let heroH = hero.offsetHeight;
    let vh = window.innerHeight;

    window.addEventListener('resize', () => {
      heroH = hero.offsetHeight;
      vh = window.innerHeight;
      updateStackCards();
      if (typeof updateJourneyLayout === 'function') updateJourneyLayout();
    });

    function updateStackCards() {
      const scrollY = window.scrollY;
      const stage = Math.max(0, (scrollY - heroH) / vh);

      const dinoCapsule = document.getElementById('dino-capsule');
      if (dinoCapsule) {
        const targetOpacity = stage > 0.3 ? '0' : '1';
        if (dinoCapsule.style.opacity !== targetOpacity) {
          dinoCapsule.style.opacity = targetOpacity;
        }
      }

      stackCards.forEach((card, i) => {
        // Offset by 1 so Card 0 enters during stage 0 -> 1
        const p = stage - i - 1; 

        if (p <= 0) {
          // Entering: smoothly slide in from bottom
          const ty = Math.min(80, Math.abs(p) * 80);
          card.style.transform = `translate3d(0, ${ty}vh, 0)`;
        } else {
          // Pushed back: smoothly scale down and shift up
          const scale = Math.max(0.85, 1 - p * 0.04);
          const shiftVh = p * 4;
          card.style.transform = `translate3d(0, -${shiftVh}vh, 0) scale(${scale})`;
        }
      });
      
      // Update Game Idle State
      if (window._dinoGame) {
        const past = scrollY > heroH - 200;
        window._dinoGame.setIdle(past);
      }
    }

    // ── Horizontal Journey Scroll ──
    const journeySection = document.getElementById('journey-section');
    const journeyTrack = document.getElementById('journey-track');

    function updateJourneyLayout() {
      if (!journeySection || !journeyTrack) return;
      const stops = journeyTrack.querySelectorAll('.journey-stop');
      if (stops.length < 2) return;
      const maxScroll = stops[stops.length - 1].offsetLeft - stops[0].offsetLeft;
      if (maxScroll > 0) {
        journeySection.style.height = `${maxScroll + window.innerHeight}px`;
      } else {
        journeySection.style.height = '100vh';
      }
    }

    function updateJourneyScroll() {
      if (!journeySection || !journeyTrack) return;
      const secTop = journeySection.offsetTop;
      const secH = journeySection.offsetHeight;
      const scrollY = window.scrollY;

      // Only animate while in view
      if (scrollY >= secTop - window.innerHeight && scrollY <= secTop + secH) {
        let progress = (scrollY - secTop) / (secH - window.innerHeight);
        progress = Math.max(0, Math.min(1, progress));

        const stops = journeyTrack.querySelectorAll('.journey-stop');
        if (stops.length < 2) return;
        const maxScroll = stops[stops.length - 1].offsetLeft - stops[0].offsetLeft;
        
        if (maxScroll > 0) {
          const tx = progress * maxScroll;
          journeyTrack.style.transform = `translate3d(-${tx}px, 0, 0)`;
        }
      }
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateStackCards();
          updateJourneyScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    updateStackCards();
    updateJourneyLayout();
    updateJourneyScroll();

    // ── Game Nav (hidden — cards have their own labels) ──
    const gameNavContainer = document.getElementById('game-nav-labels');
    if (window._dinoGame) {
      const checkHero = () => {
        const past = window.scrollY > hero.offsetHeight - 200;
        window._dinoGame.setIdle(past);
      };
      window.addEventListener('scroll', checkHero, { passive: true });
    }

    // ── Custom Cursor (desktop / mouse only) ──
    if (!isTouchDevice) {
      const cursorEl = document.querySelector('.cursor');
      const profileCircle = document.getElementById('profile-circle');
      const cursorReveal = document.getElementById('cursor-reveal');
      const BASE_CURSOR_SIZE = 80;
      const BASE_RADIUS = BASE_CURSOR_SIZE / 2;
      const HOVER_SCALE = 1.8;
      const HOVER_CURSOR_SIZE = BASE_CURSOR_SIZE * HOVER_SCALE;
      const HOVER_RADIUS = BASE_RADIUS * HOVER_SCALE;
      let isOverPhoto = false;

      if (cursorEl) {
        document.addEventListener('mousemove', (e) => {
          cursorEl.style.top = e.clientY + 'px';
          cursorEl.style.left = e.clientX + 'px';

          const isLink = e.target.closest('a, .hero-social, .game-nav-labels') !== null;
          if (isLink) cursorEl.classList.add('link-hover');
          else cursorEl.classList.remove('link-hover');

          if (profileCircle && cursorReveal) {
            const rect = profileCircle.getBoundingClientRect();
            const isNowOver =
              e.clientX >= rect.left && e.clientX <= rect.right &&
              e.clientY >= rect.top && e.clientY <= rect.bottom;

            if (isNowOver) {
              if (!isOverPhoto) {
                cursorEl.style.width = HOVER_CURSOR_SIZE + 'px';
                cursorEl.style.height = HOVER_CURSOR_SIZE + 'px';
                isOverPhoto = true;
              }
              const localX = e.clientX - rect.left;
              const localY = e.clientY - rect.top;
              cursorReveal.style.clipPath = `circle(${HOVER_RADIUS}px at ${localX}px ${localY}px)`;
              cursorReveal.style.opacity = '1';
            } else {
              if (isOverPhoto) {
                cursorEl.style.width = BASE_CURSOR_SIZE + 'px';
                cursorEl.style.height = BASE_CURSOR_SIZE + 'px';
                isOverPhoto = false;
              }
              cursorReveal.style.opacity = '0';
              cursorReveal.style.clipPath = 'circle(0px at 50% 50%)';
            }
          }
        });

        document.addEventListener('click', () => {
          cursorEl.classList.add('click');
          setTimeout(() => cursorEl.classList.remove('click'), 300);
        });
      }
    }
