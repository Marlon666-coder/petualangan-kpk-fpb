"use strict";
/* =========================================================
   PETUALANGAN FPB & KPK — script.js

   Daftar isi:
   1.  Pengaturan (CONFIG, karakter, hewan)
   2.  Data dunia & level        <-- UBAH / TAMBAH SOAL DI SINI
   3.  Lencana (badge)
   4.  Alat bantu matematika
   5.  Penyimpanan (localStorage)
   6.  Suara
   7.  Alat bantu tampilan
   8.  Navigasi layar
   9.  Layar: Home, Peta, Belajar, Prestasi, Progress
   10. Komponen visual (tumpukan, keranjang, garis bilangan)
   11. Jenis soal (bagi, faktor, lompat, kelipatan, fpb, kpk)
   12. Mesin permainan (jalannya level)
   13. Tutorial FPB & KPK
   14. Mulai!
   ========================================================= */


/* =========================================================
   1. PENGATURAN
   ========================================================= */
const CONFIG = {
  storageKey: "petualangan-fpb-kpk-v1",
  guide: { emoji: "🦉", name: "Bu Owi" },          // guru pemandu
  points: { correct: 10, correctNoHint: 15, levelDone: 50 },
  praise: ["Hebat!", "Pintar sekali!", "Keren!", "Luar biasa!", "Mantap!"],
  // Opsional: pakai file suara sendiri dari folder assets/sounds.
  // Contoh: correct: "assets/sounds/benar.mp3"
  // Jika kosong, game memakai bunyi buatan (tanpa file).
  soundFiles: {
    // click: "", correct: "", wrong: "", hop: "", win: ""
  },
};

// Karakter pemain yang bisa dipilih di Home
const CHARACTERS = [
  { id: "rani", emoji: "👧", name: "Rani" },
  { id: "dito", emoji: "👦", name: "Dito" },
  { id: "kiki", emoji: "🐱", name: "Kiki" },
  { id: "robo", emoji: "🤖", name: "Robo" },
  { id: "dino", emoji: "🦖", name: "Dino" },
];

// Hewan pelompat (dipakai soal lompat, kelipatan, dan KPK)
const ANIMALS = {
  kelinci: { emoji: "🐰", name: "Kelinci" },
  katak:   { emoji: "🐸", name: "Katak" },
  kanguru: { emoji: "🦘", name: "Kanguru" },
  kucing:  { emoji: "🐱", name: "Kucing" },
  roket:   { emoji: "🚀", name: "Roket" },
  ufo:     { emoji: "🛸", name: "UFO" },
};

// Teman-teman untuk soal "bagi rata"
const FRIENDS = ["🧒", "👧", "👦", "🧑", "👱", "🧒🏽"];


/* =========================================================
   2. DATA DUNIA & LEVEL
   ---------------------------------------------------------
   Jenis soal (type) yang tersedia:
   - "bagi"      : { total, groups, item, itemName }
                   Bisakah `total` benda dibagi rata ke `groups` teman?
   - "faktor"    : { number, item }
                   Pilih semua faktor dari `number`.
   - "lompat"    : { step, count, missing, animal }
                   Deret lompatan 0, step, 2×step ... cari yang hilang.
   - "kelipatan" : { number, max, animal }
                   Pilih semua kelipatan `number` sampai `max`.
   - "fpb"       : { a, b, person, itemA, nameA, itemB, nameB }
                   Keranjang terbanyak yang isinya sama = FPB.
   - "kpk"       : { a, b, animalA, animalB, showLine }
                   Di mana dua hewan pertama kali bertemu = KPK.
                   showLine: false  -> garis bilangan disembunyikan
   Jawaban benar DIHITUNG OTOMATIS. Cukup ubah angkanya saja.
   Opsional: `choices: [..]` untuk menentukan pilihan jawaban sendiri.
   ========================================================= */
const WORLDS = [
  { id: 1, name: "Desa Faktor",       icon: "🌱", color: "#b8f0c6", desc: "Belajar berbagi rata" },
  { id: 2, name: "Kota Kelipatan",    icon: "🌈", color: "#ffd1e6", desc: "Melompat bersama hewan" },
  { id: 3, name: "Istana FPB",        icon: "🏰", color: "#ffe0b8", desc: "Keranjang paling banyak" },
  { id: 4, name: "Planet KPK",        icon: "🚀", color: "#d9d2ff", desc: "Kapan mereka bertemu?" },
  { id: 5, name: "Tantangan Master",  icon: "🏆", color: "#fff1a8", desc: "Campuran FPB & KPK" },
];

const LEVELS = [
  /* ---------- DUNIA 1: DESA FAKTOR (pengenalan pembagian & faktor) ---------- */
  {
    id: 1, world: 1, title: "Berbagi Rata",
    intro: "Halo! Di Desa Faktor kita belajar <b>berbagi rata</b>.<br>Artinya semua teman dapat <b>sama banyak</b> dan <b>tidak ada sisa</b>.",
    questions: [
      { type: "bagi", total: 6, groups: 2, item: "🍬", itemName: "permen" },
      { type: "bagi", total: 6, groups: 4, item: "🍬", itemName: "permen" },
      { type: "bagi", total: 8, groups: 4, item: "🧁", itemName: "kue" },
    ],
  },
  {
    id: 2, world: 1, title: "Pesta Kue",
    questions: [
      { type: "bagi", total: 9, groups: 3, item: "🍪", itemName: "biskuit" },
      { type: "bagi", total: 10, groups: 3, item: "🍩", itemName: "donat" },
      { type: "bagi", total: 12, groups: 4, item: "🍓", itemName: "stroberi" },
    ],
  },
  {
    id: 3, world: 1, title: "Cari Faktor",
    intro: "Angka yang bisa membagi rata disebut <b>faktor</b>.<br>Contoh: 4 bisa dibagi 1, 2, dan 4.<br>Jadi <b>faktor 4</b> adalah 1, 2, 4.",
    questions: [
      { type: "faktor", number: 4, item: "🍪" },
      { type: "faktor", number: 6, item: "🍬" },
      { type: "faktor", number: 8, item: "🧁" },
    ],
  },

  /* ---------- DUNIA 2: KOTA KELIPATAN (pengenalan kelipatan) ---------- */
  {
    id: 4, world: 2, title: "Lompat Kelinci",
    intro: "Di Kota Kelipatan, hewan suka <b>melompat</b>!<br>Lompat 2 langkah terus: 2, 4, 6, 8 ...<br>Angka ini disebut <b>kelipatan 2</b>.",
    questions: [
      { type: "lompat", step: 2, count: 4, missing: 4, animal: "kelinci" },
      { type: "lompat", step: 5, count: 4, missing: 4, animal: "kelinci" },
      { type: "lompat", step: 3, count: 4, missing: 4, animal: "kelinci" },
    ],
  },
  {
    id: 5, world: 2, title: "Batu yang Hilang",
    questions: [
      { type: "lompat", step: 4, count: 4, missing: 3, animal: "katak" },
      { type: "lompat", step: 3, count: 4, missing: 2, animal: "katak" },
      { type: "lompat", step: 10, count: 4, missing: 4, animal: "kanguru" },
    ],
  },
  {
    id: 6, world: 2, title: "Cari Kelipatan",
    questions: [
      { type: "kelipatan", number: 2, max: 12, animal: "kelinci" },
      { type: "kelipatan", number: 3, max: 12, animal: "katak" },
      { type: "kelipatan", number: 5, max: 20, animal: "kanguru" },
    ],
  },

  /* ---------- DUNIA 3: ISTANA FPB (FPB sederhana) ---------- */
  {
    id: 7, world: 3, title: "Keranjang Buah", tutorial: "fpb",
    intro: "Selamat datang di Istana FPB! 🏰<br>Kita akan membuat keranjang buah sebanyak-banyaknya, tapi isinya harus <b>sama</b>.",
    questions: [
      { type: "fpb", a: 4, b: 6, person: "Rani" },
      { type: "fpb", a: 6, b: 8, person: "Dito", itemA: "🍌", nameA: "pisang", itemB: "🍇", nameB: "anggur" },
      { type: "fpb", a: 6, b: 9, person: "Rani", itemA: "🍓", nameA: "stroberi", itemB: "🍋", nameB: "lemon" },
    ],
  },
  {
    id: 8, world: 3, title: "Pasar Istana",
    questions: [
      { type: "fpb", a: 8, b: 12, person: "Pak Raja", itemA: "🍎", nameA: "apel", itemB: "🍐", nameB: "pir" },
      { type: "fpb", a: 10, b: 15, person: "Dito", itemA: "🍬", nameA: "permen", itemB: "🍫", nameB: "cokelat" },
      { type: "fpb", a: 12, b: 18, person: "Rani" },
    ],
  },
  {
    id: 9, world: 3, title: "Pesta Raja",
    questions: [
      { type: "fpb", a: 12, b: 16, person: "Ratu", itemA: "🧁", nameA: "kue", itemB: "🍩", nameB: "donat" },
      { type: "fpb", a: 18, b: 24, person: "Pak Raja", itemA: "🍪", nameA: "biskuit", itemB: "🍭", nameB: "lolipop" },
      { type: "fpb", a: 16, b: 24, person: "Rani", itemA: "🍓", nameA: "stroberi", itemB: "🍊", nameB: "jeruk" },
    ],
  },

  /* ---------- DUNIA 4: PLANET KPK (KPK sederhana) ---------- */
  {
    id: 10, world: 4, title: "Lompat Bersama", tutorial: "kpk",
    intro: "Selamat datang di Planet KPK! 🚀<br>Dua hewan melompat dari angka 0.<br>Tekan <b>🐾 Lompat!</b> dan lihat di mana mereka <b>bertemu</b>.",
    questions: [
      { type: "kpk", a: 2, b: 3 },
      { type: "kpk", a: 2, b: 4 },
      { type: "kpk", a: 3, b: 4 },
    ],
  },
  {
    id: 11, world: 4, title: "Taman Bintang",
    questions: [
      { type: "kpk", a: 4, b: 6 },
      { type: "kpk", a: 2, b: 5, animalA: "kucing", animalB: "kanguru" },
      { type: "kpk", a: 3, b: 5, animalA: "roket", animalB: "ufo" },
    ],
  },
  {
    id: 12, world: 4, title: "Lompatan Jauh",
    questions: [
      { type: "kpk", a: 3, b: 6, animalA: "kucing", animalB: "katak" },
      { type: "kpk", a: 4, b: 5, animalA: "roket", animalB: "ufo" },
      { type: "kpk", a: 6, b: 8 },
    ],
  },

  /* ---------- DUNIA 5: TANTANGAN MASTER (campuran & tantangan) ---------- */
  {
    id: 13, world: 5, title: "Campuran Seru",
    intro: "Sekarang soalnya <b>campuran</b>: ada FPB 🧺 dan KPK 🐾.<br>Baca ceritanya pelan-pelan, ya!",
    questions: [
      { type: "fpb", a: 8, b: 10, person: "Dito", itemA: "🍎", nameA: "apel", itemB: "🍌", nameB: "pisang" },
      { type: "kpk", a: 2, b: 6 },
      { type: "fpb", a: 9, b: 12, person: "Rani", itemA: "🍬", nameA: "permen", itemB: "🍪", nameB: "biskuit" },
      { type: "kpk", a: 4, b: 10, animalA: "kucing", animalB: "kanguru" },
    ],
  },
  {
    id: 14, world: 5, title: "Tanpa Garis",
    intro: "Tantangan! Garis bilangannya <b>disembunyikan</b>.<br>Kamu pasti bisa! Pakai 💡 petunjuk kalau perlu 😊",
    questions: [
      { type: "fpb", a: 12, b: 20, person: "Ratu", itemA: "🧁", nameA: "kue", itemB: "🍓", nameB: "stroberi" },
      { type: "kpk", a: 6, b: 9, showLine: false },
      { type: "fpb", a: 14, b: 21, person: "Pak Raja", itemA: "🍊", nameA: "jeruk", itemB: "🍎", nameB: "apel" },
      { type: "kpk", a: 5, b: 10, showLine: false, animalA: "roket", animalB: "ufo" },
    ],
  },
  {
    id: 15, world: 5, title: "Master Matematika",
    intro: "Ini level terakhir! 👑<br>Tunjukkan kalau kamu <b>Master FPB & KPK</b>!",
    questions: [
      { type: "fpb", a: 18, b: 27, person: "Rani", itemA: "🍭", nameA: "lolipop", itemB: "🍬", nameB: "permen" },
      { type: "kpk", a: 8, b: 12, showLine: false },
      { type: "fpb", a: 16, b: 20, person: "Dito", itemA: "🍪", nameA: "biskuit", itemB: "🍩", nameB: "donat" },
      { type: "kpk", a: 3, b: 7, showLine: false, animalA: "kucing", animalB: "katak" },
    ],
  },
];


/* =========================================================
   3. LENCANA (BADGE)
   `check(save)` mengembalikan true jika lencana didapat.
   ========================================================= */
const BADGES = [
  { id: "pemula",  icon: "🌟", name: "Langkah Pertama",   desc: "Selesaikan level 1",               check: s => levelsDone(s) >= 1 },
  { id: "murid-fpb", icon: "📘", name: "Murid FPB",       desc: "Selesaikan pelajaran FPB",         check: s => s.tutorials.fpb },
  { id: "murid-kpk", icon: "📗", name: "Murid KPK",       desc: "Selesaikan pelajaran KPK",         check: s => s.tutorials.kpk },
  { id: "desa",    icon: "🌱", name: "Penjelajah Desa",   desc: "Tamatkan Desa Faktor",             check: s => worldDone(s, 1) },
  { id: "kota",    icon: "🌈", name: "Pelompat Hebat",    desc: "Tamatkan Kota Kelipatan",          check: s => worldDone(s, 2) },
  { id: "istana",  icon: "🏰", name: "Pahlawan FPB",      desc: "Tamatkan Istana FPB",              check: s => worldDone(s, 3) },
  { id: "planet",  icon: "🚀", name: "Astronot KPK",      desc: "Tamatkan Planet KPK",              check: s => worldDone(s, 4) },
  { id: "master",  icon: "👑", name: "Master Matematika", desc: "Tamatkan semua level",             check: s => worldDone(s, 5) },
  { id: "cerdas",  icon: "🧠", name: "Otak Cemerlang",    desc: "Selesaikan level tanpa petunjuk",  check: s => s.flags.noHintLevel },
  { id: "bintang", icon: "⭐", name: "Bintang Tiga",      desc: "Dapat 3 bintang di satu level",    check: s => Object.values(s.levels).some(l => l.stars === 3) },
  { id: "koin",    icon: "🪙", name: "Kolektor Koin",     desc: "Kumpulkan 500 koin",               check: s => s.coins >= 500 },
];

function levelsDone(s) { return Object.keys(s.levels).length; }
function worldDone(s, worldId) {
  return LEVELS.filter(l => l.world === worldId).every(l => s.levels[l.id]);
}


/* =========================================================
   4. ALAT BANTU MATEMATIKA
   ========================================================= */
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }       // FPB
function lcm(a, b) { return (a * b) / gcd(a, b); }                // KPK

function factorsOf(n) {
  const list = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) list.push(i);
  return list;
}
function multiplesOf(n, max) {
  const list = [];
  for (let v = n; v <= max; v += n) list.push(v);
  return list;
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
// Buat pilihan jawaban: jawaban + pengecoh (priority dulu, lalu acak dari pool)
function pickChoices(answer, priority, pool, n) {
  const out = [answer];
  const add = v => { if (out.length < n && v > 0 && !out.includes(v)) out.push(v); };
  priority.forEach(add);
  shuffle(pool).forEach(add);
  return out.sort((x, y) => x - y);
}
function divText(n, d) {
  return n % d === 0
    ? `${n} ÷ ${d} = ${n / d} ✅`
    : `${n} ÷ ${d} = ${Math.floor(n / d)} sisa ${n % d} ❌`;
}


/* =========================================================
   5. PENYIMPANAN (localStorage)
   ========================================================= */
function defaultSave() {
  return {
    unlocked: 1,                 // level tertinggi yang terbuka
    levels: {},                  // { idLevel: { stars, best } }
    coins: 0,
    badges: [],
    stats: { correct: 0, wrong: 0, hints: 0, played: 0 },
    tutorials: { fpb: false, kpk: false },
    flags: { noHintLevel: false },
    avatar: "rani",
    sound: true,
  };
}
function loadSave() {
  try {
    const raw = localStorage.getItem(CONFIG.storageKey);
    if (!raw) return defaultSave();
    const data = JSON.parse(raw);
    const base = defaultSave();
    return {
      ...base, ...data,
      stats: { ...base.stats, ...data.stats },
      tutorials: { ...base.tutorials, ...data.tutorials },
      flags: { ...base.flags, ...data.flags },
    };
  } catch (e) {
    return defaultSave();
  }
}
function saveGame() {
  try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(save)); } catch (e) { /* abaikan */ }
}
let save = loadSave();

function totalStars() {
  return Object.values(save.levels).reduce((sum, l) => sum + (l.stars || 0), 0);
}
function avatar() {
  return CHARACTERS.find(c => c.id === save.avatar) || CHARACTERS[0];
}


/* =========================================================
   6. SUARA (dibuat dengan Web Audio, tanpa file)
   ========================================================= */
const SOUND_NOTES = {
  click:   [[660, 0.05]],
  hop:     [[520, 0.05], [780, 0.07]],
  correct: [[523, 0.1], [659, 0.1], [784, 0.18]],
  wrong:   [[392, 0.12], [330, 0.18]],
  coin:    [[988, 0.06], [1319, 0.12]],
  win:     [[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.32]],
};
const Sound = {
  ctx: null,
  play(type) {
    if (!save.sound) return;
    const file = CONFIG.soundFiles[type];
    if (file) { new Audio(file).play().catch(() => {}); return; }
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      let t = this.ctx.currentTime;
      (SOUND_NOTES[type] || []).forEach(([freq, dur]) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + dur + 0.02);
        t += dur;
      });
    } catch (e) { /* browser tidak mendukung suara */ }
  },
};


/* =========================================================
   7. ALAT BANTU TAMPILAN
   ========================================================= */
const $ = sel => document.querySelector(sel);

function el(tag, className, html) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (html !== undefined) e.innerHTML = html;
  return e;
}
function emojis(emoji, n) {
  return `<span>${emoji}</span>`.repeat(Math.max(0, n));
}
function chips(list, highlight = []) {
  return list.map(v => `<span class="chip ${highlight.includes(v) ? "hl" : ""}">${v}</span>`).join("");
}
function shake(elem) {
  elem.classList.remove("shake");
  void elem.offsetWidth;          // restart animasi
  elem.classList.add("shake");
}
function confetti(count = 24) {
  const box = $("#confetti");
  const pieces = ["🎉", "⭐", "✨", "🎊", "🌟", "🪙"];
  for (let i = 0; i < count; i++) {
    const p = el("span", "confetti-piece", pieces[i % pieces.length]);
    p.style.left = Math.random() * 100 + "vw";
    p.style.animationDuration = 1.6 + Math.random() * 1.6 + "s";
    p.style.animationDelay = Math.random() * 0.4 + "s";
    box.appendChild(p);
    setTimeout(() => p.remove(), 3800);
  }
}
/** Tombol pilihan jawaban. options: angka, atau {label, value}. */
function choiceButtons(container, options, onPick) {
  container.innerHTML = "";
  options.forEach(opt => {
    const o = typeof opt === "object" ? opt : { label: opt, value: opt };
    const b = el("button", "choice", o.label);
    b.onclick = () => { Sound.play("click"); onPick(o.value, b); };
    container.appendChild(b);
  });
}
/** Jendela pesan. buttons: [{label, cls, onClick}] */
function showModal({ icon = "", title = "", text = "", buttons = [] }) {
  $("#modal-icon").textContent = icon;
  $("#modal-title").innerHTML = title;
  $("#modal-text").innerHTML = text;
  const box = $("#modal-buttons");
  box.innerHTML = "";
  (buttons.length ? buttons : [{ label: "OK" }]).forEach(btn => {
    const b = el("button", "btn " + (btn.cls || "btn-primary"), btn.label);
    b.onclick = () => { closeModal(); Sound.play("click"); if (btn.onClick) btn.onClick(); };
    box.appendChild(b);
  });
  $("#modal").classList.remove("hidden");
}
function closeModal() { $("#modal").classList.add("hidden"); }

function updateTopbar() {
  const a = avatar();
  $("#tb-avatar").textContent = a.emoji;
  $("#tb-name").textContent = a.name;
  $("#tb-coins").textContent = save.coins;
  $("#tb-stars").textContent = totalStars();
  $("#btn-sound").textContent = save.sound ? "🔊" : "🔇";
}


/* =========================================================
   8. NAVIGASI LAYAR
   ========================================================= */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $("#screen-" + id).classList.add("active");
  document.body.dataset.screen = id;
  window.scrollTo(0, 0);
  updateTopbar();
}
const SCREEN_RENDER = {
  home: renderHome,
  map: renderMap,
  learn: renderLearn,
  reward: renderReward,
  progress: renderProgress,
};
function go(name) {
  if (SCREEN_RENDER[name]) SCREEN_RENDER[name]();
  showScreen(name);
}


/* =========================================================
   9. LAYAR: HOME, PETA, BELAJAR, PRESTASI, PROGRESS
   ========================================================= */
function renderHome() {
  $("#home-avatar").textContent = avatar().emoji;
  const list = $("#avatar-list");
  list.innerHTML = "";
  CHARACTERS.forEach(c => {
    const b = el("button", "avatar-btn" + (c.id === save.avatar ? " selected" : ""), `${c.emoji}<small>${c.name}</small>`);
    b.onclick = () => { save.avatar = c.id; saveGame(); Sound.play("click"); renderHome(); updateTopbar(); };
    list.appendChild(b);
  });
}

function renderMap() {
  const box = $("#world-list");
  box.innerHTML = "";
  WORLDS.forEach(w => {
    const levels = LEVELS.filter(l => l.world === w.id);
    const done = levels.filter(l => save.levels[l.id]).length;
    const worldOpen = levels.some(l => l.id <= save.unlocked);
    const card = el("div", "world" + (worldOpen ? "" : " locked"));
    card.style.setProperty("--wc", w.color);
    card.innerHTML = `
      <div class="world-head">
        <span class="world-icon">${w.icon}</span>
        <div><h3>Dunia ${w.id}: ${w.name}</h3><p>${w.desc}</p></div>
        <span class="world-count">${done}/${levels.length}</span>
      </div>`;
    const row = el("div", "level-row");
    levels.forEach(l => {
      const result = save.levels[l.id];
      const open = l.id <= save.unlocked;
      const isCurrent = open && !result;
      const stars = result ? "⭐".repeat(result.stars) + "☆".repeat(3 - result.stars) : "";
      const b = el("button", "level-btn" + (result ? " done" : "") + (open ? "" : " locked") + (isCurrent ? " current" : ""));
      b.innerHTML = `
        ${isCurrent ? `<span class="here">${avatar().emoji}</span>` : ""}
        ${open ? l.id : "🔒"}
        <span class="lv-stars">${stars}</span>`;
      b.title = l.title;
      b.onclick = () => {
        if (!open) {
          Sound.play("wrong");
          showModal({ icon: "🔒", title: "Level masih terkunci", text: "Selesaikan level sebelumnya dulu, ya! 😊" });
          return;
        }
        Sound.play("click");
        startLevel(l.id);
      };
      const wrap = el("div", "");
      wrap.style.textAlign = "center";
      wrap.appendChild(b);
      wrap.appendChild(el("span", "level-name", l.title));
      row.appendChild(wrap);
    });
    card.appendChild(row);
    box.appendChild(card);
  });
}

function renderLearn() {
  $("#done-fpb").textContent = save.tutorials.fpb ? "✅ Selesai" : "";
  $("#done-kpk").textContent = save.tutorials.kpk ? "✅ Selesai" : "";
}

function renderReward() {
  const got = BADGES.filter(b => save.badges.includes(b.id)).length;
  $("#reward-box").innerHTML = `
    <div class="summary">
      <div class="sum-card"><div class="s-icon">🪙</div><b>${save.coins}</b><small>Koin</small></div>
      <div class="sum-card"><div class="s-icon">⭐</div><b>${totalStars()}</b><small>Bintang</small></div>
      <div class="sum-card"><div class="s-icon">🏆</div><b>${got}/${BADGES.length}</b><small>Lencana</small></div>
    </div>
    <div class="badge-grid">
      ${BADGES.map(b => {
        const on = save.badges.includes(b.id);
        return `<div class="badge ${on ? "on" : "off"}">
          <span class="b-icon">${on ? b.icon : "🔒"}</span>
          <b>${b.name}</b><small>${b.desc}</small></div>`;
      }).join("")}
    </div>`;
}

function renderProgress() {
  const s = save.stats;
  let html = `
    <div class="summary">
      <div class="sum-card"><div class="s-icon">🗺️</div><b>${levelsDone(save)}/${LEVELS.length}</b><small>Level selesai</small></div>
      <div class="sum-card"><div class="s-icon">⭐</div><b>${totalStars()}/${LEVELS.length * 3}</b><small>Bintang</small></div>
      <div class="sum-card"><div class="s-icon">✅</div><b>${s.correct}</b><small>Jawaban benar</small></div>
      <div class="sum-card"><div class="s-icon">💡</div><b>${s.hints}</b><small>Petunjuk dipakai</small></div>
    </div>`;
  WORLDS.forEach(w => {
    const levels = LEVELS.filter(l => l.world === w.id);
    const done = levels.filter(l => save.levels[l.id]).length;
    const pct = Math.round((done / levels.length) * 100);
    const detail = levels.map(l => {
      const r = save.levels[l.id];
      return `Lv ${l.id} ${r ? "⭐".repeat(r.stars) : (l.id <= save.unlocked ? "▶" : "🔒")}`;
    }).join(" · ");
    html += `
      <div class="world-progress">
        <div class="wp-head"><span>${w.icon} ${w.name}</span><span>${pct}%</span></div>
        <div class="wp-bar"><div style="width:${pct}%"></div></div>
        <div class="wp-levels">${detail}</div>
      </div>`;
  });
  html += `
    <p>📘 Pelajaran FPB: <b>${save.tutorials.fpb ? "Selesai ✅" : "Belum"}</b> &nbsp; 📗 Pelajaran KPK: <b>${save.tutorials.kpk ? "Selesai ✅" : "Belum"}</b></p>
    <div class="reset-row"><button class="btn btn-danger btn-small" id="btn-reset">🗑️ Ulang dari awal</button></div>`;
  $("#progress-box").innerHTML = html;
  $("#btn-reset").onclick = () => showModal({
    icon: "🤔", title: "Ulang dari awal?",
    text: "Semua bintang, koin, dan lencana akan dihapus.",
    buttons: [
      { label: "Tidak jadi", cls: "btn-light" },
      {
        label: "Ya, ulang", cls: "btn-danger", onClick: () => {
          const keep = { avatar: save.avatar, sound: save.sound };
          save = { ...defaultSave(), ...keep };
          saveGame(); renderProgress(); updateTopbar();
        },
      },
    ],
  });
}


/* =========================================================
   10. KOMPONEN VISUAL
   ========================================================= */
/** Tumpukan benda, contoh: 12 apel */
function pileHTML(emoji, n) {
  return `<div class="pile">
    <div class="pile-items ${n > 16 ? "many" : ""}">${emojis(emoji, n)}</div>
    <div class="pile-count">${n} ${emoji}</div></div>`;
}
function friendsHTML(k) {
  let h = "";
  for (let i = 0; i < k; i++) h += `<span>${FRIENDS[i % FRIENDS.length]}</span>`;
  return h;
}
/**
 * Membagi benda ke k kelompok. parts = [{emoji, n}, ...]
 * mode "friend" = label teman, selain itu label keranjang.
 */
function groupsHTML(parts, k, mode) {
  let html = `<div class="groups">`;
  for (let g = 1; g <= k; g++) {
    const label = mode === "friend" ? `${FRIENDS[(g - 1) % FRIENDS.length]} ${g}` : `🧺 ${g}`;
    html += `<div class="group" style="animation-delay:${g * 0.06}s">
      <div class="group-label">${label}</div>
      <div class="group-items">${parts.map(p => emojis(p.emoji, Math.floor(p.n / k))).join("")}</div>
    </div>`;
  }
  html += `</div>`;
  const left = parts.filter(p => p.n % k !== 0);
  if (left.length) {
    html += `<div class="leftover">Sisa: ${left.map(p => `${emojis(p.emoji, p.n % k)} (${p.n % k})`).join(" &nbsp; ")} 😮</div>`;
  } else {
    html += `<div class="no-left">Tidak ada sisa! ✅</div>`;
  }
  return html;
}

/**
 * Garis bilangan dengan dua hewan yang melompat.
 * cfg: { a, b, max, animalA, animalB, onMeet(n) }
 * Mengembalikan { jump, reset, playToMeet, isMet }
 */
function createNumberLine(container, cfg) {
  const cell = window.innerWidth < 600 ? 38 : 46;
  const wrap = el("div", "nl-wrap");
  const line = el("div", "nl");
  line.style.setProperty("--cell", cell + "px");
  line.style.width = (cfg.max + 1) * cell + "px";

  const laneA = el("div", "nl-lane lane-a");
  const ticks = el("div", "nl-ticks");
  const laneB = el("div", "nl-lane lane-b");
  for (let n = 0; n <= cfg.max; n++) ticks.appendChild(el("div", "nl-tick", String(n)));

  const aniA = el("div", "nl-animal", `<span>${cfg.animalA.emoji}</span>`);
  const aniB = el("div", "nl-animal", `<span>${cfg.animalB.emoji}</span>`);
  laneA.appendChild(aniA);
  laneB.appendChild(aniB);
  line.append(laneA, ticks, laneB);
  wrap.appendChild(line);
  const lists = el("div", "nl-lists");
  container.append(wrap, lists);

  let pa = 0, pb = 0, met = false;
  let visitedA = [], visitedB = [];

  function place() {
    aniA.style.left = pa * cell + "px";
    aniB.style.left = pb * cell + "px";
  }
  function addMark(lane, n) {
    const m = el("div", "nl-mark");
    m.style.left = n * cell + "px";
    lane.appendChild(m);
  }
  function hop(ani) {
    const span = ani.firstChild;
    span.classList.remove("hop");
    void span.offsetWidth;
    span.classList.add("hop");
  }
  function updateLists() {
    const common = visitedA.filter(v => visitedB.includes(v));
    lists.innerHTML = `
      <div>${cfg.animalA.emoji} <b>Kelipatan ${cfg.a}:</b> ${visitedA.length ? chips(visitedA, common) : "-"}</div>
      <div>${cfg.animalB.emoji} <b>Kelipatan ${cfg.b}:</b> ${visitedB.length ? chips(visitedB, common) : "-"}</div>`;
  }
  function jump() {
    if (met) return;
    // Yang tertinggal melompat lebih dulu, supaya mereka bertemu di KPK
    if (pa <= pb) {
      pa += cfg.a; visitedA.push(pa); addMark(laneA, pa); hop(aniA);
      ticks.children[pa].classList.add("land-a");
    } else {
      pb += cfg.b; visitedB.push(pb); addMark(laneB, pb); hop(aniB);
      ticks.children[pb].classList.add("land-b");
    }
    place();
    Sound.play("hop");
    wrap.scrollTo({ left: Math.max(0, Math.max(pa, pb) * cell - wrap.clientWidth / 2), behavior: "smooth" });
    updateLists();
    if (pa === pb) {
      met = true;
      ticks.children[pa].classList.add("meet");
      if (cfg.onMeet) cfg.onMeet(pa);
    }
  }
  function reset() {
    pa = 0; pb = 0; met = false; visitedA = []; visitedB = [];
    line.querySelectorAll(".nl-mark").forEach(m => m.remove());
    ticks.querySelectorAll(".nl-tick").forEach(t => t.classList.remove("meet", "land-a", "land-b"));
    place(); updateLists();
    wrap.scrollTo({ left: 0 });
  }
  function playToMeet() {
    const timer = setInterval(() => {
      if (met || !document.body.contains(wrap)) { clearInterval(timer); return; }
      jump();
    }, 450);
  }
  place(); updateLists();
  return { jump, reset, playToMeet, isMet: () => met };
}

/** Garis bilangan + tombol Lompat & Ulang */
function numberLineWithControls(container, cfg) {
  const box = el("div", "line-box");
  const controls = el("div", "line-controls");
  const jumpBtn = el("button", "btn btn-secondary", "🐾 Lompat!");
  const resetBtn = el("button", "btn btn-light", "↺ Ulang");
  controls.append(jumpBtn, resetBtn);
  container.append(box, controls);
  const nl = createNumberLine(box, cfg);
  jumpBtn.onclick = () => nl.jump();
  resetBtn.onclick = () => { Sound.play("click"); nl.reset(); };
  return nl;
}

function resolveAnimal(key, fallback) {
  if (typeof key === "string") return ANIMALS[key] || fallback;
  return key || fallback;
}


/* =========================================================
   11. JENIS SOAL
   Setiap fungsi menggambar soal lalu mengembalikan
   array 3 petunjuk (fungsi yang menghasilkan HTML).
   ui = { story, visual, preview, answers, correct(), wrong(), say() }
   ========================================================= */
const QUESTION_TYPES = {

  /* ----- Bisakah dibagi rata? ----- */
  bagi(q, ui) {
    const n = q.total, k = q.groups;
    const it = q.item || "🍬", name = q.itemName || "permen";
    const canShare = n % k === 0;
    ui.story.innerHTML = `
      <p>Ada <span class="num">${n}</span> ${name} ${it}.</p>
      <p>Mau dibagi rata ke <span class="num">${k}</span> teman.</p>
      <p class="ask">Bisakah semua teman dapat sama banyak, tanpa sisa?</p>`;
    ui.visual.innerHTML = pileHTML(it, n) + `<div class="friends">${friendsHTML(k)}</div>`;
    const share = () => groupsHTML([{ emoji: it, n }], k, "friend");
    const explain = canShare
      ? `<p>${n} ÷ ${k} = <b>${n / k}</b></p><p>Tiap teman dapat ${n / k} ${it}. Tidak ada sisa!</p>`
      : `<p>${n} ÷ ${k} = ${Math.floor(n / k)} <b>sisa ${n % k}</b></p><p>Ada ${it} yang tersisa, jadi tidak bisa dibagi rata.</p>`;

    choiceButtons(ui.answers, [{ label: "✅ Bisa", value: true }, { label: "❌ Tidak bisa", value: false }], (v, btn) => {
      ui.preview.innerHTML = `<p class="preview-title">Ayo kita bagikan satu per satu:</p>` + share();
      if (v === canShare) { btn.classList.add("right"); ui.correct(explain); }
      else {
        btn.disabled = true; btn.classList.add("wrongpick");
        ui.wrong(canShare ? "Lihat! Ternyata semua teman dapat sama banyak." : "Lihat! Ternyata masih ada yang tersisa.");
      }
    });
    return [
      () => `Bagi rata artinya setiap teman dapat <b>sama banyak</b>. Tidak boleh ada sisa.`,
      () => `Bayangkan kamu membagi ${it} satu per satu ke ${k} teman sampai habis. Apakah ada yang tersisa?`,
      () => `Lihat cara membaginya:${share()}`,
    ];
  },

  /* ----- Pilih semua faktor ----- */
  faktor(q, ui) { return renderMultiSelect(q, ui, "faktor"); },

  /* ----- Pilih semua kelipatan ----- */
  kelipatan(q, ui) { return renderMultiSelect(q, ui, "kelipatan"); },

  /* ----- Lompatan yang hilang ----- */
  lompat(q, ui) {
    const s = q.step, count = q.count || 4;
    const miss = Math.min(q.missing || count, count);
    const A = resolveAnimal(q.animal, ANIMALS.kelinci);
    const ans = s * miss, prev = s * (miss - 1);
    const seq = [];
    for (let i = 1; i <= count; i++) seq.push(i * s);

    ui.story.innerHTML = `
      <p>${A.emoji} <b>${A.name}</b> selalu melompat <span class="num">${s}</span> langkah.</p>
      <p class="ask">Angka berapa yang hilang? ❓</p>`;
    const draw = solved => {
      let h = `<div class="stones">`;
      for (let i = 0; i <= count; i++) {
        const hidden = i === miss && !solved;
        const animalHere = solved ? i === miss : i === miss - 1;
        if (i > 0) h += `<div class="hop-arrow">+${s}</div>`;
        h += `<div class="stone ${hidden ? "mystery" : ""} ${solved && i === miss ? "solved" : ""}">
          ${animalHere ? `<span class="stone-animal ${solved ? "hop" : ""}">${A.emoji}</span>` : ""}
          <span>${hidden ? "❓" : i * s}</span></div>`;
      }
      ui.visual.innerHTML = h + `</div>`;
    };
    draw(false);

    const options = q.choices || pickChoices(ans, [], [ans - 1, ans + 1, ans + s, ans - s + 1, ans + 2], 4);
    choiceButtons(ui.answers, options, (v, btn) => {
      if (v === ans) {
        btn.classList.add("right");
        draw(true);
        ui.correct(`<p>${prev} + ${s} = <b>${ans}</b></p>
          <p>${chips(seq)}</p>
          <p class="concept">Angka-angka ini disebut kelipatan ${s}.</p>`);
      } else {
        btn.disabled = true; btn.classList.add("wrongpick");
        ui.wrong(`${A.name} selalu melompat <b>${s}</b> langkah. Coba hitung lagi dari ${prev}.`);
      }
    });
    return [
      () => `${A.emoji} ${A.name} selalu lompat <b>${s}</b> langkah. Lihat tanda <b>+${s}</b> di antara batu.`,
      () => `Angka sebelum ❓ adalah <b>${prev}</b>.`,
      () => `<span class="calc">${prev} + ${s} = ❓</span>`,
    ];
  },

  /* ----- FPB: keranjang paling banyak ----- */
  fpb(q, ui) {
    const a = q.a, b = q.b, ans = gcd(a, b);
    const iA = q.itemA || "🍎", nA = q.nameA || "apel";
    const iB = q.itemB || "🍊", nB = q.nameB || "jeruk";
    const who = q.person || "Rani";
    const parts = [{ emoji: iA, n: a }, { emoji: iB, n: b }];
    const fa = factorsOf(a), fb = factorsOf(b);
    const common = fa.filter(v => fb.includes(v));

    ui.story.innerHTML = `
      <p><b>${who}</b> punya <span class="num">${a}</span> ${nA} ${iA} dan <span class="num">${b}</span> ${nB} ${iB}.</p>
      <p>Semuanya dimasukkan ke keranjang 🧺. Isi tiap keranjang harus <b>sama</b> dan <b>tidak ada sisa</b>.</p>
      <p class="ask">Berapa keranjang paling banyak?</p>`;
    ui.visual.innerHTML = pileHTML(iA, a) + pileHTML(iB, b);

    const small = Math.min(a, b);
    const priority = shuffle(common.filter(v => v !== ans)).slice(0, 2);
    const pool = [...fa, ...fb, ans + 1, ans * 2].filter(v => v <= small);
    const options = q.choices || pickChoices(ans, priority, pool, 6);

    choiceButtons(ui.answers, options, (v, btn) => {
      if (v === ans) {
        btn.classList.add("right");
        ui.preview.innerHTML = `<p class="preview-title">${ans} keranjang:</p>` + groupsHTML(parts, ans);
        ui.correct(`<p>${a} dan ${b} bisa dibagi menjadi <b>${ans}</b> kelompok yang sama.</p>
          <p>Tiap keranjang: ${a / ans} ${iA} dan ${b / ans} ${iB}.</p>
          <p class="concept">FPB dari ${a} dan ${b} adalah ${ans}.</p>`);
      } else {
        btn.disabled = true; btn.classList.add("wrongpick");
        ui.preview.innerHTML = `<p class="preview-title">Kalau ${v} keranjang:</p>` + groupsHTML(parts, v);
        if (a % v === 0 && b % v === 0) {
          ui.wrong(`${v} keranjang bisa, tidak ada sisa! 👍<br>Tapi, apakah bisa <b>lebih banyak</b> keranjang?`);
        } else {
          ui.wrong(`Kalau ${v} keranjang, masih ada <b>sisa</b>.`);
        }
      }
    });

    const s = common.find(v => v > 1) || 1;
    return [
      () => `Yuk, cari angka yang bisa membagi <b>${a}</b> dan <b>${b}</b> tanpa sisa.`,
      () => `Apakah <b>${s}</b> bisa membagi kedua angka tanpa sisa?<br>
             <span class="calc">${divText(a, s)}<br>${divText(b, s)}</span><br>
             Bisa! Sekarang coba angka yang <b>lebih besar</b>.`,
      () => `<p>Faktor ${a}: ${chips(fa, common)}</p>
             <p>Faktor ${b}: ${chips(fb, common)}</p>
             <p>Angka kuning ada di kedua daftar. Pilih yang <b>paling besar</b>!</p>`,
    ];
  },

  /* ----- KPK: di mana mereka bertemu? ----- */
  kpk(q, ui) {
    const a = q.a, b = q.b, ans = lcm(a, b);
    const A = resolveAnimal(q.animalA, ANIMALS.kelinci);
    const B = resolveAnimal(q.animalB, ANIMALS.katak);
    ui.story.innerHTML = `
      <p>${A.emoji} <b>${A.name}</b> melompat <span class="num">${a}</span> langkah.</p>
      <p>${B.emoji} <b>${B.name}</b> melompat <span class="num">${b}</span> langkah.</p>
      <p class="small">Mereka mulai dari angka 0.</p>
      <p class="ask">Di angka berapa mereka pertama kali bertemu?</p>`;

    let line = null;
    const showLine = () => {
      if (line) return;
      ui.visual.innerHTML = "";
      line = numberLineWithControls(ui.visual, {
        a, b, max: ans + Math.max(a, b), animalA: A, animalB: B,
        onMeet: n => ui.say(run.answered
          ? `💥 Lihat! Mereka bertemu di angka <b>${n}</b>!`
          : `💥 Mereka bertemu! Di angka berapa? Pilih jawabannya 👇`),
      });
    };
    if (q.showLine === false) {
      ui.visual.innerHTML = `<div class="duo"><span class="bounce">${A.emoji}</span><span class="vs">🤝</span><span class="bounce d2">${B.emoji}</span></div>`;
    } else {
      showLine();
      ui.say(`Tekan <b>🐾 Lompat!</b> untuk melihat mereka melompat.`);
    }

    const pool = [a * b, ans + a, ans + b, a + b, ans * 2, ans - 1, ans + 1];
    const options = q.choices || pickChoices(ans, [], pool, 4);
    choiceButtons(ui.answers, options, (v, btn) => {
      if (v === ans) {
        btn.classList.add("right");
        if (line && !line.isMet()) line.playToMeet();
        ui.correct(`<p>🎉 Mereka bertemu di angka <b>${ans}</b>!</p>
          <p>Kelipatan ${a}: ${chips(multiplesOf(a, ans), [ans])}</p>
          <p>Kelipatan ${b}: ${chips(multiplesOf(b, ans), [ans])}</p>
          <p class="concept">KPK dari ${a} dan ${b} adalah ${ans}.</p>`);
      } else {
        btn.disabled = true; btn.classList.add("wrongpick");
        const inA = v % a === 0, inB = v % b === 0;
        let msg;
        if (inA && inB) msg = `${v} memang tempat bertemu, tapi bukan yang <b>pertama</b>. Ada yang lebih kecil!`;
        else if (inA) msg = `${A.emoji} mendarat di ${v}, tapi ${B.emoji} tidak.`;
        else if (inB) msg = `${B.emoji} mendarat di ${v}, tapi ${A.emoji} tidak.`;
        else msg = `${A.emoji} dan ${B.emoji} tidak mendarat di ${v}.`;
        ui.wrong(msg);
      }
    });
    return [
      () => `Yuk, tulis kelipatan <b>${a}</b>:<br>${chips(multiplesOf(a, ans + a))} ...`,
      () => `Sekarang tulis kelipatan <b>${b}</b>:<br>${chips(multiplesOf(b, ans + b))} ...`,
      () => {
        const wasHidden = !line;
        showLine();
        return `Mana angka yang <b>pertama kali</b> muncul di kedua daftar?
          <p>${A.emoji} ${chips(multiplesOf(a, ans + a))}</p>
          <p>${B.emoji} ${chips(multiplesOf(b, ans + b))}</p>
          ${wasHidden ? "Garis bilangan sudah muncul. Coba tekan 🐾 Lompat!" : ""}`;
      },
    ];
  },
};

/** Soal "pilih semua" untuk faktor dan kelipatan */
function renderMultiSelect(q, ui, mode) {
  const n = q.number;
  const isFaktor = mode === "faktor";
  const max = isFaktor ? n : (q.max || n * 4);
  const correctSet = isFaktor ? factorsOf(n) : multiplesOf(n, max);
  const A = resolveAnimal(q.animal, ANIMALS.kelinci);

  if (isFaktor) {
    ui.story.innerHTML = `
      <p class="ask">Pilih <b>semua</b> angka yang bisa membagi <span class="num">${n}</span> tanpa sisa.</p>
      <p class="small">Angka-angka ini disebut faktor ${n}.</p>`;
    ui.visual.innerHTML = pileHTML(q.item || "🍪", n);
  } else {
    ui.story.innerHTML = `
      <p>${A.emoji} <b>${A.name}</b> melompat <span class="num">${n}</span> langkah terus-menerus dari 0.</p>
      <p class="ask">Pilih <b>semua</b> angka tempat ${A.name} mendarat (sampai ${max}).</p>
      <p class="small">Angka-angka ini disebut kelipatan ${n}.</p>`;
    ui.visual.innerHTML = `<div class="big-emoji bounce">${A.emoji}</div>`;
  }

  const selected = new Set();
  const grid = el("div", "tiles");
  for (let v = 1; v <= max; v++) {
    const t = el("button", "tile", String(v));
    t.onclick = () => {
      if (run.answered) return;
      Sound.play("click");
      if (selected.has(v)) { selected.delete(v); t.classList.remove("sel"); }
      else { selected.add(v); t.classList.add("sel"); }
    };
    grid.appendChild(t);
  }
  const checkBtn = el("button", "btn btn-primary btn-check", "✔ Cek Jawaban");
  ui.answers.innerHTML = "";
  ui.answers.append(grid, checkBtn);

  const explain = isFaktor
    ? `<p>Faktor ${n}: ${chips(correctSet)}</p>
       <div class="calc">${correctSet.map(f => `${n} ÷ ${f} = ${n / f}`).join("<br>")}</div>
       <p>Semuanya tanpa sisa! ✅</p>`
    : `<p>Kelipatan ${n}: ${chips(correctSet)}</p>
       <p>Setiap kali ditambah ${n}, seperti ${A.name} yang melompat ${A.emoji}</p>`;

  checkBtn.onclick = () => {
    if (run.answered) return;
    if (selected.size === 0) { ui.say("Pilih dulu angkanya, ya 😊"); return; }
    const wrongSel = [...selected].filter(v => !correctSet.includes(v)).sort((x, y) => x - y);
    const missing = correctSet.filter(v => !selected.has(v));
    if (!wrongSel.length && !missing.length) {
      grid.querySelectorAll(".tile.sel").forEach(t => t.classList.add("right"));
      ui.correct(explain);
      return;
    }
    let reason = "";
    if (wrongSel.length) {
      const w = wrongSel[0];
      reason = isFaktor
        ? `${w} tidak bisa membagi ${n} tanpa sisa (${n} ÷ ${w} = ${Math.floor(n / w)} sisa ${n % w}).`
        : `${A.name} tidak mendarat di ${w}.`;
      wrongSel.forEach(v => {
        selected.delete(v);
        const t = grid.children[v - 1];
        t.classList.remove("sel");
        shake(t);
      });
    }
    if (missing.length) reason += (reason ? "<br>" : "") + "Masih ada angka yang terlewat 🔍";
    ui.wrong(reason);
  };

  if (isFaktor) {
    const checks = [2, 3].filter(d => d < n).map(d => divText(n, d)).join("<br>");
    return [
      () => `Faktor ${n} = angka yang bisa membagi ${n} <b>tanpa sisa</b>. Angka <b>1</b> dan <b>${n}</b> pasti termasuk!`,
      () => `Cek angka lain satu per satu. Misalnya: ${n} ÷ 2 = ? Ada sisa atau tidak?`,
      () => `<span class="calc">${checks}</span><br>Sekarang cek angka lainnya sendiri, ya!`,
    ];
  }
  return [
    () => `Kelipatan ${n} = tempat ${A.name} mendarat kalau lompat ${n} langkah terus-menerus.`,
    () => `Mulai dari <b>${n}</b>, lalu tambah ${n}, tambah ${n} lagi ...`,
    () => `<span class="calc">${n} → ${n} + ${n} = ${2 * n} → ${2 * n} + ${n} = ${3 * n} → ...</span>`,
  ];
}


/* =========================================================
   12. MESIN PERMAINAN
   ========================================================= */
let run = null;          // data level yang sedang dimainkan
let currentHints = [];   // 3 petunjuk untuk soal saat ini

const gameUI = {
  get story() { return $("#q-story"); },
  get visual() { return $("#q-visual"); },
  get preview() { return $("#q-preview"); },
  get answers() { return $("#q-answers"); },
  correct: html => onCorrect(html),
  wrong: html => onWrong(html),
  say: (html, type) => sayGuide(html, type),
};

function startLevel(id, skipTutorial) {
  const level = LEVELS.find(l => l.id === id);
  if (!level) return;

  // Tutorial singkat sebelum pertama kali masuk dunia FPB / KPK
  if (!skipTutorial && level.tutorial && !save.tutorials[level.tutorial]) {
    const name = level.tutorial.toUpperCase();
    showModal({
      icon: "📚", title: "Belajar dulu, yuk!",
      text: `Sebelum bermain, kita kenalan dengan <b>${name}</b> sebentar. Cuma 1 menit! 😊`,
      buttons: [
        { label: "📚 Ayo belajar", cls: "btn-primary", onClick: () => openTutorial(level.tutorial, id) },
        { label: "Langsung main", cls: "btn-light", onClick: () => startLevel(id, true) },
      ],
    });
    return;
  }

  run = { level, q: 0, points: 0, hints: 0, wrong: 0, qHints: 0, qWrong: 0, answered: false };
  const world = WORLDS.find(w => w.id === level.world);
  $("#game-world").textContent = `${world.icon} ${world.name}`;
  $("#game-level").textContent = `Level ${level.id}: ${level.title}`;
  $("#guide-avatar").textContent = CONFIG.guide.emoji;
  showScreen("game");
  renderQuestion();

  if (level.intro) {
    showModal({
      icon: CONFIG.guide.emoji, title: level.title, text: level.intro,
      buttons: [{ label: "Ayo mulai! ▶", cls: "btn-primary" }],
    });
  }
}

function renderQuestion() {
  const questions = run.level.questions;
  const q = questions[run.q];
  run.qHints = 0; run.qWrong = 0; run.answered = false;

  ["#q-story", "#q-visual", "#q-preview", "#q-answers", "#guide-msg", "#hint-box", "#feedback"]
    .forEach(sel => { $(sel).innerHTML = ""; });
  $("#q-count").textContent = `Soal ${run.q + 1} dari ${questions.length}`;
  $("#q-bar-fill").style.width = (run.q / questions.length) * 100 + "%";
  $("#run-points").textContent = run.points;

  const hintBtn = $("#btn-hint");
  hintBtn.disabled = false;
  hintBtn.classList.remove("pulse");
  hintBtn.textContent = "💡 Petunjuk (0/3)";

  const render = QUESTION_TYPES[q.type];
  if (!render) {
    $("#q-story").innerHTML = `Jenis soal "${q.type}" tidak dikenal.`;
    currentHints = [];
    return;
  }
  currentHints = render(q, gameUI) || [];
}

function sayGuide(html, type = "info") {
  $("#guide-msg").innerHTML = `
    <div class="msg ${type} pop"><span class="msg-icon">${CONFIG.guide.emoji}</span><div>${html}</div></div>`;
}

function showHint() {
  if (!run || run.answered || run.qHints >= currentHints.length) return;
  const i = run.qHints;
  run.qHints++; run.hints++; save.stats.hints++;
  Sound.play("coin");
  const card = el("div", "hint-card pop", `<span class="hint-title">💡 Petunjuk ${i + 1}</span>${currentHints[i]()}`);
  $("#hint-box").appendChild(card);
  const btn = $("#btn-hint");
  btn.classList.remove("pulse");
  btn.textContent = `💡 Petunjuk (${run.qHints}/3)`;
  if (run.qHints >= currentHints.length) btn.disabled = true;
  card.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function onWrong(reason) {
  if (run.answered) return;
  run.qWrong++; run.wrong++; save.stats.wrong++;
  Sound.play("wrong");
  let html = `<b>Ups! Tidak apa-apa 😊</b><br>${reason}<br>Ayo kita coba bersama.`;
  if (run.qWrong >= 2 && run.qHints < 3) {
    html += `<br><b>Yuk gunakan petunjuk 💡</b>`;
    $("#btn-hint").classList.add("pulse");
  }
  sayGuide(html, "oops");
  shake($("#q-answers"));
  saveGame();
}

function onCorrect(explainHtml) {
  if (run.answered) return;
  run.answered = true;
  const noHint = run.qHints === 0;
  const pts = noHint ? CONFIG.points.correctNoHint : CONFIG.points.correct;
  run.points += pts;
  save.stats.correct++;
  saveGame();

  $("#q-answers").querySelectorAll("button").forEach(b => { b.disabled = true; });
  $("#btn-hint").disabled = true;
  $("#btn-hint").classList.remove("pulse");
  $("#guide-msg").innerHTML = "";
  $("#run-points").textContent = run.points;
  $("#q-bar-fill").style.width = ((run.q + 1) / run.level.questions.length) * 100 + "%";

  const isLast = run.q === run.level.questions.length - 1;
  const praise = CONFIG.praise[Math.floor(Math.random() * CONFIG.praise.length)];
  $("#feedback").innerHTML = `
    <div class="correct-card pop">
      <div class="big">🎉 ${praise}</div>
      <p>Kamu menemukan jawabannya!</p>
      <div class="explain">${explainHtml}</div>
      <div class="plus">+${pts} 🪙 ${noHint ? "<small>(tanpa petunjuk!)</small>" : ""}</div>
      <button class="btn btn-primary btn-big" id="btn-next">${isLast ? "Lihat Hasil 🏁" : "Lanjut ▶"}</button>
    </div>`;
  $("#btn-next").onclick = () => { Sound.play("click"); nextQuestion(); };
  Sound.play("correct");
  confetti(16);
  setTimeout(() => $("#feedback").scrollIntoView({ behavior: "smooth", block: "center" }), 150);
}

function nextQuestion() {
  run.q++;
  if (run.q < run.level.questions.length) {
    renderQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    finishLevel();
  }
}

function finishLevel() {
  const level = run.level;
  const bonus = CONFIG.points.levelDone;
  const total = run.points + bonus;
  const help = run.hints + run.wrong;           // semakin sedikit bantuan, semakin banyak bintang
  const stars = help === 0 ? 3 : help <= 3 ? 2 : 1;

  const prev = save.levels[level.id];
  save.levels[level.id] = {
    stars: Math.max(stars, prev ? prev.stars : 0),
    best: Math.max(total, prev ? prev.best : 0),
  };
  save.coins += total;
  save.stats.played++;
  if (run.hints === 0) save.flags.noHintLevel = true;
  if (level.id >= save.unlocked && level.id < LEVELS.length) save.unlocked = level.id + 1;

  const newBadges = checkBadges();
  saveGame();
  renderResult({ level, stars, points: run.points, bonus, total, newBadges });
  showScreen("result");
  Sound.play("win");
  confetti(stars * 14);
}

function checkBadges() {
  const fresh = BADGES.filter(b => !save.badges.includes(b.id) && b.check(save));
  fresh.forEach(b => save.badges.push(b.id));
  return fresh;
}

function renderResult(r) {
  const next = LEVELS.find(l => l.id === r.level.id + 1);
  const msg = r.stars === 3 ? "Luar biasa! Sempurna! 🥳" : r.stars === 2 ? "Hebat sekali! 👏" : "Bagus! Terus berlatih, ya! 💪";
  const box = $("#result-box");
  box.innerHTML = `
    <div class="result-avatar bounce">${avatar().emoji}</div>
    <h2>Level ${r.level.id} Selesai!</h2>
    <div class="result-stars">
      ${[1, 2, 3].map(i => `<span class="rs ${i <= r.stars ? "on" : ""}" style="animation-delay:${i * 0.25}s">⭐</span>`).join("")}
    </div>
    <p class="result-msg">${msg}</p>
    <div class="result-table">
      <div><span>✅ Jawaban benar</span><b>+${r.points}</b></div>
      <div><span>🏁 Bonus level</span><b>+${r.bonus}</b></div>
      <div class="total"><span>🪙 Koin didapat</span><b>+${r.total}</b></div>
    </div>
    ${r.newBadges.length ? `
      <div class="new-badges"><p>🎁 Lencana baru!</p>
        ${r.newBadges.map(b => `<div class="badge pop"><span class="b-icon">${b.icon}</span><b>${b.name}</b></div>`).join("")}
      </div>` : ""}
    ${next ? "" : `<p class="master-msg">🏆 Kamu sudah menamatkan semua level!<br>Kamu Master Matematika! 👑</p>`}
    <div class="result-buttons">
      ${next ? `<button class="btn btn-primary btn-big" id="res-next">▶ Level Berikutnya</button>` : ""}
      <button class="btn btn-secondary" id="res-again">🔁 Main Lagi</button>
      <button class="btn btn-light" data-go="map">🗺️ Peta Level</button>
    </div>`;
  if (next) $("#res-next").onclick = () => { Sound.play("click"); startLevel(next.id); };
  $("#res-again").onclick = () => { Sound.play("click"); startLevel(r.level.id, true); };
}


/* =========================================================
   13. TUTORIAL (Contoh → Anak mencoba → Feedback)
   Setiap slide: { title, lock, render(body, ctl) }
   lock: true -> tombol Lanjut aktif setelah ctl.unlock()
   ========================================================= */
const TUTORIALS = {
  fpb: {
    title: "🏰 Belajar FPB",
    slides: [
      {
        title: "FPB itu apa?",
        render(body) {
          body.innerHTML = `
            <div class="big-emoji bounce">${CONFIG.guide.emoji}</div>
            <p class="big-text">FPB adalah angka <b>terbesar</b> yang bisa <b>membagi</b> dua angka <b>tanpa sisa</b>.</p>
            <div class="letters">
              <div class="letter"><b>F</b><small>Faktor<br>(pembagi)</small></div>
              <div class="letter"><b>P</b><small>Persekutuan<br>(yang sama)</small></div>
              <div class="letter"><b>B</b><small>Terbesar</small></div>
            </div>`;
        },
      },
      {
        title: "Contoh 🍎🍊",
        render(body) {
          body.innerHTML = `
            <p class="big-text">Rani punya <b>4</b> 🍎 dan <b>6</b> 🍊.</p>
            <div class="q-visual">${pileHTML("🍎", 4)}${pileHTML("🍊", 6)}</div>
            <p class="big-text">Rani mau membuat keranjang 🧺 yang isinya <b>sama</b>.</p>`;
        },
      },
      {
        title: "Coba 2 keranjang",
        render(body) {
          body.innerHTML = groupsHTML([{ emoji: "🍎", n: 4 }, { emoji: "🍊", n: 6 }], 2) +
            `<p class="big-text">Tiap keranjang: 2 🍎 dan 3 🍊. <b>Bisa!</b> 👍</p>`;
        },
      },
      {
        title: "Coba 3 keranjang",
        render(body) {
          body.innerHTML = groupsHTML([{ emoji: "🍎", n: 4 }, { emoji: "🍊", n: 6 }], 3) +
            `<p class="big-text">Ada 🍎 yang tersisa. <b>Tidak bisa!</b></p>`;
        },
      },
      {
        title: "Jadi ...",
        render(body) {
          body.innerHTML = `
            <p class="big-text">Faktor 4: ${chips([1, 2, 4], [1, 2])}</p>
            <p class="big-text">Faktor 6: ${chips([1, 2, 3, 6], [1, 2])}</p>
            <p class="big-text">Yang sama: 1 dan 2. Paling besar: <b>2</b></p>
            <p class="big-text">🎉 <b>FPB dari 4 dan 6 adalah 2</b></p>`;
        },
      },
      {
        title: "Sekarang kamu! ✋",
        lock: true,
        render(body, ctl) {
          body.innerHTML = `
            <p class="big-text">Ada <b>6</b> 🍎 dan <b>9</b> 🍊.<br>Berapa keranjang <b>paling banyak</b>?</p>
            <div class="q-visual">${pileHTML("🍎", 6)}${pileHTML("🍊", 9)}</div>
            <div class="q-answers" id="tut-choices"></div>
            <div id="tut-preview"></div>
            <div class="tut-msg" id="tut-msg"></div>`;
          const parts = [{ emoji: "🍎", n: 6 }, { emoji: "🍊", n: 9 }];
          choiceButtons($("#tut-choices"), [1, 2, 3, 6], (v, btn) => {
            $("#tut-preview").innerHTML = groupsHTML(parts, v);
            if (v === 3) {
              btn.classList.add("right");
              $("#tut-msg").innerHTML = "🎉 Hebat! 6 dan 9 bisa dibagi jadi 3 keranjang.<br>FPB dari 6 dan 9 adalah 3.";
              $("#tut-choices").querySelectorAll("button").forEach(b => { b.disabled = true; });
              Sound.play("correct"); confetti(14); ctl.unlock();
            } else {
              btn.disabled = true; btn.classList.add("wrongpick");
              Sound.play("wrong");
              $("#tut-msg").innerHTML = (6 % v === 0 && 9 % v === 0)
                ? "Bisa! Tapi coba yang <b>lebih banyak</b> 😊"
                : "Ups! Masih ada sisa. Coba lagi 😊";
            }
          });
        },
      },
    ],
  },

  kpk: {
    title: "🚀 Belajar KPK",
    slides: [
      {
        title: "KPK itu apa?",
        render(body) {
          body.innerHTML = `
            <div class="big-emoji bounce">${CONFIG.guide.emoji}</div>
            <p class="big-text">KPK adalah kelipatan <b>terkecil</b> yang <b>sama</b>.</p>
            <p class="big-text">Gampangnya: di angka berapa mereka <b>pertama kali bertemu</b>?</p>
            <div class="letters">
              <div class="letter"><b>K</b><small>Kelipatan<br>(lompatan)</small></div>
              <div class="letter"><b>P</b><small>Persekutuan<br>(yang sama)</small></div>
              <div class="letter"><b>K</b><small>Terkecil</small></div>
            </div>`;
        },
      },
      {
        title: "Kelipatan itu apa?",
        render(body) {
          body.innerHTML = `
            <p class="big-text">Kelipatan = hasil <b>lompat berulang</b>.</p>
            <p class="big-text">🐰 lompat 2: ${chips([2, 4, 6, 8, 10])} ...</p>
            <p class="big-text">🐸 lompat 3: ${chips([3, 6, 9, 12, 15])} ...</p>`;
        },
      },
      {
        title: "Ayo lompat! 🐾",
        lock: true,
        render(body, ctl) {
          body.innerHTML = `
            <p class="big-text">🐰 lompat <b>2</b>, 🐸 lompat <b>3</b>. Tekan <b>🐾 Lompat!</b></p>
            <div class="q-visual" id="tut-line"></div>
            <div class="tut-msg" id="tut-msg"></div>`;
          numberLineWithControls($("#tut-line"), {
            a: 2, b: 3, max: 9, animalA: ANIMALS.kelinci, animalB: ANIMALS.katak,
            onMeet: n => {
              $("#tut-msg").innerHTML = `🎉 Mereka bertemu di angka ${n}!`;
              Sound.play("correct"); confetti(12); ctl.unlock();
            },
          });
        },
      },
      {
        title: "Jadi ...",
        render(body) {
          body.innerHTML = `
            <p class="big-text">Kelipatan 2: ${chips([2, 4, 6, 8], [6])}</p>
            <p class="big-text">Kelipatan 3: ${chips([3, 6, 9, 12], [6])}</p>
            <p class="big-text">Pertama kali sama: <b>6</b></p>
            <p class="big-text">🎉 <b>KPK dari 2 dan 3 adalah 6</b></p>`;
        },
      },
      {
        title: "Sekarang kamu! ✋",
        lock: true,
        render(body, ctl) {
          body.innerHTML = `
            <p class="big-text">🐰 lompat <b>3</b>, 🐸 lompat <b>4</b>.<br>Di angka berapa mereka <b>pertama kali</b> bertemu?</p>
            <div class="q-visual" id="tut-line"></div>
            <div class="q-answers" id="tut-choices"></div>
            <div class="tut-msg" id="tut-msg"></div>`;
          const nl = numberLineWithControls($("#tut-line"), {
            a: 3, b: 4, max: 16, animalA: ANIMALS.kelinci, animalB: ANIMALS.katak,
          });
          choiceButtons($("#tut-choices"), [7, 12, 16, 24], (v, btn) => {
            if (v === 12) {
              btn.classList.add("right");
              $("#tut-msg").innerHTML = "🎉 Hebat! Mereka bertemu di 12.<br>KPK dari 3 dan 4 adalah 12.";
              $("#tut-choices").querySelectorAll("button").forEach(b => { b.disabled = true; });
              if (!nl.isMet()) nl.playToMeet();
              Sound.play("correct"); confetti(14); ctl.unlock();
            } else {
              btn.disabled = true; btn.classList.add("wrongpick");
              Sound.play("wrong");
              $("#tut-msg").innerHTML = v === 24
                ? "24 memang bertemu, tapi bukan yang <b>pertama</b> 😊"
                : "Ups! Coba lagi 😊 Tekan 🐾 Lompat! untuk melihat.";
            }
          });
        },
      },
    ],
  },
};

let tut = null;   // { id, i, returnLevel, canNext }

function openTutorial(id, returnLevel) {
  tut = { id, i: 0, returnLevel: returnLevel || null, canNext: true };
  $("#tut-title").textContent = TUTORIALS[id].title;
  showScreen("tutorial");
  renderSlide();
}

function renderSlide() {
  const t = TUTORIALS[tut.id];
  const slide = t.slides[tut.i];
  $("#tut-dots").innerHTML = t.slides.map((_, i) => `<span class="${i <= tut.i ? "on" : ""}"></span>`).join("");
  $("#tut-slide-title").textContent = slide.title;
  const body = $("#tut-body");
  body.innerHTML = "";
  body.classList.remove("pop"); void body.offsetWidth; body.classList.add("pop");
  tut.canNext = !slide.lock;
  slide.render(body, { unlock() { tut.canNext = true; updateTutNav(); } });
  updateTutNav();
}

function updateTutNav() {
  const t = TUTORIALS[tut.id];
  const isLast = tut.i === t.slides.length - 1;
  $("#tut-prev").style.visibility = tut.i === 0 ? "hidden" : "visible";
  const next = $("#tut-next");
  next.disabled = !tut.canNext;
  next.textContent = !tut.canNext ? "Coba dulu, ya 😊" : isLast ? "Selesai 🎉" : "Lanjut ▶";
}

function finishTutorial() {
  const id = tut.id;
  save.tutorials[id] = true;
  const newBadges = checkBadges();
  saveGame();
  Sound.play("win");
  confetti(30);
  const levelId = tut.returnLevel;
  const badgeText = newBadges.length ? `<br>🎁 Lencana baru: <b>${newBadges.map(b => b.icon + " " + b.name).join(", ")}</b>` : "";
  const buttons = levelId
    ? [{ label: `▶ Main Level ${levelId}`, cls: "btn-primary", onClick: () => startLevel(levelId, true) }]
    : [
        { label: "🗺️ Ayo main!", cls: "btn-primary", onClick: () => go("map") },
        { label: "📚 Kembali ke Belajar", cls: "btn-light", onClick: () => go("learn") },
      ];
  showModal({
    icon: "🎓", title: "Pelajaran selesai!",
    text: `Kamu sudah kenal <b>${id.toUpperCase()}</b>. Hebat! 🌟${badgeText}`,
    buttons,
  });
}


/* =========================================================
   14. MULAI!
   ========================================================= */
function init() {
  // Tombol navigasi umum: <button data-go="map">
  document.addEventListener("click", e => {
    const goBtn = e.target.closest("[data-go]");
    if (goBtn) { Sound.play("click"); go(goBtn.dataset.go); return; }
    const tutBtn = e.target.closest("[data-tutorial]");
    if (tutBtn) { Sound.play("click"); openTutorial(tutBtn.dataset.tutorial, null); }
  });

  $("#btn-sound").onclick = () => {
    save.sound = !save.sound;
    saveGame(); updateTopbar(); Sound.play("click");
  };
  $("#btn-hint").onclick = showHint;

  $("#game-exit").onclick = () => showModal({
    icon: "🤔", title: "Keluar dari level?",
    text: "Nilai di level ini belum tersimpan.",
    buttons: [
      { label: "Lanjut main", cls: "btn-primary" },
      { label: "Keluar", cls: "btn-light", onClick: () => go("map") },
    ],
  });

  $("#tut-prev").onclick = () => { if (tut.i > 0) { tut.i--; Sound.play("click"); renderSlide(); } };
  $("#tut-next").onclick = () => {
    if (!tut.canNext) return;
    Sound.play("click");
    if (tut.i < TUTORIALS[tut.id].slides.length - 1) { tut.i++; renderSlide(); }
    else finishTutorial();
  };
  $("#tut-exit").onclick = () => go(tut && tut.returnLevel ? "map" : "learn");

  go("home");
}

document.addEventListener("DOMContentLoaded", init);
