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
  continuityLocation: document.querySelector("#continuity-location"),
  continuityPhase: document.querySelector("#continuity-phase"),
  continuityProgress: document.querySelector("#continuity-progress-bar"),
  continuityToggle: document.querySelector("#continuity-toggle"),
  continuityPulse: document.querySelector("#continuity-pulse"),
  mapWash: document.querySelector(".map-resonance-wash"),
  mapLight: document.querySelector(".map-resonance-light"),
  mapPhaseLabel: document.querySelector("#map-phase-label"),
  coverageButton: document.querySelector("#coverage-button"),
  coveragePercent: document.querySelector("#coverage-percent"),
  coverageResult: document.querySelector("#coverage-result"),
  coverageTimeline: document.querySelector("#coverage-timeline"),
  coverageVisualTitle: document.querySelector("#coverage-visual-title"),
  coverageClock: document.querySelector("#coverage-clock"),
};

let marker;
let activeRequest = 0;
let continuityAnimation;
let coverageMarkers = [];
let coveragePlayback = null;

const continuityStops = [
  { name: "Makkah, Arab Saudi", phase: "Subuh", prayer: "Subuh", color: "#4da3ff", point: [21.4225, 39.8262] },
  { name: "Karachi, Pakistan", phase: "Terbit", prayer: "Terbit", color: "#ffd166", point: [24.8607, 67.0011] },
  { name: "Jakarta, Indonesia", phase: "Dzuhur", prayer: "Dzuhur", color: "#ff8c42", point: [-6.2088, 106.8456] },
  { name: "Kuala Lumpur, Malaysia", phase: "Ashar", prayer: "Ashar", color: "#f6b94a", point: [3.139, 101.6869] },
  { name: "Tokyo, Jepang", phase: "Maghrib", prayer: "Maghrib", color: "#ef6f61", point: [35.6762, 139.6503] },
  { name: "Istanbul, Turki", phase: "Isya", prayer: "Isya", color: "#7c83fd", point: [41.0082, 28.9784] },
  { name: "London, Inggris", phase: "Subuh", prayer: "Subuh", color: "#4da3ff", point: [51.5072, -0.1276] },
  { name: "New York, Amerika Serikat", phase: "Dzuhur", prayer: "Dzuhur", color: "#ff8c42", point: [40.7128, -74.006] },
  { name: "São Paulo, Brasil", phase: "Ashar", prayer: "Ashar", color: "#f6b94a", point: [-23.5505, -46.6333] },
];

function startContinuityAnimation() {
  const route = continuityStops.map(({ point }) => point);
  let previousStopIndex = 0;
  const routeLine = L.polyline(route, { color: "#6de0bd", weight: 4, opacity: 0.78, dashArray: "12 10", pane: "overlayPane" }).addTo(map);
  const stopDots = continuityStops.map(({ point }, index) => {
    const icon = L.divIcon({ className: "adhan-stop-marker", iconSize: [12, 12] });
    return L.marker(point, { icon, zIndexOffset: 400 }).addTo(map)
      .bindTooltip(continuityStops[index].name, { permanent: false, direction: "top", className: "adhan-map-tooltip" });
  });
  const travelIcon = L.divIcon({
    className: "adhan-travel-marker",
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    html: `<span style="background:${continuityStops[0].color};box-shadow:0 0 18px ${continuityStops[0].color}"></span>`,
  });
  const activeDot = L.marker(route[0], { icon: travelIcon, zIndexOffset: 1000 })
    .addTo(map)
    .bindTooltip(continuityStops[0].name, { permanent: true, offset: [0, -28], direction: "top", className: "adhan-map-tooltip" });
  const resonanceRings = [0, 1, 2].map((ringIndex) =>
    L.circle(route[0], {
      radius: 180000 + ringIndex * 350000,
      color: continuityStops[0].color,
      weight: ringIndex === 0 ? 3 : 2,
      opacity: 0.82 - ringIndex * 0.18,
      fillColor: continuityStops[0].color,
      fillOpacity: 0.13 - ringIndex * 0.025,
      interactive: false,
    }).addTo(map)
  );
  const segmentDuration = 4200;
  let segment = 0;
  let startedAt = performance.now();
  let paused = false;
  let pausedAt = 0;
  let activeColor = continuityStops[0].color;

  const update = (now) => {
    if (!paused) {
      const progress = Math.min((now - startedAt) / segmentDuration, 1);
      const from = route[segment];
      const to = route[(segment + 1) % route.length];
      const lat = from[0] + (to[0] - from[0]) * progress;
      const lng = from[1] + (to[1] - from[1]) * progress;
      activeDot.setLatLng([lat, lng]);
      const stop = continuityStops[segment];
      activeDot.setTooltipContent(`${stop.name} · ${stop.phase}`);
      const stopIndex = segment;
      if (previousStopIndex !== stopIndex) {
        previousStopIndex = stopIndex;
        elements.mapWash.style.background = stop.color;
        elements.mapWash.style.opacity = "0.22";
        elements.mapLight.style.setProperty(
          "--map-light-color",
          `${stop.color}99`
        );
        elements.mapLight.style.opacity = "0.95";
        elements.mapPhaseLabel.textContent = stop.phase.toUpperCase();
        elements.mapPhaseLabel.style.color = stop.color;
        elements.mapPhaseLabel.style.borderColor = stop.color;
        window.setTimeout(() => {
          elements.mapWash.style.opacity = "0.1";
          elements.mapLight.style.opacity = "0.72";
        }, 1400);
      }
      const mapPoint = map.latLngToContainerPoint([lat, lng]);
      elements.mapLight.style.left = `${mapPoint.x}px`;
      elements.mapLight.style.top = `${mapPoint.y}px`;
      if (activeColor !== stop.color) {
        activeColor = stop.color;
        activeDot.setIcon(L.divIcon({
          className: "adhan-travel-marker",
          iconSize: [42, 42],
          iconAnchor: [21, 21],
          html: `<span style="background:${stop.color};box-shadow:0 0 18px ${stop.color}"></span>`,
        }));
        elements.continuityPulse.style.background = stop.color;
        elements.continuityPulse.style.boxShadow = `0 0 14px ${stop.color}`;
      }
      resonanceRings.forEach((ring, ringIndex) => {
        const pulse = (progress + ringIndex * 0.22) % 1;
        ring.setLatLng([lat, lng]);
        ring.setStyle({
          color: stop.color,
          fillColor: stop.color,
          opacity: Math.max(0.12, 0.88 - pulse * 0.7),
          fillOpacity: Math.max(0.025, 0.16 - pulse * 0.14),
        });
        ring.setRadius(140000 + pulse * (650000 + ringIndex * 220000));
      });
      elements.continuityLocation.textContent = continuityStops[segment].name;
      elements.continuityPhase.textContent = continuityStops[segment].phase;
      elements.continuityProgress.style.width = `${progress * 100}%`;
      if (progress === 1) {
        segment = (segment + 1) % route.length;
        startedAt = now;
      }
    }
    continuityAnimation.frame = requestAnimationFrame(update);
  };

  continuityAnimation = {
    frame: requestAnimationFrame(update),
    toggle() {
      paused = !paused;
      if (paused) pausedAt = performance.now();
      else startedAt += performance.now() - pausedAt;
      elements.continuityToggle.textContent = paused ? "▶ Lanjut" : "❚❚ Jeda";
      elements.continuityToggle.setAttribute("aria-pressed", String(!paused));
    },
    routeLine,
    stopDots,
    activeDot,
  };
}

function getLocalDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

const coverageCities = [
  { name: "Makkah", lat: 21.4225, lng: 39.8262, offset: 3 },
  { name: "Istanbul", lat: 41.0082, lng: 28.9784, offset: 3 },
  { name: "Cairo", lat: 30.0444, lng: 31.2357, offset: 2 },
  { name: "Karachi", lat: 24.8607, lng: 67.0011, offset: 5 },
  { name: "Dhaka", lat: 23.8103, lng: 90.4125, offset: 6 },
  { name: "Jakarta", lat: -6.2088, lng: 106.8456, offset: 7 },
  { name: "Kuala Lumpur", lat: 3.139, lng: 101.6869, offset: 8 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198, offset: 8 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503, offset: 9 },
  { name: "Sydney", lat: -33.8688, lng: 151.2093, offset: 10 },
  { name: "London", lat: 51.5072, lng: -0.1276, offset: 0 },
  { name: "Paris", lat: 48.8566, lng: 2.3522, offset: 1 },
  { name: "Casablanca", lat: 33.5731, lng: -7.5898, offset: 1 },
  { name: "Lagos", lat: 6.5244, lng: 3.3792, offset: 1 },
  { name: "Cape Town", lat: -33.9249, lng: 18.4241, offset: 2 },
  { name: "New York", lat: 40.7128, lng: -74.006, offset: -5 },
  { name: "Chicago", lat: 41.8781, lng: -87.6298, offset: -6 },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437, offset: -8 },
  { name: "São Paulo", lat: -23.5505, lng: -46.6333, offset: -3 },
  { name: "Mexico City", lat: 19.4326, lng: -99.1332, offset: -6 },
];

function toUtcMinute(time, offset) {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  const localMinute = hours * 60 + minutes;
  return ((localMinute - offset * 60) % 1440 + 1440) % 1440;
}

const phaseColors = {
  Fajr: "#4da3ff",
  Dhuhr: "#ff8c42",
  Asr: "#f6b94a",
  Maghrib: "#ef6f61",
  Isha: "#7c83fd",
};

function renderCoverageVisual(eventsByCity) {
  const fragment = document.createDocumentFragment();
  fragment.appendChild(Object.assign(document.createElement("div"), { className: "coverage-city-label" }));

  for (let hour = 0; hour < 24; hour += 1) {
    const label = document.createElement("div");
    label.className = "coverage-hour-label";
    label.textContent = String(hour).padStart(2, "0");
    fragment.appendChild(label);
  }

  coverageMarkers.forEach((item) => map.removeLayer(item.marker));
  coverageMarkers = [];

  for (const cityEvent of eventsByCity) {
    const cityLabel = document.createElement("div");
    cityLabel.className = "coverage-city-label";
    cityLabel.textContent = cityEvent.city.name;
    fragment.appendChild(cityLabel);

    const eventsByHour = new Map();
    for (const event of cityEvent.events) {
      const hour = Math.floor(event.minute / 60);
      if (!eventsByHour.has(hour)) eventsByHour.set(hour, []);
      eventsByHour.get(hour).push(event);
    }

    for (let hour = 0; hour < 24; hour += 1) {
      const cell = document.createElement("div");
      cell.className = "coverage-cell";
      const hourEvents = eventsByHour.get(hour) || [];
      if (hourEvents.length > 0) {
        const event = hourEvents[0];
        cell.style.background = phaseColors[event.name];
        cell.style.color = phaseColors[event.name];
        cell.title = `${cityEvent.city.name}: ${hourEvents.map((item) => item.label).join(", ")}`;
        cell.dataset.minutes = hourEvents.map((item) => item.minute).join(",");
        cell.dataset.name = hourEvents.map((item) => item.name).join(",");
      }
      fragment.appendChild(cell);
    }

    const marker = L.circleMarker([cityEvent.city.lat, cityEvent.city.lng], {
      radius: 5,
      weight: 1,
      color: "#d9e9f5",
      fillColor: "#6de0bd",
      fillOpacity: 0.72,
    }).addTo(map).bindTooltip(cityEvent.city.name, { direction: "top", className: "adhan-map-tooltip" });
    coverageMarkers.push({ city: cityEvent.city, events: cityEvent.events, marker });
  }

  elements.coverageTimeline.replaceChildren(fragment);
  elements.coverageVisualTitle.textContent = `${eventsByCity.length} kota · zona UTC lintas dunia`;

  if (coveragePlayback) clearInterval(coveragePlayback);
  let playbackMinute = 0;
  coveragePlayback = setInterval(() => {
    playbackMinute = (playbackMinute + 20) % 1440;
    const hours = Math.floor(playbackMinute / 60);
    const minutes = playbackMinute % 60;
    elements.coverageClock.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} UTC`;

    document.querySelectorAll(".coverage-cell").forEach((cell) => {
      const activeMinutes = (cell.dataset.minutes || "").split(",").filter(Boolean).map(Number);
      cell.classList.toggle("active", activeMinutes.some((minute) => Math.abs(minute - playbackMinute) < 20));
    });

    coverageMarkers.forEach((item) => {
      const activeEvents = item.events.filter((event) => Math.abs(event.minute - playbackMinute) < 20);
      if (activeEvents.length > 0) {
        const color = phaseColors[activeEvents[0].name];
        item.marker.setStyle({ radius: 9, weight: 3, color: "#ffffff", fillColor: color, fillOpacity: 1 });
      } else {
        item.marker.setStyle({ radius: 5, weight: 1, color: "#d9e9f5", fillColor: "#6de0bd", fillOpacity: 0.72 });
      }
    });
  }, 80);
}

async function analyzeCoverage() {
  elements.coverageButton.disabled = true;
  elements.coveragePercent.textContent = "Menghitung...";
  elements.coverageResult.textContent = "Mengambil jadwal dari 20 kota...";
  const minuteCoverage = new Uint16Array(1440);
  const eventsByCity = [];
  let successfulCities = 0;

  const results = await Promise.allSettled(coverageCities.map(async (city) => {
    const date = getLocalDate();
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${date}?latitude=${city.lat}&longitude=${city.lng}&method=${elements.method.value}`
    );
    if (!response.ok) throw new Error(city.name);
    const payload = await response.json();
    if (payload.code !== 200) throw new Error(city.name);
    const timings = payload.data.timings;
    return { city, timings };
  }));

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    successfulCities += 1;
    const { city, timings } = result.value;
    const cityEvents = [];
    for (const name of ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]) {
      const minute = toUtcMinute(timings[name], city.offset);
      if (minute !== null) {
        minuteCoverage[minute] += 1;
        cityEvents.push({
          minute,
          name,
          label: `${timings[name]} UTC+${city.offset}`,
        });
      }
    }
    eventsByCity.push({ city, events: cityEvents });
  }

  renderCoverageVisual(eventsByCity);

  let coveredMinutes = 0;
  let weakestCount = Infinity;
  let gapStart = null;
  const gaps = [];
  for (let minute = 0; minute < 1440; minute += 1) {
    if (minuteCoverage[minute] > 0) coveredMinutes += 1;
    if (minuteCoverage[minute] < weakestCount) weakestCount = minuteCoverage[minute];
    if (minuteCoverage[minute] === 0 && gapStart === null) gapStart = minute;
    if (minuteCoverage[minute] > 0 && gapStart !== null) {
      gaps.push([gapStart, minute - 1]);
      gapStart = null;
    }
  }
  if (gapStart !== null) gaps.push([gapStart, 1439]);

  const percent = ((coveredMinutes / 1440) * 100).toFixed(1);
  elements.coveragePercent.textContent = `${percent}%`;
  elements.coveragePercent.style.color = percent === "100.0" ? "#6de0bd" : "#ffd166";

  if (successfulCities === 0) {
    elements.coverageResult.textContent = "Analisis gagal: data kota tidak dapat diambil.";
  } else if (gaps.length === 0) {
    elements.coverageResult.textContent =
      `${successfulCities} kota berhasil dianalisis. Tidak ditemukan celah menit pada jam UTC hari ini; setiap 1.440 menit memiliki minimal satu waktu adzan.`;
  } else {
    const gapText = gaps
      .slice(0, 3)
      .map(([start, end]) => `${String(Math.floor(start / 60)).padStart(2, "0")}:${String(start % 60).padStart(2, "0")}–${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")} UTC`)
      .join(", ");
    elements.coverageResult.textContent =
      `${successfulCities} kota dianalisis. Celah: ${gapText}${gaps.length > 3 ? `; ditambah ${gaps.length - 3} celah lainnya` : ""}.`;
  }
  elements.coverageButton.disabled = false;
  elements.coverageButton.textContent = "Hitung ulang";
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
elements.continuityToggle.addEventListener("click", () => continuityAnimation?.toggle());
elements.coverageButton.addEventListener("click", analyzeCoverage);
startContinuityAnimation();
