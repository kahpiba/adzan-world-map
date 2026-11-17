const map = L.map("map", { worldCopyJump: true }).setView([20, 10], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 18,
}).addTo(map);

const elements = {
  search: document.querySelector("#location-search"),
  searchButton: document.querySelector("#search-button"),
  locateButton: document.querySelector("#locate-button"),
  method: document.querySelector("#calculation-method"),
  status: document.querySelector("#status"),
  selectedLocation: document.querySelector("#selected-location"),
  coordinates: document.querySelector("#coordinates"),
  prayerList: document.querySelector("#prayer-list"),
  hijriDate: document.querySelector("#hijri-date"),
  gregorianDate: document.querySelector("#gregorian-date"),
};

let marker;
let activeRequest = 0;

function getLocalDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

const prayerLabels = {
  Fajr: "Subuh",
  Sunrise: "Terbit",
  Dhuhr: "Dzuhur",
  Asr: "Ashar",
  Maghrib: "Maghrib",
  Isha: "Isya",
};

function setStatus(message, isError = false) {
  elements.status.textContent = message;
  elements.status.classList.toggle("error", isError);
}

function cleanTime(value) {
  return value?.split(" ")[0] || "—";
}

function setMarker(latitude, longitude) {
  if (marker) marker.remove();
  marker = L.marker([latitude, longitude]).addTo(map);
}

function renderPrayerTimes(timings) {
  const keys = Object.keys(prayerLabels);
  elements.prayerList.innerHTML = keys.map((key) => `
    <div class="prayer-row">
      <span class="prayer-name">${prayerLabels[key]}</span>
      <span class="prayer-time">${cleanTime(timings[key])}</span>
    </div>
  `).join("");
}

function updateDates(date) {
  elements.gregorianDate.textContent = date.gregorian?.date || "—";
  elements.hijriDate.textContent = date.hijri
    ? `${date.hijri.day} ${date.hijri.month.en} ${date.hijri.year} H`
    : "Tanggal Hijriah tidak tersedia";
}

async function loadPrayerTimes(latitude, longitude, label = "Lokasi terpilih") {
  const requestId = ++activeRequest;
  const method = elements.method.value;
  setStatus("Mengambil jadwal waktu shalat...");
  elements.selectedLocation.textContent = label;
  elements.coordinates.textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  setMarker(latitude, longitude);
  map.flyTo([latitude, longitude], Math.max(map.getZoom(), 5), { duration: 0.8 });

  try {
    const url = `https://api.aladhan.com/v1/timings/${getLocalDate()}?latitude=${latitude}&longitude=${longitude}&method=${method}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Respons API tidak berhasil");
    const payload = await response.json();
    if (requestId !== activeRequest) return;
    if (payload.code !== 200 || !payload.data?.timings) throw new Error("Jadwal tidak tersedia");
    renderPrayerTimes(payload.data.timings);
    updateDates(payload.data.date);
    setStatus("Jadwal diperbarui untuk hari ini.");
  } catch (error) {
    if (requestId !== activeRequest) return;
    elements.prayerList.innerHTML = '<div class="empty-state">Jadwal tidak dapat dimuat. Coba lagi atau pilih lokasi lain.</div>';
    setStatus("Gagal mengambil data waktu shalat.", true);
  }
}

async function searchLocation() {
  const query = elements.search.value.trim();
  if (!query) return;
  setStatus("Mencari lokasi...");
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`);
    const results = await response.json();
    if (!results.length) throw new Error("Lokasi tidak ditemukan");
    const result = results[0];
    await loadPrayerTimes(Number(result.lat), Number(result.lon), result.display_name.split(",").slice(0, 2).join(","));
  } catch (error) {
    setStatus("Lokasi tidak ditemukan. Coba gunakan nama kota yang lebih spesifik.", true);
  }
}

map.on("click", (event) => loadPrayerTimes(event.latlng.lat, event.latlng.lng));
elements.searchButton.addEventListener("click", searchLocation);
elements.search.addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchLocation();
});
elements.method.addEventListener("change", () => {
  if (marker) loadPrayerTimes(marker.getLatLng().lat, marker.getLatLng().lng, elements.selectedLocation.textContent);
});
elements.locateButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    setStatus("Browser ini tidak mendukung geolokasi.", true);
    return;
  }
  setStatus("Meminta izin lokasi...");
  navigator.geolocation.getCurrentPosition(
    (position) => loadPrayerTimes(position.coords.latitude, position.coords.longitude, "Lokasi saya"),
    () => setStatus("Lokasi tidak dapat diakses. Pilih titik di peta atau cari kota.", true),
    { enableHighAccuracy: true, timeout: 10000 }
  );
});
