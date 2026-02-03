/* lantern_glow.js
   CSS Lantern Glow overlay, pure JS drop-in for HTML or React.
   Creates a transparent overlay of softly glowing lanterns rising upward.

   Global API:
     window.ONE_FESTIVE_EASTER_EGG

   Methods:
     ONE_FESTIVE_EASTER_EGG.start(containerEl, options)
     ONE_FESTIVE_EASTER_EGG.stop()

   Options:
     lanternCount: number (default 10)
     opacity: number/string (default 0.85)
     zIndex: number (default 2)
     density: 0.3..2.0 (default 1.0)  // scales lanternCount if lanternCount not provided
     colors: array of CSS colors (default tuned for #00AEEF visibility)
     minSize, maxSize: px (default 18..46)
     minDuration, maxDuration: seconds (default 8..16)
     blur: px glow blur (default 18)
     sparkle: true/false (default true) // subtle glow flecks
*/

(function () {
  const API = {};
  let root = null;
  let styleEl = null;

  function ensureStyles() {
    if (styleEl) return;
    styleEl = document.createElement("style");
    styleEl.id = "fxone-lantern-glow-css";
    styleEl.textContent = `
      .fxone-lantern-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
      }

      .fxone-lantern {
        position: absolute;
        left: 0;
        top: 0;
        width: var(--w);
        height: var(--h);
        transform: translate3d(var(--x), var(--y), 0);
        opacity: var(--o);
        animation: fxone-lantern-rise var(--dur) linear infinite;
        filter: drop-shadow(0 0 var(--blur) rgba(255,255,255,0.22));
      }

      /* lantern body */
      .fxone-lantern::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 12px 12px 14px 14px;
        background:
          radial-gradient(circle at 50% 35%, rgba(255,255,255,0.95), rgba(255,255,255,0.0) 55%),
          linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0.0)),
          radial-gradient(circle at 50% 60%, var(--c1), var(--c2));
        box-shadow:
          0 0 calc(var(--blur) * 1.2) rgba(255,255,255,0.10),
          0 0 calc(var(--blur) * 1.6) rgba(255,214,10,0.10);
        border: 1px solid rgba(255,255,255,0.14);
        backdrop-filter: blur(1px);
      }

      /* lantern top cap */
      .fxone-lantern::after {
        content: "";
        position: absolute;
        left: 50%;
        top: -10%;
        width: 55%;
        height: 18%;
        transform: translateX(-50%);
        border-radius: 999px;
        background: rgba(0,0,0,0.22);
        border: 1px solid rgba(255,255,255,0.10);
      }

      /* gentle sway, plus rise */
      @keyframes fxone-lantern-rise {
        0% {
          transform: translate3d(0, calc(100% + 60px), 0) rotate(calc(var(--r) * -1));
        }
        40% {
          transform: translate3d(var(--sx), 40%, 0) rotate(var(--r));
        }
        100% {
          transform: translate3d(calc(var(--sx) * -1), -120px, 0) rotate(calc(var(--r) * -1));
        }
      }


      /* optional tiny sparkles */
      .fxone-sparkle {
        position: absolute;
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0.0) 70%);
        opacity: 0.0;
        animation: fxone-sparkle-twinkle var(--sdur) ease-in-out infinite;
        filter: blur(0.2px);
      }

      @keyframes fxone-sparkle-twinkle {
        0%, 100% { opacity: 0; transform: translate3d(var(--sx), var(--sy), 0) scale(0.9); }
        40% { opacity: 0.55; transform: translate3d(var(--sx), var(--sy), 0) scale(1.2); }
        70% { opacity: 0.12; transform: translate3d(var(--sx), var(--sy), 0) scale(1.0); }
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

    const colors = options.colors ?? [
      "#FFD60A", // gold
      "#FFB020", // amber
      "#FFFFFF", // white
      "#FFF2CC", // warm white
      "#FF2D55", // pink accent
    ];

    const lanternCount =
      options.lanternCount ??
      Math.max(6, Math.min(18, Math.floor(10 * density)));

    const minSize = options.minSize ?? 18;
    const maxSize = options.maxSize ?? 46;

    const minDuration = options.minDuration ?? 8;
    const maxDuration = options.maxDuration ?? 16;

    const blur = options.blur ?? 18;
    const opacity = options.opacity ?? 0.85;

    root = document.createElement("div");
    root.className = "fxone-lantern-overlay";
    root.style.zIndex = String(options.zIndex ?? 2);
    root.style.opacity = String(opacity);

    // Lanterns
    for (let i = 0; i < lanternCount; i++) {
      const el = document.createElement("div");
      el.className = "fxone-lantern";

      const size = rand(minSize, maxSize);
      const w = size * rand(0.75, 0.95);
      const h = size * rand(1.05, 1.35);

      const xPct = rand(4, 96);
      const dur = rand(minDuration, maxDuration);

      const sway = rand(-40, 40);
      const rot = rand(-6, 6);

      // Two-tone glow for depth
      const c1 = pick(colors);
      const c2 = pick(colors);

      el.style.setProperty("--w", cssPx(w));
      el.style.setProperty("--h", cssPx(h));
      el.style.left = `${xPct}%`;
      el.style.setProperty("--y", `0px`);
      el.style.setProperty("--dur", `${dur}s`);
      el.style.setProperty("--sx", `${sway}px`);
      el.style.setProperty("--r", `${rot}deg`);
      el.style.setProperty("--c1", c1);
      el.style.setProperty("--c2", c2);
      el.style.setProperty("--blur", `${blur}px`);
      el.style.setProperty("--o", String(rand(0.65, 0.95)));

      // Desync animations
      el.style.animationDelay = `${rand(-dur, 0)}s`;

      root.appendChild(el);
    }

    // Sparkles (subtle)
    if (options.sparkle !== false) {
      const sparkleCount = Math.max(12, Math.floor(28 * density));
      for (let i = 0; i < sparkleCount; i++) {
        const s = document.createElement("div");
        s.className = "fxone-sparkle";
        s.style.setProperty("--sx", `${rand(0, 100)}%`);
        s.style.setProperty("--sy", `${rand(0, 100)}%`);
        s.style.left = `${rand(0, 100)}%`;
        s.style.top = `${rand(0, 100)}%`;
        s.style.setProperty("--sdur", `${rand(2.2, 5.0)}s`);
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

  // Keep hotkey helpers consistent with your other files (optional)
  API.installHotkey = function ({ combo = "Ctrl+Shift+L", onToggle } = {}) {
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
