/**
 * chinese_newyear.js
 * Global API:
 * window.ONE_FESTIVE_EASTER_EGG
 * Methods:
 *  ONE_FESTIVE_EASTER_EGG.start(containerEl, options)
 *  ONE_FESTIVE_EASTER_EGG.stop()
 *  ONE_FESTIVE_EASTER_EGG.installHotkey({ combo, onToggle })
 *  ONE_FESTIVE_EASTER_EGG.uninstallHotkey()
 * Notes:
 * - Designed for overlays, pass background:"transparent"
 *   and set overlay div to position:absolute inset:0 pointer-events:none.
 * - Uses KeyboardEvent.code for combo matching (layout independent).
 * In React, use it as:
 *
 useEffect(() => {
  ONE_FESTIVE_EASTER_EGG.start(overlayRef.current, {
    background: "transparent",
    greeting: ""
  });
  return () => ONE_FESTIVE_EASTER_EGG.stop();
}, []);
*/
(function () {
  const API = {};
  let current = null;
  let hotkeyHandler = null;

  function createFestiveAsciiSplash(container, opts = {}) {
    const width = opts.width ?? 80;
    const height = opts.height ?? 28;
    const fps = opts.fps ?? 30;

    const bgChar = " ";
    const chars = ["·", "*", "✶", "+", "x", "✸", "o"];
    const palette = [
      "#ff3b30", // red
      "#ff9500", // orange
      "#ffd60a", // gold
      "#34c759", // green
      "#5ac8fa", // cyan
      "#5856d6", // purple
      "#ff2d55", // pink
    ];

    // Container setup (overlay-friendly)
    container.style.display = "grid";
    container.style.placeItems = "center";
    container.style.width = opts.containerWidth ?? "100%";
    container.style.height = opts.containerHeight ?? "100%";
    container.style.overflow = "hidden";

    // Only set background if provided, so you can overlay on existing content without changing it
    if (opts.background !== undefined) {
      container.style.background = opts.background;
    }

    // Build a <pre> for ASCII rendering (with colored spans)
    const pre = document.createElement("pre");
    pre.style.margin = "0";
    pre.style.padding = opts.padding ?? "24px";
    pre.style.fontFamily =
      opts.fontFamily ??
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
    pre.style.fontSize = opts.fontSize ?? "14px";
    pre.style.lineHeight = opts.lineHeight ?? "1.1";
    pre.style.userSelect = "none";
    pre.style.whiteSpace = "pre";
    pre.style.textShadow = "0 0 10px rgba(255,255,255,0.08)";
    pre.style.opacity = String(opts.opacity ?? "0.9");

    // If used as overlay, this helps avoid blocking clicks even if container forgot it
    pre.style.pointerEvents = "none";

    container.appendChild(pre);

    const greeting = opts.greeting ?? "Happy New Year 恭喜发财";
    const greetingColor = opts.greetingColor ?? "rgba(255,214,10,0.9)";

    const particles = [];
    let running = true;
    let last = performance.now();
    let acc = 0;
    const dtTarget = 1000 / fps;

    const rand = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    function spawnRocket() {
      const x = rand(8, width - 8);
      const y = height - 2;
      const vx = rand(-0.25, 0.25);
      const vy = rand(-1.4, -1.9);
      const color = palette[(Math.random() * palette.length) | 0];

      particles.push({
        type: "rocket",
        x,
        y,
        vx,
        vy,
        ax: 0,
        ay: 0.05,
        life: rand(18, 28),
        color,
        sparkle: 0,
      });
    }

    function explode(x, y, baseColor) {
      const n = (rand(22, 40) | 0);
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + rand(-0.15, 0.15);
        const sp = rand(0.5, 1.4);
        const c = Math.random() < 0.6 ? baseColor : palette[(Math.random() * palette.length) | 0];
        particles.push({
          type: "spark",
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          ax: 0,
          ay: 0.06,
          life: rand(10, 20),
          color: c,
          ch: chars[(Math.random() * chars.length) | 0],
        });
      }

      // little gold ring burst
      if (Math.random() < 0.5) {
        const ringN = 18;
        const ringColor = "#ffd60a";
        for (let i = 0; i < ringN; i++) {
          const a = (Math.PI * 2 * i) / ringN;
          const sp = rand(0.9, 1.2);
          particles.push({
            type: "spark",
            x,
            y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp,
            ax: 0,
            ay: 0.05,
            life: rand(8, 14),
            color: ringColor,
            ch: "✶",
          });
        }
      }
    }

    // Render buffer: each cell stores char + color + brightness
    function makeGrid() {
      return Array.from({ length: height }, () =>
        Array.from({ length: width }, () => ({ ch: bgChar, color: null, a: 0 }))
      );
    }

    function put(g, x, y, ch, color, a = 1) {
      const xi = x | 0;
      const yi = y | 0;
      if (xi < 0 || xi >= width || yi < 0 || yi >= height) return;
      if (a >= g[yi][xi].a) g[yi][xi] = { ch, color, a };
    }

    function update(dt) {
      if (Math.random() < 0.12) spawnRocket();
      if (Math.random() < 0.02) spawnRocket();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.vx += (p.ax || 0) * dt;
        p.vy += (p.ay || 0) * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;

        if (p.type === "rocket") {
          p.sparkle += dt;

          if (p.sparkle > 0.15) {
            p.sparkle = 0;
            particles.push({
              type: "spark",
              x: p.x,
              y: p.y + 1,
              vx: rand(-0.25, 0.25),
              vy: rand(0.2, 0.6),
              ax: 0,
              ay: 0.08,
              life: rand(4, 7),
              color: p.color,
              ch: "·",
            });
          }

          if (p.vy > -0.2 || p.life < 0) {
            explode(p.x, p.y, p.color);
            particles.splice(i, 1);
            continue;
          }
        } else {
          // fade out
          p.a = clamp(p.life / 12, 0, 1);
          if (p.life < 0) {
            particles.splice(i, 1);
            continue;
          }
        }

        // Cull off-screen
        if (p.y > height + 3 || p.x < -5 || p.x > width + 5) {
          particles.splice(i, 1);
        }
      }
    }

    function render() {
      const g = makeGrid();

      for (const p of particles) {
        if (p.type === "rocket") {
          put(g, p.x, p.y, "│", p.color, 1);
          put(g, p.x, p.y + 1, "·", p.color, 0.6);
        } else {
          put(g, p.x, p.y, p.ch, p.color, p.a ?? 1);
        }
      }

      // Greeting line (optional)
      if (greeting) {
        const text = greeting;
        const gy = height - 2;
        const startX = Math.max(0, ((width - text.length) / 2) | 0);
        for (let i = 0; i < text.length; i++) put(g, startX + i, gy, text[i], greetingColor, 0.9);
      }

      // Convert grid to HTML with color runs
      let html = "";

      const esc = (s) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      for (let y = 0; y < height; y++) {
        let row = "";
        let runColor = null;
        let runText = "";

        const flush = () => {
          if (!runText) return;
          const safe = esc(runText);
          if (!runColor) row += safe;
          else row += `<span style="color:${runColor}; text-shadow:0 0 10px rgba(255,255,255,0.15)">${safe}</span>`;
          runText = "";
        };

        for (let x = 0; x < width; x++) {
          const c = g[y][x];
          const col = c.color;
          if (col !== runColor) {
            flush();
            runColor = col;
          }
          runText += c.ch;
        }

        flush();
        html += row + "\n";
      }

      pre.innerHTML = html;
    }

    function frame(now) {
      if (!running) return;
      const dtMs = now - last;
      last = now;
      acc += dtMs;

      while (acc >= dtTarget) {
        update(0.6); // tuned for ASCII grid motion
        acc -= dtTarget;
      }

      render();
      requestAnimationFrame(frame);
    }

    // initial burst
    for (let i = 0; i < 4; i++) spawnRocket();
    requestAnimationFrame(frame);

    return {
      stop() {
        running = false;
        if (pre.parentNode === container) container.removeChild(pre);
      },
    };
  }

  // --- Hotkey parsing (combo) ---
  function normalizeKeyName(s) {
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

    // If single letter or digit, use KeyboardEvent.code style (KeyA / Digit1)
    if (/^[a-z]$/i.test(k)) return "Key" + k.toUpperCase();
    if (/^\d$/.test(k)) return "Digit" + k;

    return k; // already "KeyK", "ArrowUp", etc.
  }

  function parseCombo(combo) {
    const parts = String(combo).split("+").map((p) => p.trim()).filter(Boolean);
    const need = { ctrl: false, shift: false, alt: false, meta: false, code: null };

    for (const p of parts) {
      const pl = p.toLowerCase();
      if (pl === "ctrl" || pl === "control") need.ctrl = true;
      else if (pl === "shift") need.shift = true;
      else if (pl === "alt" || pl === "option") need.alt = true;
      else if (pl === "meta" || pl === "cmd" || pl === "command") need.meta = true;
      else need.code = normalizeKeyName(p);
    }
    return need;
  }

  function matchCombo(e, need) {
    if (need.ctrl && !e.ctrlKey) return false;
    if (need.shift && !e.shiftKey) return false;
    if (need.alt && !e.altKey) return false;
    if (need.meta && !e.metaKey) return false;
    if (!need.code) return false;

    // Prefer .code, fallback to .key for arrows etc.
    return e.code === need.code || e.key === need.code;
  }

  // --- Public API ---
  API.start = function (container, options) {
    if (!container) {
      throw new Error(
        "ONE_FESTIVE_EASTER_EGG.start(container, options): container is required"
      );
    }
    API.stop();
    current = createFestiveAsciiSplash(container, options);
    return current;
  };

  API.stop = function () {
    if (current && typeof current.stop === "function") current.stop();
    current = null;
  };

  API.installHotkey = function ({ combo = "Alt+Shift+F", onToggle } = {}) {
    API.uninstallHotkey();
    const need = parseCombo(combo);

    hotkeyHandler = (e) => {
      if (matchCombo(e, need)) {
        e.preventDefault();
        if (typeof onToggle === "function") onToggle(e);
      }
    };

    // capture phase for reliability
    window.addEventListener("keydown", hotkeyHandler, true);
    return { combo: need };
  };

  API.uninstallHotkey = function () {
    if (hotkeyHandler) window.removeEventListener("keydown", hotkeyHandler, true);
    hotkeyHandler = null;
  };

  window.ONE_FESTIVE_EASTER_EGG = API;
})();
