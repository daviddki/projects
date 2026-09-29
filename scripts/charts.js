// Charts for the NAND gate page. Reads simulation results from <script id="nand-data">
// and draws crisp, theme-aware SVG charts (colors come from CSS variables).
(function () {
  const dataEl = document.getElementById("nand-data");
  if (!dataEl) return;
  const D = JSON.parse(dataEl.textContent);
  const NS = "http://www.w3.org/2000/svg";

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function text(parent, x, y, str, cls, anchor) {
    const t = el("text", { x, y, class: cls, "text-anchor": anchor || "start" }, parent);
    t.textContent = str;
    return t;
  }
  const lin = (d0, d1, r0, r1) => (v) => r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
  const fmt = (v, n) => v.toFixed(n);
  const round1 = (v) => (Math.round((v + 1e-9) * 10) / 10).toFixed(1);

  // linear interpolation on a [[t, v], ...] series
  function at(pts, t) {
    let lo = 0, hi = pts.length - 1;
    if (t <= pts[0][0]) return pts[0][1];
    if (t >= pts[hi][0]) return pts[hi][1];
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (pts[mid][0] <= t) lo = mid; else hi = mid;
    }
    const a = pts[lo], b = pts[hi];
    return b[0] === a[0] ? b[1] : a[1] + ((t - a[0]) * (b[1] - a[1])) / (b[0] - a[0]);
  }

  function path(pts, sx, sy) {
    return pts.map((p, i) => (i ? "L" : "M") + sx(p[0]).toFixed(1) + " " + sy(p[1]).toFixed(1)).join("");
  }

  // ---------- tooltip ----------
  function makeTip(host) {
    const tip = document.createElement("div");
    tip.className = "chart-tip";
    tip.hidden = true;
    host.appendChild(tip);
    return {
      show(x, y, head, rows) {
        tip.replaceChildren();
        const h = document.createElement("div");
        h.className = "tip-head";
        h.textContent = head;
        tip.appendChild(h);
        rows.forEach((r) => {
          const row = document.createElement("div");
          row.className = "tip-row" + (r.strong ? " tip-strong" : "");
          if (r.key) {
            const k = document.createElement("i");
            k.className = "tip-key " + r.key;
            row.appendChild(k);
          }
          const v = document.createElement("b");
          v.textContent = r.value;
          const l = document.createElement("span");
          l.textContent = r.label;
          row.appendChild(v);
          row.appendChild(l);
          tip.appendChild(row);
        });
        tip.hidden = false;
        const w = tip.offsetWidth, hostW = host.clientWidth;
        let left = x + 14;
        if (left + w > hostW) left = x - w - 14;
        tip.style.left = Math.max(0, left) + "px";
        tip.style.top = Math.max(0, y) + "px";
      },
      hide() { tip.hidden = true; },
    };
  }

  // ---------- shared hover wiring ----------
  // stops: sorted array of x pixel positions to snap to (or null for continuous), and a callback(xpx)
  function wireHover(host, svg, plot, onMove, onLeave, step) {
    function local(evt) {
      const r = svg.getBoundingClientRect();
      return { x: evt.clientX - r.left, y: evt.clientY - r.top };
    }
    svg.addEventListener("pointermove", (e) => {
      const p = local(e);
      if (p.x < plot.l - 6 || p.x > plot.r + 6) return onLeave();
      onMove(Math.min(plot.r, Math.max(plot.l, p.x)), p.y);
    });
    svg.addEventListener("pointerleave", onLeave);
    host.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        step(e.key === "ArrowRight" ? 1 : -1);
      } else if (e.key === "Escape") onLeave();
    });
    host.addEventListener("blur", onLeave);
  }

  // ---------- 1. waveform (three lanes, shared time axis) ----------
  function drawWaveform(host) {
    const W = Math.max(280, host.clientWidth);
    const laneH = W < 480 ? 64 : 72, gap = 14, top = 6, bottom = 36;
    const left = 44, right = 14;
    const H = top + 3 * laneH + 2 * gap + bottom;
    host.querySelector("svg")?.remove();
    const svg = el("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: "img",
      "aria-label": "Input A, input B and output voltage over 2 nanoseconds. Output is low only in the first 0.5 nanoseconds, when both inputs are high." });
    host.insertBefore(svg, host.firstChild);
    const sx = lin(0, 2, left, W - right);
    const lanes = [
      { key: "A", name: "Input A", cls: "s1", pts: D.waveform.A },
      { key: "B", name: "Input B", cls: "s2", pts: D.waveform.B },
      { key: "Vout", name: "Output", cls: "s3", pts: D.waveform.Vout },
    ];
    const g = el("g", {}, svg);
    lanes.forEach((ln, i) => {
      const y0 = top + i * (laneH + gap);
      ln.sy = lin(-0.15, 1.6, y0 + laneH, y0);
      ln.y0 = y0;
      // lane guides: 0 V and 1 V
      [0, 1].forEach((v) => {
        el("line", { x1: left, x2: W - right, y1: ln.sy(v), y2: ln.sy(v), class: "grid" }, g);
        text(g, left - 8, ln.sy(v) + 4, String(v), "axis-text", "end");
      });
      text(g, left + 6, y0 + 12, ln.name, "lane-name");
    });
    // vertical guides + time axis
    const axisY = top + 3 * laneH + 2 * gap;
    [0, 0.5, 1, 1.5, 2].forEach((t) => {
      el("line", { x1: sx(t), x2: sx(t), y1: top, y2: axisY, class: "grid grid-v" }, g);
      text(g, sx(t), axisY + 16, String(t), "axis-text", t === 0 ? "start" : t === 2 ? "end" : "middle");
    });
    text(g, (left + W - right) / 2, axisY + 32, "Time (ns)", "axis-title", "middle");
    text(g, 0, top + 12, "V", "axis-title");
    lanes.forEach((ln) => el("path", { d: path(ln.pts, sx, ln.sy), class: "ln " + ln.cls }, svg));

    // hover layer
    const cross = el("line", { y1: top, y2: axisY, class: "crosshair", visibility: "hidden" }, svg);
    const dots = lanes.map((ln) => el("circle", { r: 4, class: "hover-dot " + ln.cls, visibility: "hidden" }, svg));
    const tip = host._tip || (host._tip = makeTip(host));
    let cursor = 0.5;
    function show(t, ypx) {
      cursor = t;
      const x = sx(t);
      cross.setAttribute("x1", x); cross.setAttribute("x2", x); cross.setAttribute("visibility", "visible");
      const rows = lanes.map((ln, i) => {
        const v = at(ln.pts, t);
        dots[i].setAttribute("cx", x); dots[i].setAttribute("cy", ln.sy(v)); dots[i].setAttribute("visibility", "visible");
        return { key: ln.cls, value: fmt(v, 2) + " V", label: ln.name };
      });
      tip.show(x, ypx == null ? top + 8 : Math.min(ypx, H - 90), "t = " + fmt(t, 2) + " ns", rows);
    }
    function hide() {
      cross.setAttribute("visibility", "hidden");
      dots.forEach((d) => d.setAttribute("visibility", "hidden"));
      tip.hide();
    }
    const plot = { l: left, r: W - right };
    wireHover(host, svg, plot,
      (xpx, ypx) => show(Math.round(((xpx - left) / (W - right - left)) * 2 * 100) / 100, ypx),
      hide,
      (dir) => show(Math.min(2, Math.max(0, Math.round((cursor + dir * 0.05) * 100) / 100))));
  }

  // ---------- 2 & 3. delay line charts ----------
  function drawDelay(host, cfg) {
    const W = Math.max(260, host.clientWidth), H = 250;
    const m = { l: 44, r: 22, t: 16, b: 44 };
    host.querySelector("svg")?.remove();
    const svg = el("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": cfg.aria });
    host.insertBefore(svg, host.firstChild);
    const rows = cfg.rows;
    const sx = lin(cfg.x0, cfg.x1, m.l, W - m.r), sy = lin(4, 9, H - m.b, m.t);
    const g = el("g", {}, svg);
    for (let v = 4; v <= 9; v++) {
      el("line", { x1: m.l, x2: W - m.r, y1: sy(v), y2: sy(v), class: "grid" }, g);
      text(g, m.l - 8, sy(v) + 4, String(v), "axis-text", "end");
    }
    text(g, 0, m.t - 4, "ps", "axis-title");
    cfg.ticks.forEach((t, i) => {
      text(g, sx(t), H - m.b + 18, cfg.tickLabel(t), "axis-text",
        i === 0 ? "start" : i === cfg.ticks.length - 1 ? "end" : "middle");
    });
    text(g, (m.l + W - m.r) / 2, H - 6, cfg.xTitle, "axis-title", "middle");

    const pts = rows.map((r) => [cfg[cfg.xKey](r), r.avg]);
    el("path", { d: path(pts, sx, sy), class: "ln s1" }, svg);
    // end dots + direct labels at the ends
    [0, rows.length - 1].forEach((i, k) => {
      const [x, y] = [sx(pts[i][0]), sy(pts[i][1])];
      el("circle", { cx: x, cy: y, r: 4, class: "dot s1" }, svg);
      const below = k === 0 ? cfg.firstLabelBelow : cfg.lastLabelBelow;
      text(svg, k === 0 ? x + 2 : x - 2, y + (below ? 24 : -12), round1(pts[i][1]) + " ps", "end-label", k === 0 ? "start" : "end");
    });
    if (cfg.markAll) pts.slice(1, -1).forEach((p) => el("circle", { cx: sx(p[0]), cy: sy(p[1]), r: 4, class: "dot s1" }, svg));

    const cross = el("line", { y1: m.t, y2: H - m.b, class: "crosshair", visibility: "hidden" }, svg);
    const hdot = el("circle", { r: 5, class: "hover-dot s1", visibility: "hidden" }, svg);
    const tip = host._tip || (host._tip = makeTip(host));
    let idx = 0;
    function show(i, ypx) {
      idx = Math.max(0, Math.min(rows.length - 1, i));
      const r = rows[idx], x = sx(pts[idx][0]);
      cross.setAttribute("x1", x); cross.setAttribute("x2", x); cross.setAttribute("visibility", "visible");
      hdot.setAttribute("cx", x); hdot.setAttribute("cy", sy(r.avg)); hdot.setAttribute("visibility", "visible");
      tip.show(x, ypx == null ? m.t : Math.min(ypx, H - 100), cfg.head(r), [
        { key: "s1", value: fmt(r.avg, 2) + " ps", label: "Delay (average)", strong: true },
        { value: fmt(r.tpHL, 2) + " ps", label: "tpHL" },
        { value: fmt(r.tpLH, 2) + " ps", label: "tpLH" },
      ]);
    }
    function hide() { cross.setAttribute("visibility", "hidden"); hdot.setAttribute("visibility", "hidden"); tip.hide(); }
    const nearest = (xpx) => {
      let best = 0, bd = 1e9;
      pts.forEach((p, i) => { const d = Math.abs(sx(p[0]) - xpx); if (d < bd) { bd = d; best = i; } });
      return best;
    };
    wireHover(host, svg, { l: m.l, r: W - m.r }, (xpx, ypx) => show(nearest(xpx), ypx), hide, (dir) => show(idx + dir));
  }

  const draw = {
    waveform: drawWaveform,
    supply: (h) => drawDelay(h, {
      rows: D.supply, xKey: "vdd", vdd: (r) => r.vdd, x0: 0.8, x1: 1.2, ticks: [0.8, 0.9, 1.0, 1.1, 1.2],
      tickLabel: (t) => t.toFixed(1), xTitle: "Supply voltage, VDD (V)", markAll: true, lastLabelBelow: true,
      head: (r) => "VDD = " + r.vdd.toFixed(2) + " V",
      aria: "Propagation delay falls from 8.1 picoseconds at 0.8 volts to 4.9 picoseconds at 1.2 volts, flattening as supply voltage rises.",
    }),
    temp: (h) => drawDelay(h, {
      rows: D.temp, xKey: "tc", tc: (r) => r.t, x0: 0, x1: 90, ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90],
      tickLabel: (t) => String(t), xTitle: "Temperature (°C)",
      head: (r) => "T = " + r.t.toFixed(0) + " °C",
      aria: "Propagation delay rises almost linearly from 4.9 picoseconds at 0 degrees Celsius to 8.9 picoseconds at 90 degrees Celsius.",
    }),
  };

  const hosts = Array.from(document.querySelectorAll(".chart[data-chart]"));
  function renderAll() { hosts.forEach((h) => draw[h.dataset.chart](h)); }
  renderAll();
  let raf = null, lastW = hosts.map((h) => h.clientWidth).join();
  new ResizeObserver(() => {
    const w = hosts.map((h) => h.clientWidth).join();
    if (w === lastW) return;
    lastW = w;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(renderAll);
  }).observe(document.body);
})();
