(() => {
  // Every word about the demos comes from content.json, placed in the page by build.mjs.
  const { site, projects: P } = JSON.parse(document.getElementById("data").textContent);
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const N = P.length, STEP = 360 / N, GAP = 306, ROW = 18;
  const $ = (id) => document.getElementById(id);
  const app = $("app"), stage = $("stage"), ring = $("ring"), frame = $("frame"), names = $("names"), caption = $("caption"),
    count = $("count").firstElementChild, track = $("track"), pct = $("pct"), cta = $("cta"), ctaAlt = $("ctaAlt"), talk = $("talk"), menu = $("menu");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(pointer: coarse)").matches;
  const phone = () => innerWidth <= 780;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mod = (v, n) => ((v % n) + n) % n;
  const idx = (i) => "D" + String(i + 1).padStart(3, "0");
  const cardHtml = (p, i) => `<span>For ${esc(p.for)}</span><i>${i + 1}</i><img src="shots/${esc(p.id)}-thumb.jpg" alt="${esc(p.alt)}" draggable="false">`;

  const cards = [], lis = [], nameBtns = [];
  let hover = -1, wheeling = false;
  P.forEach((p, i) => {
    const a = document.createElement("a");
    a.className = "card"; a.href = "#" + p.id; a.draggable = false;
    a.style.setProperty("--c", p.color); a.style.setProperty("--on", p.on);
    a.innerHTML = cardHtml(p, i);
    a.addEventListener("click", (e) => { e.preventDefault(); if (moved > 6) return; i === active ? openCase(i) : goTo(i); });
    a.addEventListener("mouseenter", () => (hover = i)); a.addEventListener("mouseleave", () => { if (hover === i) hover = -1; });
    ring.appendChild(a); cards.push(a);
    const li = document.createElement("li"), b = document.createElement("button");
    b.textContent = p.name; b.addEventListener("click", () => (i === active ? openCase(i) : goTo(i)));
    li.appendChild(b); names.appendChild(li); lis.push(li); nameBtns.push(b);
  });
  // the same six tiles again, as a plain grid on the pages
  const gridHtml = (label) => P.map((p, i) => `<a href="#${esc(p.id)}" data-open="${i}"><span class="card" style="--c:${esc(p.color)};--on:${esc(p.on)}">${cardHtml(p, i)}</span>${label ? `${idx(i)}<span>${esc(p.name)}</span>` : ""}</a>`).join("");
  document.querySelector("[data-grid]").innerHTML = gridHtml(true);
  document.querySelector("[data-mosaic]").innerHTML = P.map((p, i) => `<a class="card" href="#${esc(p.id)}" data-open="${i}" style="--c:${esc(p.color)};--on:${esc(p.on)}">${cardHtml(p, i)}</a>`).join("");
  $("limits").innerHTML = P.map((p) => `<li><b>${esc(p.name)}.</b> ${esc(p.note)}</li>`).join("");
  document.querySelectorAll("[data-foot]").forEach((el) => {
    const here = el.dataset.foot, links = [["about", "About"], ["built", "How they are built"], ["contact", "Contact"]].filter((l) => l[0] !== here);
    el.innerHTML = `
      <div class="more"><h3 class="up" style="font-size:12px;font-weight:400">Find out more</h3>
        <ul><li><button data-go="home">The six demos</button></li>${links.map((l) => `<li><button data-go="${l[0]}">${l[1]}</button></li>`).join("")}</ul>
        <div class="say"><h3 class="up" style="font-size:12px;font-weight:400">Want something like this for your office?</h3><a class="btn solid" href="mailto:${esc(site.email)}">Write to me</a></div></div>
      <p class="big" aria-hidden="true">Hayden Huelskamp</p>
      <div class="pfoot"><p>© 2026 Hayden Huelskamp<br>Demonstration builds, not client work</p><p>Interested in working together?<br><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>
        <p><a href="${esc(site.linkedin)}" target="_blank" rel="noopener">LinkedIn</a><a href="${esc(site.github)}" target="_blank" rel="noopener">GitHub</a></p></div>`;
  });

  // pos: which card faces front, as a float. vel: wheel and fling momentum. aim: a card being eased to.
  let mode = "ring", pos = 0, vel = 0, aim = null, last = 0, lean = 0, tilt = 0, open = still ? 1 : 0, openTo = still ? 1 : 0, active = -1;
  let R = 640, scale = 1, dragging = false, moved = 0, startX = 0, startY = 0, startPos = 0, startTilt = 0, view = "home";

  function fit() {
    const w = innerWidth, h = innerHeight;
    R = phone() ? 300 : 640;
    let s = phone() ? clamp(w / 628, .44, .7) : w > 1440 ? Math.min(1.3, w / 1440) : 1;
    scale = Math.min(s, (w * 1.02) / (1.08 * R + 300), (h * .5) / 300);
    stage.style.setProperty("--rs", scale.toFixed(4));
    stage.style.setProperty("--cap", Math.round(150 * scale + (phone() ? 34 : 44)) + "px");
    $("hint").textContent = phone() ? "Swipe to explore" : "© 2026 Hayden Huelskamp. Demonstration builds";
    if (phone() && mode !== "ring") setMode("ring");
    lines(); sizeCase();
  }
  function goTo(i) {
    const from = aim === null ? Math.round(pos) : aim;
    let d = mod(i - from, N); if (d > N / 2) d -= N;
    aim = from + d; vel = 0;
  }
  function setMode(m) {
    mode = m; stage.classList.toggle("is-list", m === "list"); stage.classList.toggle("is-slider", m === "slider");
    ["Ring", "List", "Slider"].forEach((k) => $("mode" + k).classList.toggle("is-on", m === k.toLowerCase()));
    cards.forEach((c) => (c.lastElementChild.style.transform = ""));
    vel = 0; lean = 0; tilt = 0; aim = Math.round(pos);
    stage.classList.add("is-switch"); clearTimeout(setMode.t); setMode.t = setTimeout(() => stage.classList.remove("is-switch"), 940);
  }

  function tick() {
    if (!dragging) {
      if (aim !== null) { pos += (aim - pos) * (mode === "ring" ? .1 : .075); if (Math.abs(aim - pos) < .0005 && !wheeling) { pos = aim; aim = null; } }
      else { pos += vel; vel *= .93; if (Math.abs(vel) < .02) pos += (Math.round(pos) - pos) * .06; }
      tilt += (0 - tilt) * .08;
    }
    open += (openTo - open) * .05;
    const dv = pos - last; last = pos; lean += (dv - lean) * .25;
    const skew = clamp(lean * 50, -20, 20), squeeze = 1 - Math.min(Math.abs(lean) * 1.4, .14);
    ring.style.transform = mode === "ring" ? `translateZ(${-R * open}px) rotateX(${tilt.toFixed(2)}deg)` : "";
    for (let i = 0; i < N; i++) {
      let d = i - pos; d -= N * Math.round(d / N);
      const c = cards[i], img = c.lastElementChild;
      if (mode === "ring") {
        const ang = d * STEP, flip = Math.abs(ang) > 90 ? " scaleX(-1)" : "";
        c.style.transform = `rotateY(${ang}deg) translateZ(${R * open}px) scale(${squeeze * (.06 + .94 * open)}) skewX(${skew}deg)${flip}`;
        c.style.opacity = 1; c.style.zIndex = "";
      } else if (mode === "slider") {
        c.style.transform = `translateX(${d * GAP}px)`; c.style.opacity = 1; c.style.zIndex = "";
        img.style.transform = `translateX(${clamp(-d * GAP * .04, -8, 8).toFixed(1)}px)`;
      } else {
        c.style.transform = `translateY(${d * GAP}px)`;
        c.style.opacity = clamp(1 - Math.max(0, Math.abs(d) - 2.4) * .55, .12, 1);
        c.style.zIndex = String(100 - Math.round(Math.abs(d) * 10));
        img.style.transform = `translateY(${clamp(-d * GAP * .04, -8, 8).toFixed(1)}px)`;
      }
      // the name list rolls with the tiles and wraps round
      let l = (i - pos) * ROW; l -= N * ROW * Math.round(l / (N * ROW));
      const u = Math.abs(l), m = clamp(1 - u / (ROW / 2), 0, 1), edge = clamp(((N * ROW) / 2 - u) / (ROW / 2), 0, 1);
      lis[i].style.transform = `translateY(${l.toFixed(1)}px)`; lis[i].style.opacity = ((.32 + .68 * m) * edge).toFixed(3);
    }
    const now = mod(Math.round(pos), N);
    frame.classList.toggle("is-hot", hover === now);
    frame.classList.toggle("is-moving", Math.abs(dv) > .004);
    if (now !== active) {
      active = now; const p = P[now];
      nameBtns.forEach((b, i) => b.classList.toggle("is-on", i === now));
      caption.innerHTML = `<b>${esc(p.name)}</b><span>For ${esc(p.for)}</span><em>${coarse || phone() ? "Swipe to turn. Tap the card to open it" : "Scroll or drag to turn. Click the card to open it"}</em>`;
      $("m1").firstElementChild.textContent = p.cat; $("m2").firstElementChild.textContent = p.kind; $("m3").firstElementChild.textContent = idx(now);
      $("sIdx").textContent = idx(now); $("sName").textContent = p.name;
      if (!app.classList.contains("booting")) count.textContent = `${now + 1} / ${N}`;
    }
    caseTick();
    requestAnimationFrame(tick);
  }

  // The opening paragraph is cut into its real lines so each can rise on its own.
  const introEl = $("intro"), introSrc = [...introEl.childNodes].map((n) => ({ strong: n.nodeType === 1, text: n.textContent }));
  function lines() {
    introEl.innerHTML = introSrc.map((part) => part.text.split(/\s+/).filter(Boolean).map((w) => `<span class="w${part.strong ? " s" : ""}">${w}</span>`).join(" ")).join(" ");
    const rows = []; let top = null;
    introEl.querySelectorAll(".w").forEach((w) => { if (top === null || Math.abs(w.offsetTop - top) > 4) { rows.push([]); top = w.offsetTop; } rows[rows.length - 1].push(w); });
    introEl.innerHTML = "";
    rows.forEach((row, i) => {
      const out = document.createElement("span"), inn = document.createElement("span");
      out.className = "iline"; inn.style.transitionDelay = i * .09 + "s";
      row.forEach((w, j) => { inn.appendChild(w); if (j < row.length - 1) inn.appendChild(document.createTextNode(" ")); });
      out.appendChild(inn); introEl.appendChild(out);
    });
  }

  // The opening: a count, then the cards leave the centre and take their places.
  function boot() {
    if (still) { app.classList.remove("booting"); count.textContent = `1 / ${N}`; return; }
    const t0 = performance.now(), run = 1500;
    (function step(t) {
      const k = clamp((t - t0) / run, 0, 1); count.textContent = Math.round(k * 100) + "%";
      if (k < 1) return requestAnimationFrame(step);
      openTo = 1; setTimeout(() => { app.classList.remove("booting"); count.textContent = `${active + 1} / ${N}`; }, 500);
    })(t0);
  }

  // ----- views: home, one demo's case strip, or a page -----
  function show(v) {
    view = v; setMenu(false);
    if (v !== "case") mark(v === "home" ? "" : v);
    app.classList.toggle("is-sub", v !== "home"); app.classList.toggle("is-case", v === "case"); app.classList.toggle("is-page", v !== "home" && v !== "case");
    ["case", "about", "built", "contact"].forEach((id) => $(id).classList.toggle("is-open", id === v));
    if (v !== "home" && v !== "case") $(v).scrollTop = 0;
    menu.querySelectorAll("[data-go]").forEach((b) => b.classList.toggle("is-here", b.dataset.go === v));
  }
  // the case strip: words and screens on one long row that the wheel pulls sideways
  let cx = 0, cAim = 0, cMax = 0, current = 0, over = 0, busy = false;
  function openCase(i) {
    const p = P[i], next = P[(i + 1) % N]; current = i; over = 0;
    track.innerHTML = `
      <div class="words"><p class="for">For ${esc(p.for)}</p><h2>${esc(p.name)}</h2><p class="pitch">${esc(p.pitch)}</p>${p.demo ? `<p class="code-phone"><a href="${esc(p.code)}" target="_blank" rel="noopener">See the code</a></p>` : ""}</div>
      <div class="try"><h3>${esc(p.tryTitle || "Three things to try")}</h3><ol>${p.try.map((t) => `<li>${esc(t)}</li>`).join("")}</ol><p class="note">${esc(p.note)}</p></div>
      ${[1, 2, 3, 4].map((n) => `<figure class="tile" style="--c:${esc(p.color)}"><img src="shots/${esc(p.id)}-${n}.jpg" alt="${esc(n === 1 ? p.alt : `${p.name}, screen ${n}`)}" draggable="false"></figure>`).join("")}
      <a class="next" href="#${esc(next.id)}" id="nextLink"><span>${coarse ? "Next demo" : "Scroll down for the next demo"}</span>${esc(next.name)}</a>`;
    $("nextLink").addEventListener("click", (e) => { e.preventDefault(); if (moved <= 6) hop(1); });
    track.querySelectorAll("img").forEach((img) => img.addEventListener("load", sizeCase));
    cx = cAim = 0; $("case").scrollTop = 0;
    cta.textContent = p.demo ? "Open the demo" : "See the code and screenshots"; cta.href = p.demo || p.code;
    ctaAlt.href = p.code; ctaAlt.style.display = p.demo ? "" : "none";
    pos = aim = i; vel = 0;
    show("case"); mark(p.id); sizeCase();
  }
  // leave this demo for the one before or after it
  function mark(hash) { try { history.replaceState(null, "", hash ? "#" + hash : location.pathname + location.search); } catch {} }
  function fromHash() {
    const h = location.hash.slice(1), i = P.findIndex((p) => p.id === h);
    if (i >= 0) openCase(i); else if (["about", "built", "contact"].includes(h)) show(h); else if (view !== "home") show("home");
  }
  function hop(dir) {
    if (busy) return; busy = true; const to = mod(current + dir, N);
    show("home"); setTimeout(() => { busy = false; openCase(to); }, 620);
  }
  function sizeCase() { cMax = Math.max(0, track.scrollWidth - innerWidth); cAim = clamp(cAim, 0, cMax); }
  function caseTick() {
    if (view !== "case" || phone()) return;
    cx += (cAim - cx) * (dragging ? 1 : .12);
    track.style.transform = `translateX(${-cx.toFixed(1)}px)`;
    pct.textContent = (cMax ? Math.round((cx / cMax) * 100) : 0) + "%";
    over *= .94; $("pull").style.transform = `scaleX(${clamp(Math.abs(over) / 420, 0, 1).toFixed(3)})`;
  }

  // ----- menu, clock and the contact panel -----
  function setMenu(on) { menu.classList.toggle("is-open", on); menu.setAttribute("aria-hidden", String(!on)); $("menuBtn").setAttribute("aria-expanded", String(on)); }
  function clock() {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Denver", hour12: false, weekday: "long", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(new Date());
    const g = (t) => (parts.find((x) => x.type === t) || {}).value || "";
    const s = `${g("weekday")} ${g("hour")}:${g("minute")}:${g("second")}`; $("clock").textContent = s; $("clock2").textContent = s;
  }
  clock(); setInterval(clock, 1000);
  let talkOpen = false, talkBusy = false;
  function setTalk(on) {
    if (talkBusy || on === talkOpen) return; talkBusy = true; talkOpen = on; talk.setAttribute("aria-expanded", String(on)); setMenu(false);
    talk.classList.remove("is-open"); talk.classList.add("is-square");
    setTimeout(() => { talk.classList.remove("is-square"); talk.classList.toggle("is-open", on); talkBusy = false; }, still ? 0 : 420);
  }
  talk.addEventListener("click", () => setTalk(true));
  talk.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target === talk) { e.preventDefault(); setTalk(true); } });
  $("talkX").addEventListener("click", (e) => { e.stopPropagation(); setTalk(false); });
  $("copy").addEventListener("click", (e) => {
    const b = e.currentTarget, done = () => { b.textContent = "Copied"; setTimeout(() => (b.textContent = "Copy address"), 1600); };
    try { navigator.clipboard.writeText(site.email).then(done, () => (b.textContent = "Select the address above")); } catch { b.textContent = "Select the address above"; }
  });
  document.addEventListener("click", (e) => {
    if (talkOpen && !talk.contains(e.target) && e.target.id !== "contactBtn") setTalk(false);
    if (menu.classList.contains("is-open") && !menu.contains(e.target) && e.target.id !== "menuBtn") setMenu(false);
    const go = e.target.closest("[data-go]"); if (go) show(go.dataset.go);
    const op = e.target.closest("[data-open]"); if (op) { e.preventDefault(); const i = +op.dataset.open; show("home"); setTimeout(() => openCase(i), 620); }
  });
  $("menuBtn").addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  $("menuX").addEventListener("click", () => setMenu(false));
  $("contactBtn").addEventListener("click", () => setTalk(!talkOpen));

  // ----- input -----
  const inPanel = (t) => t.closest && t.closest(".talk, .menu");
  addEventListener("wheel", (e) => {
    if (inPanel(e.target) || (view !== "home" && view !== "case") || (view === "case" && phone())) return;
    e.preventDefault();
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (view === "case") {
      // pushing on past either end of the strip carries on to the neighbouring demo
      if ((cAim >= cMax - 1 && d > 0) || (cAim <= 1 && d < 0)) { over += d; if (Math.abs(over) > 420) { const dir = Math.sign(over); over = 0; hop(dir); } }
      else over = 0;
      cAim = clamp(cAim + d * 1.1, 0, cMax); return;
    }
    if (mode === "ring") { aim = null; vel += d * .0003; }
    else {
      // the wheel moves a target and the tiles glide after it, so a notched wheel does not step
      const px = e.deltaMode === 1 ? d * 32 : d;
      aim = (aim === null ? pos : aim) + clamp(px, -160, 160) * .0016; wheeling = true;
      clearTimeout(tick.snap); tick.snap = setTimeout(() => { wheeling = false; aim = Math.round(aim === null ? pos : aim); }, 140);
    }
  }, { passive: false });
  addEventListener("pointerdown", (e) => {
    moved = 0;
    if ((view !== "home" && view !== "case") || e.target.closest("button, .head, .talk, .menu, .demo-cta, .cta-alt")) return;
    if (view === "case" && phone()) return;
    dragging = true; aim = null; vel = 0; startX = e.clientX; startY = e.clientY; startPos = view === "case" ? cAim : pos; startTilt = tilt; stage.classList.add("is-drag");
  });
  addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX, dy = e.clientY - startY; moved = Math.max(moved, Math.abs(dx), Math.abs(dy));
    if (view === "case") { cAim = cx = clamp(startPos - dx, 0, cMax); return; }
    const to = mode === "list" ? startPos - dy / (GAP * scale) : startPos - dx / ((mode === "ring" ? 275 : GAP) * scale);
    if (mode === "ring") tilt = clamp(startTilt + (dy / scale) * .18, -12, 12);
    vel = to - pos; pos = to;
  });
  const drop = () => { if (!dragging) return; dragging = false; stage.classList.remove("is-drag"); if (mode !== "ring" && view === "home") { vel = 0; aim = Math.round(pos); } };
  addEventListener("pointerup", drop); addEventListener("pointercancel", drop);
  addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Escape") { if (talkOpen) return setTalk(false); if (menu.classList.contains("is-open")) return setMenu(false); if (view !== "home") return show("home"); }
    const d = { ArrowRight: 1, ArrowDown: 1, PageDown: 1, ArrowLeft: -1, ArrowUp: -1, PageUp: -1 }[e.key];
    if (!d || talkOpen || (view !== "home" && view !== "case")) return;
    e.preventDefault();
    if (view === "case") cAim = clamp(cAim + d * 420, 0, cMax); else { aim = (aim === null ? Math.round(pos) : aim) + d; vel = 0; }
  });
  $("modeRing").addEventListener("click", () => setMode("ring"));
  $("modeList").addEventListener("click", () => setMode("list"));
  $("modeSlider").addEventListener("click", () => setMode("slider"));
  $("back").addEventListener("click", () => show("home"));
  $("brand").addEventListener("click", (e) => { e.preventDefault(); show("home"); });
  addEventListener("resize", fit);

  fit(); requestAnimationFrame(tick);
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => { lines(); boot(); if (location.hash) fromHash(); });
  addEventListener("hashchange", fromHash);
})();
