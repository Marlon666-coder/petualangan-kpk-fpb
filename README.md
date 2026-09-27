# 🎮 Petualangan KPK & FPB

Game edukasi matematika untuk **anak SD kelas 3** dengan topik **KPK** (Kelipatan Persekutuan Terkecil) dan **FPB** (Faktor Persekutuan Terbesar), menggunakan pendekatan **GASING — Gampang, Asyik, Menyenangkan**.

## ✨ Fitur

- **Splash screen** & **Main Menu** warna-warni dengan maskot matematika (digambar murni pakai CSS).
- **Tutorial interaktif KPK** — konsep "dua teman melompat sampai bertemu".
- **Tutorial interaktif FPB** — konsep "membagi permen secara adil".
- **15 level** bertahap:
  - Level 1–3: pengenalan (angka kecil)
  - Level 4–6: angka lebih besar
  - Level 7–9: soal cerita (bus, tepuk tangan, permen)
  - Level 10–12: campuran — anak memilih **KPK** atau **FPB** dulu
  - Level 13–15: tantangan
- **Mini game KPK** ("Lompat Sampai Bertemu") dengan visual lompatan 🐰🐢.
- **Mini game FPB** ("Bagi Permen") dengan visual faktor 🍬.
- **Mode Tantangan** — 8 soal acak campuran.
- **Sistem skor**: +10 benar, +5 bonus beruntun, +20 selesai level, +30 kalau 3 bintang.
- **Bintang** (⭐ maks 3 per level), **hint bertahap** 💡, **sistem nyawa** ❤️ (bisa dimatikan, tidak menghukum keras).
- **Badge/Reward** 🏆, **halaman Progress** dengan progress bar.
- **Audio** dibuat dengan Web Audio API (tanpa file suara) + tombol **🔊 on/off**.
- **Progress tersimpan otomatis** di `localStorage`.
- **Responsive**: HP, tablet, laptop, desktop.

## 🚀 Cara Menjalankan

Cukup buka `index.html` di browser. Tidak perlu server atau backend.

Atau jalankan server statis sederhana:

```bash
cd petualangan-kpk-fpb
python3 -m http.server 8000
# buka http://localhost:8000
```

## 📁 Struktur

```
petualangan-kpk-fpb/
├── index.html      # semua halaman/screen
├── style.css       # desain ramah anak, responsive
├── script.js       # logika game, data level, skor, localStorage
├── README.md
└── assets/
    ├── images/     # (opsional — maskot memakai CSS/emoji)
    └── sounds/     # (opsional — suara dibuat via Web Audio API)
```

## ➕ Menambah Level

Tambahkan entri baru pada array `LEVELS` di `script.js`:

```js
{ type:'KPK', pairs:[[4,6],[6,8]] }          // soal KPK
{ type:'FPB', pairs:[[8,12]] }                // soal FPB
{ type:'STORY_KPK', pairs:[[4,6]] }           // soal cerita KPK
{ type:'CHOOSE', pairs:[['KPK',4,6]] }        // anak pilih KPK/FPB dulu
```

Jawaban dihitung otomatis dan tervalidasi (`gcd`/`lcm`), jadi tidak ada soal ambigu.
