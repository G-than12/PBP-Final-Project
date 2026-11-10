# PBP-Final-Project

# SimpanIn (Bookmark & Link Manager Mobile Application)
> *"Simpan sekali. Temukan kapan saja."*

SimpanIn adalah aplikasi mobile berbasis *local-first* untuk menyimpan, mengelompokkan, dan mengelola tautan (bookmark) dari berbagai platform sosial dan web (TikTok, Instagram, Pinterest, X/Twitter, dan artikel web). Aplikasi ini mengusung gaya visual **Neobrutalist** (border hitam 2px, bayangan offset tegas, warna pastel kontras) dengan struktur navigasi yang cepat dan intuitif.

---

## 📱 Fitur Utama

1. **Local-First & Bebas Kuota (100% Free & Unlocked)**
   - Penyimpanan lokal menggunakan `AsyncStorage` + `Zustand`.
   - Tidak ada batasan kuota, tanpa paywall, dan mendukung pembuatan koleksi, subkoleksi, tag, dan link tanpa batas.

2. **8-Step Interactive Onboarding Flow**
   - Panduan interaktif dari pengenalan maskot, demo simpan tautan, pemilihan kategori, hingga mode fokus.
   - Menggunakan simulated demo state (`Resep`, `Ide rumah`, `Liburan`) yang otomatis di-reset menjadi basis data bersih hanya dengan koleksi sistem `"Belum Diurutkan"` saat onboarding selesai.

3. **Beranda & Manila Folder Grid**
   - Tampilan koleksi berbentuk kartu tab map manila (*manila folder*) dengan garis warna, tag "BARU", dan badge "UTAMA".
   - Quick-save bar dengan deteksi otomatis tautan dari clipboard.
   - Kartu peninjauan tautan belum terbaca (*Unreviewed Quick Action*).
   - Tampilan grid tautan disematkan (*Pinned Links*).

4. **Pustakamu & Pencarian Global (Search Hub)**
   - Pencarian real-time berdasarkan judul, URL, catatan, maupun tag.
   - Tab navigasi pustaka: *Ringkasan*, *Koleksi*, *Simpanan*, *Disematkan*, dan *Tag*.
   - Carousel horizontal item yang baru disimpan.

5. **Koleksi & Subkoleksi Berjenjang**
   - Pengorganisasian folder tak terbatas dengan dukungan subkoleksi (`parentId`).
   - Kustomisasi koleksi dengan 16 pilihan warna pastel dan 24 ikon folder.
   - Filter cepat (*Semua*, *TikTok*, *Instagram*, *Web*, dll.) dan pengurutan (*Terbaru*, *Terlama*, *A-Z*, dll.).

6. **Mode Fokus (Swipe Review Mode)**
   - Mode tinjau kartu tautan yang belum dibaca dengan progress bar segmented dan aksi *Tandai Ditinjau* atau *Lewati*.

7. **Detail & Editor Metadata Tautan**
   - Hero visual tematik berdasarkan platform (Food, Home, Travel, Web, dll.).
   - Pengeditan judul, catatan pribadi, manajemen tag dinamis, dan pemindahan koleksi.

8. **Cadangan & Pemulihan (JSON Backup & Restore)**
   - Ekspor dan impor data aplikasi secara utuh dalam format JSON (kompatibel untuk Web Blob maupun Native FileSystem).
   - Opsi reset data dan mode gelap/terang (*Dark/Light Mode*).

---

## 🛠️ Tech Stack

- **Framework**: React Native with [Expo](https://expo.dev) (SDK 58)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Language**: TypeScript
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with `persist` middleware & `@react-native-async-storage/async-storage`
- **UI & Icons**: [lucide-react-native](https://lucide.dev/), Neobrutalist design system
- **Platform Support**: Web, Android, iOS

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Prasyarat
Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) (versi LTS yang direkomendasikan).

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Menjalankan di Web
```bash
npx expo start --web
```
Aplikasi akan otomatis terbuka di browser pada alamat `http://localhost:8081`.

### 4. Menjalankan di Expo Go (Android / iOS)
```bash
npx expo start
```
Pindai QR code yang muncul di terminal menggunakan aplikasi **Expo Go** pada ponsel Anda.

---

## 📁 Struktur Direktori Proyek

```
├── app/
│   ├── _layout.tsx                 # Root Stack Layout & Theme Provider
│   ├── index.tsx                   # Splash Screen & Initial Route Redirect
│   ├── onboarding.tsx              # 8-Step Interactive Onboarding Flow
│   ├── home.tsx                    # Beranda (Main Dashboard & Koleksiku Grid)
│   ├── search.tsx                  # Pustakamu & Global Search Hub
│   ├── focus.tsx                   # Mode Fokus (Swipe Review Screen)
│   ├── collection/
│   │   └── [id].tsx                # Detail Koleksi & Tampilan Subkoleksi
│   ├── link/
│   │   └── [id].tsx                # Detail Tautan, Editor Metadata & Tag
│   └── settings/
│       ├── index.tsx               # Pengaturan Utama
│       ├── cloud-sync.tsx          # Sinkronisasi Cloud
│       ├── backup.tsx              # Cadangan & Pemulihan (JSON Export/Import)
│       └── guide.tsx               # Panduan Bagikan Link
├── src/
│   ├── constants/
│   │   └── theme.ts                # Warna Neobrutalist, 16 Warna & 24 Ikon Folder
│   ├── types/
│   │   └── models.ts               # Interface TypeScript (Collection, SavedItem, dll.)
│   ├── store/
│   │   └── useSimpanInStore.ts     # Zustand Store (Full CRUD & Zero Quota Limit)
│   ├── utils/
│   │   ├── metadataParser.ts       # Deteksi Platform URL & Format Tanggal Relatif
│   │   ├── backupManager.ts        # Utilitas Ekspor/Impor JSON (Web & Native)
│   │   └── navigation.ts           # Safe navigation helper
│   └── components/
│       ├── ui/                     # Komponen Neobrutalist (NeoCard, NeoButton, dll.)
│       └── sheets/                 # Bottom Sheet Modals
└── assets/                         # Aset Gambar, Ikon & Maskot
```

