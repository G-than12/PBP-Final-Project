# 📑 SimpanIn (Mobile Bookmark & Link Manager)
> *"Simpan sekali. Temukan kapan saja."*  
> **Final Project — Pemrograman Berbasis Platform (PBP)**  
> Built with **React Native (Expo SDK 58)**, **TypeScript**, **Zustand**, and **Neobrutalism Design System**.

---

## 🌟 Ringkasan Eksekutif & Latar Belakang

Seringkali pengguna menyimpan inspirasi resep di **Instagram Reels**, rekomendasi tempat wisata di **TikTok**, utas wawasan di **Threads / X**, dan artikel panjang di browser. Namun, tautan-tautan tersebut berakhir tercecer di berbagai aplikasi, terpendam di folder tersimpan masing-masing, atau bahkan terlupakan selamanya (*bookmark hoarding*).

**SimpanIn** hadir sebagai solusi terpusat (*all-in-one link hub*) yang mengusung prinsip **Local-First**, **Privasi Penuh**, dan estetika visual **Neobrutalisme** yang segar. Aplikasi ini memungkinkan pengguna menyimpan tautan langsung dari lembar berbagi (*Share Intent*) atau papan klip (*Clipboard*), mengorganisasikannya ke dalam folder berjenjang tak terbatas, serta menyediakan **Mode Fokus** untuk meninjau simpanan secara bertahap.

---

## ✨ Fitur Unggulan (Portfolio Highlights)

### 1. 🚀 Native Share Target & Auto Clipboard Detection
- **System Share Sheet Integration**: Menerima tautan langsung saat pengguna mengetuk tombol *Bagikan* (*Share*) dari Instagram, TikTok, Threads, YouTube, maupun Google Chrome.
- **Auto-Return Workflow**: Setelah tautan tersimpan ke koleksi yang dipilih, aplikasi menyediakan opsi konfirmasi instan untuk langsung kembali ke aplikasi asal (`BackHandler.exitApp()`) tanpa memutus alur pengguna.
- **Foreground Clipboard Auto-Detect**: Begitu pengguna menyalin link lalu membuka SimpanIn, muncul banner deteksi cerdas di bagian atas beranda yang siap disimpan hanya dalam 1 ketukan.

### 2. 🎨 8-Langkah Tur Onboarding Interaktif (Pixel-Perfect Figma)
- Menghadirkan maskot resmi SimpanIn dengan dialog interaktif.
- Simulasi pemutaran Instagram Reel dan aksi simpan langsung.
- Penjelasan alur tinjau simpanan (*Focus Mode*) dengan kartu warna-warni kontras tinggi.
- Mockup layar kunci (*Lockscreen*) dengan izin notifikasi sistem riil.
- **100% Free & Unlocked**: Tidak ada tier berbayar, paywall palsu, atau batasan kuota. Setelah onboarding selesai, database dibersihkan secara aman dengan koleksi sistem *"Belum Diurutkan"*.

### 3. 🗂️ Pengorganisasian Manila Folder & Subkoleksi Tak Terbatas
- Grid koleksi bergaya map manila (*Manila Folder Card*) dengan tab warna, badge "BARU", dan penanda folder "UTAMA".
- Dukungan koleksi berjenjang (*nested subcollections*) tanpa batas menggunakan relasi `parentId`.
- 16 palet warna pastel Neobrutalist dan 24 pilihan ikon koleksi yang ekspresif.
- Aksi cepat tahan-lama (*Long Press Quick Action Sheet*) untuk Edit, Pindah, Bagikan, dan Hapus koleksi.

### 4. 🎯 Mode Fokus (Segmented Swipe Review)
- Antarmuka bertema gelap fokus (`#121212` / `#141414`) yang menghilangkan distraksi.
- Tampilan kartu per kartu dengan bilah kemajuan tersegmentasi (*segmented progress bar*).
- Tombol aksi *"Tandai Ditinjau"* yang memperbarui status baca dan menghitung statistik produktivitas.

### 5. 🔔 Pengingat Simpanan Cerdas (System Notifications)
- Terintegrasi penuh dengan `expo-notifications`.
- Meminta izin notifikasi sistem secara transparan.
- Penjadwalan pengingat otomatis jika terdapat tautan yang belum sempat ditinjau.
- Fitur *"Kirim Notifikasi Uji Coba"* langsung di menu Pengaturan untuk memverifikasi fungsionalitas di perangkat fisik.

### 6. 🔒 Arsitektur Local-First & Cadangan JSON Terbuka
- Seluruh data disimpan di penyimpanan lokal perangkat melalui `AsyncStorage` dan di-hydrate seketika oleh `Zustand`.
- **Nol Latensi**: Aplikasi terbuka instan tanpa menunggu sambungan server eksternal dan 100% berfungsi offline.
- **Cadangan & Pemulihan**: Ekspor dan impor seluruh koleksi, tautan, dan pengaturan ke berkas format `JSON` standar menggunakan `expo-file-system`, `expo-sharing`, dan `expo-document-picker`.

### 7. 🧪 Mode Demo Portofolio (One-Click Presentation Ready)
- Disediakan tombol *"✨ Muat Data Sampel Demo"* di Beranda dan menu Pengaturan.
- Memuat contoh koleksi realistis (*Resep Lezat*, *Ide Rumah & Interior*, *Rencana Liburan*) dan tautan konten kaya untuk keperluan presentasi, demo video, dan penilaian dosen/penguji.

---

## 🏗️ Arsitektur Teknis & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                       SimpanIn Mobile                       │
├─────────────────────────────────────────────────────────────┤
│  UI / UX Layer:                                             │
│  - React Native (Paperless / Custom Neobrutalist Components) │
│  - Expo Router v58 (File-Based Nested Navigation)           │
│  - Lucide React Native Icons + Safe Area Context            │
├─────────────────────────────────────────────────────────────┤
│  State & Business Logic:                                    │
│  - Zustand Store with persist middleware                    │
│  - AsyncStorage (Local-First Offline Engine)                │
│  - Metadata Parser (Smart Domain & Social Platform Scraper) │
├─────────────────────────────────────────────────────────────┤
│  Native Device Capabilities:                                │
│  - expo-share-intent (System SEND intent receiver)          │
│  - expo-clipboard (Foreground link auto-detector)           │
│  - expo-notifications (Scheduling & instant test push)       │
│  - expo-file-system & expo-sharing (JSON Backup Engine)     │
│  - expo-haptics (Tactile tactile feedback)                  │
└─────────────────────────────────────────────────────────────┘
```

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework** | Expo SDK 58 / React Native 0.81 | Platform stabil, modern, dan performa tinggi |
| **Routing** | Expo Router (v58) | Navigasi deklaratif berbasis struktur berkas |
| **Language** | TypeScript (Strict mode) | Type-safety penuh dengan 0 error kompilasi |
| **State Management** | Zustand (v5) + AsyncStorage | State reaktif lokal tanpa *boilerplate* rumit |
| **Desain Grafis** | Neobrutalism Design System | Border tebal 2px, bayangan keras, pastel retro |
| **Integrasi Sistem** | `expo-notifications`, `expo-share-intent` | Fitur native Android & iOS |

---

## 📁 Struktur Direktori

```
PBP-Final-Project/
├── app/
│   ├── _layout.tsx                 # Root layout, Stack Router & Status Bar
│   ├── index.tsx                   # Inisialisasi awal & pengarah Onboarding
│   ├── onboarding.tsx              # 8-Langkah Onboarding Interaktif (Figma-faithful)
│   ├── home.tsx                    # Beranda (Manila Grid, Recent Saves, Quick Save)
│   ├── search.tsx                  # Pustakamu & Pencarian Global Multi-Kategori
│   ├── focus.tsx                   # Mode Fokus Tinjau Tautan Bertahap
│   ├── collection/
│   │   └── [id].tsx                # Detail Koleksi, Subkoleksi & Filter Tag
│   ├── link/
│   │   └── [id].tsx                # Detail Tautan, Inline Editor, & Metadata
│   └── settings/
│       ├── index.tsx               # Pengaturan Utama, Statistik & Portofolio
│       ├── cloud-sync.tsx          # Penjelasan Arsitektur Local-First & Sync
│       ├── backup.tsx              # Cadangan & Pemulihan format JSON
│       └── guide.tsx               # Panduan Interaktif Bagikan Link
├── src/
│   ├── components/
│   │   ├── ui/                     # Komponen Neobrutalist (NeoCard, ManilaFolder, Mascot)
│   │   └── sheets/                 # Lembar Modal Bawah (SaveLink, Form, TitleEditor)
│   ├── constants/
│   │   └── theme.ts                # Token warna, 16 warna koleksi, 24 ikon
│   ├── hooks/
│   │   └── useIncomingShare.ts     # Hook Native Share Intent & Clipboard Auto-Detection
│   ├── store/
│   │   └── useSimpanInStore.ts     # Zustand Store (CRUD Koleksi, Tautan, Demo Data)
│   ├── types/
│   │   └── models.ts               # Tipe data TypeScript (Collection, SavedItem, dll.)
│   └── utils/
│       ├── backupManager.ts        # Ekspor/Impor berkas JSON lintas platform
│       ├── metadataParser.ts       # Ekstraksi URL, domain, dan pratinjau sosial
│       ├── notificationManager.ts  # Izin dan penjadwalan notifikasi pengingat
│       └── navigation.ts           # Helper navigasi aman
├── assets/                         # Ikon aplikasi, logo, dan maskot SimpanIn
├── app.json                        # Konfigurasi Expo & Android Intent Filters
└── package.json                    # Dependensi proyek & scripts
```

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Prasyarat
- Pasang [Node.js](https://nodejs.org/) (disarankan v20 LTS atau v22).
- Ponsel pintar Android/iOS dengan aplikasi **Expo Go** terpasang dari Play Store / App Store, atau browser web (Google Chrome / Brave).

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Menjalankan di Expo Go (Perangkat Fisik)
```bash
npx expo start
```
Pindai QR code yang tampil di terminal menggunakan kamera ponsel (iOS) atau aplikasi **Expo Go** (Android).

### 4. Menjalankan di Browser Web
```bash
npm run web
# atau
npx expo start --web
```
Aplikasi akan langsung berjalan di browser pada `http://localhost:8081`.

### 5. Pemeriksaan Kualitas & TypeScript
```bash
npx tsc --noEmit
```
*Hasil: 0 errors — Type safety terjamin secara penuh.*

---

## 📱 Skenario Demo untuk Presentasi & Portofolio

1. **Tur Awal (Onboarding)**:
   - Buka aplikasi pertama kali.
   - Ikuti tur 8 langkah, coba simulasi simpan Reel Instagram, jelajahi kartu interaktif, izinkan notifikasi, dan masuk ke Beranda.
2. **Eksplorasi dengan Data Sampel**:
   - Di Beranda, ketuk tombol kuning *"✨ Muat Data Sampel Demo"*.
   - Amati bagaimana 3 koleksi (*Resep Lezat*, *Ide Rumah*, *Rencana Liburan*) dan tautan kaya termuat seketika.
3. **Menguji Mode Fokus**:
   - Ketuk banner hijau *"X simpanan baru menunggu — Tinjau sekarang"*.
   - Geser kartu inspirasi satu per satu, baca catatan, dan ketuk *"Tandai Ditinjau"*.
4. **Menguji Simpan Cepat & Papan Klip**:
   - Salin tautan apa pun dari browser atau chat (contoh: `https://vt.tiktok.com/ZS...`).
   - Buka SimpanIn: Banner *"TAUTAN DARI TIKTOK TERDETEKSI"* akan muncul secara otomatis.
   - Ketuk *"Simpan ke Koleksi →"*, pilih folder, dan simpan.
5. **Menguji Notifikasi**:
   - Buka *Pengaturan* (ikon gerigi di kiri atas beranda).
   - Pastikan saklar *Pengingat Simpanan* aktif, lalu ketuk *"⚡ Kirim Notifikasi Uji Coba"*. Notifikasi lokal akan langsung muncul di *notification tray* ponsel Anda.
6. **Menguji Cadangan JSON**:
   - Masuk ke *Pengaturan → Cadangan & Pemulihan*.
   - Ketuk *"Ekspor Cadangan Sekarang"* untuk membagikan/menyimpan berkas `.json`.
   - Coba tombol *"Pulihkan dari Berkas Cadangan"* untuk memverifikasi proses impor.

---

## 🎓 Pertanyaan Kritis Ujian / Evaluasi (Academic Defense Q&A)

<details>
<summary><b>1. Mengapa memilih arsitektur Local-First alih-alih Full-Cloud Database?</b></summary>
<br>
Aplikasi bookmark mobile sering digunakan saat pengguna sedang bermobilitas (misalnya di transportasi umum atau tempat dengan sinyal minim). Dengan Local-First (AsyncStorage + Zustand):
1. Kecepatan baca/tulis adalah 0 ms (tanpa jeda loading server).
2. Menjamin privasi mutlak pengguna karena riwayat tautan pribadi tidak disimpan di server pihak ketiga.
3. Memberikan kedaulatan data melalui fitur ekspor/impor JSON terbuka.
</details>

<details>
<summary><b>2. Bagaimana cara kerja integrasi simpan tautan langsung dari Instagram/TikTok?</b></summary>
<br>
SimpanIn mengimplementasikan dua jalur saling melengkapi:
1. <b>Native Android Intent Filters (<code>android.intent.action.SEND</code>)</b> yang dikonfigurasi pada <code>app.json</code> dan di-handle oleh modul <code>expo-share-intent</code>.
2. <b>Foreground Clipboard Auto-Detection</b> melalui hook <code>useIncomingShare</code> yang mendeteksi perubahan state aplikasi saat kembali aktif (<i>active foreground</i>) dan memvalidasi URL menggunakan <code>metadataParser</code>.
3. Setelah penyimpanan selesai, <code>BackHandler.exitApp()</code> meminimalkan SimpanIn sehingga pengguna langsung kembali ke aplikasi asal.
</details>

<details>
<summary><b>3. Mengapa memilih gaya desain Neobrutalisme?</b></summary>
<br>
Neobrutalisme memadukan border hitam tegas (2px), bayangan offset tanpa blur (hard flat shadow), serta warna pastel berdaya kontras tinggi. Gaya ini dipilih karena memberikan hierarki visual yang sangat jelas (*high affordance*), membuat tombol dan kartu folder map manila terasa nyata dan taktil (*tactile digital feel*), serta membedakan SimpanIn dari aplikasi bookmark konvensional yang monoton.
</details>

---

## 👨‍💻 Pengembang & Hak Cipta
- **Proyek**: Final Project Pemrograman Berbasis Platform (PBP)
- **Status**: Production Ready & Open Portfolio
- **Lisensi**: MIT License
