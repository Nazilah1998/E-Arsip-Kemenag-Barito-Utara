# PRD — Sistem E-Arsip Kementerian Agama Kabupaten Barito Utara

**Versi Dokumen:** 1.0
**Tanggal:** 18 Juni 2026
**Status:** Final — Siap Eksekusi
**Domain Produksi:** e-arsip.kemenag-baritoutara.com

---

## 1. Latar Belakang

Kantor Kementerian Agama Kabupaten Barito Utara membutuhkan sistem pengarsipan digital (E-Arsip) untuk menggantikan/mendukung proses pengarsipan fisik dokumen per bidang/seksi. Sistem ini akan menjadi pusat penyimpanan dokumen jangka panjang yang aman, terstruktur per bidang, mudah dicari, dan dapat diakses oleh pegawai sesuai kewenangannya tanpa bisa melihat dokumen bidang lain.

## 2. Tujuan

1. Menyediakan tempat penyimpanan dokumen digital terpusat, terstruktur dalam folder bertingkat tanpa batas kedalaman.
2. Memberikan kontrol akses berbasis role agar setiap bidang/seksi hanya dapat mengelola arsip miliknya sendiri.
3. Memberikan kemudahan unggah, unduh, lihat (preview), ubah nama, dan hapus dokumen layaknya pengelola berkas modern (mirip Google Drive).
4. Memastikan dokumen tersimpan aman dalam jangka panjang dengan biaya infrastruktur yang efisien (storage di Cloudflare R2, metadata di Supabase self-hosted).
5. Menyediakan visibilitas/statistik penggunaan arsip khusus untuk pimpinan (Super Admin).

## 3. Lingkup (Scope)

### Termasuk dalam lingkup:

- Autentikasi berbasis username & password + Cloudflare Turnstile.
- Dua role: **Super Admin** dan **Admin Bidang**.
- Manajemen folder bertingkat tanpa batas (unlimited nested folder).
- Upload, download, preview, rename, delete file & folder.
- Pembatasan akses file/folder tertentu menjadi "view-only" (tidak bisa di-download).
- Soft-delete (Trash/Recycle Bin) dengan retensi sebelum hapus permanen.
- Pencarian file/folder berdasarkan nama.
- Dashboard statistik (khusus Super Admin).
- Tampilan responsif penuh untuk desktop dan mobile.

### Tidak termasuk dalam lingkup (Out of Scope) untuk versi ini:

- Audit log/jejak aktivitas pengguna (sesuai keputusan user, tidak diperlukan).
- Notifikasi email/push.
- OCR atau pencarian berdasarkan isi dokumen.
- Upload file video.
- Workflow approval/persetujuan berjenjang sebelum dokumen tersimpan.
- Multi-level approval, e-signature, atau watermarking dokumen.

## 4. Pengguna & Role

| Role             | Hak Akses                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Super Admin**  | Akses penuh ke seluruh bidang, seluruh folder & file. Membuat/mengedit/menghapus/menonaktifkan akun pengguna. Membuat/mengelola data Bidang/Seksi. Melihat dashboard statistik. Mengakses dan mengembalikan (restore) Trash semua bidang. Mengatur status restricted (view-only) pada folder/file mana pun.                                                                                    |
| **Admin Bidang** | Hanya dapat mengakses folder & file milik bidangnya sendiri (tidak bisa melihat bidang lain sama sekali — baik secara UI maupun di level data/API). Dapat membuat folder baru, upload, download, rename, delete, restore dari Trash bidangnya sendiri. Dapat mengatur status restricted pada file/folder di bidangnya. **Tidak** dapat membuat user, **tidak** dapat melihat dashboard global. |

> Catatan: Hanya Super Admin yang dapat membuat akun pengguna baru (termasuk akun Admin Bidang) dan menetapkan bidang yang menjadi tanggung jawabnya.

## 5. Struktur Data Arsip

- Setiap **Bidang/Seksi** adalah entitas data dinamis (dikelola oleh Super Admin), bukan daftar yang di-hardcode di kode program — sehingga jika ada perubahan struktur organisasi di kemudian hari, Super Admin tinggal menambah/mengubah/menghapus data Bidang tanpa perlu mengubah aplikasi.
- Contoh data awal (seed) yang dapat disesuaikan Super Admin setelah sistem berjalan, mengikuti pola umum struktur Kantor Kemenag Kabupaten: Sub Bagian Tata Usaha, Seksi Pendidikan Madrasah, Seksi Pendidikan Diniyah dan Pondok Pesantren, Seksi Pendidikan Agama Islam, Seksi Bimbingan Masyarakat Islam, Seksi Penyelenggara Haji dan Umrah, Penyelenggara Syariah, Penyelenggara Zakat dan Wakaf.
- Setiap Bidang memiliki satu root folder. Di dalam root folder, Admin Bidang bebas membuat folder bertingkat tanpa batas kedalaman (folder dalam folder dalam folder, dst).
- Metadata yang disimpan per file: nama file, lokasi folder, ukuran, tipe file (mime-type), tanggal upload, tanggal update terakhir, status restricted (ya/tidak), serta referensi lokasi fisik file di Cloudflare R2.
- Tidak ada metadata tambahan seperti nomor surat/klasifikasi arsip nasional pada versi ini — cukup nama file + struktur folder.

## 6. Kebutuhan Fungsional (Functional Requirements)

### 6.1 Autentikasi

- Login menggunakan **username** dan **password**.
- Form login dilengkapi **Cloudflare Turnstile** untuk mencegah bot/brute-force login.
- Tidak ada pendaftaran mandiri (self sign-up) — semua akun dibuat oleh Super Admin.
- Reset password pengguna dilakukan oleh Super Admin melalui menu Manajemen Pengguna (karena login berbasis username, tidak menggunakan flow reset password via email).

### 6.2 Manajemen Pengguna (khusus Super Admin)

- Membuat akun baru: username, password awal, nama lengkap, role (Super Admin/Admin Bidang), dan penetapan Bidang (untuk role Admin Bidang).
- Mengedit data akun, menonaktifkan (suspend) akun, mereset password, atau menghapus akun.
- Satu Bidang dapat memiliki lebih dari satu Admin Bidang jika diperlukan di kemudian hari.

### 6.3 Manajemen Bidang/Seksi (khusus Super Admin)

- Tambah, ubah nama, dan hapus data Bidang/Seksi.
- Setiap Bidang baru otomatis memiliki root folder kosong.

### 6.4 Manajemen Folder

- Buat folder baru di lokasi mana pun yang menjadi akses pengguna (tanpa batas kedalaman/nested folder).
- Rename folder.
- Hapus folder (folder beserta seluruh isi di dalamnya akan dipindahkan ke Trash, bukan dihapus permanen langsung).
- Navigasi folder menggunakan breadcrumb agar mudah berpindah antar level folder.

### 6.5 Manajemen File

- **Upload** file dengan tipe yang diizinkan: PDF, Microsoft Word (.doc/.docx), Microsoft Excel (.xls/.xlsx), dan berbagai format gambar (.jpg, .jpeg, .png, .webp, dll). **Video tidak diizinkan** dan akan ditolak sistem secara otomatis (validasi tipe file dilakukan di server, bukan hanya di tampilan).
- Tidak ada batas ukuran file per upload.
- **Download** file kembali ke perangkat pengguna.
- **View/Preview** langsung di browser tanpa perlu download terlebih dahulu — untuk PDF dan gambar preview ditampilkan langsung; untuk file Word/Excel, versi awal menampilkan ikon file + opsi download (preview konten Office secara langsung di browser dapat menjadi pengembangan lanjutan/fase berikutnya bila dibutuhkan, karena memerlukan layanan konversi tambahan di server).
- **Rename** nama file.
- **Update/Perbarui isi file** — mengganti isi file dengan versi baru menggunakan nama yang sama (overwrite), tanpa menyimpan riwayat versi lama.
- **Delete** file — file dipindahkan ke Trash, bukan langsung dihapus permanen.

### 6.6 Pembatasan Akses (Restricted/View-Only)

- Super Admin dan Admin Bidang (pada bidangnya) dapat menandai folder **atau** file tertentu sebagai **Restricted (view-only)**.
- Jika sebuah folder ditandai restricted, secara default seluruh isi di dalamnya mengikuti status tersebut (dapat dilihat namun tombol download disembunyikan/dinonaktifkan), kecuali file di dalamnya diatur ulang secara spesifik.
- Penegakan pembatasan dilakukan di sisi server (bukan hanya menyembunyikan tombol di tampilan) — yaitu tautan/akses unduh tidak akan dihasilkan untuk file yang berstatus restricted, file hanya bisa ditampilkan melalui mode pratinjau.
- **Catatan keterbatasan teknis (penting untuk diketahui pengguna):** pembatasan ini bersifat _best-effort_ di level aplikasi. Karena file tetap perlu ditampilkan di browser, pengguna yang memiliki akses melihat secara teknis tetap dapat mengambil isi dokumen melalui cara lain (misalnya screenshot). Sistem ini bukan solusi DRM (Digital Rights Management) penuh.

### 6.7 Pencarian

- Kolom pencarian berdasarkan **nama file** dan **nama folder**.
- Admin Bidang hanya mendapatkan hasil pencarian dalam lingkup bidangnya sendiri.
- Super Admin dapat mencari di seluruh bidang sekaligus, dengan hasil yang menunjukkan bidang asal dokumen.

### 6.8 Trash / Recycle Bin

- Folder dan file yang dihapus masuk ke Trash, tidak langsung hilang permanen.
- Retensi default: **30 hari** di Trash sebelum dihapus permanen secara otomatis (nilai ini dapat dikonfigurasi oleh Super Admin).
- Pengguna dapat **Restore** (mengembalikan) item dari Trash ke lokasi asal, atau memilih **Hapus Permanen** secara manual sebelum masa retensi berakhir.
- Admin Bidang hanya melihat dan mengelola Trash miliknya sendiri; Super Admin dapat melihat Trash seluruh bidang.
- Proses penghapusan permanen otomatis berjalan melalui scheduled job (cron) di server aplikasi/database.

### 6.9 Dashboard (khusus Super Admin)

- Total jumlah dokumen per Bidang.
- Total penggunaan storage (estimasi ukuran total file) per Bidang dan keseluruhan.
- Daftar dokumen yang baru saja ditambahkan (recent uploads) lintas bidang.
- Dashboard ini **tidak** menampilkan jejak aktivitas detail per pengguna (sesuai keputusan tidak ada audit log), hanya bersifat ringkasan statistik.

### 6.10 Tampilan untuk Admin Bidang (Non Super Admin)

- Setelah login, pengguna langsung diarahkan ke tampilan pengelola berkas (file browser) bidangnya — bergaya seperti Google Drive: daftar folder & file, breadcrumb navigasi, tombol upload, tombol buat folder baru, dan kolom pencarian. Tidak ada dashboard atau menu administratif lain yang terlihat.

## 7. Kebutuhan Non-Fungsional

- **Responsif:** Tampilan wajib optimal di perangkat mobile (prioritas utama) dan desktop — termasuk navigasi folder, upload, dan preview file.
- **Performa:** Daftar folder/file yang berisi banyak item harus tetap responsif (menggunakan teknik virtualisasi list di sisi frontend agar tidak lag).
- **Keamanan:**
  - Validasi tipe file dilakukan di server (whitelist mime-type), bukan hanya berdasarkan ekstensi nama file dari client.
  - Isolasi data antar bidang ditegakkan di level kebijakan database (Row Level Security di Supabase), bukan hanya di level tampilan, agar Admin Bidang benar-benar tidak bisa mengakses data bidang lain meski mencoba memanipulasi request.
  - Semua trafik menggunakan HTTPS dengan sertifikat SSL aktif pada domain e-arsip.kemenag-baritoutara.com.
  - Tautan unduh file dibuat melalui presigned URL yang memiliki waktu kedaluwarsa singkat (tidak dapat dibagikan secara permanen).
- **Keandalan & Jangka Panjang:** Sistem dirancang sebagai arsip jangka panjang — struktur data dan penyimpanan dirancang agar dapat bertambah terus tanpa batas praktis (sejalan dengan kapasitas R2 dan VPS yang tersedia).
- **Kemudahan Penggunaan:** Antarmuka sederhana dan intuitif agar pegawai dengan latar belakang teknis berbeda-beda tetap mudah menggunakannya.

## 8. Arsitektur Teknis

### 8.1 Ringkasan Arsitektur

```
[Pengguna - Browser Desktop/Mobile]
            │  HTTPS
            ▼
[VPS Pribadi]
   ├── Reverse Proxy (Nginx/Caddy) + SSL (Let's Encrypt)
   ├── Aplikasi TanStack Start (Node.js server, SSR)
   └── Supabase (self-hosted, sudah terinstal)
              ├── Postgres → menyimpan metadata (user, role, bidang, folder, file, trash)
              └── Auth → autentikasi username/password
            │
            ▼  (Presigned URL upload/download langsung dari/ke browser)
[Cloudflare R2]
   └── Menyimpan seluruh isi fisik file (PDF, Word, Excel, gambar)
```

### 8.2 Stack Teknologi

| Layer                   | Teknologi                                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework Utama         | **TanStack Start** (versi stabil terbaru) — full-stack React framework berbasis Vite dengan file-based routing dan server functions, ringan dan modern |
| Routing                 | TanStack Router                                                                                                                                        |
| Data Fetching & Caching | TanStack Query                                                                                                                                         |
| Tabel/Daftar File       | TanStack Table + TanStack Virtual (untuk performa pada folder berisi banyak item)                                                                      |
| Form & Validasi         | TanStack Form                                                                                                                                          |
| Styling                 | Tailwind CSS + komponen UI ringan (shadcn/ui) untuk konsistensi tampilan responsif                                                                     |
| Autentikasi             | Supabase Auth (self-hosted) — username/password, ditambah verifikasi Cloudflare Turnstile pada form login                                              |
| Database Metadata       | Supabase self-hosted (PostgreSQL) — Row Level Security aktif per bidang                                                                                |
| Storage File Fisik      | Cloudflare R2 (S3-compatible), diakses melalui presigned URL untuk upload & download langsung dari browser                                             |
| Hosting Aplikasi        | VPS pribadi (sudah disiapkan), dijalankan via Docker/Process Manager, di belakang reverse proxy                                                        |
| Domain & SSL            | e-arsip.kemenag-baritoutara.com, SSL otomatis (Let's Encrypt)                                                                                          |
| Scheduled Job           | Cron job (pg_cron pada Postgres atau scheduler pada server aplikasi) untuk pembersihan Trash otomatis                                                  |

### 8.3 Alur Upload File (Direct-to-R2)

1. Pengguna memilih file di browser.
2. Frontend memvalidasi tipe file secara awal (UX), lalu meminta **presigned upload URL** ke server aplikasi.
3. Server memvalidasi ulang tipe file (mime-type whitelist), kewenangan bidang pengguna, lalu menghasilkan presigned URL dari R2.
4. Browser mengunggah file **langsung ke R2** menggunakan presigned URL tersebut (tidak melewati VPS, menghemat bandwidth server).
5. Setelah upload sukses, frontend memberi tahu server untuk menyimpan metadata file (nama, folder, ukuran, mime-type, key R2) ke Supabase.

### 8.4 Alur Download/View File

1. Pengguna klik file → frontend meminta tautan akses ke server.
2. Server memeriksa kewenangan bidang & status restricted file tersebut.
3. Jika diizinkan: server menghasilkan presigned **GET URL** sementara dari R2 untuk download, atau mengizinkan mode pratinjau (inline) jika file berstatus restricted (tanpa opsi download).
4. Jika tidak diizinkan (bidang berbeda): permintaan ditolak di level server.

## 9. Skema Data (Ringkas)

| Tabel     | Kolom Utama                                                                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `users`   | id, username, password_hash, full_name, role (super_admin / admin_bidang), bidang_id (nullable), is_active, created_at                                       |
| `bidang`  | id, name, created_at                                                                                                                                         |
| `folders` | id, name, parent_id (self-reference, nullable untuk root), bidang_id, is_restricted, created_by, created_at, updated_at, deleted_at (nullable, untuk Trash)  |
| `files`   | id, name, folder_id, bidang_id, r2_object_key, mime_type, size_bytes, is_restricted, uploaded_by, created_at, updated_at, deleted_at (nullable, untuk Trash) |

> Kebijakan Row Level Security (RLS) di Supabase diterapkan pada tabel `folders` dan `files` agar Admin Bidang hanya dapat membaca/menulis baris dengan `bidang_id` sesuai akun mereka, sementara Super Admin memiliki akses penuh.

## 10. Daftar Halaman (Page List)

1. **Login** — username, password, widget Cloudflare Turnstile.
2. **File Browser (Root/Bidang)** — untuk Admin Bidang langsung menampilkan isi root folder bidangnya; untuk Super Admin menampilkan daftar seluruh Bidang sebagai folder tingkat atas.
3. **Detail Folder** — breadcrumb, daftar folder & file (grid/list), tombol Upload, Buat Folder Baru, kolom pencarian, menu aksi per item (rename, delete, set restricted, download).
4. **Preview File** — modal/halaman pratinjau PDF & gambar; untuk file lain menampilkan ikon + tombol download (jika tidak restricted).
5. **Trash** — daftar item terhapus beserta sisa waktu sebelum hapus permanen, tombol Restore dan Hapus Permanen.
6. **Hasil Pencarian** — daftar hasil file/folder sesuai kata kunci.
7. **Manajemen Pengguna** _(khusus Super Admin)_ — daftar user, tambah/edit/nonaktifkan/reset password/hapus user.
8. **Manajemen Bidang** _(khusus Super Admin)_ — tambah/ubah/hapus data Bidang.
9. **Dashboard** _(khusus Super Admin)_ — statistik jumlah dokumen, storage terpakai per bidang, daftar upload terbaru.

## 11. Asumsi & Catatan Desain

- VPS dan Supabase self-hosted dianggap sudah siap, aman, dan dapat diakses — instalasi awal tidak termasuk dalam lingkup teknis pengembangan ini.
- Domain custom `e-arsip.kemenag-baritoutara.com` sudah/akan diarahkan (DNS) ke VPS terkait sebelum tahap deployment akhir.
- Pembatasan file "view-only" adalah pembatasan tingkat aplikasi (best-effort), bukan DRM penuh — sudah dijelaskan ke pemangku kepentingan agar ekspektasi sesuai.
- Tidak ada audit log/log aktivitas pengguna sesuai keputusan eksplisit; jika di kemudian hari dibutuhkan untuk keperluan pengawasan internal, ini dapat menjadi pengembangan tambahan di luar lingkup versi ini.
- Preview langsung untuk file Word/Excel di browser (tanpa download) bukan bagian dari versi ini karena membutuhkan layanan konversi tambahan; versi ini cukup menampilkan ikon file dan opsi download/lihat metadata.
- Tidak ada batas ukuran upload yang diterapkan di level aplikasi; untuk file berukuran sangat besar, proses upload ke R2 akan menggunakan mekanisme multipart upload agar tetap stabil.

## 12. Tahapan Implementasi (Untuk Pelacakan Internal Pengembangan)

Meskipun seluruh fitur akan dikerjakan dan dirilis sekaligus (single release), berikut pembagian tahap kerja untuk memudahkan pelacakan progres pengembangan:

1. **Tahap 1 — Pondasi:** Setup project TanStack Start, koneksi ke Supabase self-hosted yang sudah ada, setup skema database & RLS, integrasi Auth + Cloudflare Turnstile.
2. **Tahap 2 — Inti Manajemen Arsip:** CRUD folder bertingkat, integrasi upload/download presigned URL ke R2, rename, delete (soft-delete ke Trash), update/overwrite file.
3. **Tahap 3 — Fitur Pendukung:** Pencarian, fitur Restricted (view-only) per file/folder, Trash dengan retensi & auto-purge terjadwal.
4. **Tahap 4 — Panel Administratif:** Manajemen Pengguna, Manajemen Bidang, Dashboard statistik (khusus Super Admin).
5. **Tahap 5 — Quality Assurance & Deployment:** Pengujian responsivitas desktop/mobile, pengujian isolasi akses antar bidang, deployment ke VPS dengan domain & SSL final, User Acceptance Test bersama pihak Kemenag.

## 13. Kriteria Keberhasilan (Acceptance Criteria)

- Admin Bidang tidak dapat mengakses data bidang lain dalam kondisi apa pun, termasuk melalui manipulasi request langsung ke server (diverifikasi melalui RLS).
- Super Admin dapat melihat dan mengelola seluruh bidang tanpa batasan.
- File video ditolak secara otomatis oleh sistem saat diunggah, baik dari sisi tampilan maupun validasi server.
- Folder dapat dibuat bertingkat tanpa batas kedalaman dan berfungsi normal pada pengujian hingga minimal 10 tingkat ke dalam.
- File yang dihapus dapat dikembalikan dari Trash sebelum periode retensi berakhir, dan terhapus otomatis setelahnya.
- File berstatus restricted tidak menghasilkan tautan unduh yang valid meski diminta langsung melalui API.
- Seluruh halaman berfungsi dan tampil baik pada lebar layar mobile maupun desktop.
- Login gagal berulang kali terblokir/terhambat oleh mekanisme Cloudflare Turnstile.
