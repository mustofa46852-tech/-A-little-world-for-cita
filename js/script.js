/* =========================================================
   A LITTLE WORLD FOR CITA — script.js
   Daftar isi
   1. Konten & pengaturan (bagian yang mudah diedit)
   2. Helper & state
   3. Dunia latar (bintang, hati, kupu-kupu)
   4. Efek partikel (confetti, hati, sentuhan)
   5. Musik
   6. Animasi GSAP (helper)
   7. Navigasi antar-section
   8. Section 01 — Invitation
   9. Section 02 — Welcome
  10. Section 03 — Birthday
  11. Section 04 — Gallery + lightbox
  12. Section 05 — Letter
  13. Section 06 — Cake
  14. Section 07 — Gift & finale
  15. Bintang rahasia & toast
  16. Replay
  17. Init
   ========================================================= */
(() => {
  'use strict';

  /* =======================================================
     1. KONTEN & PENGATURAN
     Edit teks di bagian ini. Judul section ada di index.html.
     ======================================================= */
  const CONTENT = {
    // Pesan di bintang rahasia (muncul bergantian setiap bintang ditekan)
    secretWishes: [
  "Hari ini, jangan lupa senyum yaa! ♡",
  "Kamu sudah melakukan yang terbaik, Cita!",
  "Semoga hari ini kamu bahagia yaaa! 🗿",
  "Hari ini, kamulah pemeran utamanya! ✨",
  "Pengingat kecil: kamu sudah hebat dengan caramu sendiri. ♡",
  "Jangan keseringan overthinking, nikmati aja yaa! 🗿"
],

    // Enam foto galeri. Ganti file di assets/images/ (nama file sama),
    // atau ubah "src" di bawah. Caption boleh diganti sesuka hati.
    photos: [
      { src: 'assets/images/cita-1.jpg', caption: 'Smile mode: on ♡' },
      { src: 'assets/images/cita-2.jpg', caption: 'Pure good vibes' },
      { src: 'assets/images/cita-3.jpg', caption: 'A happy little moment' },
      { src: 'assets/images/cita-4.jpg', caption: 'Sparkle sparkle ✨' },
      { src: 'assets/images/cita-5.jpg', caption: 'Cita, being Cita' },
      { src: 'assets/images/cita-6.webp', caption: 'Cheers to you!' }
    ],

    // Surat dari Ahmad (Section 05)
    letter: {
      greeting: 'Happy Birthday, Cita! ♡',
      paragraphs: [
        'Akhirnya hari spesialmu datang juga!',
        'Semoga di usia 15 ini, kamu selalu diberikan kesehatan, kebahagiaan, dan banyak hal baik yang mungkin belum pernah kamu bayangkan sebelumnya.',
        'Gak berasa kita udah 2 tahun kenal. Terima kasih ya sudah menjadi bagian dari cerita kecil dalam keseharianku. Meskipun kita belum punya kesempatan untuk bertemu secara langsung, tapi aku senang bisa mengenalmu dan berbagi banyak cerita melalui obrolan sederhana kita.',
        'Semoga hari-harimu selalu dipenuhi hal-hal menyenangkan. Jangan terlalu sering overthinking, jangan lupa bahagia, jaga kesehatan, dan tetap jadi Cita yang ceria! oh iya lupa, jangan keseringan begadang, dan jangan sampai telat makan lagi loh, nanti malah sakit nyaa makin parah🗿',
        'Aku juga berharap kita masih bisa terus ngobrol kayak biasa. Bisa berbagi cerita, bercanda, saling menghibur, dan tetap akrab untuk waktu yang lama.',
        'Sekali lagi, selamat ulang tahun, Cita!',
        'Enjoy your special day!'
      ],
      signature: '— Ahmad 🗿'
    },

    // Pesan setelah lilin padam (Section 06)
    wishDone: 'Semoga semua harapan kecilmu menjadi kenyataan! ♡',

// Pesan penutup di kotak hadiah (Section 07)
finale: {
  paragraphs: [
    'Makasih banget yaaa, udah jadi teman terbaikku dan udah mau nemenin aku ngobrol. Walaupun aku kadang ngeselin..',
    'Aku harap, kita bisa terus akrab dan ngobrol kayak biasa yaa. Maaf banget kalau aku kadang ngeselin. Oh iya, maaf juga karena aku jarang chat kamu. Aku siapin ini agak lama🗿',
    'Tetap bahagia, tetap sehat, dan semoga semua cita-cita kamu bisa tercapai. Semangat!!'
  ],
  highlight: '生日快乐，Cita！♡ \n(Happy Birthday, Cita! ♡)',
  signature: 'Dari temanmu,\nAhmad Mustofa.'
}
  };

  const CONFIG = {
    gsapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
    gsapWaitMs: 3500,          // batas tunggu GSAP sebelum tetap lanjut tanpa GSAP
    typingCharsPerSecond: 62,  // kecepatan efek mengetik surat
    maxParticles: 170,         // batas partikel confetti/hati di layar
    rainMs: 4200,              // lama hujan confetti di Section 03
    transitionMs: 650          // jeda kunci antar-section
  };

  /* =======================================================
     2. HELPER & STATE
     ======================================================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const state = {
    current: 0,
    busy: false,
    opened: false,
    reduce: motionQuery.matches,
    lightbox: false,
    wishIndex: 0
  };

  // Semua timeout lewat sini supaya bisa dibatalkan saat replay
  const timers = new Set();
  const later = (fn, ms) => {
    const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
    return id;
  };
  const clearTimers = () => { timers.forEach(clearTimeout); timers.clear(); };

  const SCENES = $$('.scene');
  const LAST = SCENES.length - 1;
  const split = {};   // karakter hasil pemecahan teks judul

  /* =======================================================
     3. DUNIA LATAR
     ======================================================= */
  function buildSky() {
    // bintang berkilauan
    const starsEl = $('#skyStars');
    const stars = document.createDocumentFragment();
    for (let i = 0; i < 22; i++) {
      const s = document.createElement('span');
      const size = rand(8, 17).toFixed(1);
      s.className = 'twinkle' + (i % 4 === 0 ? ' twinkle--pink' : '');
      s.style.cssText =
        `left:${rand(2, 96).toFixed(1)}%;top:${rand(2, 92).toFixed(1)}%;` +
        `width:${size}px;height:${size}px;` +
        `animation-delay:${rand(0, 4).toFixed(2)}s;animation-duration:${rand(2.6, 4.8).toFixed(2)}s`;
      s.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-sparkle"/></svg>';
      stars.appendChild(s);
    }
    starsEl.appendChild(stars);

    // hati melayang
    const heartsEl = $('#skyHearts');
    const hearts = document.createDocumentFragment();
    const heartColors = ['#FF8FAB', '#FFC2D1', '#F7A8C4', '#E6D5FF'];
    for (let i = 0; i < 9; i++) {
      const h = document.createElement('span');
      h.className = 'float-heart';
      h.style.cssText =
        `--x:${rand(4, 94).toFixed(1)}%;--size:${rand(13, 28).toFixed(0)}px;` +
        `--dur:${rand(13, 22).toFixed(1)}s;--delay:${(-rand(0, 20)).toFixed(1)}s;--c:${pick(heartColors)}`;
      h.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-heart"/></svg>';
      hearts.appendChild(h);
    }
    heartsEl.appendChild(hearts);

    // kupu-kupu
    const bfEl = $('#skyButterflies');
    const palettes = [
      ['#FF8FAB', '#FFC2D1'], ['#E6D5FF', '#F7A8C4'], ['#FFC2D1', '#E6D5FF'], ['#F7A8C4', '#FFFFFF']
    ];
    const tops = [14, 36, 58, 76];
    palettes.forEach(([c1, c2], i) => {
      const b = document.createElement('span');
      b.className = 'butterfly';
      b.style.cssText =
        `--top:${tops[i]}%;--w:${rand(34, 48).toFixed(0)}px;--dur:${rand(26, 40).toFixed(0)}s;` +
        `--delay:${(-rand(0, 30)).toFixed(0)}s;--fly:${i % 2 ? 'fly-left' : 'fly-right'};--c1:${c1};--c2:${c2}`;
      b.innerHTML =
        '<svg viewBox="0 0 64 48" aria-hidden="true">' +
        '<g class="bf-wing bf-wing--l"><path d="M32 24C24 8 8 2 4 12c-3 9 6 15 14 14-6 2-9 8-6 13 4 6 14 3 20-15z" fill="var(--c1)"/><circle cx="14" cy="14" r="3.2" fill="#fff" opacity=".7"/></g>' +
        '<g class="bf-wing bf-wing--r"><path d="M32 24C40 8 56 2 60 12c3 9-6 15-14 14 6 2 9 8 6 13-4 6-14 3-20-15z" fill="var(--c2)"/><circle cx="50" cy="14" r="3.2" fill="#fff" opacity=".7"/></g>' +
        '<rect x="30.8" y="14" width="2.4" height="22" rx="1.2" fill="#59404A" opacity=".75"/>' +
        '<path d="M31.5 15c-2-5-5-6-7-6M32.5 15c2-5 5-6 7-6" stroke="#59404A" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".75"/>' +
        '</svg>';
      bfEl.appendChild(b);
    });
  }

  /* =======================================================
     4. EFEK PARTIKEL (satu canvas, jumlah dibatasi)
     ======================================================= */
  const fx = (() => {
    const canvas = $('#fx');
    const ctx = canvas.getContext('2d');
    const COLORS = ['#FF8FAB', '#FFC2D1', '#E6D5FF', '#F7A8C4', '#FFFFFF', '#FFB3C7'];
    const parts = [];
    let w = 0, h = 0, dpr = 1, raf = 0, last = 0, rainUntil = 0, rainAcc = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }

    function spawn(p) {
      if (parts.length >= CONFIG.maxParticles) parts.splice(0, parts.length - CONFIG.maxParticles + 1);
      parts.push(p);
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    }

    function base(type, x, y, vx, vy, extra) {
      return Object.assign({
        type, x, y, vx, vy,
        g: 600, drag: .985, rot: rand(0, 6.28), vr: rand(-6, 6),
        flip: rand(0, 6.28), vf: rand(4, 10),
        size: rand(6, 10), color: pick(COLORS), alpha: 1, life: rand(2.4, 3.6)
      }, extra);
    }

    function confetti(x, y, n = 40) {
      const count = state.reduce ? Math.min(n, 12) : n;
      for (let i = 0; i < count; i++) {
        const ang = -Math.PI / 2 + rand(-1.15, 1.15);
        const sp = rand(220, 560);
        spawn(base(Math.random() < .25 ? 'circle' : 'rect', x, y, Math.cos(ang) * sp, Math.sin(ang) * sp));
      }
    }

    function hearts(x, y, n = 24) {
      const count = state.reduce ? Math.min(n, 10) : n;
      const types = ['heart', 'heart', 'star', 'sparkle'];
      for (let i = 0; i < count; i++) {
        const ang = rand(0, 6.283);
        const sp = rand(70, 300);
        spawn(base(pick(types), x, y, Math.cos(ang) * sp, Math.sin(ang) * sp - 80, {
          g: 120, drag: .975, size: rand(5, 10), life: rand(1.5, 2.5), vr: rand(-2, 2)
        }));
      }
    }

    function tap(x, y) {
      if (state.reduce) return;
      const types = ['heart', 'star', 'sparkle'];
      for (let i = 0; i < 5; i++) {
        const ang = rand(0, 6.283);
        const sp = rand(60, 150);
        spawn(base(pick(types), x, y, Math.cos(ang) * sp, Math.sin(ang) * sp - 50, {
          g: 90, drag: .96, size: rand(3.5, 6.5), life: rand(.7, 1.1), vr: rand(-3, 3)
        }));
      }
    }

    function rain(ms) {
      if (state.reduce) return;
      rainUntil = performance.now() + ms;
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    }

    function spawnRain() {
      spawn(base(Math.random() < .3 ? 'circle' : 'rect', rand(0, w), -12, rand(-30, 30), rand(90, 200), {
        g: 70, drag: .995, life: rand(5, 8), size: rand(6, 9)
      }));
    }

    function drawHeart(s) {
      ctx.beginPath();
      ctx.moveTo(0, s * .9);
      ctx.bezierCurveTo(-s * 1.2, s * .1, -s * .7, -s * .9, 0, -s * .3);
      ctx.bezierCurveTo(s * .7, -s * .9, s * 1.2, s * .1, 0, s * .9);
      ctx.fill();
    }
    function drawStar(s) {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? s * .45 : s;
        const a = -Math.PI / 2 + i * Math.PI / 5;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
    }
    function drawSparkle(s) {
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(0, 0, s, 0);
      ctx.quadraticCurveTo(0, 0, 0, s);
      ctx.quadraticCurveTo(0, 0, -s, 0);
      ctx.quadraticCurveTo(0, 0, 0, -s);
      ctx.fill();
    }

    function draw(p) {
      ctx.globalAlpha = Math.min(1, p.life / .5) * p.alpha;
      const c = Math.cos(p.rot), s = Math.sin(p.rot);
      ctx.setTransform(c * dpr, s * dpr, -s * dpr, c * dpr, p.x * dpr, p.y * dpr);
      ctx.fillStyle = p.color;
      switch (p.type) {
        case 'rect':
          ctx.scale(1, Math.cos(p.flip));
          ctx.fillRect(-p.size / 2, -p.size * .3, p.size, p.size * .6);
          break;
        case 'circle':
          ctx.beginPath(); ctx.arc(0, 0, p.size * .4, 0, 6.283); ctx.fill();
          break;
        case 'heart': drawHeart(p.size * .8); break;
        case 'star': drawStar(p.size); break;
        default: drawSparkle(p.size);
      }
    }

    function loop(now) {
      const dt = Math.min(.04, (now - last) / 1000);
      last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      if (now < rainUntil && parts.length < CONFIG.maxParticles * .7) {
        rainAcc += dt * 26;
        while (rainAcc >= 1) { rainAcc -= 1; spawnRain(); }
      }

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life -= dt;
        if (p.life <= 0 || p.y > h + 40) { parts.splice(i, 1); continue; }
        const d = Math.pow(p.drag, dt * 60);
        p.vx *= d;
        p.vy = p.vy * d + p.g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.flip += p.vf * dt;
        draw(p);
      }
      ctx.globalAlpha = 1;

      if (parts.length || now < rainUntil) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
      }
    }

    function center(el) {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    function clear() {
      parts.length = 0;
      rainUntil = 0;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    return {
      confetti, hearts, tap, rain, clear, center,
      stopRain() { rainUntil = 0; },
      confettiAt(el, n) { const c = center(el); confetti(c.x, c.y, n); },
      heartsAt(el, n) { const c = center(el); hearts(c.x, c.y, n); }
    };
  })();

  /* =======================================================
     5. MUSIK (satu elemen audio global)
     ======================================================= */
  const music = (() => {
    const el = $('#bgm');
    const btn = $('#musicBtn');
    const label = $('#musicLabel');
    let started = false;
    let muted = false;
    let available = true;
    let resumeAfterHide = false;

    const isOn = () => available && started && !muted && !el.paused;

    function render() {
      const on = isOn();
      const stateName = !available ? 'unavailable' : on ? 'on' : 'off';
      btn.dataset.state = stateName;
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', !available ? 'Music file has not been added yet' : on ? 'Mute music' : 'Play music');
      label.textContent = !available ? 'No music' : on ? 'Music on' : 'Music off';
    }

    function markUnavailable() { available = false; render(); }

    function start() {
      if (!available) return;
      el.volume = .55;
      el.muted = muted;
      const p = el.play();
      if (p && typeof p.then === 'function') {
        p.then(() => { started = true; render(); })
         .catch((err) => {
           if (err && err.name === 'NotSupportedError') markUnavailable();
           else render();
         });
      } else {
        started = true;
        render();
      }
    }

    function toggle() {
      if (!available) return;
      if (!started || el.paused) { muted = false; start(); return; }
      muted = !muted;
      el.muted = muted;
      render();
    }

    function reset() {
      el.pause();
      try { el.currentTime = 0; } catch (e) { /* belum dimuat, abaikan */ }
      started = false;
      muted = false;
      el.muted = false;
      render();
    }

    function init() {
      btn.addEventListener('click', toggle);
      el.addEventListener('error', () => { if (started || !el.paused) markUnavailable(); });
      // jeda otomatis saat tab/aplikasi disembunyikan (mis. pindah ke WhatsApp)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (!el.paused) { resumeAfterHide = true; el.pause(); }
        } else if (resumeAfterHide) {
          resumeAfterHide = false;
          el.play().catch(() => {});
        }
      });
      render();
    }

    return { init, start, reset };
  })();

  /* =======================================================
     6. ANIMASI GSAP (helper)
     GSAP dimuat dari CDN. Jika gagal, semua fungsi di bawah
     otomatis memakai fallback CSS tanpa error.
     ======================================================= */
  const hasGsap = () => typeof window.gsap !== 'undefined';
  const useGsap = () => hasGsap() && !state.reduce;
  const syncMotionClass = () => document.documentElement.classList.toggle('fx-css', !useGsap());

  const registry = SCENES.map(() => new Set());   // elemen yang disentuh GSAP per scene
  const timelines = SCENES.map(() => null);

  function loadGsap() {
    return new Promise((resolve) => {
      if (hasGsap()) { resolve(true); return; }
      let settled = false;
      const done = (ok) => { if (!settled) { settled = true; resolve(ok); } };
      const s = document.createElement('script');
      s.src = CONFIG.gsapUrl;
      s.async = true;
      s.onload = () => { syncMotionClass(); done(true); };
      s.onerror = () => done(false);
      document.head.appendChild(s);
      setTimeout(() => done(hasGsap()), CONFIG.gsapWaitMs);
    });
  }

  function reg(i, targets) {
    const list = targets instanceof Element ? [targets] : Array.from(targets || []);
    list.forEach((t) => { if (t) registry[i].add(t); });
    return list;
  }

  function killScene(i) {
    if (timelines[i]) { timelines[i].kill(); timelines[i] = null; }
    if (hasGsap() && registry[i].size) {
      const els = Array.from(registry[i]);
      window.gsap.killTweensOf(els);
      window.gsap.set(els, { clearProps: 'all' });
    }
    registry[i].clear();
  }

  function newTimeline(i, vars) {
    killScene(i);
    const tl = window.gsap.timeline(vars || {});
    timelines[i] = tl;
    return tl;
  }

  // tl.fromTo dengan pencatatan elemen + clearProps otomatis di akhir
  function add(i, tl, targets, from, to, pos) {
    const els = reg(i, targets);
    if (!els.length) return tl;
    tl.fromTo(els, from, Object.assign({ clearProps: 'all' }, to), pos);
    return tl;
  }

  /* pecah teks judul menjadi kata & huruf agar bisa dianimasikan */
  function splitChars(el) {
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', label);
    const chars = [];
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const word = document.createElement('span');
            word.className = 'word';
            word.setAttribute('aria-hidden', 'true');
            Array.from(part).forEach((ch) => {
              const c = document.createElement('span');
              c.className = 'char';
              c.textContent = ch;
              word.appendChild(c);
              chars.push(c);
            });
            frag.appendChild(word);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
    return chars;
  }

  /* =======================================================
     7. NAVIGASI
     ======================================================= */
  const dock = {
    prev: $('#prevBtn'),
    next: $('#nextBtn'),
    dots: [],
    build() {
      const labels = ['Welcome', 'Celebration', 'Gallery', 'Letter', 'Make a wish', 'Last surprise'];
      const ol = $('#dots');
      for (let i = 1; i <= LAST; i++) {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'dot';
        b.dataset.target = String(i);
        b.setAttribute('aria-label', `Go to ${labels[i - 1]} (${i} of ${LAST})`);
        li.appendChild(b);
        ol.appendChild(li);
        this.dots.push(b);
      }
    },
    update() {
      this.prev.disabled = state.current <= 1;
      this.next.disabled = state.current >= LAST;
      this.dots.forEach((b) => {
        if (Number(b.dataset.target) === state.current) b.setAttribute('aria-current', 'true');
        else b.removeAttribute('aria-current');
      });
    },
    nudge(on) { this.next.classList.toggle('is-nudging', Boolean(on) && state.current < LAST); }
  };

  /* Gambar baru diminta saat scene hampir dibuka (lazy loading) */
  function hydrate(i) {
    if (i < 0 || i > LAST) return;
    $$('img[data-src]', SCENES[i]).forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }

  const leaveHandlers = {};
  const enterHandlers = {};

  function goTo(next, opts = {}) {
    if (next < 0 || next > LAST) return;
    if (!opts.force && (state.busy || next === state.current)) return;

    const prev = state.current;
    state.busy = true;
    dock.nudge(false);

    if (leaveHandlers[prev]) leaveHandlers[prev]();
    // bersihkan sisa animasi scene lama setelah selesai memudar
    later(() => { if (state.current !== prev) killScene(prev); }, CONFIG.transitionMs + 50);

    state.current = next;
    document.body.dataset.scene = String(next);
    SCENES.forEach((s, idx) => s.classList.toggle('is-active', idx === next));
    SCENES[next].scrollTop = 0;

    hydrate(next);
    hydrate(next + 1);
    dock.update();
    if (enterHandlers[next]) enterHandlers[next]();

    const heading = $('[tabindex="-1"]', SCENES[next]);
    if (heading && next > 0) later(() => heading.focus({ preventScroll: true }), 250);
    later(() => { state.busy = false; }, CONFIG.transitionMs);
  }

  /* =======================================================
     8. SECTION 01 — INVITATION
     ======================================================= */
  const invite = {
    open() {
      if (state.opened) return;
      state.opened = true;
      $('#openInvite').disabled = true;
      document.body.classList.add('is-opened');
      music.start();          // dipanggil dari tap pengguna, jadi boleh memutar audio
      hydrate(2);

      const env = $('#envelope');
      const finish = () => goTo(1);

      if (!useGsap()) {
        env.classList.add('is-open');
        fx.heartsAt(env, 26);
        later(finish, 1100);
        return;
      }

      const flap = $('#envFlap'), card = $('#envCard'), seal = $('#envSeal');
      const glow = $('#glowBurst'), stage = $('#inviteStage'), btn = $('#openInvite');
      reg(0, [flap, card, seal, glow, stage, btn]);

      const tl = newTimeline(0, { onComplete: finish });
      reg(0, [flap, card, seal, glow, stage, btn]);
      tl.to(btn, { opacity: 0, y: 12, duration: .3, ease: 'power1.in' }, 0)
        .to(seal, { scale: 0, opacity: 0, duration: .3, ease: 'back.in(2)' }, 0)
        .to(flap, { rotationX: 180, transformPerspective: 700, duration: .75, ease: 'power2.inOut' }, .15)
        .set(flap, { zIndex: 1 }, .5)
        .to(card, { y: '-62%', duration: .7, ease: 'back.out(1.3)' }, .75)
        .fromTo(glow, { scale: .2, opacity: 0 }, { scale: 2.4, opacity: 1, duration: .7, ease: 'power2.out' }, .85)
        .add(() => { fx.heartsAt(card, 30); fx.confettiAt(card, 26); }, .95)
        .to(glow, { opacity: 0, duration: .5, ease: 'power1.out' }, 1.5)
        .to(stage, { scale: 1.45, opacity: 0, duration: .7, ease: 'power2.in' }, 1.5);
    },

    reset() {
      $('#openInvite').disabled = false;
      $('#envelope').classList.remove('is-open');
    },

    enter() {
      if (!useGsap() || !state.replaying) return;
      const tl = newTimeline(0);
      add(0, tl, $('#inviteStage'), { scale: .7, opacity: 0, y: 24 }, { scale: 1, opacity: 1, y: 0, duration: .9, ease: 'back.out(1.6)' }, .1);
      add(0, tl, $('#openInvite'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' }, .6);
    }
  };
  enterHandlers[0] = () => invite.enter();

  /* =======================================================
     9. SECTION 02 — WELCOME
     ======================================================= */
  enterHandlers[1] = () => {
    if (!useGsap()) return;
    const sc = SCENES[1];
    const tl = newTimeline(1);
    add(1, tl, split.welcome, { y: 50, rotation: 14, scale: .4, opacity: 0 },
      { y: 0, rotation: 0, scale: 1, opacity: 1, duration: .7, ease: 'back.out(2.2)', stagger: .035 }, .2);
    add(1, tl, $('.lede', sc), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: 'power2.out' }, '>-.15');
    add(1, tl, $('[data-go]', sc), { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .6, ease: 'back.out(2)' }, '>-.3');
    add(1, tl, $$('.secret-star', sc), { scale: 0, opacity: 0, rotation: -90 },
      { scale: 1, opacity: 1, rotation: 0, duration: .6, ease: 'back.out(2)', stagger: .2 }, 1.3);
    later(() => fx.hearts(window.innerWidth / 2, window.innerHeight * .32, 18), 650);
  };

  /* =======================================================
     10. SECTION 03 — BIRTHDAY
     ======================================================= */
  enterHandlers[2] = () => {
    later(() => fx.rain(CONFIG.rainMs), 500);
    if (!useGsap()) return;
    const sc = SCENES[2];
    const tl = newTimeline(2);
    add(2, tl, $$('.bunting i', sc), { y: -46, opacity: 0 },
      { y: 0, opacity: 1, duration: .6, ease: 'back.out(2)', stagger: .06 }, 0);
    add(2, tl, split.party, { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: .9, ease: 'elastic.out(1, .5)', stagger: .04 }, .25);
    add(2, tl, $('#partySub'), { opacity: 0, scale: .8 }, { opacity: 1, scale: 1, duration: .6, ease: 'back.out(2)' }, '>-.5');
    add(2, tl, $('#heroPhoto'), { rotation: -20, opacity: 0, y: -24, transformOrigin: '50% 0%' },
      { rotation: 0, opacity: 1, y: 0, duration: 1.3, ease: 'elastic.out(1, .45)' }, '>-.35');
    add(2, tl, $$('.balloon', sc), { y: 220, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.5, ease: 'power2.out', stagger: .15 }, .5);
    add(2, tl, $$('.secret-star', sc), { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: .6, ease: 'back.out(2)' }, 1.6);
  };
  leaveHandlers[2] = () => fx.stopRain();

  /* =======================================================
     11. SECTION 04 — GALLERY + LIGHTBOX
     ======================================================= */
  const gallery = {
    list: $('#gallery'),
    items: [],
    build() {
      const decos = ['tape', 'bow', 'star', 'tape', 'heart', 'bow'];
      CONTENT.photos.forEach((p, i) => {
        const file = p.src.split('/').pop();
        const li = document.createElement('li');
        li.className = 'polaroid-item';
        li.innerHTML =
          '<button type="button" class="polaroid">' +
            '<span class="polaroid__photo" data-photo-wrap>' +
              '<img data-photo decoding="async" loading="lazy">' +
              '<span class="photo-ph" aria-hidden="true">' +
                '<svg class="icon" aria-hidden="true"><use href="#i-heart"/></svg><b></b>' +
              '</span>' +
            '</span>' +
            '<span class="polaroid__caption"></span>' +
          '</button>';
        const btn = $('.polaroid', li);
        const img = $('img', li);
        img.dataset.src = p.src;
        img.alt = `Cita, photo ${i + 1}`;
        $('.photo-ph b', li).textContent = file;
        $('.polaroid__caption', li).textContent = p.caption;
        btn.setAttribute('aria-label', `Open photo ${i + 1}: ${p.caption}`);
        btn.dataset.index = String(i);

        const d = decos[i];
        if (d === 'tape') {
          btn.insertAdjacentHTML('beforeend', '<span class="polaroid__deco polaroid__deco--tape" aria-hidden="true"></span>');
        } else {
          const icon = { bow: 'i-bow', star: 'i-sparkle', heart: 'i-heart' }[d];
          btn.insertAdjacentHTML('beforeend',
            `<svg class="polaroid__deco polaroid__deco--${d} icon" aria-hidden="true"><use href="#${icon}"/></svg>`);
        }
        this.list.appendChild(li);
        this.items.push(li);
      });
    }
  };

  enterHandlers[3] = () => {
    later(() => dock.nudge(true), 3200);
    if (!useGsap()) return;
    const sc = SCENES[3];
    const tl = newTimeline(3);
    add(3, tl, [$('.title', sc), $('.sub', sc)], { opacity: 0, scale: .9 },
      { opacity: 1, scale: 1, duration: .6, ease: 'power2.out', stagger: .12 }, 0);
    add(3, tl, gallery.items, { y: -190, rotation: (i) => (i % 2 ? 24 : -24), opacity: 0, scale: 1.15 },
      { y: 0, rotation: 0, opacity: 1, scale: 1, duration: .95, ease: 'back.out(1.5)', stagger: .14 }, .3);
    add(3, tl, $$('.secret-star', sc), { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: .6, ease: 'back.out(2)' }, 1.6);
  };

  const lightbox = {
    el: $('#lightbox'),
    figure: $('#lbFigure'),
    img: $('#lbImg'),
    caption: $('#lbCaption'),
    count: $('#lbCount'),
    file: $('#lbFile'),
    index: 0,
    opener: null,

    open(i, opener) {
      this.opener = opener || document.activeElement;
      this.el.hidden = false;
      state.lightbox = true;
      this.show(i);
      $('#lbClose').focus();
    },
    show(i) {
      const total = CONTENT.photos.length;
      this.index = (i + total) % total;
      const photo = CONTENT.photos[this.index];
      const thumb = $('img', gallery.items[this.index]);
      const loaded = thumb.complete && thumb.naturalWidth > 0;
      this.figure.classList.remove('is-loaded');
      this.file.textContent = photo.src.split('/').pop();
      this.caption.textContent = photo.caption;
      this.count.textContent = `${this.index + 1} / ${total}`;
      if (loaded) {
        this.img.alt = thumb.alt;
        this.img.src = thumb.currentSrc || thumb.src;
        this.figure.classList.add('is-loaded');
      } else {
        this.img.removeAttribute('src');
        this.img.alt = '';
      }
    },
    close() {
      if (this.el.hidden) return;
      this.el.hidden = true;
      state.lightbox = false;
      if (this.opener && this.opener.focus) this.opener.focus({ preventScroll: true });
    },
    bind() {
      $('#lbClose').addEventListener('click', () => this.close());
      $('#lbPrev').addEventListener('click', () => this.show(this.index - 1));
      $('#lbNext').addEventListener('click', () => this.show(this.index + 1));
      this.el.addEventListener('click', (e) => { if (e.target === this.el) this.close(); });
      this.el.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { this.close(); return; }
        if (e.key === 'ArrowRight') { this.show(this.index + 1); return; }
        if (e.key === 'ArrowLeft') { this.show(this.index - 1); return; }
        if (e.key === 'Tab') {
          const f = $$('button', this.el).filter((b) => !b.disabled);
          const first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
      gallery.list.addEventListener('click', (e) => {
        const b = e.target.closest('.polaroid');
        if (b) this.open(Number(b.dataset.index), b);
      });
    }
  };

  /* Status foto: loaded / missing (tanpa gambar rusak) */
  function bindPhotoEvents() {
    const wrapOf = (img) => img.closest('[data-photo-wrap]');
    document.addEventListener('load', (e) => {
      const t = e.target;
      if (t instanceof HTMLImageElement && t.hasAttribute('data-photo')) {
        const w = wrapOf(t);
        if (w) { w.classList.add('is-loaded'); w.classList.remove('is-missing'); }
      }
    }, true);
    document.addEventListener('error', (e) => {
      const t = e.target;
      if (t instanceof HTMLImageElement && t.hasAttribute('data-photo')) {
        const w = wrapOf(t);
        if (w) { w.classList.add('is-missing'); w.classList.remove('is-loaded'); }
      }
    }, true);
  }

  /* =======================================================
     12. SECTION 05 — LETTER
     ======================================================= */
  const letter = {
    opened: false,
    done: false,
    typing: false,
    raf: 0,
    lines: [],
    li: 0, ci: 0, acc: 0, pauseUntil: 0, last: 0,

    build() {
      const body = $('#letterBody');
      body.textContent = '';
      this.lines = [];
      const mk = (cls, text) => {
        const p = document.createElement('p');
        p.className = cls;
        body.appendChild(p);
        this.lines.push({ el: p, chars: Array.from(text), full: text });
      };
      mk('paper__greeting', CONTENT.letter.greeting);
      CONTENT.letter.paragraphs.forEach((t) => mk('paper__p', t));
      mk('paper__signature', CONTENT.letter.signature);
    },

    open() {
      if (this.opened) return;
      this.opened = true;
      $('#openLetter').disabled = true;

      const mail = $('#mail'), stage = $('#letterStage'), paper = $('#paper');
      const reveal = () => {
        stage.hidden = true;
        paper.hidden = false;
        $('#paperHint').hidden = false;
        paper.focus({ preventScroll: true });
        if (useGsap()) {
          reg(4, paper);
          window.gsap.fromTo(paper,
            { y: 60, scale: .88, opacity: 0, transformOrigin: '50% 0%' },
            { y: 0, scale: 1, opacity: 1, duration: .7, ease: 'back.out(1.4)', clearProps: 'all' });
        }
        this.start();
      };

      if (!useGsap()) {
        mail.classList.add('is-open');
        later(reveal, 900);
        return;
      }

      const flap = $('#mailFlap'), card = $('#mailCard'), seal = $('#mailSeal'), btn = $('#openLetter');
      const tl = newTimeline(4, { onComplete: reveal });
      reg(4, [flap, card, seal, stage, btn]);
      tl.to(btn, { opacity: 0, y: 10, duration: .3 }, 0)
        .to(seal, { scale: 0, opacity: 0, duration: .25 }, 0)
        .to(flap, { rotationX: 180, transformPerspective: 700, duration: .7, ease: 'power2.inOut' }, .1)
        .set(flap, { zIndex: 1 }, .45)
        .to(card, { y: '-70%', duration: .6, ease: 'back.out(1.2)' }, .7)
        .add(() => fx.heartsAt(card, 14), .85)
        .to(stage, { y: 30, opacity: 0, scale: .92, duration: .45, ease: 'power2.in' }, 1.5);
    },

    start() {
      if (state.reduce) { this.finish(); return; }
      this.typing = true;
      this.li = 0; this.ci = 0; this.acc = 0; this.pauseUntil = 0;
      this.last = performance.now();
      this.lines[0].el.classList.add('is-typing');
      this.raf = requestAnimationFrame((t) => this.tick(t));
    },

    tick(now) {
      if (!this.typing) return;
      const dt = Math.min(.05, (now - this.last) / 1000);
      this.last = now;

      if (now >= this.pauseUntil) {
        this.acc += dt * CONFIG.typingCharsPerSecond;
        let n = Math.floor(this.acc);
        this.acc -= n;
        while (n > 0 && this.li < this.lines.length) {
          const line = this.lines[this.li];
          this.ci += 1;
          n -= 1;
          line.el.textContent = line.chars.slice(0, this.ci).join('');
          if (this.ci >= line.chars.length) {
            line.el.classList.remove('is-typing');
            this.li += 1;
            this.ci = 0;
            if (this.li < this.lines.length) this.lines[this.li].el.classList.add('is-typing');
            this.pauseUntil = now + 320;
            break;
          }
        }
        // jaga baris yang sedang diketik tetap terlihat
        const paper = $('#paper');
        paper.scrollTop = paper.scrollHeight;
      }

      if (this.li >= this.lines.length) this.finish();
      else this.raf = requestAnimationFrame((t) => this.tick(t));
    },

    finish() {
      if (this.done) return;
      cancelAnimationFrame(this.raf);
      this.typing = false;
      this.done = true;
      this.lines.forEach((l) => { l.el.textContent = l.full; l.el.classList.remove('is-typing'); });
      $('#paper').scrollTop = 0;
      $('#paperHint').hidden = true;
      dock.nudge(true);
    },

    reset() {
      cancelAnimationFrame(this.raf);
      this.opened = false; this.done = false; this.typing = false;
      $('#mail').classList.remove('is-open');
      $('#openLetter').disabled = false;
      $('#letterStage').hidden = false;
      $('#paper').hidden = true;
      $('#paperHint').hidden = true;
      this.build();
    }
  };

  enterHandlers[4] = () => {
    if (!useGsap()) return;
    const sc = SCENES[4];
    const tl = newTimeline(4);
    add(4, tl, $('.title', sc), { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: .6, ease: 'power2.out' }, 0);
    if (!letter.opened) {
      add(4, tl, $('#mail', sc), { scale: .5, rotation: -10, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 1.1, ease: 'elastic.out(1, .55)' }, .15);
      add(4, tl, $('#openLetter', sc), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' }, .7);
    }
  };
  // Jika pengunjung pergi saat surat masih diketik, tampilkan sisanya langsung
  leaveHandlers[4] = () => { if (letter.typing) letter.finish(); };

  /* =======================================================
     13. SECTION 06 — CAKE
     ======================================================= */
  const cake = {
    stage: 'idle',
    el: $('#cake'),
    candles: $$('.candle', $('#cake')),

    setStage(s) { this.stage = s; this.el.dataset.stage = s; },

    light() {
      if (this.stage !== 'idle') return;
      this.setStage('lit');
      this.candles.forEach((c, i) => {
        later(() => {
          c.classList.add('is-lit');
          c.setAttribute('tabindex', '0');
          const f = $('.flame', c);
          if (f) fx.heartsAt(f, 4);
        }, i * 260);
      });
      later(() => {
        $('#cakeAction').textContent = 'Tiup lilinnya';
        $('#cakeHint').classList.add('is-emph');
        const micOk = Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        $('#micBtn').hidden = !micOk;
      }, this.candles.length * 260);
    },

    extinguish(c) {
      if (!c.classList.contains('is-lit') || c.classList.contains('is-out')) return;
      c.classList.add('is-out');
      c.setAttribute('tabindex', '-1');
      fx.heartsAt(c, 5);
      if (this.candles.every((x) => x.classList.contains('is-out'))) later(() => this.finishWish(), 500);
    },

    blowAll() {
      if (this.stage !== 'lit') return;
      blow.stop();
      this.candles.forEach((c, i) => later(() => this.extinguish(c), i * 220));
    },

    finishWish() {
      if (this.stage === 'done') return;
      this.setStage('done');
      blow.stop();
      $('#cakeActions').hidden = true;
      $('#blowStatus').textContent = '';
      $('#wishGlow').classList.add('is-on');
      const msg = $('#wishMessage');
      msg.textContent = CONTENT.wishDone;
      msg.classList.add('is-visible');
      fx.confettiAt($('#cakeWrap'), 70);
      later(() => fx.heartsAt($('#cakeWrap'), 26), 350);
      later(() => fx.confettiAt($('#cakeWrap'), 40), 900);
      dock.nudge(true);
    },

    reset() {
      this.setStage('idle');
      this.candles.forEach((c) => {
        c.classList.remove('is-lit', 'is-out');
        c.setAttribute('tabindex', '-1');
      });
      $('#cakeAction').textContent = 'Light the candles';
      $('#cakeHint').classList.remove('is-emph');
      $('#micBtn').hidden = true;
      $('#cakeActions').hidden = false;
      $('#wishGlow').classList.remove('is-on');
      const msg = $('#wishMessage');
      msg.textContent = '';
      msg.classList.remove('is-visible');
      $('#blowStatus').textContent = '';
    }
  };

  /* Deteksi tiupan lewat mikrofon: hanya aktif setelah tombol ditekan */
  const blow = {
    stream: null, ctx: null, analyser: null, data: null, raf: 0, hot: 0, active: false,

    async start() {
      if (this.active || cake.stage !== 'lit') return;
      const status = $('#blowStatus');
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !AC) {
        status.textContent = 'Microphone is not available here. Please use the button instead.';
        return;
      }
      try {
        status.textContent = 'Listening… blow gently toward your phone.';
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
        });
        this.ctx = new AC();
        const src = this.ctx.createMediaStreamSource(this.stream);
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 512;
        src.connect(this.analyser);
        this.data = new Uint8Array(this.analyser.fftSize);
        this.active = true;
        this.hot = 0;
        this.raf = requestAnimationFrame(() => this.listen());
      } catch (err) {
        this.stop();
        status.textContent = 'Microphone access was not allowed. You can use the button instead.';
      }
    },

    listen() {
      if (!this.active) return;
      this.analyser.getByteTimeDomainData(this.data);
      let sum = 0;
      for (let i = 0; i < this.data.length; i++) {
        const v = (this.data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / this.data.length);
      this.hot = rms > .16 ? this.hot + 1 : Math.max(0, this.hot - 2);
      if (this.hot >= 9) { cake.blowAll(); return; }
      this.raf = requestAnimationFrame(() => this.listen());
    },

    stop() {
      this.active = false;
      cancelAnimationFrame(this.raf);
      if (this.stream) { this.stream.getTracks().forEach((t) => t.stop()); this.stream = null; }
      if (this.ctx) { this.ctx.close().catch(() => {}); this.ctx = null; }
    }
  };

  enterHandlers[5] = () => {
    if (!useGsap()) return;
    const sc = SCENES[5];
    const tl = newTimeline(5);
    add(5, tl, [$('.title', sc), $('#cakeHint')], { opacity: 0, y: -14 },
      { opacity: 1, y: 0, duration: .6, ease: 'power2.out', stagger: .12 }, 0);
    add(5, tl, $('#cakeWrap'), { y: 80, scale: .7, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.5)' }, .2);
    add(5, tl, $('#cakeActions'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' }, .9);
    add(5, tl, $$('.secret-star', sc), { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: .6, ease: 'back.out(2)' }, 1.4);
  };
  leaveHandlers[5] = () => blow.stop();

  /* =======================================================
     14. SECTION 07 — GIFT & FINALE
     ======================================================= */
  const gift = {
    opened: false,

    buildFinale() {
      const box = $('#finaleText');
      box.textContent = '';
      CONTENT.finale.paragraphs.forEach((t) => {
        const p = document.createElement('p');
        p.textContent = t;
        box.appendChild(p);
      });
      const h = document.createElement('p');
      h.className = 'finale__highlight';
      h.textContent = CONTENT.finale.highlight;
      box.appendChild(h);
      const s = document.createElement('p');
      s.className = 'finale__signature';
      s.style.whiteSpace = 'pre-line';
      s.textContent = CONTENT.finale.signature;
      box.appendChild(s);
    },

    open() {
      if (this.opened) return;
      this.opened = true;
      const btn = $('#gift');
      btn.classList.add('is-open');
      btn.setAttribute('aria-label', 'Gift opened');
      $('#giftStage').classList.add('is-open');
      $('#giftHint').textContent = '';

      later(() => fx.heartsAt(btn, 46), 250);
      later(() => fx.confettiAt(btn, 50), 500);
      later(() => this.showFinale(), 1500);
    },

    showFinale() {
      const finale = $('#finale');
      const card = $('#finaleCard');
      finale.classList.add('is-visible');
      finale.setAttribute('aria-hidden', 'false');
      if (useGsap()) {
        reg(6, card);
        window.gsap.fromTo(card, { y: 50, scale: .88, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: .8, ease: 'back.out(1.5)', clearProps: 'all' });
      }
      later(() => card.focus({ preventScroll: true }), 300);
      later(() => fx.heartsAt(card, 24), 400);
    },

    reset() {
      this.opened = false;
      const btn = $('#gift');
      btn.classList.remove('is-open');
      btn.setAttribute('aria-label', 'Open the gift');
      $('#giftStage').classList.remove('is-open');
      $('#giftHint').textContent = 'Tap the gift to open it.';
      const finale = $('#finale');
      finale.classList.remove('is-visible');
      finale.setAttribute('aria-hidden', 'true');
    }
  };

  enterHandlers[6] = () => {
    if (!useGsap()) return;
    const sc = SCENES[6];
    const tl = newTimeline(6);
    add(6, tl, [$('.title', sc), $('#giftHint')], { opacity: 0, y: -14 },
      { opacity: 1, y: 0, duration: .6, ease: 'power2.out', stagger: .12 }, 0);
    add(6, tl, $('#giftStage'), { y: -240, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'bounce.out' }, .2);
    add(6, tl, $$('.secret-star', sc), { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: .6, ease: 'back.out(2)' }, 1.4);
  };

  /* =======================================================
     15. BINTANG RAHASIA & TOAST
     ======================================================= */
  const toast = {
    el: $('#toast'),
    t: 0,
    show(msg) {
      this.el.textContent = msg;
      this.el.classList.remove('is-on');
      void this.el.offsetWidth;
      this.el.classList.add('is-on');
      clearTimeout(this.t);
      this.t = setTimeout(() => this.el.classList.remove('is-on'), 3600);
    },
    hide() { clearTimeout(this.t); this.el.classList.remove('is-on'); }
  };

  function revealSecret(star) {
    const msg = CONTENT.secretWishes[state.wishIndex % CONTENT.secretWishes.length];
    state.wishIndex += 1;
    star.classList.add('is-found');
    toast.show(msg);
    fx.heartsAt(star, 14);
  }

  /* =======================================================
     16. REPLAY (tanpa menumpuk musik / listener)
     ======================================================= */
  function replay() {
    if (state.busy) return;
    state.replaying = true;
    goTo(0, { force: true });
    // Reset isi setiap section setelah scene terakhir selesai memudar
    later(() => {
      fx.clear();
      toast.hide();
      blow.stop();
      lightbox.close();
      music.reset();
      invite.reset();
      letter.reset();
      cake.reset();
      gift.reset();
      SCENES.forEach((_, i) => killScene(i));
      state.opened = false;
      state.wishIndex = 0;
      document.body.classList.remove('is-opened');
      $$('.secret-star').forEach((s) => s.classList.remove('is-found'));
      SCENES[0].scrollTop = 0;
      state.replaying = false;
      invite.enter();
    }, CONFIG.transitionMs + 100);
  }

  /* =======================================================
     17. INIT (semua listener dipasang sekali di sini)
     ======================================================= */
  function bindEvents() {
    $('#openInvite').addEventListener('click', () => invite.open());
    $('#openLetter').addEventListener('click', () => letter.open());
    $('#paper').addEventListener('click', () => { if (letter.typing) letter.finish(); });
    $('#gift').addEventListener('click', () => gift.open());
    $('#replayBtn').addEventListener('click', replay);

    // tombol dengan data-go="n" pindah ke section n
    document.addEventListener('click', (e) => {
      const go = e.target.closest('[data-go]');
      if (go) goTo(Number(go.dataset.go));
    });

    // dock
    dock.prev.addEventListener('click', () => goTo(state.current - 1));
    dock.next.addEventListener('click', () => goTo(state.current + 1));
    $('#dots').addEventListener('click', (e) => {
      const b = e.target.closest('.dot');
      if (b) goTo(Number(b.dataset.target));
    });

    // kue
    $('#cakeAction').addEventListener('click', () => {
      if (cake.stage === 'idle') cake.light();
      else if (cake.stage === 'lit') cake.blowAll();
    });
    $('#micBtn').addEventListener('click', () => blow.start());
    const cakeSvg = $('#cake');
    cakeSvg.addEventListener('click', (e) => {
      const c = e.target.closest('.candle');
      if (c && cake.stage === 'lit') cake.extinguish(c);
    });
    cakeSvg.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const c = e.target.closest && e.target.closest('.candle');
      if (c && cake.stage === 'lit') { e.preventDefault(); cake.extinguish(c); }
    });

    // bintang rahasia
    document.addEventListener('click', (e) => {
      const star = e.target.closest('.secret-star');
      if (star) revealSecret(star);
    });

    // keyboard: panah kiri/kanan untuk berpindah section
    document.addEventListener('keydown', (e) => {
      if (state.lightbox || !state.opened) return;
      if (e.key === 'ArrowRight') goTo(state.current + 1);
      else if (e.key === 'ArrowLeft' && state.current > 1) goTo(state.current - 1);
    });

    // efek sentuhan (dibatasi oleh jumlah partikel maksimum)
    let lastTap = 0;
    document.addEventListener('pointerdown', (e) => {
      if (state.reduce || state.lightbox) return;
      const now = performance.now();
      if (now - lastTap < 90) return;
      lastTap = now;
      fx.tap(e.clientX, e.clientY);
    }, { passive: true });

    // preferensi animasi bisa berubah saat halaman terbuka
    const onMotionChange = () => { state.reduce = motionQuery.matches; syncMotionClass(); };
    if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMotionChange);
    else if (motionQuery.addListener) motionQuery.addListener(onMotionChange);
  }

  function hideLoader() {
    const loader = $('#loader');
    loader.classList.add('is-hidden');
    later(() => loader.remove(), 800);
  }

  function init() {
    syncMotionClass();
    buildSky();
    dock.build();
    gallery.build();
    letter.build();
    gift.buildFinale();

    split.welcome = splitChars($('#welcome-title'));
    split.party = splitChars($('#party-title'));

    bindPhotoEvents();
    lightbox.bind();
    music.init();
    bindEvents();
    dock.update();

    // foto yang sudah gagal dimuat sebelum listener terpasang
    $$('img[data-photo]').forEach((img) => {
      if (img.complete && img.src && img.naturalWidth === 0) {
        const w = img.closest('[data-photo-wrap]');
        if (w) w.classList.add('is-missing');
      }
    });

    // tampilkan halaman setelah font siap (maksimal 1,2 detik)
    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1200))]).then(hideLoader);

    // GSAP dimuat di belakang layar; situs tetap berfungsi tanpanya
    loadGsap().then(syncMotionClass);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
