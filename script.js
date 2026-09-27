/* ============================================================
   Petualangan KPK & FPB — script.js
   Game edukasi matematika (KPK & FPB) untuk SD kelas 3
   Vanilla JS, tanpa backend, progress di localStorage.
   ============================================================ */
'use strict';

/* ---------- Util matematika ---------- */
function gcd(a, b){ while(b){ [a, b] = [b, a % b]; } return a; }        // FPB
function lcm(a, b){ return a * b / gcd(a, b); }                          // KPK
function multiplesUpTo(n, count){ const r=[]; for(let i=1;i<=count;i++) r.push(n*i); return r; }
function factorsOf(n){ const r=[]; for(let i=1;i<=n;i++) if(n%i===0) r.push(i); return r; }
function shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function uniq(arr){ return [...new Set(arr)]; }

/* Buat pilihan jawaban: jawaban benar + 3 pengecoh masuk akal */
function buildOptions(answer, kind){
  const opts = new Set([answer]);
  const pool = [];
  if(kind === 'KPK'){
    // pengecoh: kelipatan lain, jumlah dua angka, salah satu angka x2
    pool.push(answer + 2, answer - 2, answer + 4, Math.round(answer/2), answer*2);
  } else {
    pool.push(answer + 1, answer - 1, answer + 2, answer + 3, Math.max(1, answer-2));
  }
  const sh = shuffle(pool);
  for(const p of sh){ if(opts.size>=4) break; if(p>0 && p!==answer) opts.add(p); }
  let n=1; while(opts.size<4){ opts.add(answer+n*5); n++; }
  return shuffle([...opts].slice(0,4));
}

/* ============================================================
   DATA LEVEL (15 level, mudah ditambah)
   type: KPK | FPB | STORY_KPK | STORY_FPB | CHOOSE
   ============================================================ */
const LEVELS = [
  // Level 1-3 : pengenalan, angka kecil
  { type:'KPK', pairs:[[2,4],[2,3],[3,6]] },
  { type:'FPB', pairs:[[4,8],[6,9],[4,6]] },
  { type:'KPK', pairs:[[4,8],[2,6],[3,4]] },
  // Level 4-6 : angka lebih besar
  { type:'FPB', pairs:[[8,12],[9,12],[6,15]] },
  { type:'KPK', pairs:[[4,6],[6,8],[3,5]] },
  { type:'FPB', pairs:[[12,18],[10,15],[8,20]] },
  // Level 7-9 : soal cerita
  { type:'STORY_KPK', pairs:[[4,6],[5,10],[3,4]] },
  { type:'STORY_FPB', pairs:[[12,18],[8,12],[16,24]] },
  { type:'STORY_KPK', pairs:[[6,8],[4,10],[6,9]] },
  // Level 10-12 : campuran, anak memilih KPK atau FPB
  { type:'CHOOSE', pairs:[['KPK',4,6],['FPB',12,18],['KPK',3,5]] },
  { type:'CHOOSE', pairs:[['FPB',8,12],['KPK',6,8],['FPB',10,15]] },
  { type:'CHOOSE', pairs:[['KPK',4,10],['FPB',16,24],['KPK',5,6]] },
  // Level 13-15 : tantangan (tetap level SD kelas 3)
  { type:'KPK', pairs:[[6,9],[8,12],[9,12]] },
  { type:'FPB', pairs:[[18,24],[16,20],[15,20]] },
  { type:'CHOOSE', pairs:[['KPK',8,12],['FPB',18,24],['KPK',6,10]] },
];
const TOTAL_LEVELS = LEVELS.length;

/* ============================================================
   DATA BADGE
   ============================================================ */
const BADGES = [
  { id:'kpk',   ico:'🐇', name:'Master KPK',        desc:'Selesai 3 level KPK', check:s=>countTypeCleared(s,'KPK')>=3 },
  { id:'fpb',   ico:'🍬', name:'Master FPB',        desc:'Selesai 3 level FPB', check:s=>countTypeCleared(s,'FPB')>=3 },
  { id:'jago',  ico:'🧮', name:'Jago Berhitung',    desc:'Kumpulkan 200 poin',  check:s=>s.points>=200 },
  { id:'l5',    ico:'🎖️', name:'5 Level Selesai',   desc:'Tamatkan 5 level',    check:s=>levelsCleared(s)>=5 },
  { id:'l10',   ico:'🏅', name:'10 Level Selesai',  desc:'Tamatkan 10 level',   check:s=>levelsCleared(s)>=10 },
  { id:'all',   ico:'👑', name:'Semua Level Selesai',desc:'Tamatkan 15 level',   check:s=>levelsCleared(s)>=TOTAL_LEVELS },
];

/* ============================================================
   STATE + LOCALSTORAGE
   ============================================================ */
const SAVE_KEY = 'petualangan_kpk_fpb_v1';
const defaultState = {
  points:0,
  stars:{},        // { levelIndex: bintang(1-3) }
  cleared:{},      // { levelIndex: true }
  badges:{},       // { badgeId: true }
  bestChallenge:0,
  sound:true,
  livesOn:true,
};
let state = loadProgress();

function loadProgress(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(raw){ return Object.assign({}, defaultState, JSON.parse(raw)); }
  }catch(e){ console.warn('Gagal memuat progress:', e); }
  return JSON.parse(JSON.stringify(defaultState));
}
function saveProgress(){
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
  catch(e){ console.warn('Gagal menyimpan progress:', e); }
}
function levelsCleared(s=state){ return Object.keys(s.cleared).filter(k=>s.cleared[k]).length; }
function countTypeCleared(s, t){
  let c=0;
  Object.keys(s.cleared).forEach(k=>{
    if(!s.cleared[k]) return;
    const lv = LEVELS[+k];
    if(!lv) return;
    if(t==='KPK' && (lv.type==='KPK'||lv.type==='STORY_KPK')) c++;
    if(t==='FPB' && (lv.type==='FPB'||lv.type==='STORY_FPB')) c++;
  });
  return c;
}
function totalStars(s=state){ return Object.values(s.stars).reduce((a,b)=>a+b,0); }
function badgeCount(s=state){ return Object.values(s.badges).filter(Boolean).length; }
function isUnlocked(idx){ return idx===0 || !!state.cleared[idx-1]; }

/* ============================================================
   AUDIO (Web Audio API — tanpa file)
   ============================================================ */
let audioCtx = null;
function ensureAudio(){
  if(!audioCtx){
    try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e){ audioCtx = null; }
  }
  if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}
function beep(freq, dur=0.12, type='sine', vol=0.15){
  if(!state.sound || !audioCtx) return;
  try{
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
  }catch(e){/* silent */}
}
const sfx = {
  click(){ beep(520, 0.06, 'square', 0.08); },
  correct(){ beep(660,0.1,'sine',0.13); setTimeout(()=>beep(880,0.14,'sine',0.13),90); },
  wrong(){ beep(300,0.15,'sawtooth',0.1); },
  win(){ [523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,0.16,'triangle',0.14), i*130)); },
  star(){ beep(1200,0.1,'sine',0.12); },
};

/* ============================================================
   NAVIGASI SCREEN
   ============================================================ */
function show(name){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const el = document.getElementById('screen-'+name);
  if(el) el.classList.add('active');
  // refresh data tiap screen
  if(name==='menu') renderMenu();
  if(name==='levelselect') renderLevelSelect();
  if(name==='reward') renderReward();
  if(name==='progress') renderProgress();
  if(name==='settings') renderSettings();
}

function toast(msg, ms=1600){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>t.classList.remove('show'), ms);
}

/* ============================================================
   RENDER: MENU
   ============================================================ */
function renderMenu(){
  document.getElementById('menuPoints').textContent = state.points;
  document.getElementById('menuBadges').textContent = badgeCount();
}

/* ============================================================
   RENDER: LEVEL SELECT
   ============================================================ */
function renderLevelSelect(){
  document.getElementById('lsPoints').textContent = state.points;
  const grid = document.getElementById('levelGrid');
  grid.innerHTML = '';
  LEVELS.forEach((lv, idx)=>{
    const unlocked = isUnlocked(idx);
    const stars = state.stars[idx] || 0;
    const tag = tagOf(lv.type);
    const card = document.createElement('div');
    card.className = 'level-card' + (unlocked ? '' : ' locked');
    card.innerHTML = `
      ${unlocked ? '' : '<span class="lock-ico">🔒</span>'}
      <div class="lc-num">${idx+1}</div>
      <span class="lc-type ${tag}">${tag}</span>
      <div class="lc-stars">${unlocked ? starStr(stars) : ''}</div>`;
    if(unlocked){
      card.addEventListener('click', ()=>{ sfx.click(); startLevel(idx); });
    }else{
      card.addEventListener('click', ()=>toast('Selesaikan level sebelumnya dulu ya! 🔒'));
    }
    grid.appendChild(card);
  });
}
function tagOf(type){
  if(type==='KPK'||type==='STORY_KPK') return 'KPK';
  if(type==='FPB'||type==='STORY_FPB') return 'FPB';
  return 'MIX';
}
function starStr(n){ return n>0 ? '⭐'.repeat(n) + '☆'.repeat(3-n) : '☆☆☆'; }

/* ============================================================
   TUTORIAL INTERAKTIF (KPK & FPB)
   ============================================================ */
let tutState = { mode:'KPK', step:0, steps:[] };

function openTutorial(mode){
  tutState.mode = mode;
  tutState.step = 0;
  tutState.steps = mode==='KPK' ? kpkTutorialSteps() : fpbTutorialSteps();
  document.getElementById('tutTitle').textContent = mode==='KPK' ? 'Belajar KPK 🐇' : 'Belajar FPB 🍬';
  show('tutorial');
  renderTutStep();
}

function kpkTutorialSteps(){
  return [
    ()=>`<div class="mascot mascot-sm bounce"><div class="mascot-face"><span class="m-eye"></span><span class="m-eye"></span><span class="m-smile"></span></div></div>
      <h3>Yuk kenalan dengan Kelipatan!</h3>
      <p>Kelipatan adalah hasil kali sebuah angka.</p>
      <div class="number-line">${[2,4,6,8,10,12].map((n,i)=>`<span class="nl-chip pop" style="animation-delay:${i*0.12}s">${n}</span>`).join('')}</div>
      <p>Ini kelipatan <b>2</b>: 2, 4, 6, 8, 10, 12...</p>`,
    ()=>`<h3>Sekarang coba dua angka</h3>
      <p>Ada dua teman yang <b>melompat</b>! 🐰</p>
      <div class="jump-row"><div class="jump-label" style="color:#1c7ec4">Teman A lompat 3-3:</div>
        <div class="number-line">${[3,6,9,12,15].map((n,i)=>`<span class="nl-chip a pop" style="animation-delay:${i*0.1}s">${n}</span>`).join('')}</div></div>
      <div class="jump-row"><div class="jump-label" style="color:#c93980">Teman B lompat 4-4:</div>
        <div class="number-line">${[4,8,12,16].map((n,i)=>`<span class="nl-chip b pop" style="animation-delay:${i*0.1}s">${n}</span>`).join('')}</div></div>
      <p>Kapan mereka bertemu di angka yang sama?</p>`,
    ()=>`<h3>Ketemu! 🎉</h3>
      <p>Lihat, angka yang sama pertama kali adalah...</p>
      <div class="number-line">
        <span class="nl-chip a">3,6,9</span>
        <span class="nl-chip hit">12</span>
        <span class="nl-chip b">4,8</span>
      </div>
      <p class="meet-tag">Mereka bertemu di 12!</p>
      <p><b>KPK dari 3 dan 4 adalah 12.</b></p>
      <p class="q-sub">KPK = angka yang <b>bertemu duluan</b>.</p>`,
    ()=>`<div class="mascot mascot-sm bounce"><div class="mascot-face"><span class="m-eye"></span><span class="m-eye"></span><span class="m-smile"></span></div></div>
      <h3>Kamu sudah paham KPK! 🌟</h3>
      <p>Ingat: cari kelipatan kedua angka, lalu ambil angka <b>sama yang paling kecil</b>.</p>
      <p>Yuk kita coba bermain! 🎮</p>`,
  ];
}
function fpbTutorialSteps(){
  return [
    ()=>`<div class="mascot mascot-sm bounce"><div class="mascot-face"><span class="m-eye"></span><span class="m-eye"></span><span class="m-smile"></span></div></div>
      <h3>Yuk kenalan dengan Faktor!</h3>
      <p>Faktor adalah angka yang bisa <b>membagi habis</b>.</p>
      <div class="number-line">${[1,2,4,8].map((n,i)=>`<span class="nl-chip pop" style="animation-delay:${i*0.12}s">${n}</span>`).join('')}</div>
      <p>Angka <b>8</b> bisa dibagi: 1, 2, 4, 8.</p>`,
    ()=>`<h3>Sekarang coba dua angka</h3>
      <p>Kita bagi <b>permen</b> secara adil! 🍬</p>
      <div class="jump-row"><div class="jump-label" style="color:#1c7ec4">Faktor 8:</div>
        <div class="number-line">${[1,2,4,8].map((n,i)=>`<span class="nl-chip a pop" style="animation-delay:${i*0.1}s">${n}</span>`).join('')}</div></div>
      <div class="jump-row"><div class="jump-label" style="color:#c93980">Faktor 12:</div>
        <div class="number-line">${[1,2,3,4,6,12].map((n,i)=>`<span class="nl-chip b pop" style="animation-delay:${i*0.1}s">${n}</span>`).join('')}</div></div>
      <p>Mana angka yang <b>sama</b>?</p>`,
    ()=>`<h3>Angka yang sama 🎉</h3>
      <div class="number-line">
        <span class="nl-chip">1</span>
        <span class="nl-chip">2</span>
        <span class="nl-chip hit">4</span>
      </div>
      <p>Angka sama: 1, 2, 4. Yang <b>terbesar</b> adalah <b>4</b>.</p>
      <p class="meet-tag">FPB dari 8 dan 12 adalah 4!</p>
      <p class="q-sub">FPB = angka pembagi <b>terbesar</b> yang sama.</p>`,
    ()=>`<div class="mascot mascot-sm bounce"><div class="mascot-face"><span class="m-eye"></span><span class="m-eye"></span><span class="m-smile"></span></div></div>
      <h3>Kamu sudah paham FPB! 🌟</h3>
      <p>Ingat: cari faktor kedua angka, lalu ambil angka <b>sama yang paling besar</b>.</p>
      <p>Yuk kita coba bermain! 🎮</p>`,
  ];
}

function renderTutStep(){
  const stage = document.getElementById('tutStage');
  stage.innerHTML = tutState.steps[tutState.step]();
  // dots
  const dots = document.getElementById('tutDots');
  dots.innerHTML = tutState.steps.map((_,i)=>`<i class="${i===tutState.step?'on':''}"></i>`).join('');
  // buttons
  document.getElementById('tutPrev').style.visibility = tutState.step===0 ? 'hidden' : 'visible';
  const next = document.getElementById('tutNext');
  next.textContent = tutState.step===tutState.steps.length-1 ? 'Selesai 🎮' : 'Lanjut ›';
}

/* ============================================================
   GAMEPLAY (Level & Challenge)
   ============================================================ */
let game = null;

function makeQuestion(type, args){
  // args: [a,b] atau ['KPK',a,b] untuk CHOOSE
  if(type==='CHOOSE'){
    const [op, a, b] = args;
    const answer = op==='KPK' ? lcm(a,b) : gcd(a,b);
    return { kind:'CHOOSE', op, a, b, answer };
  }
  const [a,b] = args;
  if(type==='KPK' || type==='STORY_KPK'){
    return { kind:'KPK', story:type==='STORY_KPK', a, b, answer:lcm(a,b), options:buildOptions(lcm(a,b),'KPK') };
  }
  // FPB
  return { kind:'FPB', story:type==='STORY_FPB', a, b, answer:gcd(a,b), options:buildOptions(gcd(a,b),'FPB') };
}

function startLevel(idx){
  const lv = LEVELS[idx];
  const questions = lv.pairs.map(p => makeQuestion(lv.type, p));
  game = {
    mode:'level', levelIndex:idx, tag:tagOf(lv.type),
    questions, qi:0, correct:0, sessionPoints:0,
    streak:0, lives:3, hintStep:0, answered:false, chooseStage:0,
  };
  enterGame();
}

function startChallenge(){
  // 8 soal acak campuran KPK & FPB dari angka ramah SD
  const bank = [[4,6],[6,8],[8,12],[9,12],[12,18],[10,15],[6,9],[4,10],[16,24],[6,10],[8,20],[15,20]];
  const qs = [];
  const picks = shuffle(bank).slice(0,8);
  picks.forEach(p=>{
    const useKPK = Math.random()<0.5;
    qs.push(makeQuestion(useKPK?'KPK':'FPB', p));
  });
  game = {
    mode:'challenge', levelIndex:-1, tag:'MIX',
    questions:qs, qi:0, correct:0, sessionPoints:0,
    streak:0, lives:3, hintStep:0, answered:false, chooseStage:0,
  };
  enterGame();
}

function enterGame(){
  show('game');
  updateGameHud();
  renderQuestion();
}

function updateGameHud(){
  document.getElementById('gamePoints').textContent = state.points + game.sessionPoints;
  const lives = document.getElementById('gameLives');
  if(state.livesOn){
    lives.style.display = 'flex';
    lives.textContent = '❤️'.repeat(game.lives) + '🤍'.repeat(Math.max(0,3-game.lives));
  }else{
    lives.style.display = 'none';
  }
  document.getElementById('qTag').textContent = game.tag;
  document.getElementById('qTag').className = 'q-tag ' + game.tag;
  document.getElementById('qCount').textContent = `Soal ${game.qi+1} / ${game.questions.length}`;
  document.getElementById('gameProgressBar').style.width = (game.qi/game.questions.length*100)+'%';
}

function renderQuestion(){
  game.answered = false;
  game.hintStep = 0;
  game.chooseStage = 0;
  updateGameHud();
  const q = game.questions[game.qi];
  const stage = document.getElementById('gameStage');

  if(q.kind==='CHOOSE'){
    renderChooseQuestion(q, stage);
    return;
  }
  if(q.kind==='KPK'){ renderKPKQuestion(q, stage); return; }
  renderFPBQuestion(q, stage);
}

/* ---- KPK question ---- */
function renderKPKQuestion(q, stage){
  const mulA = multiplesUpTo(q.a, 6);
  const mulB = multiplesUpTo(q.b, 6);
  const qtext = q.story
    ? storyKPKText(q)
    : `Cari <b>KPK</b> dari <b>${q.a}</b> dan <b>${q.b}</b>`;
  const sub = q.story ? 'Kapan mereka bertemu lagi?' : 'Angka mana yang mereka temui duluan?';
  stage.innerHTML = `
    <p class="q-text">${qtext}</p>
    <p class="q-sub">${sub}</p>
    <div class="q-visual"><div class="hoppers">
      <div class="hopper"><div class="h-name">🐰 Lompat ${q.a}</div>
        <div class="hop-track">${mulA.map(n=>`<span class="hop-chip a${n===q.answer?' common':''}">${n}</span>`).join('')}</div></div>
      <div class="hopper"><div class="h-name">🐢 Lompat ${q.b}</div>
        <div class="hop-track">${mulB.map(n=>`<span class="hop-chip b${n===q.answer?' common':''}">${n}</span>`).join('')}</div></div>
    </div></div>
    <div class="options">${q.options.map(o=>`<button class="opt" data-val="${o}">${o}</button>`).join('')}</div>
    <button class="btn hint-btn">💡 PETUNJUK</button>
    <div class="feedback" id="fb"></div>
    <div id="hintArea"></div>`;
  wireAnswer(stage, q);
}
function storyKPKText(q){
  const t = [
    `🚌 Bus A datang tiap <b>${q.a}</b> menit. Bus B tiap <b>${q.b}</b> menit. Kapan datang bersama lagi?`,
    `👏 Rina bertepuk tiap <b>${q.a}</b> detik. Budi tiap <b>${q.b}</b> detik. Kapan bertepuk bersama?`,
    `🔔 Lonceng A bunyi tiap <b>${q.a}</b> menit, lonceng B tiap <b>${q.b}</b> menit. Kapan bunyi bersama?`,
  ];
  q._storyPick = q._storyPick ?? Math.floor(Math.random()*t.length);
  return t[q._storyPick];
}

/* ---- FPB question ---- */
function renderFPBQuestion(q, stage){
  const facA = factorsOf(q.a);
  const facB = factorsOf(q.b);
  const qtext = q.story ? storyFPBText(q) : `Cari <b>FPB</b> dari <b>${q.a}</b> dan <b>${q.b}</b>`;
  const sub = q.story ? 'Berapa kelompok terbanyak yang sama rata?' : 'Angka pembagi terbesar yang sama?';
  stage.innerHTML = `
    <p class="q-text">${qtext}</p>
    <p class="q-sub">${sub}</p>
    <div class="q-visual"><div class="candy-wrap">
      <div><span class="candy-label" style="color:#1c7ec4">🍬 ${q.a} permen — faktor:</span>
        <div class="candy-row" style="margin-top:6px">${facA.map(n=>`<span class="hop-chip a${facA.includes(n)&&facB.includes(n)?' common':''}">${n}</span>`).join('')}</div></div>
      <div><span class="candy-label" style="color:#c93980">🍭 ${q.b} permen — faktor:</span>
        <div class="candy-row" style="margin-top:6px">${facB.map(n=>`<span class="hop-chip b${facA.includes(n)&&facB.includes(n)?' common':''}">${n}</span>`).join('')}</div></div>
    </div></div>
    <div class="options">${q.options.map(o=>`<button class="opt" data-val="${o}">${o}</button>`).join('')}</div>
    <button class="btn hint-btn">💡 PETUNJUK</button>
    <div class="feedback" id="fb"></div>
    <div id="hintArea"></div>`;
  wireAnswer(stage, q);
}
function storyFPBText(q){
  const t = [
    `🍬 Ada <b>${q.a}</b> permen merah dan <b>${q.b}</b> permen biru dibagi rata ke beberapa kelompok. Berapa kelompok terbanyak?`,
    `🎁 <b>${q.a}</b> pensil dan <b>${q.b}</b> buku dibagi ke anak sama rata. Berapa anak terbanyak?`,
    `🌸 <b>${q.a}</b> bunga merah dan <b>${q.b}</b> bunga putih dibuat buket sama rata. Berapa buket terbanyak?`,
  ];
  q._storyPick = q._storyPick ?? Math.floor(Math.random()*t.length);
  return t[q._storyPick];
}

/* ---- CHOOSE question (pilih KPK/FPB dulu, lalu jawab) ---- */
function renderChooseQuestion(q, stage){
  const story = q.op==='KPK'
    ? `👏 Rina bertepuk tiap <b>${q.a}</b> detik, Budi tiap <b>${q.b}</b> detik. Kapan bertepuk <b>bersama lagi</b>?`
    : `🍬 <b>${q.a}</b> permen dan <b>${q.b}</b> permen dibagi rata ke kelompok. Berapa <b>kelompok terbanyak</b>?`;
  stage.innerHTML = `
    <p class="q-text">${story}</p>
    <p class="q-sub">Soal ini pakai cara apa?</p>
    <div class="choose">
      <button class="opt pick-kpk" data-op="KPK">KPK<br><small style="font-size:.7rem;font-weight:600">bertemu / bersama</small></button>
      <button class="opt pick-fpb" data-op="FPB">FPB<br><small style="font-size:.7rem;font-weight:600">membagi rata</small></button>
    </div>
    <div class="feedback" id="fb"></div>`;
  stage.querySelectorAll('.choose .opt').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(game.answered) return;
      const pick = btn.dataset.op;
      const fb = document.getElementById('fb');
      if(pick===q.op){
        sfx.correct();
        btn.classList.add('correct');
        fb.textContent = `Betul! Ini pakai ${q.op}. Sekarang hitung ya! 👍`;
        fb.className = 'feedback good';
        game.answered = true;
        // buka tahap hitung
        setTimeout(()=>renderChooseCompute(q, stage), 900);
      }else{
        sfx.wrong();
        btn.classList.add('wrong');
        loseLife();
        fb.textContent = q.op==='KPK'
          ? 'Hampir! Kata "bersama lagi" artinya mereka bertemu → pakai KPK.'
          : 'Hampir! Kata "membagi rata" → pakai FPB.';
        fb.className = 'feedback bad';
        setTimeout(()=>btn.classList.remove('wrong'), 500);
      }
    });
  });
}
function renderChooseCompute(q, stage){
  game.answered = false; game.hintStep = 0;
  const compQ = makeQuestion(q.op, [q.a, q.b]);
  compQ.story = false;
  // render sebagai soal KPK/FPB biasa, tapi jawaban tetap ke handler yang menyelesaikan soal ini
  if(q.op==='KPK') renderKPKQuestion(compQ, stage);
  else renderFPBQuestion(compQ, stage);
}

/* ---- Wire pilihan jawaban numerik ---- */
function wireAnswer(stage, q){
  stage.querySelectorAll('.options .opt').forEach(btn=>{
    btn.addEventListener('click', ()=>onAnswer(btn, q, stage));
  });
  const hintBtn = stage.querySelector('.hint-btn');
  if(hintBtn) hintBtn.addEventListener('click', ()=>showHint(q));
}

function onAnswer(btn, q, stage){
  if(game.answered) return;
  const val = +btn.dataset.val;
  const fb = document.getElementById('fb');
  if(val===q.answer){
    game.answered = true;
    btn.classList.add('correct');
    stage.querySelectorAll('.opt').forEach(b=>b.disabled=true);
    sfx.correct();
    // skor
    let gained = 10;
    game.streak++;
    if(game.streak>=2){ gained += 5; }
    game.sessionPoints += gained;
    game.correct++;
    fb.innerHTML = `🎉 Benar! Kamu hebat! <b>+${gained} poin</b>`;
    fb.className = 'feedback good';
    updateGameHud();
    setTimeout(nextQuestion, 1100);
  }else{
    btn.classList.add('wrong');
    btn.disabled = true;
    game.streak = 0;
    sfx.wrong();
    loseLife();
    fb.textContent = randMsg(['Hampir benar! Yuk lihat lompatannya lagi.','Belum tepat. Coba lihat petunjuknya! 💡','Coba lagi, kamu pasti bisa!']);
    fb.className = 'feedback bad';
  }
}
function randMsg(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function loseLife(){
  if(!state.livesOn) return;
  game.lives = Math.max(0, game.lives-1);
  updateGameHud();
  if(game.lives<=0){
    // mini challenge pemulihan: beri kesempatan lanjut (jangan menghukum keras)
    game.lives = 1;
    updateGameHud();
    toast('Semangat! Nyawa dipulihkan 💪❤️');
  }
}

/* ---- HINT bertahap ---- */
function showHint(q){
  const area = document.getElementById('hintArea');
  const isKPK = q.kind==='KPK';
  const hints = isKPK ? [
    `Coba tulis kelipatan dari <b>${q.a}</b>: ${multiplesUpTo(q.a,5).join(', ')}...`,
    `Sekarang kelipatan dari <b>${q.b}</b>: ${multiplesUpTo(q.b,5).join(', ')}...`,
    `Cari angka <b>sama yang paling kecil</b>. Jawabannya <b>${q.answer}</b>! 😊`,
  ] : [
    `Faktor <b>${q.a}</b>: ${factorsOf(q.a).join(', ')}`,
    `Faktor <b>${q.b}</b>: ${factorsOf(q.b).join(', ')}`,
    `Cari angka <b>sama yang paling besar</b>. Jawabannya <b>${q.answer}</b>! 😊`,
  ];
  if(game.hintStep >= hints.length){ toast('Semua petunjuk sudah keluar 😊'); return; }
  sfx.click();
  let box = area.querySelector('.hint-box');
  if(!box){ box = document.createElement('div'); box.className='hint-box'; area.appendChild(box); }
  const p = document.createElement('p');
  p.innerHTML = `💡 ${hints[game.hintStep]}`;
  box.appendChild(p);
  game.hintStep++;
}

function nextQuestion(){
  game.qi++;
  if(game.qi >= game.questions.length){ finishGame(); return; }
  renderQuestion();
}

/* ============================================================
   SELESAI GAME → hitung bintang, simpan, badge
   ============================================================ */
function finishGame(){
  document.getElementById('gameProgressBar').style.width = '100%';
  const total = game.questions.length;
  const ratio = game.correct/total;
  let stars = 1;
  if(ratio>=0.99) stars = 3;
  else if(ratio>=0.6) stars = 2;

  let earnedBadges = [];

  if(game.mode==='level'){
    const idx = game.levelIndex;
    // tambah poin sesi
    state.points += game.sessionPoints;
    // bonus selesai level +20
    state.points += 20;
    game.sessionPoints += 20;
    // bonus 3 bintang +30
    if(stars===3){ state.points += 30; game.sessionPoints += 30; }
    // simpan bintang terbaik
    if(!state.stars[idx] || stars>state.stars[idx]) state.stars[idx] = stars;
    state.cleared[idx] = true;
    earnedBadges = evaluateBadges();
    saveProgress();
  }else{
    // challenge
    state.points += game.sessionPoints;
    if(game.sessionPoints > state.bestChallenge) state.bestChallenge = game.sessionPoints;
    earnedBadges = evaluateBadges();
    saveProgress();
  }

  showResult(stars, game.sessionPoints, earnedBadges);
}

function evaluateBadges(){
  const newly = [];
  BADGES.forEach(b=>{
    if(!state.badges[b.id] && b.check(state)){
      state.badges[b.id] = true;
      newly.push(b);
    }
  });
  return newly;
}

/* ============================================================
   RESULT SCREEN
   ============================================================ */
function showResult(stars, points, newBadges){
  show('result');
  const starsEl = document.getElementById('resultStars');
  starsEl.textContent = '';
  document.getElementById('resultScore').textContent = points;

  const titles = {3:'Hebat sekali! 🏆',2:'Bagus! Sedikit lagi! 😊',1:'Terus berlatih! 💪'};
  document.getElementById('resultTitle').textContent = titles[stars];
  document.getElementById('resultMsg').textContent =
    stars===3 ? 'Semua jawaban benar!' : `Kamu benar ${game.correct} dari ${game.questions.length} soal.`;

  // badges baru
  const bWrap = document.getElementById('resultBadges');
  bWrap.innerHTML = newBadges.map(b=>`<span class="rb">${b.ico} ${b.name}!</span>`).join('');

  // animasi bintang bertahap: tampilkan 3 slot, isi bintang emas satu per satu
  sfx.win();
  const slots = ['☆','☆','☆'];
  starsEl.textContent = slots.join('');
  let i = 0;
  const iv = setInterval(()=>{
    if(i < stars){ slots[i] = '⭐'; sfx.star(); }
    starsEl.textContent = slots.join('');
    i++;
    if(i >= 3){ clearInterval(iv); }
  }, 360);

  if(stars>=2) confetti();
  if(newBadges.length) setTimeout(()=>toast(`Badge baru: ${newBadges.map(b=>b.name).join(', ')}! 🏆`, 2600), 800);

  // tombol lanjut
  const nextBtn = document.getElementById('resultNext');
  if(game.mode==='level'){
    const next = game.levelIndex+1;
    if(next < TOTAL_LEVELS){
      nextBtn.textContent = 'Level Berikutnya ›';
      nextBtn.onclick = ()=>{ sfx.click(); startLevel(next); };
    }else{
      nextBtn.textContent = 'Selesai! 🎉';
      nextBtn.onclick = ()=>{ sfx.click(); show('levelselect'); };
    }
    document.getElementById('resultReplay').onclick = ()=>{ sfx.click(); startLevel(game.levelIndex); };
  }else{
    nextBtn.textContent = 'Ke Menu ›';
    nextBtn.onclick = ()=>{ sfx.click(); show('menu'); };
    document.getElementById('resultReplay').onclick = ()=>{ sfx.click(); startChallenge(); };
  }
}

function confetti(){
  const box = document.getElementById('confetti');
  box.innerHTML = '';
  const colors = ['#ffd23f','#ff5ea8','#39b7ff','#2ecc71','#ff9d2e','#7c4dff'];
  for(let i=0;i<40;i++){
    const c = document.createElement('i');
    c.style.left = Math.random()*100+'%';
    c.style.background = colors[i%colors.length];
    c.style.animationDuration = (1.5+Math.random()*1.5)+'s';
    c.style.animationDelay = (Math.random()*0.5)+'s';
    box.appendChild(c);
  }
  setTimeout(()=>box.innerHTML='', 3200);
}

/* ============================================================
   RENDER: REWARD / BADGE
   ============================================================ */
function renderReward(){
  const grid = document.getElementById('badgeGrid');
  grid.innerHTML = BADGES.map(b=>{
    const got = !!state.badges[b.id];
    return `<div class="badge-card ${got?'earned':''}">
      <div class="bc-ico">${b.ico}</div>
      <div class="bc-name">${got?b.name:'???'}</div>
      <div class="bc-desc">${b.desc}${got?' ✅':''}</div>
    </div>`;
  }).join('');
}

/* ============================================================
   RENDER: PROGRESS
   ============================================================ */
function renderProgress(){
  const cleared = levelsCleared();
  document.getElementById('prgLevel').textContent = `${cleared} / ${TOTAL_LEVELS}`;
  document.getElementById('prgLevelBar').style.width = (cleared/TOTAL_LEVELS*100)+'%';
  document.getElementById('prgPoints').textContent = state.points;
  document.getElementById('prgStars').textContent = totalStars();
  document.getElementById('prgBadges').textContent = `${badgeCount()}/${BADGES.length}`;
  document.getElementById('prgBest').textContent = state.bestChallenge;
  const track = document.getElementById('prgStarTrack');
  track.innerHTML = LEVELS.map((_,i)=>{
    const s = state.stars[i]||0;
    return `<span class="st-item">L${i+1} ${s>0?'⭐'.repeat(s):'–'}</span>`;
  }).join('');
}

/* ============================================================
   RENDER: SETTINGS
   ============================================================ */
function renderSettings(){
  document.getElementById('setSound').classList.toggle('on', state.sound);
  document.getElementById('setLives').classList.toggle('on', state.livesOn);
  syncAudioIcon();
}
function syncAudioIcon(){
  document.getElementById('audioIcon').textContent = state.sound ? '🔊' : '🔇';
}

/* ============================================================
   EVENT WIRING
   ============================================================ */
function init(){
  // Tombol data-go
  document.querySelectorAll('[data-go]').forEach(btn=>{
    btn.addEventListener('click', ()=>{ ensureAudio(); sfx.click(); show(btn.dataset.go); });
  });
  // Tombol data-action
  document.querySelectorAll('[data-action]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      ensureAudio(); sfx.click();
      const a = btn.dataset.action;
      if(a==='tutorial-kpk') openTutorial('KPK');
      else if(a==='tutorial-fpb') openTutorial('FPB');
      else if(a==='challenge') startChallenge();
    });
  });

  // Tutorial nav
  document.getElementById('tutNext').addEventListener('click', ()=>{
    sfx.click();
    if(tutState.step < tutState.steps.length-1){ tutState.step++; renderTutStep(); }
    else{
      // selesai tutorial → mulai level pertama dari tipe terkait, atau level select
      show('levelselect');
      toast('Yuk pilih level dan mulai bermain! 🎮');
    }
  });
  document.getElementById('tutPrev').addEventListener('click', ()=>{
    sfx.click();
    if(tutState.step>0){ tutState.step--; renderTutStep(); }
  });

  // Game quit
  document.getElementById('gameQuit').addEventListener('click', ()=>{
    sfx.click();
    if(confirm('Keluar dari permainan? Progress soal ini tidak disimpan.')){
      show(game && game.mode==='challenge' ? 'menu' : 'levelselect');
    }
  });

  // Audio toggle (global)
  document.getElementById('audioToggle').addEventListener('click', ()=>{
    state.sound = !state.sound; saveProgress(); syncAudioIcon();
    if(state.sound){ ensureAudio(); sfx.click(); }
    toast(state.sound?'Suara dinyalakan 🔊':'Suara dimatikan 🔇');
  });

  // Settings toggles
  document.getElementById('setSound').addEventListener('click', ()=>{
    state.sound=!state.sound; saveProgress(); renderSettings();
    if(state.sound){ ensureAudio(); sfx.click(); }
  });
  document.getElementById('setLives').addEventListener('click', ()=>{
    sfx.click(); state.livesOn=!state.livesOn; saveProgress(); renderSettings();
  });

  // Reset progress
  document.getElementById('resetProgress').addEventListener('click', ()=>{
    if(confirm('Hapus semua progress dan mulai dari awal?')){
      const keepSound = state.sound, keepLives = state.livesOn;
      state = JSON.parse(JSON.stringify(defaultState));
      state.sound = keepSound; state.livesOn = keepLives;
      saveProgress(); renderProgress();
      toast('Progress direset! Mulai petualangan baru 🚀');
    }
  });

  // Unlock audio pada interaksi pertama
  document.body.addEventListener('pointerdown', ()=>ensureAudio(), { once:true });

  syncAudioIcon();
  renderMenu();
  show('splash');
}

document.addEventListener('DOMContentLoaded', init);
