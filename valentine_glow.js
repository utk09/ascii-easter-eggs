/* valentine_glow.js
   CSS Valentine's Day overlay, pure JS drop-in for HTML or React.
   Creates a transparent overlay of floating hearts and falling rose petals.

   Global API:
     window.ONE_FESTIVE_EASTER_EGG

   Methods:
     ONE_FESTIVE_EASTER_EGG.start(containerEl, options)
     ONE_FESTIVE_EASTER_EGG.stop()

   Options:
     heartCount: number (default 12)
     petalCount: number (default 18)
     opacity: number/string (default 0.9)
     zIndex: number (default 2)
     density: 0.3..2.0 (default 1.0)
     heartColors: array of CSS colors (default reds/pinks)
     petalColors: array of CSS colors (default rose reds)
     minHeartSize, maxHeartSize: px (default 16..40)
     minPetalSize, maxPetalSize: px (default 10..22)
     minDuration, maxDuration: seconds (default 8..14)
     blur: px glow blur (default 12)
     sparkle: true/false (default true)
*/

(function () {
  const API = {};
  let root = null;
  let styleEl = null;

  function ensureStyles() {
    if (styleEl) return;
    styleEl = document.createElement("style");
    styleEl.id = "fxone-valentine-glow-css";
    styleEl.textContent = `
      .fxone-valentine-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
      }

      /* Floating Heart */
      .fxone-heart {
        position: absolute;
        left: 0;
        top: 0;
        width: var(--w);
        height: var(--h);
        opacity: var(--o);
        animation: fxone-heart-float var(--dur) ease-in-out infinite;
        filter: drop-shadow(0 0 var(--blur) var(--glow));
      }

      .fxone-heart::before,
      .fxone-heart::after {
        content: "";
        position: absolute;
        width: 52%;
        height: 80%;
        background: var(--c);
        border-radius: 50% 50% 0 0;
      }

      .fxone-heart::before {
        left: 50%;
        top: 0;
        transform: rotate(-45deg);
        transform-origin: 0 100%;
      }

      .fxone-heart::after {
        left: 0;
        top: 0;
        transform: rotate(45deg);
        transform-origin: 100% 100%;
      }

      @keyframes fxone-heart-float {
        0% {
          transform: translate3d(var(--x), calc(100% + 60px), 0) rotate(var(--r)) scale(0.8);
          opacity: 0;
        }
        10% {
          opacity: var(--o);
        }
        50% {
          transform: translate3d(calc(var(--x) + var(--sx)), 50%, 0) rotate(calc(var(--r) * -1)) scale(1);
        }
        90% {
          opacity: var(--o);
        }
        100% {
          transform: translate3d(var(--x), -80px, 0) rotate(var(--r)) scale(0.9);
          opacity: 0;
        }
      }

      /* Falling Rose Petal */
      .fxone-petal {
        position: absolute;
        left: 0;
        top: 0;
        width: var(--w);
        height: var(--h);
        opacity: var(--o);
        animation: fxone-petal-fall var(--dur) ease-in-out infinite;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
      }

      .fxone-petal::before {
        content: "";
        position: absolute;
        inset: 0;
        background: var(--c);
        border-radius: 80% 0 55% 50% / 55% 0 80% 50%;
        transform: rotate(var(--pr));
        box-shadow:
          inset -2px -2px 6px rgba(0,0,0,0.12),
          inset 2px 2px 6px rgba(255,255,255,0.25);
      }

      @keyframes fxone-petal-fall {
        0% {
          transform: translate3d(var(--x), -40px, 0) rotate(0deg) scale(1);
          opacity: 0;
        }
        10% {
          opacity: var(--o);
        }
        25% {
          transform: translate3d(calc(var(--x) + var(--sx)), 25%, 0) rotate(90deg) scale(0.95);
        }
        50% {
          transform: translate3d(calc(var(--x) - var(--sx) * 0.5), 50%, 0) rotate(180deg) scale(1);
        }
        75% {
          transform: translate3d(calc(var(--x) + var(--sx) * 0.8), 75%, 0) rotate(270deg) scale(0.9);
        }
        90% {
          opacity: var(--o);
        }
        100% {
          transform: translate3d(var(--x), calc(100% + 40px), 0) rotate(360deg) scale(0.85);
          opacity: 0;
        }
      }

      /* Love sparkles */
      .fxone-love-sparkle {
        position: absolute;
        width: 8px;
        height: 8px;
        opacity: 0;
        animation: fxone-love-twinkle var(--sdur) ease-in-out infinite;
      }

      .fxone-love-sparkle::before {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(circle, var(--sc) 0%, transparent 70%);
        border-radius: 50%;
      }

      /* Mini heart sparkle shape */
      .fxone-love-sparkle.heart-sparkle::before {
        width: 100%;
        height: 100%;
        background: var(--sc);
        clip-path: path('M4 1.5C4 0.67 3.33 0 2.5 0S1 0.67 1 1.5c0 0.28.09.54.24.76L4 5l2.76-2.74c.15-.22.24-.48.24-.76C7 0.67 6.33 0 5.5 0S4 0.67 4 1.5z');
        transform: scale(0.8);
      }

      @keyframes fxone-love-twinkle {
        0%, 100% {
          opacity: 0;
          transform: translate3d(var(--sx), var(--sy), 0) scale(0.6);
        }
        30% {
          opacity: 0.7;
          transform: translate3d(var(--sx), var(--sy), 0) scale(1.1);
        }
        60% {
          opacity: 0.4;
          transform: translate3d(var(--sx), var(--sy), 0) scale(0.9);
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

    const heartColors = options.heartColors ?? [
      "#FF1744", // vivid red
      "#FF4081", // pink
      "#E91E63", // rose
      "#F50057", // hot pink
      "#FF6B6B", // coral red
      "#C2185B", // deep pink
    ];

    const petalColors = options.petalColors ?? [
      "#E53935", // red
      "#D32F2F", // dark red
      "#C62828", // deeper red
      "#FF5252", // light red
      "#EF5350", // salmon red
      "#FFCDD2", // pale pink
    ];

    const sparkleColors = [
      "#FFB6C1", // light pink
      "#FF69B4", // hot pink
      "#FFC0CB", // pink
      "#FFFFFF", // white
      "#FFE4E1", // misty rose
    ];

    const heartCount =
      options.heartCount ??
      Math.max(8, Math.min(20, Math.floor(12 * density)));

    const petalCount =
      options.petalCount ??
      Math.max(12, Math.min(30, Math.floor(18 * density)));

    const minHeartSize = options.minHeartSize ?? 16;
    const maxHeartSize = options.maxHeartSize ?? 40;

    const minPetalSize = options.minPetalSize ?? 10;
    const maxPetalSize = options.maxPetalSize ?? 22;

    const minDuration = options.minDuration ?? 8;
    const maxDuration = options.maxDuration ?? 14;

    const blur = options.blur ?? 12;
    const opacity = options.opacity ?? 0.9;

    root = document.createElement("div");
    root.className = "fxone-valentine-overlay";
    root.style.zIndex = String(options.zIndex ?? 2);
    root.style.opacity = String(opacity);

    // Create hearts
    for (let i = 0; i < heartCount; i++) {
      const el = document.createElement("div");
      el.className = "fxone-heart";

      const size = rand(minHeartSize, maxHeartSize);
      const w = size;
      const h = size * 0.9;

      const xPct = rand(5, 95);
      const dur = rand(minDuration, maxDuration);
      const sway = rand(-50, 50);
      const rot = rand(-25, 25);

      const color = pick(heartColors);

      el.style.setProperty("--w", cssPx(w));
      el.style.setProperty("--h", cssPx(h));
      el.style.left = `${xPct}%`;
      el.style.setProperty("--x", "0px");
      el.style.setProperty("--dur", `${dur}s`);
      el.style.setProperty("--sx", `${sway}px`);
      el.style.setProperty("--r", `${rot}deg`);
      el.style.setProperty("--c", color);
      el.style.setProperty("--glow", color);
      el.style.setProperty("--blur", `${blur}px`);
      el.style.setProperty("--o", String(rand(0.6, 0.95)));

      // Desync animations
      el.style.animationDelay = `${rand(-dur, 0)}s`;

      root.appendChild(el);
    }

    // Create rose petals
    for (let i = 0; i < petalCount; i++) {
      const el = document.createElement("div");
      el.className = "fxone-petal";

      const size = rand(minPetalSize, maxPetalSize);
      const w = size;
      const h = size * rand(0.6, 0.9);

      const xPct = rand(3, 97);
      const dur = rand(minDuration * 0.8, maxDuration * 1.2);
      const sway = rand(-35, 35);
      const petalRot = rand(-30, 30);

      const color = pick(petalColors);

      el.style.setProperty("--w", cssPx(w));
      el.style.setProperty("--h", cssPx(h));
      el.style.left = `${xPct}%`;
      el.style.setProperty("--x", "0px");
      el.style.setProperty("--dur", `${dur}s`);
      el.style.setProperty("--sx", `${sway}px`);
      el.style.setProperty("--pr", `${petalRot}deg`);
      el.style.setProperty("--c", color);
      el.style.setProperty("--o", String(rand(0.55, 0.85)));

      // Desync animations
      el.style.animationDelay = `${rand(-dur, 0)}s`;

      root.appendChild(el);
    }

    // Sparkles
    if (options.sparkle !== false) {
      const sparkleCount = Math.max(16, Math.floor(32 * density));
      for (let i = 0; i < sparkleCount; i++) {
        const s = document.createElement("div");
        s.className = "fxone-love-sparkle" + (Math.random() > 0.6 ? " heart-sparkle" : "");
        s.style.setProperty("--sx", `${rand(0, 100)}%`);
        s.style.setProperty("--sy", `${rand(0, 100)}%`);
        s.style.left = `${rand(0, 100)}%`;
        s.style.top = `${rand(0, 100)}%`;
        s.style.setProperty("--sdur", `${rand(1.8, 4.5)}s`);
        s.style.setProperty("--sc", pick(sparkleColors));
        s.style.animationDelay = `${rand(0, 4)}s`;
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

  API.installHotkey = function ({ combo = "Ctrl+Shift+V", onToggle } = {}) {
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
