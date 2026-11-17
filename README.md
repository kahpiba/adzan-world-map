# Adzan Atlas

Peta dunia interaktif untuk melihat waktu shalat berdasarkan lokasi yang dipilih.

## Fitur

- Peta dunia yang dapat diklik.
- Pencarian kota atau negara.
- Deteksi lokasi pengguna melalui browser.
- Jadwal Subuh, Terbit, Dzuhur, Ashar, Maghrib, dan Isya.
- Pilihan metode perhitungan waktu shalat.
- Tanggal Masehi dan Hijriah.

## Menjalankan lokal

Karena browser dapat membatasi request API saat membuka file langsung, jalankan server HTTP sederhana:

```bash
npx serve .
```

Lalu buka URL yang ditampilkan. Aplikasi ini tidak membutuhkan API key. Data jadwal disediakan oleh [AlAdhan Prayer Times API](https://aladhan.com/prayer-times-api), pencarian lokasi oleh Nominatim, dan peta oleh OpenStreetMap.

## Catatan

Jadwal dapat berbeda dengan jadwal masjid setempat. Gunakan metode perhitungan yang sesuai dengan wilayah Anda.
