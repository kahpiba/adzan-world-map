# Adzan Atlas

Peta dunia interaktif untuk melihat waktu shalat berdasarkan lokasi yang dipilih.

## Fitur

- Peta dunia yang dapat diklik.
- Pencarian kota atau negara.
- Deteksi lokasi pengguna melalui browser.
- Jadwal Subuh, Terbit, Dzuhur, Ashar, Maghrib, dan Isya.
- Pilihan metode perhitungan waktu shalat.
- Tanggal Masehi dan Hijriah.
- Animasi estafet lintas zona waktu sebagai model edukasi kontinuitas waktu adzan.
- Gelombang resonansi berwarna di peta untuk Subuh (biru), Terbit (emas), Dzuhur (oranye),
  Ashar (kuning), Maghrib (merah), dan Isya (ungu).
- Lapisan cahaya area peta berpindah mengikuti lokasi aktif dan warna peta berubah sesuai fase.
- Analisis cakupan adzan lintas 381 kota unik: menghitung 1.440 menit dalam satu hari dan melaporkan celah.
- Tidak menggunakan data populasi Muslim; seluruh kota dihitung berdasarkan koordinat dan metode waktu shalat.
- Timeline 24 jam per kota, pemutaran waktu UTC, dan titik kota aktif di peta seperti visualisasi event global.
- Mode sinematik, kecepatan pemutaran, panel kejadian aktif, dan efek cahaya sinematik di peta.
- Visual utama berupa kawasan berwarna lembut; gelombang berubah halus tanpa ketergantungan pada titik/node.
- Seluruh pengalaman animasi menggunakan engine pemutaran terpadu untuk timeline, atmosfer peta, dan panel fase.
- Leaflet disertakan secara lokal agar peta dan animasi tidak bergantung pada CDN.

## Menjalankan lokal

Karena browser dapat membatasi request API saat membuka file langsung, jalankan server HTTP sederhana:

```bash
npx serve .
```

Lalu buka URL yang ditampilkan. Aplikasi ini tidak membutuhkan API key. Data jadwal disediakan oleh [AlAdhan Prayer Times API](https://aladhan.com/prayer-times-api), pencarian lokasi oleh Nominatim, dan peta oleh OpenStreetMap.

## Catatan

Jadwal dapat berbeda dengan jadwal masjid setempat. Gunakan metode perhitungan yang sesuai dengan wilayah Anda.

Animasi kontinuitas menggunakan beberapa kota contoh untuk menggambarkan hubungan antara rotasi bumi,
zona waktu, dan waktu lokal. Animasi tersebut bukan bukti ilmiah bahwa adzan secara absolut tidak pernah
berhenti hingga akhir zaman.
