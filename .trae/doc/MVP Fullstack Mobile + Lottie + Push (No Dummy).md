## Sasaran MVP
- Fullstack tanpa dummy: semua data dari sumber nyata (OSM/Nominatim/Backend JSON persistence/Firebase Auth).
- Mobile-first UX: peta + daftar, tombol besar, safe-area, interaksi tap halus.
- Banyak animasi Lottie: loading, empty-state, micro-interactions tombol, transisi.
- Push notification: order status update dikirim ke device (FCM).

## Sumber Data Nyata
- Stasiun: Overpass API via backend `GET /api/stations` (`server/index.js:26-44`).
- Geocoding global: Nominatim via backend `GET /api/geocode` (`server/index.js:46-74`).
- Detail stasiun: Overpass via `GET /api/station/:id` (`server/index.js:109-151`).
- Orders: Persist JSON file (`server/data/orders.json`) melalui `GET/POST/PATCH /api/orders` (`server/index.js:88-107`).
- Auth: Firebase ID Token (frontend) diverifikasi di backend; profil user disimpan & diupdate melalui endpoint baru.

## Perubahan Backend (Express)
1. Tambah auth & user profile:
   - `POST /api/auth/firebase` menerima Firebase ID token, verifikasi (Firebase Admin SDK), buat/ambil user; simpan di `server/data/users.json`.
   - `GET /api/user/me` mengembalikan profil user; `PATCH /api/user/me` update profil.
2. Push notifications (FCM):
   - `POST /api/notifications/register` simpan `fcmToken` per user.
   - `POST /api/notifications/test` kirim notifikasi uji ke token.
   - Kirim notifikasi otomatis saat `POST /api/orders` (order dibuat) dan `PATCH /api/orders/:id/status` (status berubah).
3. Konfigurasi port:
   - Jalankan di `PORT=5000` untuk menghindari bentrok (`server/index.js:153`).
   - Ambil `process.env.FCM_SERVER_KEY` dari env (tanpa commit secret).

## Perubahan Frontend
1. Hapus mock & gunakan backend:
   - `services/api.ts`: buang `mockUsers`, `simulateNetwork`, localStorage orders.
   - `apiLoginWithGoogleCredential`: kirim ID token ke `POST /api/auth/firebase`, terima profil user nyata.
   - `apiGetOrders/apiCreateOrder/apiUpdateOrderStatus`: pakai endpoint backend saja.
2. Push notifications (FCM):
   - Tambah service worker `firebase-messaging-sw.js`.
   - Inisialisasi Messaging: `getMessaging`, `getToken`, `onMessage`;
   - Minta izin, kirim token ke backend (`/api/notifications/register`).
   - Tampilkan snackbar/Lottie saat notifikasi diterima.
3. Mobile fit & animasi Lottie:
   - Welcome/Login: gelombang tidak tertutup, tombol dengan `active:scale-95` dan `hover:shadow` (sudah mulai di `screens/WelcomeScreen.tsx:38-40,46-55`).
   - Home: indikator Lottie kecil di search, loading peta/daftar, empty-state Lottie (`screens/HomeScreen.tsx:159-166,208-214`).
   - Map: marker stasiun pakai warna brand, hover/touch scale ringan (`components/MapboxMap.tsx:91-99,127-144`).
   - Station Details: tombol order menampilkan Lottie saat proses (`screens/StationDetailsScreen.tsx:100-104`).
   - Orders/Track: empty-state + loading Lottie (`screens/MyOrdersScreen.tsx:98-109`, `screens/TrackOrderScreen.tsx:41-45`).
   - Tambah transisi page sederhana (fade/slide) via CSS utility atau Framer-Motion jika diizinkan (tanpa dummy asset).
4. Ports & env:
   - Frontend dev: gunakan port custom `4321`.
   - `.env.local`: set `VITE_API_BASE_URL=http://127.0.0.1:5000`, `VITE_FIREBASE_*`, `VITE_MAPBOX_ACCESS_TOKEN`.

## Animasi Lottie (tanpa mock)
- Gunakan file JSON Lottie open-source terkurasi (loading, success, empty state). Tambah ke `assets/animations/` dan panggil via `LottieAnimation`.
- Lokasi:
  - Loading kecil (search, submit, order now).
  - Empty states: Home (no stations), Orders (no ongoing/history), Track (no active order).
  - Success: setelah checkout/order dibuat.
  - Micro-interactions: tombol besar (tap feedback), marker pulse (user marker).

## Push Notification Alur
- User login → minta izin notif → ambil FCM token → kirim ke backend.
- Order dibuat/diupdate → backend kirim FCM ke token user.
- App foreground: tangkap `onMessage`, tampilkan banner/snackbar; background: OS push.

## Validasi
- Jalankan backend di `5000`, frontend di `4321`.
- Uji: login Firebase, mendapatkan token FCM, buat order, terima push.
- Uji: geolocation & pencarian global, stasiun muncul, detail stasiun real dari OSM.

## Deliverables
- Backend endpoint auth/user/notifications + integrasi FCM.
- Frontend integrasi FCM + service worker.
- Hilangkan semua mock di `services/api.ts`.
- Lottie ditambahkan di layar-layar utama dengan aset nyata.
- Mobile-first polish pada seluruh layar & bottom nav.

## Konfirmasi
- Setujui rencana ini, saya akan implementasi langsung dan menyesuaikan bila ada preferensi Lottie spesifik atau provider push (FCM vs Web Push).