# 🌟 Petualangan FPB & KPK 🌟

Game edukasi matematika untuk **anak SD kelas 3** (usia 8–9 tahun) yang mengajarkan
**FPB (Faktor Persekutuan Terbesar)** dan **KPK (Kelipatan Persekutuan Terkecil)**
dengan pendekatan **GASING** (Gampang, Asyik, Menyenangkan).

Anak belajar konsep lewat **permainan visual** — membagi buah ke keranjang untuk FPB,
dan melihat dua hewan melompat sampai bertemu untuk KPK — bukan lewat rumus.

## ▶ Cara Menjalankan
Cukup buka `index.html` di browser (Chrome, Edge, Safari, atau HP/tablet).
Tidak butuh internet, server, database, atau instalasi apa pun.

## 🎮 Isi Game
- **5 dunia, 15 level**, terbuka bertahap.
- **Tutorial FPB & KPK** yang muncul otomatis sebelum dunia terkait.
- **Sistem petunjuk 3 tingkat** — tanpa kata "salah", selalu ramah anak.
- **Hadiah:** koin, bintang (1–3 per level), dan 11 lencana.
- **Progress tersimpan** otomatis di browser (localStorage).

| Dunia | Level | Isi |
|-------|-------|-----|
| 🌱 Desa Faktor      | 1–3   | Berbagi rata & cari faktor |
| 🌈 Kota Kelipatan   | 4–6   | Lompat hewan & cari kelipatan |
| 🏰 Istana FPB       | 7–9   | Keranjang buah (FPB) |
| 🚀 Planet KPK       | 10–12 | Dua hewan melompat (KPK) |
| 🏆 Tantangan Master | 13–15 | Campuran FPB & KPK |

## 📁 Struktur Project
```
fpb-kpk-game/
├── index.html      # kerangka 8 halaman
├── style.css       # warna, tampilan, animasi
├── script.js       # data level + logika game
└── assets/
    ├── images/     # opsional (game memakai emoji)
    └── sounds/     # opsional (bunyi dibuat oleh browser)
```

## 🔧 Cara Memodifikasi (untuk pemula)
Semua yang sering diubah ada di `script.js`, di **bagian 1 (Pengaturan)** dan **bagian 2 (Data Level)**.

- **Tambah level:** tambahkan objek baru di array `LEVELS` (lihat komentar di atasnya untuk jenis soal).
- **Ubah soal:** cukup ganti angkanya — jawaban dihitung otomatis.
- **Ubah karakter:** edit array `CHARACTERS` (pemain), `ANIMALS` (hewan lompat), atau `CONFIG.guide` (guru pemandu).
- **Ubah warna:** edit nilai di `:root` pada `style.css`; warna tiap dunia ada di `WORLDS[].color`.
- **Pakai suara sendiri:** isi `CONFIG.soundFiles` di `script.js`.

## 🧩 Jenis Soal yang Tersedia
`bagi`, `faktor`, `lompat`, `kelipatan`, `fpb`, `kpk` — masing-masing dijelaskan
di komentar bagian 2 pada `script.js`.

## 💻 Teknologi
HTML + CSS + JavaScript murni (tanpa framework). Bunyi dibuat memakai Web Audio API,
jadi game tetap bersuara tanpa file audio eksternal.
