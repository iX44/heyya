/* ==========
  
========== */
const DATA = {
  profile: {
    bio: "sorry if i hurt you",
    location: "Vung Tau",
    stats: { likes: 3636, views: 363636 },
  },

  skills: [
    { label: "JS", sub: "JavaScript", icon: "fa-brands fa-js" },
    { label: "TS", sub: "TypeScript", icon: "fa-solid fa-code" },
    { label: "Node", sub: "Backend", icon: "fa-brands fa-node-js" },
    { label: "React", sub: "UI", icon: "fa-brands fa-react" },
    { label: "Git", sub: "VCS", icon: "fa-brands fa-git-alt" },
    { label: "Docker", sub: "DevOps", icon: "fa-brands fa-docker" },
  ],

  games: [
    { label: "Valorant", sub: "LFT iX4#3004", icon: "fa-solid fa-crosshairs" },
    { label: "TFT", sub: "iX4#3004", icon: "fa-solid fa-chess" },
    { label: "LOL", sub: "iX4#3004", icon: "fa-solid fa-crown" },
    { label: "CS2", sub: "iXa", icon: "fa-solid fa-bullseye" },
  ],

  social: [
    { label: "Facebook", sub: "profile", icon: "fa-brands fa-facebook", href: "https://www.facebook.com/ix4444" },
    { label: "Instagram", sub: "@ix4", icon: "fa-brands fa-instagram", href: "https://www.instagram.com/hdddanh/" },
    { label: "GitHub", sub: "@ix4", icon: "fa-brands fa-github", href: "https://github.com/iX44" },
    { label: "Discord", sub: "server", icon: "fa-brands fa-discord", href: "https://discord.gg/QRuUd8UXbV" },
    { label: "Spotify", sub: "playlist", icon: "fa-brands fa-spotify", href: "https://open.spotify.com/user/31i65lfz6hceufh55kurta4doe4i?si=8972f504a68d41d1" },
  ],

  gear: [
    { k: "CPU", v: "i7 12th" },
    { k: "GPU", v: "RTX" },
    { k: "RAM", v: "32GB" },
    { k: "Mouse", v: "G304" },
    { k: "Keyboard", v: "Custom" },
    { k: "Headset", v: "Razer" },
  ],

  tracks: [
    { title: "thap drill tu do", artist: "MCK", src: "./assets/music/thapdrilltudo.mp3", cover: "./assets/cover.jpg" },
    { title: "Nguoi Dau Tien", artist: "iX4", src: "./assets/music/nguoidautien.mp3", cover: "./assets/cover.jpg" },
  ],
};

/* ==========
  HELPERS
========== */
const $ = (sel) => document.querySelector(sel);

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec <= 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function paintRange(range) {
  const min = Number(range.min || 0);
  const max = Number(range.max || 100);
  const val = Number(range.value || 0);
  const pct = ((val - min) / (max - min)) * 100;
  range.style.background = `linear-gradient(90deg,
    rgba(255,255,255,.95) ${pct}%,
    rgba(255,255,255,.20) ${pct}%)`;
}

function makeTile({ label, sub, icon, href }) {
  const el = href ? document.createElement("a") : document.createElement("div");
  el.className = "iconTile";
  if (href) {
    el.href = href;
    el.target = "_blank";
    el.rel = "noreferrer";
  }
  el.innerHTML = `
    <div class="iconTile__ic"><i class="${icon}"></i></div>
    <div>
      <div class="iconTile__label">${label}</div>
      <div class="iconTile__sub">${sub ?? ""}</div>
    </div>
  `;
  return el;
}

/* ==========
  INIT CONTENT
========== */
function initContent() {
  $("#bioLine").textContent = DATA.profile.bio;
  $("#locLine").textContent = DATA.profile.location;

  $("#statLikes").textContent = DATA.profile.stats.likes.toLocaleString("en-US");
  $("#statViews").textContent = DATA.profile.stats.views.toLocaleString("en-US");

  const skillsGrid = $("#skillsGrid");
  skillsGrid.innerHTML = "";
  DATA.skills.forEach((s) => skillsGrid.appendChild(makeTile(s)));

  const gamesGrid = $("#gamesGrid");
  gamesGrid.innerHTML = "";
  DATA.games.forEach((g) => gamesGrid.appendChild(makeTile(g)));

  const socialGrid = $("#socialGrid");
  socialGrid.innerHTML = "";
  DATA.social.forEach((s) => socialGrid.appendChild(makeTile(s)));

  const gearList = $("#gearList");
  gearList.innerHTML = "";
  DATA.gear.forEach((row) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="k">${row.k}</span><span class="v">${row.v}</span>`;
    gearList.appendChild(li);
  });
}

/* ==========
  SUBTLE GLOW TOGGLE
========== */
function initGlowToggle() {
  $("#btnGlow").addEventListener("click", () => {
    document.body.classList.toggle("subtle-glow");
  });
}

/* ==========
  MUSIC PLAYER (no volume/loop/mute)
========== */
function initPlayer() {
  const audio = $("#audio");
  const viz = $("#viz");
  const ctx = viz.getContext("2d", { alpha: true });

  const btnPlay = $("#btnPlay");
  const btnPrev = $("#btnPrev");
  const btnNext = $("#btnNext");

  const titleEl = $("#trackTitle");
  const artistEl = $("#trackArtist");
  const coverImg = $("#coverImg");

  const curTime = $("#curTime");
  const durTime = $("#durTime");
  const progress = $("#progress");

  let idx = 0;
  let isSeeking = false;

  let audioCtx = null;
  let analyser = null;
  let srcNode = null;
  let freqData = null;

  function ensureAudioGraph() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.86;
    freqData = new Uint8Array(analyser.frequencyBinCount);

    srcNode = audioCtx.createMediaElementSource(audio);
    srcNode.connect(analyser);
    analyser.connect(audioCtx.destination);
  }

  function setPlayState(isPlaying) {
    btnPlay.innerHTML = isPlaying
      ? `<i class="fa-solid fa-pause"></i>`
      : `<i class="fa-solid fa-play"></i>`;
  }

  function loadTrack(i, autoplay = false) {
    idx = (i + DATA.tracks.length) % DATA.tracks.length;
    const t = DATA.tracks[idx];

    titleEl.textContent = t.title;
    artistEl.textContent = t.artist;
    coverImg.src = t.cover;

    audio.src = t.src;
    audio.load();

    if (autoplay) {
      audio.play().then(() => setPlayState(true)).catch(() => {});
    } else {
      setPlayState(false);
    }
  }

  btnPlay.addEventListener("click", async () => {
    ensureAudioGraph();
    if (audioCtx && audioCtx.state === "suspended") await audioCtx.resume();

    if (audio.paused) {
      audio.play().then(() => setPlayState(true)).catch(() => {});
    } else {
      audio.pause();
      setPlayState(false);
    }
  });

  btnPrev.addEventListener("click", () => loadTrack(idx - 1, true));
  btnNext.addEventListener("click", () => loadTrack(idx + 1, true));

  audio.addEventListener("loadedmetadata", () => {
    durTime.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    curTime.textContent = formatTime(audio.currentTime);
    if (!isSeeking && Number.isFinite(audio.duration) && audio.duration > 0) {
      const v = Math.floor((audio.currentTime / audio.duration) * 1000);
      progress.value = String(clamp(v, 0, 1000));
      paintRange(progress);
    }
  });

  progress.addEventListener("input", () => {
    isSeeking = true;
    paintRange(progress);
  });

  progress.addEventListener("change", () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = (Number(progress.value) / 1000) * audio.duration;
    }
    isSeeking = false;
  });

  audio.addEventListener("ended", () => loadTrack(idx + 1, true));

  function roundRect(c, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + rr, y);
    c.arcTo(x + w, y, x + w, y + h, rr);
    c.arcTo(x + w, y + h, x, y + h, rr);
    c.arcTo(x, y + h, x, y, rr);
    c.arcTo(x, y, x + w, y, rr);
    c.closePath();
  }

  function resizeViz() {
    const rect = viz.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    viz.width = Math.floor(rect.width * dpr);
    viz.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawViz() {
    const w = viz.getBoundingClientRect().width;
    const h = viz.getBoundingClientRect().height;

    ctx.clearRect(0, 0, w, h);

    ctx.globalAlpha = 0.16;
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(0, h - 2, w, 2);
    ctx.globalAlpha = 1;

    if (!analyser || !freqData || audio.paused) {
      requestAnimationFrame(drawViz);
      return;
    }

    analyser.getByteFrequencyData(freqData);

    const bars = 52;
    const step = Math.floor(freqData.length / bars);
    const gap = 8;
    const barW = (w - gap * (bars + 1)) / bars;

    ctx.fillStyle = "rgba(255,255,255,0.92)";

    for (let i = 0; i < bars; i++) {
      const v = freqData[i * step] / 255;
      const barH = Math.max(6, v * (h - 22));
      const x = gap + i * (barW + gap);
      const y = h - barH - 8;

      roundRect(ctx, x, y, barW, barH, 10);
      ctx.fill();
    }

    requestAnimationFrame(drawViz);
  }

  window.addEventListener("resize", () => resizeViz());

  paintRange(progress);
  resizeViz();
  loadTrack(0, false);
  requestAnimationFrame(drawViz);
}

/* ==========
  SNOW
========== */
function initSnow() {
  const canvas = $("#snow");
  const ctx = canvas.getContext("2d");

  const flakes = [];
  const N = 140;

  function resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function seed() {
    flakes.length = 0;
    for (let i = 0; i < N; i++) {
      flakes.push({
        x: rand(0, window.innerWidth),
        y: rand(-window.innerHeight, window.innerHeight),
        r: rand(0.8, 2.1),
        s: rand(0.6, 1.9),
        a: rand(0.25, 0.70),
        w: rand(-0.55, 0.55),
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const f of flakes) {
      f.y += f.s;
      f.x += f.w + Math.sin((f.y / 90) * 0.9) * 0.30;

      if (f.y > window.innerHeight + 10) { f.y = -10; f.x = rand(0, window.innerWidth); }
      if (f.x < -10) f.x = window.innerWidth + 10;
      if (f.x > window.innerWidth + 10) f.x = -10;

      ctx.globalAlpha = f.a;
      ctx.beginPath();
      ctx.fillStyle = "rgba(255,255,255,1)";
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(step);
  }

  window.addEventListener("resize", () => { resize(); seed(); });

  resize();
  seed();
  requestAnimationFrame(step);
}

/* ==========
  BOOT
========== */
initContent();
initGlowToggle();
initPlayer();
initSnow();
