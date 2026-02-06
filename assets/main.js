(() => {
  'use strict';

  // ---------- Small helpers ----------
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const fmt = new Intl.NumberFormat();

  function clampInt(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    const v = Math.trunc(n);
    return Math.min(max, Math.max(min, v));
  }

  function toast(title, body) {
    const t = qs('#toast');
    const tt = qs('#toastTitle');
    const tb = qs('#toastBody');
    if (!t || !tt || !tb) return;

    tt.textContent = title;
    tb.textContent = body;

    t.classList.add('is-visible');
    window.clearTimeout(toast._timer);
    toast._timer = window.setTimeout(() => t.classList.remove('is-visible'), 2600);
  }

  // ---------- Year ----------
  const yearEl = qs('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------- Scroll progress ----------
  const scrollBar = qs('#scrollBar');
  const onScroll = () => {
    if (!scrollBar) return;
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
    scrollBar.style.width = `${pct.toFixed(2)}%`;
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Mobile menu ----------
  const menuBtn = qs('#menuBtn');
  const mobileNav = qs('#mobileNav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });

    mobileNav.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      mobileNav.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  }

  // ---------- Reveal animation ----------
  const revealEls = qsa('.reveal');
  if (!prefersReduced && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // ---------- Cursor glow (subtle luxury microinteraction) ----------
  const cursorGlow = qs('#cursorGlow');
  if (cursorGlow && !prefersReduced) {
    let x = -999, y = -999, tx = -999, ty = -999;
    const lerp = (a, b, t) => a + (b - a) * t;

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      tx = e.clientX;
      ty = e.clientY;
      if (x < 0) { x = tx; y = ty; }
    }, { passive: true });

    function tick() {
      x = lerp(x, tx, 0.12);
      y = lerp(y, ty, 0.12);
      cursorGlow.style.left = `${x}px`;
      cursorGlow.style.top = `${y}px`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------- Magnetic buttons ----------
  if (!prefersReduced) {
    qsa('.btn').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.transform = `translate(${dx * 6}px, ${dy * 6}px)`;
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // ---------- Celebration (emoji confetti) ----------
  function ensureCelebrateLayer(host) {
    if (!host) return null;
    let layer = qs('.celebrate-layer', host);
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'celebrate-layer';
      layer.setAttribute('aria-hidden', 'true');
      host.appendChild(layer);
    }
    return layer;
  }

  function celebrator(host, anchorEl) {
    const layer = ensureCelebrateLayer(host);
    if (!layer || !anchorEl) return () => {};
    let last = 0;

    return () => {
      const now = Date.now();
      if (now - last < 420) return;
      last = now;

      if (prefersReduced) {
        const original = anchorEl.textContent;
        anchorEl.textContent = `${original} 🎉`;
        setTimeout(() => { anchorEl.textContent = original; }, 450);
        return;
      }

      const emojis = ['🎉', '✨', '💚', '🖤', '🧵', '🪡'];
      const hostRect = host.getBoundingClientRect();
      const aRect = anchorEl.getBoundingClientRect();
      const ox = aRect.left - hostRect.left + aRect.width / 2;
      const oy = aRect.top - hostRect.top + aRect.height / 2;

      layer.innerHTML = '';
      const pieces = 16;

      for (let i = 0; i < pieces; i++) {
        const s = document.createElement('span');
        s.className = 'celebrate-pop';
        s.textContent = emojis[Math.floor(Math.random() * emojis.length)];

        s.style.setProperty('--x', `${ox}px`);
        s.style.setProperty('--y', `${oy}px`);
        s.style.setProperty('--dx', `${(Math.random() * 220 - 110).toFixed(1)}px`);
        s.style.setProperty('--dy', `${(-(Math.random() * 160 + 80)).toFixed(1)}px`);
        s.style.setProperty('--rot', `${(Math.random() * 360 - 180).toFixed(0)}deg`);
        s.style.setProperty('--dur', `${(Math.random() * 450 + 780).toFixed(0)}ms`);
        s.style.setProperty('--delay', `${(Math.random() * 120).toFixed(0)}ms`);

        layer.appendChild(s);
      }

      setTimeout(() => { layer.innerHTML = ''; }, 1400);
    };
  }

  // ---------- Benchmark in hero panel ----------
  const benchmarkEl = qs('#benchmarkOutfits');
  if (benchmarkEl) benchmarkEl.textContent = fmt.format(6 * 4 * 3);

  // ---------- Capsule calculator ----------
  function capsuleLevel(score) {
    if (score >= 200) return 'ICONIC';
    if (score >= 100) return 'SIGNATURE';
    if (score >= 60) return 'CURATED';
    if (score >= 30) return 'STARTER';
    return 'BASELINE';
  }

  function setupCapsule() {
    const topsEl = qs('#capsuleTops');
    const bottomsEl = qs('#capsuleBottoms');
    const layersEl = qs('#capsuleLayers');
    const includeEl = qs('#capsuleIncludeLayers');
    const goalEl = qs('#capsuleGoal');

    const outEl = qs('#capsuleOutfits');
    const levelEl = qs('#capsuleLevel');
    const progEl = qs('#capsuleProgress');
    const goalProgEl = qs('#capsuleGoalProgress');
    const itemsEl = qs('#capsuleItemsUsed');
    const shareBtn = qs('#capsuleShare');

    if (!topsEl || !bottomsEl || !layersEl || !includeEl || !goalEl) return;

    const resultCard = outEl ? outEl.closest('.card') : null;
    const celebrate = resultCard && outEl ? celebrator(resultCard, outEl) : () => {};

    let touched = false;

    const update = () => {
      const tops = clampInt(topsEl.value, 1, 30, 1);
      const bottoms = clampInt(bottomsEl.value, 1, 30, 1);
      const layers = clampInt(layersEl.value, 0, 20, 0);
      const include = (includeEl.value || 'yes') === 'yes';
      const goal = clampInt(goalEl.value, 10, 1000, 60);

      const layerFactor = include ? (layers > 0 ? layers : 1) : 1;
      const combos = tops * bottoms * layerFactor;
      const itemsUsed = tops + bottoms + (include ? layers : 0);

      if (outEl) outEl.textContent = fmt.format(combos);
      const lvl = capsuleLevel(combos);
      if (levelEl) levelEl.textContent = lvl;

      const pct = Math.min(100, (combos / goal) * 100);
      if (progEl) progEl.style.width = `${pct.toFixed(1)}%`;
      if (goalProgEl) goalProgEl.textContent = `${Math.min(100, pct).toFixed(0)}%`;
      if (itemsEl) itemsEl.textContent = fmt.format(itemsUsed);

      if (touched) celebrate();
    };

    [topsEl, bottomsEl, layersEl, includeEl, goalEl].forEach(el => {
      el.addEventListener('input', () => { touched = true; update(); });
      el.addEventListener('change', () => { touched = true; update(); });
    });

    if (shareBtn) {
      shareBtn.addEventListener('click', async () => {
        const tops = clampInt(topsEl.value, 1, 30, 1);
        const bottoms = clampInt(bottomsEl.value, 1, 30, 1);
        const layers = clampInt(layersEl.value, 0, 20, 0);
        const include = (includeEl.value || 'yes') === 'yes';
        const layerFactor = include ? (layers > 0 ? layers : 1) : 1;
        const combos = tops * bottoms * layerFactor;

        const text = `APARERI Capsule Score: ${combos} looks (tops:${tops}, bottoms:${bottoms}${include ? `, layers:${layers}` : ''}).`;
        try {
          await navigator.clipboard.writeText(text);
          toast('Copied', 'Your capsule score was copied to clipboard.');
          const outEl = qs('#capsuleOutfits');
          if (outEl) celebrator(outEl.closest('.card'), outEl)();
        } catch {
          toast('Copy failed', 'Your browser blocked clipboard access.');
        }
      });
    }

    update();
  }

  // ---------- Multiwear calculator ----------
function multiwearLevel(score) {
  if (score >= 14) return 'ICONIC';
  if (score >= 12) return 'ELITE';
  if (score >= 10) return 'CURATED';
  if (score >= 8) return 'STRONG';
  if (score >= 6) return 'STARTER';
  return 'BASELINE';
}

function setupMultiwear() {
  const pieceEl = qs('#mwPiece');
  const slitEl = qs('#mwSlitOptions');
  const goalEl = qs('#mwGoal');

  const totalEl = qs('#mwTotalLooks');
  const levelEl = qs('#mwLevel');
  const progEl = qs('#mwProgress');
  const goalProgEl = qs('#mwGoalProgress');

  const dressCountEl = qs('#mwDressLooks');
  const setCountEl = qs('#mwSetLooks');
  const skirtCountEl = qs('#mwSkirtLooks');
  const scarfCountEl = qs('#mwScarfLooks');

  const dressListEl = qs('#mwDressList');
  const setListEl = qs('#mwSetList');
  const skirtListEl = qs('#mwSkirtList');
  const scarfListEl = qs('#mwScarfList');

  const noSlitEl = qs('#mwNoSlitLooks');
  const slitCountEl = qs('#mwSlitLooks');

  const shareBtn = qs('#mwShare');
  const toggleBtns = qsa('[data-mw-toggle]');

  if (!pieceEl || !slitEl || !totalEl) return;

  // Silhouette-first data model (scales to other products later)
  const PRODUCTS = {
    'modular-dress': {
      label: 'Modular Dress — Hera 001',
      silhouettes: {
        dress: [
          'Maxi dress',
          'Midi dress',
          'Knee-length dress',
          'Mini dress'
        ],
        set: [
          'Maxi skirt + top',
          'Midi skirt + top',
          'Knee-length skirt + top',
          'Mini skirt + top'
        ],
        skirt: [
          'Maxi skirt',
          'Midi skirt',
          'Knee-length skirt',
          'Mini skirt'
        ],
        scarf: [
          'Scarf (neck)',
          'Scarf (waist)'
        ]
      },
      defaultSlit: 4
    }
  };

  const state = { dress: true, set: true, skirt: true, scarf: true };

  const resultCard = totalEl.closest('.card');
  const celebrate = resultCard ? celebrator(resultCard, totalEl) : () => {};
  let touched = false;

  function getProduct() {
    return PRODUCTS[pieceEl.value] || PRODUCTS['modular-dress'];
  }

  function setTags(container, items) {
    if (!container) return;
    container.innerHTML = '';
    items.forEach((label) => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = label;
      container.appendChild(span);
    });
  }

  function update() {
    const product = getProduct();
    const slitSettings = clampInt(slitEl.value, 1, 12, product.defaultSlit || 4);
    const goal = goalEl ? clampInt(goalEl.value, 1, 1000, 14) : 14;

    const dressItems = state.dress ? product.silhouettes.dress : [];
    const setItems = state.set ? product.silhouettes.set : [];
    const skirtItems = state.skirt ? product.silhouettes.skirt : [];
    const scarfItems = state.scarf ? product.silhouettes.scarf : [];

    const dressCount = dressItems.length;
    const setCount = setItems.length;
    const skirtCount = skirtItems.length;
    const scarfCount = scarfItems.length;

    // Core silhouette ways (THIS is the “14”)
    const totalWays = dressCount + setCount + skirtCount + scarfCount;

    totalEl.textContent = fmt.format(totalWays);
    if (levelEl) levelEl.textContent = multiwearLevel(totalWays);

    // Counts
    if (dressCountEl) dressCountEl.textContent = fmt.format(dressCount);
    if (setCountEl) setCountEl.textContent = fmt.format(setCount);
    if (skirtCountEl) skirtCountEl.textContent = fmt.format(skirtCount);
    if (scarfCountEl) scarfCountEl.textContent = fmt.format(scarfCount);

    // Lists (silhouette breakdown)
    setTags(dressListEl, dressItems);
    setTags(setListEl, setItems);
    setTags(skirtListEl, skirtItems);
    setTags(scarfListEl, scarfItems);

    // Detail: slit vs no-slit “versions” for garment silhouettes only (dress/set/skirt)
    const garmentSilhouettes = dressCount + setCount + skirtCount;
    const noSlit = garmentSilhouettes; // 1 no-slit option per garment silhouette
    const slit = garmentSilhouettes * Math.max(0, slitSettings - 1); // remaining slit positions

    if (noSlitEl) noSlitEl.textContent = fmt.format(noSlit);
    if (slitCountEl) slitCountEl.textContent = fmt.format(slit);

    // Progress is based on the core silhouette ways
    const pct = Math.min(100, (totalWays / goal) * 100);
    if (progEl) progEl.style.width = `${pct.toFixed(1)}%`;
    if (goalProgEl) goalProgEl.textContent = `${Math.min(100, pct).toFixed(0)}%`;

    if (touched) celebrate();
  }

  // Mode toggles (optional, but keeps interactivity)
  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-mw-toggle');
      if (!key || !(key in state)) return;

      const next = !state[key];

      // Don’t allow turning everything off (prevents “0 ways” confusion)
      const activeAfter = Object.keys(state).filter(k => (k === key ? next : state[k])).length;
      if (activeAfter === 0) {
        toast('Select at least one', 'Keep one mode enabled to calculate.');
        return;
      }

      state[key] = next;
      btn.classList.toggle('is-active', next);
      btn.setAttribute('aria-pressed', String(next));

      touched = true;
      update();
    });
  });

  // Inputs
  pieceEl.addEventListener('change', () => { touched = true; update(); });
  slitEl.addEventListener('input', () => { touched = true; update(); });
  slitEl.addEventListener('change', () => { touched = true; update(); });
  if (goalEl) goalEl.addEventListener('change', () => { touched = true; update(); });

  // Share
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const product = getProduct();
      const slitSettings = clampInt(slitEl.value, 1, 12, product.defaultSlit || 4);

      const dressItems = state.dress ? product.silhouettes.dress : [];
      const setItems = state.set ? product.silhouettes.set : [];
      const skirtItems = state.skirt ? product.silhouettes.skirt : [];
      const scarfItems = state.scarf ? product.silhouettes.scarf : [];

      const totalWays = dressItems.length + setItems.length + skirtItems.length + scarfItems.length;
      const garmentSilhouettes = dressItems.length + setItems.length + skirtItems.length;
      const noSlit = garmentSilhouettes;
      const slit = garmentSilhouettes * Math.max(0, slitSettings - 1);

      const text =
        `APARERI ${product.label}: ${totalWays} core ways.\n` +
        `Dress: ${dressItems.join(', ') || '—'}\n` +
        `Skirt+top: ${setItems.join(', ') || '—'}\n` +
        `Skirt-only: ${skirtItems.join(', ') || '—'}\n` +
        `Scarf: ${scarfItems.join(', ') || '—'}\n` +
        `Detail: slit settings=${slitSettings} → no-slit versions=${noSlit}, slit versions=${slit}.`;

      try {
        await navigator.clipboard.writeText(text);
        toast('Copied', 'Your silhouette breakdown was copied to clipboard.');
        celebrator(totalEl.closest('.card'), totalEl)();
      } catch {
        toast('Copy failed', 'Your browser blocked clipboard access.');
      }
    });
  }

  update();
}

  // ---------- Studio board (beta) ----------
  function readProducts() {
    return qsa('#collection [data-product]').map((el) => {
      const title = qs('h3', el)?.textContent?.trim() || 'Item';
      const badge = qs('.product__title span', el)?.textContent?.trim() || '';
      const tags = qsa('.tag', el).map(t => t.textContent.trim()).filter(Boolean);
      const key = el.getAttribute('data-product') || title.toLowerCase().replace(/\s+/g, '-');
      return { key, title, badge, tags };
    });
  }

  function buildBoardThumb({ title, mode, length, slit, accent }) {
    const a = accent === 'mono'
      ? 'rgba(255,255,255,0.10)'
      : accent === 'pastel'
        ? 'rgba(215,203,255,0.12)'
        : 'rgba(11,107,79,0.14)';

    return {
      bg: `radial-gradient(520px 240px at 10% 10%, ${a}, transparent 60%), radial-gradient(520px 240px at 90% 70%, rgba(255,255,255,0.06), transparent 60%), rgba(0,0,0,0.10)`,
      label: `${mode} • ${length} • ${slit}`
    };
  }

  function setupStudio() {
    const baseEl = qs('#studioBase');
    const modeEl = qs('#studioMode');
    const lengthEl = qs('#studioLength');
    const slitEl = qs('#studioSlit');
    const accentEl = qs('#studioAccent');

    const pinBtn = qs('#studioPin');
    const randomBtn = qs('#studioRandom');

    const boardEl = qs('#studioBoard');
    const clearBtn = qs('#studioClear');
    const copyBtn = qs('#studioCopy');
    const countEl = qs('#studioCount');

    if (!baseEl || !modeEl || !lengthEl || !slitEl || !accentEl || !pinBtn || !boardEl) return;

    const STORAGE_KEY = 'apareri_board_v1';
    let products = readProducts();
    if (!products.length) return;

    baseEl.innerHTML = products.map(p => `<option value="${p.key}">${p.title}</option>`).join('');

    let board = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      board = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(board)) board = [];
    } catch { board = []; }

    const boardCard = boardEl.closest('.card');
    const celebrate = boardCard ? celebrator(boardCard, countEl || boardEl) : () => {};

    function save() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(board)); } catch {}
      if (countEl) countEl.textContent = `${board.length} pinned`;
    }

    function render() {
      boardEl.innerHTML = '';
      if (!board.length) {
        boardEl.innerHTML = `<p class="small" style="color: rgba(255,255,255,0.70); margin: 0;">No pinned looks yet.</p>`;
        save();
        return;
      }

      board.forEach((item, idx) => {
        const prod = products.find(p => p.key === item.base) || { title: 'Look' };
        const thumb = buildBoardThumb({ title: prod.title, mode: item.mode, length: item.length, slit: item.slit, accent: item.accent });

        const div = document.createElement('div');
        div.className = 'board-item';
        div.setAttribute('role', 'listitem');

        div.innerHTML = `
          <div class="board-thumb" style="background:${thumb.bg}">
            <div class="board-title">${prod.title}</div>
          </div>
          <div class="board-body">
            <small>${thumb.label}</small>
            <button class="board-x" type="button" aria-label="Remove">×</button>
          </div>
        `;

        qs('.board-x', div).addEventListener('click', () => {
          board.splice(idx, 1);
          save();
          render();
        });

        boardEl.appendChild(div);
      });

      save();
    }

    function pinCurrent() {
      const item = {
        base: baseEl.value,
        mode: modeEl.value,
        length: lengthEl.value,
        slit: slitEl.value,
        accent: accentEl.value,
        ts: Date.now()
      };

      board.unshift(item);
      if (board.length > 20) board = board.slice(0, 20);
      save();
      render();
      celebrate();
    }

    function randomize() {
      const lengths = ['maxi','midi','knee','mini'];
      const slits = ['none','low','mid','high'];
      const accents = ['emerald','pastel','mono'];
      modeEl.value = Math.random() > 0.5 ? 'dress' : 'skirt';
      lengthEl.value = lengths[Math.floor(Math.random()*lengths.length)];
      slitEl.value = slits[Math.floor(Math.random()*slits.length)];
      accentEl.value = accents[Math.floor(Math.random()*accents.length)];
      toast('Randomized', 'A new look suggestion is ready. Pin it if you like it.');
    }

    pinBtn.addEventListener('click', pinCurrent);
    randomBtn?.addEventListener('click', randomize);

    clearBtn?.addEventListener('click', () => {
      board = [];
      save();
      render();
      toast('Cleared', 'Your board was cleared.');
    });

    copyBtn?.addEventListener('click', async () => {
      const summary = board.slice(0, 10).map((item, i) => {
        const prod = products.find(p => p.key === item.base) || { title: 'Item' };
        return `${i+1}. ${prod.title} — ${item.mode}/${item.length}/${item.slit}/${item.accent}`;
      }).join('\n');

      const text = summary ? `APARERI board (top ${Math.min(10, board.length)}):\n${summary}` : 'APARERI board is empty.';
      try {
        await navigator.clipboard.writeText(text);
        toast('Copied', 'Your board summary was copied to clipboard.');
        celebrate();
      } catch {
        toast('Copy failed', 'Your browser blocked clipboard access.');
      }
    });

    render();
  }

  // ---------- Ledger + passport modal ----------
  const ledgerEl = qs('#ledger');
  const passportModal = qs('#passportModal');
  const passportBody = qs('#passportBody');

  const ledgerItems = [
    {
      name: 'Outer fabric — sample lot',
      traceId: 'AP-OF-001',
      category: 'Bio-based',
      origin: 'Region / farm (TBD)',
      mill: 'Spinning / weaving partner (TBD)',
      finish: 'Low-impact dye (TBD)',
      notes: 'Plastic-free fiber goal; confirm composition after lab tests.'
    },
    {
      name: 'Thread & reinforcements',
      traceId: 'AP-TR-001',
      category: 'Certified',
      origin: 'Supplier (TBD)',
      mill: 'N/A',
      finish: 'N/A',
      notes: 'Selected for strength at stress points; repair-friendly.'
    },
    {
      name: 'Hardware (adjustable slit + length)',
      traceId: 'AP-HW-001',
      category: 'Recycled',
      origin: 'Metal source (TBD)',
      mill: 'Hardware partner (TBD)',
      finish: 'Nickel-free finish (goal)',
      notes: 'Designed for serviceability and replacement.'
    },
  ];

  function renderLedger(filter = 'All') {
    if (!ledgerEl) return;
    const items = filter === 'All' ? ledgerItems : ledgerItems.filter(i => i.category === filter);

    ledgerEl.innerHTML = items.map((it) => `
      <div class="ledger-item">
        <h3>${it.name}</h3>
        <div class="ledger-meta">
          <div class="meta-row"><span>Trace ID</span><b class="mono">${it.traceId}</b></div>
          <div class="meta-row"><span>Origin</span><b>${it.origin}</b></div>
          <div class="meta-row"><span>Mill</span><b>${it.mill}</b></div>
          <div class="meta-row"><span>Finish</span><b>${it.finish}</b></div>
        </div>
        <div class="ledger-tags">
          <span class="tag">${it.category}</span>
          <button class="btn btn--outline btn--sm" type="button" data-passport="${it.traceId}">View passport</button>
        </div>
      </div>
    `).join('');
  }

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Passport modal handlers
  if (ledgerEl && passportModal && passportBody) {
    renderLedger('All');

    ledgerEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-passport]');
      if (!btn) return;
      const trace = btn.getAttribute('data-passport');
      const it = ledgerItems.find(x => x.traceId === trace);
      if (!it) return;

      passportBody.innerHTML = `
        <p><b>Trace ID:</b> <span class="mono">${it.traceId}</span></p>
        <p><b>Component:</b> ${it.name}</p>
        <p><b>Category:</b> ${it.category}</p>
        <hr class="sep" />
        <p><b>Origin:</b> ${it.origin}</p>
        <p><b>Mill:</b> ${it.mill}</p>
        <p><b>Finish:</b> ${it.finish}</p>
        <hr class="sep" />
        <p style="color: rgba(255,255,255,0.72); margin-bottom:0;">${it.notes}</p>
      `;
      openModal(passportModal);
    });
  }

  // Chips filter
  qsa('.chip[data-filter]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const filter = chip.getAttribute('data-filter') || 'All';
      qsa('.chip[data-filter]').forEach(c => {
        const active = (c.getAttribute('data-filter') || 'All') === filter;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-pressed', String(active));
      });
      renderLedger(filter);
    });
  });

  // Product modal
  const productModal = qs('#productModal');
  const productBody = qs('#productBody');
  const productTitle = qs('#productTitle');

  const PRODUCT_DETAILS = {
    dress: {
      title: 'Modular Dress — wear modes',
      html: `
        <p>One garment, multiple proportions. Designed for repeat styling, travel utility, and longevity.</p>
        <ul>
          <li><b>Lengths:</b> maxi → midi → knee → mini</li>
          <li><b>Conversion:</b> dress ↔ skirt mode</li>
          <li><b>Adjustable slit:</b> controlled variations</li>
        </ul>
        <p style="color: rgba(255,255,255,0.72);">Replace this with your real mechanism details once prototypes are finalized.</p>
      `
    },
    jewelry: {
      title: 'Modular Jewelry — system',
      html: `
        <p>Interchangeable components to reduce buying “duplicates” for different looks.</p>
        <ul>
          <li>Adjustable sizing</li>
          <li>Swap stones / elements</li>
          <li>Nickel-free finishes (goal)</li>
        </ul>
      `
    },
    knit: {
      title: 'Reversible Knit — styling notes',
      html: `
        <p>Two faces, one piece. Designed to maintain shape and be repairable.</p>
        <ul>
          <li>Double-sided wear</li>
          <li>Minimal seams for comfort</li>
          <li>Repair-first finishing</li>
        </ul>
      `
    }
  };

  qsa('[data-open-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-open-modal');
      const data = PRODUCT_DETAILS[key];
      if (!data || !productModal || !productBody || !productTitle) return;

      productTitle.textContent = data.title;
      productBody.innerHTML = data.html;
      openModal(productModal);
    });
  });

  // Global modal close
  qsa('[data-modal-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal(productModal);
      closeModal(passportModal);
    });
  });

  [productModal, passportModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeModal(productModal);
    closeModal(passportModal);
  });

  // Waitlist submit microfeedback
  const waitForm = qs('#waitlist-form');
  if (waitForm) {
    waitForm.addEventListener('submit', () => {
      const btn = qs('#waitlist-submit');
      const status = qs('#waitlist-status');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Submitting…';
      }
      if (status) status.textContent = 'Submitting securely…';
    });
  }

  // Init calculators + studio
  setupCapsule();
  setupMultiwear();
  setupStudio();
})();
