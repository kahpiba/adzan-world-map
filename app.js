const map = L.map("map", {
  worldCopyJump: true,
  zoomControl: true,
}).setView([18, 20], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 18,
}).addTo(map);

const $ = (selector) => document.querySelector(selector);
const elements = {
  search: $("#location-search"),
  searchButton: $("#search-button"),
  locateButton: $("#locate-button"),
  method: $("#calculation-method"),
  status: $("#status"),
  locationName: $("#selected-location"),
  coordinates: $("#coordinates"),
  prayerList: $("#prayer-list"),
  hijriDate: $("#hijri-date"),
  gregorianDate: $("#gregorian-date"),
  coverageButton: $("#coverage-button"),
  coveragePercent: $("#coverage-percent"),
  coverageResult: $("#coverage-result"),
  timeline: $("#coverage-timeline"),
  timelineTitle: $("#coverage-visual-title"),
  clock: $("#coverage-clock"),
  speed: $("#coverage-speed"),
  cinematicToggle: $("#cinematic-toggle"),
  liveEvent: $("#map-live-event"),
  liveTime: $("#map-live-time"),
  liveLocation: $("#map-live-location"),
  livePhase: $("#map-live-phase"),
  phaseLabel: $("#map-phase-label"),
  phaseCaption: $("#phase-caption"),
  pauseButton: $("#cinema-pause"),
};

const prayerLabels = {
  Fajr: "Subuh",
  Sunrise: "Terbit",
  Dhuhr: "Dzuhur",
  Asr: "Ashar",
  Maghrib: "Maghrib",
  Isha: "Isya",
};

const phases = {
  Fajr: { label: "SUBUH", color: "#62a9ff", glow: "#93cfff", night: "#081a38" },
  Dhuhr: { label: "DZUHUR", color: "#ff9655", glow: "#ffc18a", night: "#35150b" },
  Asr: { label: "ASHAR", color: "#efb84a", glow: "#ffe09a", night: "#33230a" },
  Maghrib: { label: "MAGHRIB", color: "#ee6a74", glow: "#ffa0a3", night: "#390f1c" },
  Isha: { label: "ISYA", color: "#8588ef", glow: "#bbbaff", night: "#17183e" },
};

const coverageCities = [
  ["Makkah", 21.4225, 39.8262, 3], ["Istanbul", 41.0082, 28.9784, 3],
  ["Cairo", 30.0444, 31.2357, 2], ["Karachi", 24.8607, 67.0011, 5],
  ["Dhaka", 23.8103, 90.4125, 6], ["Jakarta", -6.2088, 106.8456, 7],
  ["Kuala Lumpur", 3.139, 101.6869, 8], ["Singapore", 1.3521, 103.8198, 8],
  ["Tokyo", 35.6762, 139.6503, 9], ["Sydney", -33.8688, 151.2093, 10],
  ["London", 51.5072, -0.1276, 0], ["Paris", 48.8566, 2.3522, 1],
  ["Casablanca", 33.5731, -7.5898, 1], ["Lagos", 6.5244, 3.3792, 1],
  ["Cape Town", -33.9249, 18.4241, 2], ["New York", 40.7128, -74.006, -5],
  ["Chicago", 41.8781, -87.6298, -6], ["Los Angeles", 34.0522, -118.2437, -8],
  ["São Paulo", -23.5505, -46.6333, -3], ["Mexico City", 19.4326, -99.1332, -6],
].map(([name, lat, lng, offset]) => ({ name, lat, lng, offset }));

let selectedMarker = null;
let activeRequest = 0;
let coverageEvents = [];
let coveragePlaybackId = null;
let coverageMinute = 0;
let cinemaPaused = false;
let mapAreaPulse = null;

function localDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function setStatus(message, error = false) {
  elements.status.textContent = message;
  elements.status.classList.toggle("error", error);
}

function cleanTime(value) {
  return value?.split(" ")[0] || "—";
}

function setMapPhase(name, { place = "", intensity = 1 } = {}) {
  const phase = phases[name] || phases.Fajr;
  document.documentElement.style.setProperty("--phase-color", phase.color);
  document.documentElement.style.setProperty("--phase-glow", phase.glow);
  document.documentElement.style.setProperty("--phase-night", phase.night);
  document.documentElement.style.setProperty("--phase-intensity", intensity);
  elements.phaseLabel.textContent = phase.label;
  elements.phaseCaption.textContent = place || `${phase.label} · WAKTU GLOBAL`;
}

function createAreaPulse() {
  mapAreaPulse = L.circle([18, 20], {
    radius: 850000,
    weight: 1,
    color: phases.Fajr.color,
    opacity: 0.26,
    fillColor: phases.Fajr.color,
    fillOpacity: 0.12,
    interactive: false,
  }).addTo(map);
}

function showMapEvent(lat, lng, name, phaseName) {
  mapAreaPulse.setLatLng([lat, lng]);
  mapAreaPulse.setRadius(650000 + (coverageMinute % 240) * 2200);
  mapAreaPulse.setStyle({
    color: phases[phaseName].glow,
    fillColor: phases[phaseName].color,
    fillOpacity: 0.28,
  });

  elements.liveEvent.classList.add("visible");
  elements.liveTime.textContent = formatClock(coverageMinute);
  elements.liveLocation.textContent = name;
  elements.livePhase.textContent = `${prayerLabels[phaseName]} · wilayah aktif`;
  setMapPhase(phaseName, { place: `${name} · ${prayerLabels[phaseName]}` });
}

function formatClock(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")} UTC`;
}

async function loadPrayerTimes(lat, lng, label = "Lokasi terpilih") {
  const requestId = ++activeRequest;
  elements.locationName.textContent = label;
  elements.coordinates.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  setStatus("Mengambil jadwal waktu shalat...");
  if (selectedMarker) selectedMarker.remove();
  selectedMarker = L.circleMarker([lat, lng], {
    radius: 7,
    weight: 2,
    color: "#ffffff",
    fillColor: "var(--phase-color)",
    fillOpacity: 0.9,
  }).addTo(map);
  map.flyTo([lat, lng], Math.max(map.getZoom(), 5), { duration: 0.8 });

  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${localDate()}?latitude=${lat}&longitude=${lng}&method=${elements.method.value}`
    );
    if (!response.ok) throw new Error("API unavailable");
    const payload = await response.json();
    if (requestId !== activeRequest || payload.code !== 200) return;
    const timings = payload.data.timings;
    elements.prayerList.innerHTML = Object.keys(prayerLabels).map((key) => `
      <div class="prayer-row">
        <span class="prayer-name">${prayerLabels[key]}</span>
        <span class="prayer-time">${cleanTime(timings[key])}</span>
      </div>
    `).join("");
    elements.hijriDate.textContent =
      `${payload.data.date.hijri.day} ${payload.data.date.hijri.month.en} ${payload.data.date.hijri.year} H`;
    elements.gregorianDate.textContent = payload.data.date.gregorian.date;
    setStatus("Jadwal diperbarui untuk hari ini.");
  } catch {
    elements.prayerList.innerHTML = '<div class="empty-state">Jadwal tidak dapat dimuat.</div>';
    setStatus("Gagal mengambil data waktu shalat.", true);
  }
}

async function searchLocation() {
  const query = elements.search.value.trim();
  if (!query) return;
  setStatus("Mencari lokasi...");
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`
    );
    const results = await response.json();
    if (!results.length) throw new Error("Not found");
    const place = results[0];
    const label = place.display_name.split(",").slice(0, 2).join(",");
    loadPrayerTimes(Number(place.lat), Number(place.lon), label);
  } catch {
    setStatus("Lokasi tidak ditemukan.", true);
  }
}

function utcMinute(time, offset) {
  if (!time) return null;
  const [hour, minute] = time.split(":").map(Number);
  return ((hour * 60 + minute - offset * 60) % 1440 + 1440) % 1440;
}

function renderTimeline(eventsByCity) {
  const fragment = document.createDocumentFragment();
  fragment.appendChild(document.createElement("div"));
  for (let hour = 0; hour < 24; hour += 1) {
    const label = document.createElement("span");
    label.className = "hour-label";
    label.textContent = String(hour).padStart(2, "0");
    fragment.appendChild(label);
  }

  for (const cityEvent of eventsByCity) {
    const label = document.createElement("span");
    label.className = "city-label";
    label.textContent = cityEvent.name;
    fragment.appendChild(label);
    for (let hour = 0; hour < 24; hour += 1) {
      const cell = document.createElement("div");
      const hourEvents = cityEvent.events.filter((event) =>
        Math.floor(event.minute / 60) === hour
      );
      if (hourEvents.length) {
        const first = hourEvents[0];
        cell.style.setProperty("--cell-color", phases[first.phase].color);
        cell.dataset.minutes = hourEvents.map((event) => event.minute).join(",");
        cell.title = `${cityEvent.name}: ${hourEvents.map((event) => prayerLabels[event.phase]).join(", ")}`;
      }
      cell.className = "timeline-cell";
      fragment.appendChild(cell);
    }
  }
  elements.timeline.replaceChildren(fragment);
  elements.timelineTitle.textContent = `${eventsByCity.length} wilayah · siklus 24 jam UTC`;
}

function startCoveragePlayback(eventsByCity) {
  if (coveragePlaybackId) clearInterval(coveragePlaybackId);
  coverageMinute = 0;
  const tick = () => {
    if (cinemaPaused) return;
    coverageMinute = (coverageMinute + 18) % 1440;
    elements.clock.textContent = formatClock(coverageMinute);

    document.querySelectorAll(".timeline-cell").forEach((cell) => {
      const minutes = (cell.dataset.minutes || "").split(",").map(Number).filter(Boolean);
      cell.classList.toggle("active", minutes.some((minute) =>
        Math.abs(minute - coverageMinute) < 24
      ));
    });

    const activeEvents = eventsByCity.flatMap((city) =>
      city.events
        .filter((event) => Math.abs(event.minute - coverageMinute) < 24)
        .map((event) => ({ ...event, city: city.name, lat: city.lat, lng: city.lng }))
    );
    if (activeEvents.length) {
      const event = activeEvents[0];
      showMapEvent(event.lat, event.lng, event.city, event.phase);
    }

    const percent = ((coverageMinute / 1440) * 100).toFixed(0);
    document.documentElement.style.setProperty("--timeline-progress", `${percent}%`);
  };
  coveragePlaybackId = setInterval(tick, Number(elements.speed.value));
  tick();
}

async function analyzeCoverage() {
  elements.coverageButton.disabled = true;
  elements.coveragePercent.textContent = "Menghitung...";
  elements.coverageResult.textContent = "Mengambil data 20 wilayah...";
  const minuteCoverage = new Uint16Array(1440);
  const eventsByCity = [];

  const results = await Promise.allSettled(coverageCities.map(async (city) => {
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${localDate()}?latitude=${city.lat}&longitude=${city.lng}&method=${elements.method.value}`
    );
    if (!response.ok) throw new Error(city.name);
    const payload = await response.json();
    if (payload.code !== 200) throw new Error(city.name);
    return { city, timings: payload.data.timings };
  }));

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const { city, timings } = result.value;
    const events = [];
    for (const [apiName, phaseName] of [
      ["Fajr", "Fajr"], ["Dhuhr", "Dhuhr"], ["Asr", "Asr"],
      ["Maghrib", "Maghrib"], ["Isha", "Isha"],
    ]) {
      const minute = utcMinute(timings[apiName], city.offset);
      if (minute !== null) {
        minuteCoverage[minute] += 1;
        events.push({ minute, phase: phaseName });
      }
    }
    eventsByCity.push({ ...city, events });
  }

  let covered = 0;
  let gapStart = null;
  const gaps = [];
  for (let minute = 0; minute < 1440; minute += 1) {
    if (minuteCoverage[minute] > 0) covered += 1;
    if (!minuteCoverage[minute] && gapStart === null) gapStart = minute;
    if (minuteCoverage[minute] && gapStart !== null) {
      gaps.push([gapStart, minute - 1]);
      gapStart = null;
    }
  }
  if (gapStart !== null) gaps.push([gapStart, 1439]);

  const percent = ((covered / 1440) * 100).toFixed(1);
  elements.coveragePercent.textContent = `${percent}%`;
  elements.coveragePercent.style.color = percent === "100.0" ? "#6de0bd" : "#ffd166";
  elements.coverageResult.textContent = gaps.length
    ? `${eventsByCity.length} wilayah dianalisis. ${gaps.length} celah waktu ditemukan.`
    : `${eventsByCity.length} wilayah dianalisis. Tidak ada celah pada seluruh 1.440 menit UTC.`;
  renderTimeline(eventsByCity);
  startCoveragePlayback(eventsByCity);
  coverageEvents = eventsByCity;
  elements.coverageButton.disabled = false;
  elements.coverageButton.textContent = "Hitung ulang";
}

map.on("click", (event) => loadPrayerTimes(event.latlng.lat, event.latlng.lng));
elements.searchButton.addEventListener("click", searchLocation);
elements.search.addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchLocation();
});
elements.locateButton.addEventListener("click", () => {
  if (!navigator.geolocation) return setStatus("Browser tidak mendukung geolokasi.", true);
  navigator.geolocation.getCurrentPosition(
    (position) => loadPrayerTimes(position.coords.latitude, position.coords.longitude, "Lokasi saya"),
    () => setStatus("Izin lokasi tidak diberikan.", true)
  );
});
elements.method.addEventListener("change", () => {
  if (selectedMarker) loadPrayerTimes(selectedMarker.getLatLng().lat, selectedMarker.getLatLng().lng, elements.locationName.textContent);
});
elements.coverageButton.addEventListener("click", analyzeCoverage);
elements.speed.addEventListener("change", () => {
  if (coverageEvents.length) startCoveragePlayback(coverageEvents);
});
elements.cinematicToggle.addEventListener("click", () => {
  document.querySelector(".coverage-card").classList.toggle("cinematic");
  const active = document.querySelector(".coverage-card").classList.contains("cinematic");
  elements.cinematicToggle.setAttribute("aria-pressed", String(active));
  elements.cinematicToggle.textContent = active ? "Keluar sinematik" : "✦ Mode sinematik";
});
elements.pauseButton.addEventListener("click", () => {
  cinemaPaused = !cinemaPaused;
  elements.pauseButton.textContent = cinemaPaused ? "Lanjutkan" : "Jeda";
});

createAreaPulse();
setMapPhase("Fajr", { place: "WAKTU ADZAN · DUNIA" });
