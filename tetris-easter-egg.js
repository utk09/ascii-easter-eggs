/**
 * Tetris Easter Egg
 * Usage:
 *  ONE_TETRIS_EGG.install(); // installs listeners, default trigger Ctrl+Shift+T
 * Optional:
 *  ONE_TETRIS_EGG.install({ trigger: { type: "sequence", value: "tetris" } });
 * ONE_TETRIS_EGG.open(); ONE_TETRIS_EGG.close(); ONE_TETRIS_EGG.uninstall();
 * Controls (when modal open):
 *  Left Arrow, Right Arrow to Move move, Up Arrow to Rotate, Z rotate CCW,
 *  Down Arrow soft drop, Space hard drop
 *  C hold, P pause, R restart, Esc close
 * In React, use as:
 useEffect(() => {
   window.ONE_TETRIS_EGG?.install();
   return () => window.TETRIS_EGG?.uninstall();
  }, []);
*/
(() => {
  const API = {};
  const CFG = {
    W: 10,
    H: 20,
    DROP_MS_START: 800,
    DROP_MS_MIN: 90,
    DROP_ACCEL_PER_LEVEL: 60,
    LINES_PER_LEVEL: 10,
    GHOST: true,
    // Visual
    CELL_W: 14,
    CELL_H: 14,
    GAP: 1,
    FONT: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  };

  const SHAPES = {
    I: [
      [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
      [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
      [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
    ],
    O: [
      [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    ],
    T: [
      [[0, 1, 0, 0], [1, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 1, 0, 0], [0, 1, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
      [[0, 0, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
      [[0, 1, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
    ],
    S: [
      [[0, 1, 1, 0], [1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]],
      [[0, 0, 0, 0], [0, 1, 1, 0], [1, 1, 0, 0], [0, 0, 0, 0]],
      [[1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
    ],
    Z: [
      [[1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 0, 1, 0], [0, 1, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
      [[0, 0, 0, 0], [1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
      [[0, 1, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]],
    ],
    J: [
      [[1, 0, 0, 0], [1, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 1, 1, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
      [[0, 0, 0, 0], [1, 1, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]],
      [[0, 1, 0, 0], [0, 1, 0, 0], [1, 1, 0, 0], [0, 0, 0, 0]],
    ],
    L: [
      [[0, 0, 1, 0], [1, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
      [[0, 0, 0, 0], [1, 1, 1, 0], [1, 0, 0, 0], [0, 0, 0, 0]],
      [[1, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
    ],
  };

  const COLORS = {
    I: "#40C4FF",
    O: "#FFD740",
    T: "#B388FF",
    S: "#69F0AE",
    Z: "#FF5252",
    J: "#448AFF",
    L: "#FFAB40",
    GHOST: "rgba(255,255,255,0.18)",
    EMPTY: "rgba(255,255,255,0.06)",
    GRID_BG: "#0b0f1a",
    PANEL_BG: "rgba(10,14,24,0.96)",
    TEXT: "rgba(255,255,255,0.88)",
    MUTED: "rgba(255,255,255,0.60)",
    BORDER: "rgba(255,255,255,0.14)",
  };

  const SCORE_TABLE = { 1: 100, 2: 300, 3: 500, 4: 800 };

  const state = {
    installed: false,
    open: false,
    paused: false,
    over: false,
    board: [],
    bag: [],
    next: null,
    hold: null,
    holdUsed: false,
    piece: null,
    x: 0,
    y: 0,
    rot: 0,
    score: 0,
    lines: 0,
    level: 1,
    dropMs: CFG.DROP_MS_START,
    lastDrop: 0,
    raf: 0,

    // UI nodes
    dialog: null,
    root: null,
    grid: null,
    cells: [],
    hud: null,

    // input
    keydown: null,
    keyup: null,
    trigger: { type: "combo", value: "Ctrl+Shift+T" },
    sequenceBuf: "",
  };

  function makeBoard() {
    return Array.from({ length: CFG.H }, () => Array.from({ length: CFG.W }, () => null));
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function refillBagIfNeeded() {
    if (state.bag.length < 7) state.bag = state.bag.concat(shuffle(Object.keys(SHAPES).slice()));
  }

  function takeFromBag() {
    refillBagIfNeeded();
    return state.bag.shift();
  }

  function shapeAt(type, rot) {
    return SHAPES[type][rot & 3];
  }

  function collides(px, py, prot) {
    const m = shapeAt(state.piece, prot);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        if (!m[y][x]) continue;
        const bx = px + x;
        const by = py + y;
        if (bx < 0 || bx >= CFG.W) return true;
        if (by >= CFG.H) return true;
        if (by >= 0 && state.board[by][bx]) return true;
      }
    }
    return false;
  }

  function spawn() {
    if (!state.next) state.next = takeFromBag();
    const type = state.next;
    state.next = takeFromBag();

    state.piece = type;
    state.rot = 0;
    state.x = ((CFG.W / 2) | 0) - 2;
    state.y = -1;
    state.holdUsed = false;

    if (collides(state.x, state.y, state.rot)) {
      state.over = true;
    }
  }

  function clearLines() {
    let cleared = 0;
    for (let y = CFG.H - 1; y >= 0; y--) {
      if (state.board[y].every(Boolean)) {
        state.board.splice(y, 1);
        state.board.unshift(Array.from({ length: CFG.W }, () => null));
        cleared++;
        y++;
      }
    }
    if (cleared) {
      state.lines += cleared;
      state.score += (SCORE_TABLE[cleared] || 0) * state.level;
      const newLevel = 1 + ((state.lines / CFG.LINES_PER_LEVEL) | 0);
      if (newLevel !== state.level) {
        state.level = newLevel;
        const target = CFG.DROP_MS_START - (state.level - 1) * CFG.DROP_ACCEL_PER_LEVEL;
        state.dropMs = Math.max(CFG.DROP_MS_MIN, target);
      }
    }
  }

  function lock() {
    const m = shapeAt(state.piece, state.rot);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        if (!m[y][x]) continue;
        const bx = state.x + x;
        const by = state.y + y;
        if (by >= 0 && by < CFG.H && bx >= 0 && bx < CFG.W) state.board[by][bx] = state.piece;
      }
    }
    clearLines();
    spawn();
  }

  function ghostY() {
    let gy = state.y;
    while (!collides(state.x, gy + 1, state.rot)) gy++;
    return gy;
  }

  function move(dx) {
    if (!collides(state.x + dx, state.y, state.rot)) state.x += dx;
  }

  function rotate(dir) {
    const nr = (state.rot + dir + 4) & 3;
    const kicks = [0, -1, 1, -2, 2];
    for (const k of kicks) {
      if (!collides(state.x + k, state.y, nr)) {
        state.x += k;
        state.rot = nr;
        return;
      }
    }
  }

  function softDrop() {
    if (!collides(state.x, state.y + 1, state.rot)) {
      state.y++;
      state.score += 1;
    } else {
      lock();
    }
  }

  function hardDrop() {
    let dy = 0;
    while (!collides(state.x, state.y + dy + 1, state.rot)) dy++;
    state.y += dy;
    state.score += dy * 2;
    lock();
  }

  function doHold() {
    if (state.holdUsed) return;
    state.holdUsed = true;
    const cur = state.piece;

    if (!state.hold) {
      state.hold = cur;
      spawn();
      return;
    }

    state.piece = state.hold;
    state.hold = cur;
    state.rot = 0;
    state.x = ((CFG.W / 2) | 0) - 2;
    state.y = -1;

    if (collides(state.x, state.y, state.rot)) state.over = true;
  }

  function buildOverlayCells() {
    // base from board
    const out = Array.from({ length: CFG.H }, (_, y) =>
      Array.from({ length: CFG.W }, (_, x) => state.board[y][x] ? { type: state.board[y][x], kind: "locked" } : null)
    );

    // ghost
    if (CFG.GHOST && state.piece && !state.over) {
      const gy = ghostY();
      const gm = shapeAt(state.piece, state.rot);
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
        if (!gm[y][x]) continue;
        const by = gy + y, bx = state.x + x;
        if (by >= 0 && by < CFG.H && bx >= 0 && bx < CFG.W && !out[by][bx]) {
          out[by][bx] = { type: state.piece, kind: "ghost" };
        }
      }
    }

    // active
    if (state.piece && !state.over) {
      const m = shapeAt(state.piece, state.rot);
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
        if (!m[y][x]) continue;
        const by = state.y + y, bx = state.x + x;
        if (by >= 0 && by < CFG.H && bx >= 0 && bx < CFG.W) {
          out[by][bx] = { type: state.piece, kind: "active" };
        }
      }
    }

    return out;
  }

  function renderDOM() {
    if (!state.grid) return;
    const overlay = buildOverlayCells();

    for (let y = 0; y < CFG.H; y++) {
      for (let x = 0; x < CFG.W; x++) {
        const idx = y * CFG.W + x;
        const cell = state.cells[idx];
        const v = overlay[y][x];

        if (!v) {
          cell.style.background = COLORS.EMPTY;
          cell.textContent = " ";
          continue;
        }
        if (v.kind === "ghost") {
          cell.style.background = COLORS.GHOST;
          cell.textContent = " ";
          continue;
        }
        cell.style.background = COLORS[v.type] || "#fff";
        cell.textContent = " ";
      }
    }

    const status = state.over ? "GAME OVER" : state.paused ? "PAUSED" : " ";
    state.hud.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:baseline;">
        <div style="font-weight:700;">Tetris</div>
        <div style="color:${COLORS.MUTED};font-size:12px;">Esc close, P pause, R restart</div>
      </div>
      <div style="margin-top:8px;display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:8px;font-size:13px;">
        <div>Score: <b>${state.score}</b></div>
        <div>Level: <b>${state.level}</b></div>
        <div>Lines: <b>${state.lines}</b></div>
        <div>Status: <b>${status}</b></div>
        <div>Next: <b>${state.next || ""}</b></div>
        <div>Hold: <b>${state.hold || ""}</b></div>
      </div>
      <div style="margin-top:10px;color:${COLORS.MUTED};font-size:12px;line-height:1.35;">
        Controls: ← → move, ↑ rotate, Z rotate CCW, ↓ soft drop, Space hard drop, C hold
      </div>
    `;
  }

  function gameLoop(ts) {
    if (!state.open) return;
    state.raf = requestAnimationFrame(gameLoop);

    if (state.paused || state.over) {
      renderDOM();
      return;
    }

    if (!state.lastDrop) state.lastDrop = ts;
    if (ts - state.lastDrop >= state.dropMs) {
      state.lastDrop = ts;
      if (!collides(state.x, state.y + 1, state.rot)) state.y++;
      else lock();
    }
    renderDOM();
  }

  function resetGame() {
    state.board = makeBoard();
    state.bag = [];
    state.next = null;
    state.hold = null;
    state.holdUsed = false;
    state.score = 0;
    state.lines = 0;
    state.level = 1;
    state.dropMs = CFG.DROP_MS_START;
    state.paused = false;
    state.over = false;
    state.lastDrop = 0;
    spawn();
    renderDOM();
  }

  function buildModal() {
    // dialog if available
    const hasDialog = typeof HTMLDialogElement !== "undefined";
    const dialog = hasDialog ? document.createElement("dialog") : document.createElement("div");
    state.dialog = dialog;

    const baseStyle = `
      position:${hasDialog ? "fixed" : "fixed"};
      inset:0;
      margin:auto;
      border:none;
      padding:0;
      background:transparent;
      z-index:2147483647;
    `;

    if (hasDialog) dialog.setAttribute("style", baseStyle);
    else dialog.setAttribute("style", baseStyle + "display:none;");

    const backdrop = document.createElement("div");
    backdrop.setAttribute("style", `
      position:fixed; inset:0;
      background:rgba(0,0,0,0.55);
      display:flex; align-items:center; justify-content:center;
      padding:24px;
    `);

    const root = document.createElement("div");
    state.root = root;
    root.setAttribute("tabindex", "0");
    root.setAttribute("style", `
      outline:none;
      background:${COLORS.PANEL_BG};
      border:1px solid ${COLORS.BORDER};
      border-radius:16px;
      box-shadow:0 20px 60px rgba(0,0,0,0.6);
      width:min(560px, 92vw);
      padding:16px;
      color:${COLORS.TEXT};
      font-family:${CFG.FONT};
    `);

    const wrap = document.createElement("div");
    wrap.setAttribute("style", `display:flex; gap:16px; align-items:flex-start;`);

    const hud = document.createElement("div");
    state.hud = hud;
    hud.setAttribute("style", `flex:1; min-width: 220px;`);

    const grid = document.createElement("div");
    state.grid = grid;
    grid.setAttribute("aria-label", "Tetris board");
    grid.setAttribute("style", `
      flex:0 0 auto;
      background:${COLORS.GRID_BG};
      border:1px solid ${COLORS.BORDER};
      border-radius:12px;
      padding:10px;
      display:grid;
      grid-template-columns:repeat(${CFG.W}, ${CFG.CELL_W}px);
      grid-auto-rows:${CFG.CELL_H}px;
      gap:${CFG.GAP}px;
    `);

    // cells
    state.cells = [];
    for (let i = 0; i < CFG.W * CFG.H; i++) {
      const c = document.createElement("div");
      c.setAttribute("style", `
        width:${CFG.CELL_W}px;
        height:${CFG.CELL_H}px;
        background:${COLORS.EMPTY};
        border-radius:3px;
      `);
      c.textContent = " ";
      state.cells.push(c);
      grid.appendChild(c);
    }

    wrap.appendChild(grid);
    wrap.appendChild(hud);

    const footer = document.createElement("div");
    footer.setAttribute("style", `
      display:flex; justify-content:space-between; align-items:center;
      margin-top:12px; gap:12px;
    `);

    const left = document.createElement("div");
    left.setAttribute("style", `color:${COLORS.MUTED}; font-size:12px;`);
    left.textContent = "Easter egg, pure JS drop-in";

    const btns = document.createElement("div");
    btns.setAttribute("style", `display:flex; gap:8px;`);

    const mkBtn = (label, onClick) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.setAttribute("style", `
        font-family:${CFG.FONT};
        font-size:12px;
        color:${COLORS.TEXT};
        background:rgba(255,255,255,0.08);
        border:1px solid ${COLORS.BORDER};
        border-radius:10px;
        padding:8px 10px;
        cursor:pointer;
      `);
      b.addEventListener("click", onClick);
      return b;
    };

    btns.appendChild(mkBtn("Restart (R)", () => { resetGame(); root.focus(); }));
    btns.appendChild(mkBtn(state.paused ? "Resume (P)" : "Pause (P)", () => { state.paused = !state.paused; renderDOM(); root.focus(); }));
    btns.appendChild(mkBtn("Close (Esc)", () => API.close()));

    footer.appendChild(left);
    footer.appendChild(btns);

    root.appendChild(wrap);
    root.appendChild(footer);
    backdrop.appendChild(root);

    if (hasDialog) dialog.appendChild(backdrop);
    else dialog.appendChild(backdrop);

    // close on backdrop click (but not when clicking the panel)
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) API.close();
    });

    document.body.appendChild(dialog);
  }

  function ensureModal() {
    if (!state.dialog) buildModal();
  }

  function isTriggerCombo(e, comboStr) {
    // "Ctrl+Shift+T"
    const want = comboStr.toLowerCase().split("+").map(s => s.trim());
    const key = (e.key || "").toLowerCase();
    const needCtrl = want.includes("ctrl");
    const needShift = want.includes("shift");
    const needAlt = want.includes("alt");
    const needMeta = want.includes("meta") || want.includes("cmd");

    const mainKey = want.find(s => !["ctrl", "shift", "alt", "meta", "cmd"].includes(s));
    if (needCtrl && !e.ctrlKey) return false;
    if (needShift && !e.shiftKey) return false;
    if (needAlt && !e.altKey) return false;
    if (needMeta && !e.metaKey) return false;
    if (!mainKey) return false;
    return key === mainKey.toLowerCase();
  }

  function handleKeydown(e) {
    // Easter egg trigger works anytime (unless modal already open)
    if (!state.open) {
      if (state.trigger.type === "combo") {
        if (isTriggerCombo(e, state.trigger.value)) {
          e.preventDefault();
          API.open();
          return;
        }
      } else if (state.trigger.type === "sequence") {
        const ch = (e.key || "").length === 1 ? (e.key || "").toLowerCase() : "";
        if (ch) {
          state.sequenceBuf = (state.sequenceBuf + ch).slice(-32);
          if (state.sequenceBuf.endsWith(state.trigger.value.toLowerCase())) {
            API.open();
          }
        }
      }
      return;
    }

    // When modal is open, capture gameplay keys aggressively so arrows work
    const gameplayKeys = new Set([
      "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
      " ", "Spacebar", "z", "Z", "c", "C", "p", "P", "r", "R", "Escape"
    ]);
    if (gameplayKeys.has(e.key)) e.preventDefault();

    if (e.key === "Escape") { API.close(); return; }
    if (e.key === "p" || e.key === "P") { state.paused = !state.paused; renderDOM(); return; }
    if (e.key === "r" || e.key === "R") { resetGame(); return; }

    if (state.paused || state.over) { renderDOM(); return; }

    if (e.key === "ArrowLeft") move(-1);
    else if (e.key === "ArrowRight") move(1);
    else if (e.key === "ArrowUp") rotate(1);
    else if (e.key === "z" || e.key === "Z") rotate(-1);
    else if (e.key === "ArrowDown") softDrop();
    else if (e.key === " " || e.key === "Spacebar") hardDrop();
    else if (e.key === "c" || e.key === "C") doHold();

    renderDOM();
  }

  API.open = () => {
    ensureModal();
    if (state.open) return;

    state.open = true;
    resetGame();

    const d = state.dialog;
    if (d.tagName.toLowerCase() === "dialog" && typeof d.showModal === "function") d.showModal();
    else d.style.display = "block";

    // focus root so key events are reliable
    setTimeout(() => state.root && state.root.focus(), 0);

    // start loop
    cancelAnimationFrame(state.raf);
    state.raf = requestAnimationFrame(gameLoop);
  };

  API.close = () => {
    if (!state.open) return;
    state.open = false;
    cancelAnimationFrame(state.raf);

    const d = state.dialog;
    if (!d) return;

    if (d.tagName.toLowerCase() === "dialog" && typeof d.close === "function") d.close();
    else d.style.display = "none";
  };

  API.install = (opts = {}) => {
    if (state.installed) return;
    state.installed = true;

    if (opts.trigger) state.trigger = opts.trigger;

    state.keydown = (e) => handleKeydown(e);
    // capture phase is key: it beats DevTools / page handlers more often
    window.addEventListener("keydown", state.keydown, true);

    console.log(
      "%cONE_TETRIS_EGG installed.%c Trigger: " + (state.trigger.type === "combo" ? state.trigger.value : `type "${state.trigger.value}"`) +
      "%c  API: ONE_TETRIS_EGG.open(), .close(), .uninstall()",
      "font-weight:700;",
      "font-weight:700;",
      ""
    );
  };

  API.uninstall = () => {
    if (!state.installed) return;
    state.installed = false;

    window.removeEventListener("keydown", state.keydown, true);
    state.keydown = null;

    API.close();

    if (state.dialog && state.dialog.parentNode) state.dialog.parentNode.removeChild(state.dialog);
    state.dialog = null;
    state.root = null;
    state.grid = null;
    state.cells = [];
    state.hud = null;

    console.log("ONE_TETRIS_EGG uninstalled.");
  };

  // expose
  window.ONE_TETRIS_EGG = API;
})();
