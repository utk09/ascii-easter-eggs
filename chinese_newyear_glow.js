/* chinese_new_year_glow.js
   CSS Chinese New Year overlay, pure JS drop-in for HTML or React.
   Creates a transparent overlay of fortune cookies, red envelopes, and fireworks.

   Global API:
     window.ONE_FESTIVE_EASTER_EGG

   Methods:
     ONE_FESTIVE_EASTER_EGG.start(containerEl, options)
     ONE_FESTIVE_EASTER_EGG.stop()

   Options:
     cookieCount: number (default 8)
     envelopeCount: number (default 10)
     fireworkCount: number (default 6)
     opacity: number/string (default 0.9)
     zIndex: number (default 2)
     density: 0.3..2.0 (default 1.0)
     minCookieSize, maxCookieSize: px (default 22..38)
     minEnvelopeSize, maxEnvelopeSize: px (default 26..42)
     minDuration, maxDuration: seconds (default 8..14)
     sparkle: true/false (default true)
*/

(function () {
  const API = {};
  let root = null;
  let styleEl = null;

  function ensureStyles() {
    if (styleEl) return;
    styleEl = document.createElement("style");
    styleEl.id = "fxone-cny-glow-css";
    styleEl.textContent = `
      .fxone-cny-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
      }

      /* Fortune Cookie */
      .fxone-cookie {
        position: absolute;
        left: 0;
        top: 0;
        font-size: var(--size);
        line-height: 1;
        opacity: var(--o);
        animation: fxone-cookie-float var(--dur) ease-in-out infinite;
        filter: drop-shadow(0 0 var(--glow) rgba(255, 215, 0, 0.6))
                drop-shadow(0 0 calc(var(--glow) * 0.6) rgba(255, 180, 50, 0.4));
      }

      @keyframes fxone-cookie-float {
        0% {
          transform: translate3d(var(--x), calc(100% + 50px), 0) rotate(var(--r)) scale(0.7);
          opacity: 0;
        }
        10% {
          opacity: var(--o);
        }
        30% {
          transform: translate3d(calc(var(--x) + var(--sx)), 65%, 0) rotate(calc(var(--r) * -0.8)) scale(0.9);
        }
        60% {
          transform: translate3d(calc(var(--x) - var(--sx) * 0.5), 35%, 0) rotate(var(--r)) scale(1);
        }
        90% {
          opacity: var(--o);
        }
        100% {
          transform: translate3d(var(--x), -60px, 0) rotate(calc(var(--r) * -1)) scale(0.85);
          opacity: 0;
        }
      }

      /* Red Envelope (Hongbao) */
      .fxone-envelope {
        position: absolute;
        left: 0;
        top: 0;
        font-size: var(--size);
        line-height: 1;
        opacity: var(--o);
        animation: fxone-envelope-fall var(--dur) ease-in-out infinite;
        filter: drop-shadow(0 0 var(--glow) rgba(255, 50, 50, 0.7))
                drop-shadow(0 0 calc(var(--glow) * 0.5) rgba(255, 215, 0, 0.5));
      }

      @keyframes fxone-envelope-fall {
        0% {
          transform: translate3d(var(--x), -50px, 0) rotate(var(--r)) scale(1);
          opacity: 0;
        }
        8% {
          opacity: var(--o);
        }
        25% {
          transform: translate3d(calc(var(--x) + var(--sx)), 25%, 0) rotate(calc(var(--r) * -0.5)) scale(0.95);
        }
        50% {
          transform: translate3d(calc(var(--x) - var(--sx) * 0.6), 50%, 0) rotate(var(--r)) scale(1);
        }
        75% {
          transform: translate3d(calc(var(--x) + var(--sx) * 0.4), 75%, 0) rotate(calc(var(--r) * -0.7)) scale(0.95);
        }
        92% {
          opacity: var(--o);
        }
        100% {
          transform: translate3d(var(--x), calc(100% + 50px), 0) rotate(var(--r)) scale(0.9);
          opacity: 0;
        }
      }

      /* Firework Container */
      .fxone-firework {
        position: absolute;
        left: var(--fx);
        top: var(--fy);
        width: 0;
        height: 0;
        animation: fxone-firework-cycle var(--dur) linear infinite;
        animation-delay: var(--delay);
      }

      @keyframes fxone-firework-cycle {
        0%, 100% { opacity: 1; }
      }

      /* Firework Trail (rocket going up) */
      .fxone-firework-trail {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 3px;
        height: 0;
        background: linear-gradient(to top, transparent, var(--tc), var(--tc));
        border-radius: 2px;
        transform: translateX(-50%);
        animation: fxone-trail-rise var(--dur) ease-out infinite;
        filter: drop-shadow(0 0 4px var(--tc)) drop-shadow(0 0 2px #fff);
      }

      @keyframes fxone-trail-rise {
        0% {
          height: 0;
          bottom: calc(var(--travel) * -1);
          opacity: 1;
        }
        25% {
          height: 30px;
          bottom: 0;
          opacity: 1;
        }
        30%, 100% {
          height: 0;
          bottom: 0;
          opacity: 0;
        }
      }

      /* Firework Particle */
      .fxone-firework-particle {
        position: absolute;
        left: 0;
        top: 0;
        width: var(--psize);
        height: var(--psize);
        background: var(--pc);
        border-radius: 50%;
        opacity: 0;
        animation: fxone-particle-explode var(--dur) ease-out infinite;
        filter: drop-shadow(0 0 6px var(--pc)) drop-shadow(0 0 3px #fff);
      }

      @keyframes fxone-particle-explode {
        0%, 28% {
          transform: translate(0, 0) scale(0);
          opacity: 0;
        }
        32% {
          transform: translate(0, 0) scale(1.2);
          opacity: 1;
        }
        50% {
          transform: translate(calc(var(--px) * 0.7), calc(var(--py) * 0.7)) scale(1);
          opacity: 1;
        }
        80% {
          transform: translate(var(--px), calc(var(--py) + 20px)) scale(0.6);
          opacity: 0.5;
        }
        100% {
          transform: translate(calc(var(--px) * 1.1), calc(var(--py) + 40px)) scale(0.2);
          opacity: 0;
        }
      }

      /* Secondary particles (smaller, trailing) */
      .fxone-firework-particle.secondary {
        animation: fxone-particle-secondary var(--dur) ease-out infinite;
        filter: drop-shadow(0 0 4px var(--pc));
      }

      @keyframes fxone-particle-secondary {
        0%, 35% {
          transform: translate(0, 0) scale(0);
          opacity: 0;
        }
        40% {
          transform: translate(calc(var(--px) * 0.2), calc(var(--py) * 0.2)) scale(0.8);
          opacity: 0.8;
        }
        70% {
          transform: translate(calc(var(--px) * 0.5), calc(var(--py) * 0.5 + 15px)) scale(0.5);
          opacity: 0.4;
        }
        100% {
          transform: translate(calc(var(--px) * 0.6), calc(var(--py) * 0.6 + 35px)) scale(0.1);
          opacity: 0;
        }
      }

      /* Sparkle burst at explosion center */
      .fxone-firework-flash {
        position: absolute;
        left: 50%;
        top: 50%;
        width: var(--fsize);
        height: var(--fsize);
        background: radial-gradient(circle, #fff 0%, var(--fc) 30%, transparent 70%);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
        animation: fxone-flash-burst var(--dur) ease-out infinite;
      }

      @keyframes fxone-flash-burst {
        0%, 28% {
          transform: translate(-50%, -50%) scale(0);
          opacity: 0;
        }
        32% {
          transform: translate(-50%, -50%) scale(1.5);
          opacity: 1;
        }
        45% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 0.6;
        }
        60%, 100% {
          transform: translate(-50%, -50%) scale(0.5);
          opacity: 0;
        }
      }

      /* Lucky sparkles */
      .fxone-lucky-sparkle {
        position: absolute;
        width: 10px;
        height: 10px;
        opacity: 0;
        animation: fxone-lucky-twinkle var(--sdur) ease-in-out infinite;
      }

      .fxone-lucky-sparkle::before {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(circle, var(--sc) 0%, transparent 70%);
        border-radius: 50%;
      }

      /* Star sparkle shape */
      .fxone-lucky-sparkle.star-sparkle::before {
        background: var(--sc);
        clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
        transform: scale(0.9);
      }

      @keyframes fxone-lucky-twinkle {
        0%, 100% {
          opacity: 0;
          transform: translate3d(var(--sx), var(--sy), 0) scale(0.5) rotate(0deg);
        }
        25% {
          opacity: 0.8;
          transform: translate3d(var(--sx), var(--sy), 0) scale(1.1) rotate(20deg);
        }
        50% {
          opacity: 0.5;
          transform: translate3d(var(--sx), var(--sy), 0) scale(0.9) rotate(-10deg);
        }
        75% {
          opacity: 0.7;
          transform: translate3d(var(--sx), var(--sy), 0) scale(1) rotate(15deg);
        }
      }
    `;
    document.head.appendChild(styleEl);
  }

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function pick(arr) {
    return arr[(Math.random() * arr.length) | 0];
  }

  function cssPx(n) {
    return `${Math.round(n)}px`;
  }

  API.start = function (container, options = {}) {
    if (!container) {
      throw new Error("ONE_FESTIVE_EASTER_EGG.start(container, options): container is required");
    }

    API.stop();
    ensureStyles();

    // Ensure container can host absolute overlay
    const cs = getComputedStyle(container);
    if (cs.position === "static") container.style.position = "relative";

    const density = Number.isFinite(options.density) ? options.density : 1.0;

    const sparkleColors = [
      "#FFD700", // gold
      "#FF4444", // red
      "#FFFFFF", // white
      "#FFA500", // orange
      "#FFEC8B", // light gold
    ];

    const fireworkColors = [
      "#FF4444", // red
      "#FFD700", // gold
      "#FF6B35", // orange
      "#FF1493", // pink
      "#00FF88", // green
      "#44AAFF", // blue
      "#FFFFFF", // white
    ];

    const cookieCount =
      options.cookieCount ??
      Math.max(6, Math.min(14, Math.floor(8 * density)));

    const envelopeCount =
      options.envelopeCount ??
      Math.max(8, Math.min(16, Math.floor(10 * density)));

    const fireworkCount =
      options.fireworkCount ??
      Math.max(4, Math.min(10, Math.floor(6 * density)));

    const minCookieSize = options.minCookieSize ?? 22;
    const maxCookieSize = options.maxCookieSize ?? 38;

    const minEnvelopeSize = options.minEnvelopeSize ?? 26;
    const maxEnvelopeSize = options.maxEnvelopeSize ?? 42;

    const minDuration = options.minDuration ?? 8;
    const maxDuration = options.maxDuration ?? 14;

    const opacity = options.opacity ?? 0.9;

    root = document.createElement("div");
    root.className = "fxone-cny-overlay";
    root.style.zIndex = String(options.zIndex ?? 2);
    root.style.opacity = String(opacity);

    // Create fortune cookies (floating up)
    for (let i = 0; i < cookieCount; i++) {
      const el = document.createElement("div");
      el.className = "fxone-cookie";
      el.textContent = "🥠";

      const size = rand(minCookieSize, maxCookieSize);
      const xPct = rand(5, 95);
      const dur = rand(minDuration, maxDuration);
      const sway = rand(-45, 45);
      const rot = rand(-20, 20);
      const glowSize = rand(6, 12);

      el.style.setProperty("--size", cssPx(size));
      el.style.setProperty("--glow", cssPx(glowSize));
      el.style.left = `${xPct}%`;
      el.style.setProperty("--x", "0px");
      el.style.setProperty("--dur", `${dur}s`);
      el.style.setProperty("--sx", `${sway}px`);
      el.style.setProperty("--r", `${rot}deg`);
      el.style.setProperty("--o", String(rand(0.75, 1)));

      el.style.animationDelay = `${rand(-dur, 0)}s`;

      root.appendChild(el);
    }

    // Create red envelopes (falling down)
    for (let i = 0; i < envelopeCount; i++) {
      const el = document.createElement("div");
      el.className = "fxone-envelope";
      el.textContent = "🧧";

      const size = rand(minEnvelopeSize, maxEnvelopeSize);
      const xPct = rand(3, 97);
      const dur = rand(minDuration * 0.9, maxDuration * 1.1);
      const sway = rand(-35, 35);
      const rot = rand(-15, 15);
      const glowSize = rand(8, 14);

      el.style.setProperty("--size", cssPx(size));
      el.style.setProperty("--glow", cssPx(glowSize));
      el.style.left = `${xPct}%`;
      el.style.setProperty("--x", "0px");
      el.style.setProperty("--dur", `${dur}s`);
      el.style.setProperty("--sx", `${sway}px`);
      el.style.setProperty("--r", `${rot}deg`);
      el.style.setProperty("--o", String(rand(0.8, 1)));

      el.style.animationDelay = `${rand(-dur, 0)}s`;

      root.appendChild(el);
    }

    // Create fireworks (real particle explosions)
    for (let i = 0; i < fireworkCount; i++) {
      const el = document.createElement("div");
      el.className = "fxone-firework";

      const xPct = rand(10, 90);
      const yPct = rand(15, 45);
      const dur = rand(3.5, 5.5);
      const travel = rand(120, 200);
      const delay = rand(0, dur * 1.5);

      // Pick 1-2 colors for this firework
      const mainColor = pick(fireworkColors);
      const secondaryColor = Math.random() > 0.5 ? pick(fireworkColors) : mainColor;

      el.style.setProperty("--fx", `${xPct}%`);
      el.style.setProperty("--fy", `${yPct}%`);
      el.style.setProperty("--dur", `${dur}s`);
      el.style.setProperty("--delay", `${delay}s`);
      el.style.setProperty("--travel", `${travel}px`);

      // Create trail
      const trail = document.createElement("div");
      trail.className = "fxone-firework-trail";
      trail.style.setProperty("--tc", mainColor);
      trail.style.setProperty("--dur", `${dur}s`);
      trail.style.setProperty("--travel", `${travel}px`);
      el.appendChild(trail);

      // Create flash at center
      const flash = document.createElement("div");
      flash.className = "fxone-firework-flash";
      flash.style.setProperty("--fsize", cssPx(rand(30, 50)));
      flash.style.setProperty("--fc", mainColor);
      flash.style.setProperty("--dur", `${dur}s`);
      el.appendChild(flash);

      // Create explosion particles
      const particleCount = Math.floor(rand(16, 28));
      const burstRadius = rand(50, 90);

      for (let p = 0; p < particleCount; p++) {
        const particle = document.createElement("div");
        const isSecondary = Math.random() > 0.6;
        particle.className = "fxone-firework-particle" + (isSecondary ? " secondary" : "");

        const angle = (360 / particleCount) * p + rand(-10, 10);
        const radian = (angle * Math.PI) / 180;
        const distance = burstRadius * (isSecondary ? rand(0.4, 0.7) : rand(0.8, 1.2));

        const px = Math.cos(radian) * distance;
        const py = Math.sin(radian) * distance;

        particle.style.setProperty("--px", `${px}px`);
        particle.style.setProperty("--py", `${py}px`);
        particle.style.setProperty("--pc", isSecondary ? secondaryColor : mainColor);
        particle.style.setProperty("--psize", cssPx(isSecondary ? rand(3, 5) : rand(4, 7)));
        particle.style.setProperty("--dur", `${dur}s`);

        el.appendChild(particle);
      }

      root.appendChild(el);
    }

    // Sparkles
    if (options.sparkle !== false) {
      const sparkleCount = Math.max(20, Math.floor(36 * density));
      for (let i = 0; i < sparkleCount; i++) {
        const s = document.createElement("div");
        s.className = "fxone-lucky-sparkle" + (Math.random() > 0.5 ? " star-sparkle" : "");
        s.style.setProperty("--sx", `${rand(0, 100)}%`);
        s.style.setProperty("--sy", `${rand(0, 100)}%`);
        s.style.left = `${rand(0, 100)}%`;
        s.style.top = `${rand(0, 100)}%`;
        s.style.setProperty("--sdur", `${rand(1.5, 3.5)}s`);
        s.style.setProperty("--sc", pick(sparkleColors));
        s.style.animationDelay = `${rand(0, 3)}s`;
        root.appendChild(s);
      }
    }

    container.appendChild(root);

    return {
      stop: API.stop,
    };
  };

  API.stop = function () {
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null;
  };

  let hotkeyHandler = null;

  API.installHotkey = function ({ combo = "Ctrl+Shift+C", onToggle } = {}) {
    API.uninstallHotkey();

    const need = (function parseCombo(comboStr) {
      const parts = String(comboStr).split("+").map((p) => p.trim()).filter(Boolean);
      const out = { ctrl: false, shift: false, alt: false, meta: false, code: null };

      const normalizeKeyName = (s) => {
        const m = {
          space: "Space",
          esc: "Escape",
          escape: "Escape",
          enter: "Enter",
          tab: "Tab",
          slash: "Slash",
          backquote: "Backquote",
          up: "ArrowUp",
          down: "ArrowDown",
          left: "ArrowLeft",
          right: "ArrowRight",
        };
        const k = String(s).trim();
        const lower = k.toLowerCase();
        if (m[lower]) return m[lower];
        if (/^[a-z]$/i.test(k)) return "Key" + k.toUpperCase();
        if (/^\d$/.test(k)) return "Digit" + k;
        return k;
      };

      for (const p of parts) {
        const pl = p.toLowerCase();
        if (pl === "ctrl" || pl === "control") out.ctrl = true;
        else if (pl === "shift") out.shift = true;
        else if (pl === "alt" || pl === "option") out.alt = true;
        else if (pl === "meta" || pl === "cmd" || pl === "command") out.meta = true;
        else out.code = normalizeKeyName(p);
      }
      return out;
    })(combo);

    const match = (e) => {
      if (need.ctrl && !e.ctrlKey) return false;
      if (need.shift && !e.shiftKey) return false;
      if (need.alt && !e.altKey) return false;
      if (need.meta && !e.metaKey) return false;
      if (!need.code) return false;
      return e.code === need.code || e.key === need.code;
    };

    hotkeyHandler = (e) => {
      if (match(e)) {
        e.preventDefault();
        if (typeof onToggle === "function") onToggle(e);
      }
    };

    window.addEventListener("keydown", hotkeyHandler, true);
  };

  API.uninstallHotkey = function () {
    if (hotkeyHandler) window.removeEventListener("keydown", hotkeyHandler, true);
    hotkeyHandler = null;
  };

  window.ONE_FESTIVE_EASTER_EGG = API;
})();
