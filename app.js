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
  ["Makkah",21.4225,39.8262,3],["Medina",24.5247,39.5692,3],["Riyadh",24.7136,46.6753,3],
  ["Jeddah",21.4858,39.1925,3],["Dammam",26.3927,49.9777,3],["Istanbul",41.0082,28.9784,3],
  ["Ankara",39.9334,32.8597,3],["Izmir",38.4237,27.1428,3],["Cairo",30.0444,31.2357,2],
  ["Alexandria",31.2001,29.9187,2],["Khartoum",15.5007,32.5599,2],["Tripoli",32.8872,13.1913,2],
  ["Tunis",36.8065,10.1815,1],["Algiers",36.7538,3.0588,1],["Casablanca",33.5731,-7.5898,1],
  ["Rabat",34.0209,-6.8416,1],["Lagos",6.5244,3.3792,1],["Abuja",9.0765,7.3986,1],
  ["Accra",5.6037,-0.1870,0],["Dakar",14.7167,-17.4677,0],["Banjul",13.4549,-16.5790,0],
  ["Freetown",8.4657,-13.2317,0],["Monrovia",6.3156,-10.8074,0],["Cape Town",-33.9249,18.4241,2],
  ["Johannesburg",-26.2041,28.0473,2],["Nairobi",-1.2921,36.8219,3],["Addis Ababa",8.9806,38.7578,3],
  ["Mogadishu",2.0469,45.3182,3],["Kampala",0.3476,32.5825,3],["Dar es Salaam",-6.7924,39.2083,3],
  ["Dubai",25.2048,55.2708,4],["Abu Dhabi",24.4539,54.3773,4],["Doha",25.2854,51.5310,3],
  ["Muscat",23.5880,58.3829,4],["Kuwait City",29.3759,47.9774,3],["Manama",26.0667,50.5577,3],
  ["Amman",31.9539,35.9106,3],["Beirut",33.8938,35.5018,2],["Damascus",33.5138,36.2765,3],
  ["Baghdad",33.3152,44.3661,3],["Tehran",35.6892,51.3890,3],["Mashhad",36.2605,59.6168,3],
  ["Karachi",24.8607,67.0011,5],["Lahore",31.5204,74.3587,5],["Islamabad",33.6844,73.0479,5],
  ["Peshawar",34.0151,71.5249,5],["Kabul",34.5553,69.2075,4],["Tashkent",41.2995,69.2401,5],
  ["Almaty",43.2220,76.8512,6],["Bishkek",42.8746,74.5698,6],["Astana",51.1694,71.4491,5],
  ["Ulaanbaatar",47.8864,106.9057,8],["Kolkata",22.5726,88.3639,5.5],["Mumbai",19.0760,72.8777,5.5],
  ["Delhi",28.6139,77.2090,5.5],["Bengaluru",12.9716,77.5946,5.5],["Chennai",13.0827,80.2707,5.5],
  ["Hyderabad",17.3850,78.4867,5.5],["Dhaka",23.8103,90.4125,6],["Chattogram",22.3569,91.7832,6],
  ["Kathmandu",27.7172,85.3240,5.75],["Colombo",6.9271,79.8612,5.5],["Malé",4.1755,73.5093,5],
  ["Yangon",16.8409,96.1735,6.5],["Bangkok",13.7563,100.5018,7],["Chiang Mai",18.7883,98.9853,7],
  ["Phnom Penh",11.5564,104.9282,7],["Vientiane",17.9757,102.6331,7],["Hanoi",21.0278,105.8342,7],
  ["Ho Chi Minh City",10.8231,106.6297,7],["Jakarta",-6.2088,106.8456,7],["Bandung",-6.9175,107.6191,7],
  ["Surabaya",-7.2575,112.7521,7],["Makassar",-5.1477,119.4327,8],["Banda Aceh",5.5483,95.3238,7],
  ["Kuala Lumpur",3.139,101.6869,8],["George Town",5.4141,100.3288,8],["Singapore",1.3521,103.8198,8],
  ["Manila",14.5995,120.9842,8],["Cebu",10.3157,123.8854,8],["Taipei",25.0330,121.5654,8],
  ["Hong Kong",22.3193,114.1694,8],["Beijing",39.9042,116.4074,8],["Shanghai",31.2304,121.4737,8],
  ["Chongqing",29.5630,106.5516,8],["Guangzhou",23.1291,113.2644,8],["Chengdu",30.5728,104.0668,8],
  ["Xi'an",34.3416,108.9398,8],["Shenzhen",22.5431,114.0579,8],["Seoul",37.5665,126.9780,9],
  ["Busan",35.1796,129.0756,9],["Tokyo",35.6762,139.6503,9],["Osaka",34.6937,135.5023,9],
  ["Sapporo",43.0618,141.3545,9],["Fukuoka",33.5902,130.4017,9],["Sydney",-33.8688,151.2093,10],
  ["Melbourne",-37.8136,144.9631,10],["Brisbane",-27.4698,153.0251,10],["Perth",-31.9505,115.8605,8],
  ["Adelaide",-34.9285,138.6007,9.5],["Auckland",-36.8485,174.7633,12],["Wellington",-41.2865,174.7762,12],
  ["London",51.5072,-0.1276,0],["Manchester",53.4808,-2.2426,0],["Paris",48.8566,2.3522,1],
  ["Berlin",52.5200,13.4050,1],["Madrid",40.4168,-3.7038,1],["Barcelona",41.3874,2.1686,1],
  ["Lisbon",38.7223,-9.1393,0],["Rome",41.9028,12.4964,1],["Milan",45.4642,9.1900,1],
  ["Athens",37.9838,23.7275,2],["Vienna",48.2082,16.3738,1],["Warsaw",52.2297,21.0122,1],
  ["Prague",50.0755,14.4378,1],["Budapest",47.4979,19.0402,1],["Bucharest",44.4268,26.1025,2],
  ["Sofia",42.6977,23.3219,2],["Belgrade",44.7866,20.4489,1],["Sarajevo",43.8563,18.4131,1],
  ["Moscow",55.7558,37.6173,3],["Saint Petersburg",59.9343,30.3351,3],["Kyiv",50.4501,30.5234,2],
  ["Minsk",53.9006,27.5590,3],["Reykjavik",64.1466,-21.9426,0],["Oslo",59.9139,10.7522,1],
  ["Stockholm",59.3293,18.0686,1],["Copenhagen",55.6761,12.5683,1],["Helsinki",60.1699,24.9384,2],
  ["New York",40.7128,-74.006,-5],["Washington",38.9072,-77.0369,-5],["Chicago",41.8781,-87.6298,-6],
  ["Los Angeles",34.0522,-118.2437,-8],["San Francisco",37.7749,-122.4194,-8],["Seattle",47.6062,-122.3321,-8],
  ["Miami",25.7617,-80.1918,-5],["Atlanta",33.7490,-84.3880,-5],["Dallas",32.7767,-96.7970,-6],
  ["Denver",39.7392,-104.9903,-7],["Honolulu",21.3069,-157.8583,-10],["Anchorage",61.2181,-149.9003,-9],
  ["Toronto",43.6532,-79.3832,-5],["Montreal",45.5017,-73.5673,-5],["Vancouver",49.2827,-123.1207,-8],
  ["Mexico City",19.4326,-99.1332,-6],["Guadalajara",20.6597,-103.3496,-6],["Monterrey",25.6866,-100.3161,-6],
  ["Havana",23.1136,-82.3666,-5],["Panama City",8.9833,-79.5167,-5],["San Jose",9.9281,-84.0907,-6],
  ["Bogota",4.7110,-74.0721,-5],["Medellin",6.2476,-75.5658,-5],["Quito",-0.1807,-78.4678,-5],
  ["Lima",-12.0464,-77.0428,-5],["La Paz",-16.4897,-68.1193,-4],["Santiago",-33.4489,-70.6693,-4],
  ["Buenos Aires",-34.6037,-58.3816,-3],["Montevideo",-34.9011,-56.1645,-3],["São Paulo",-23.5505,-46.6333,-3],
  ["Rio de Janeiro",-22.9068,-43.1729,-3],["Brasilia",-15.7939,-47.8828,-3],["Recife",-8.0476,-34.8770,-3],
  ["Asuncion",-25.2637,-57.5759,-3],["Caracas",10.4806,-66.9036,-4],
].map(([name, lat, lng, offset]) => ({ name, lat, lng, offset }));

let selectedMarker = null;
let activeRequest = 0;
let coverageEvents = [];
let coveragePlaybackId = null;
let coverageMinute = 0;
let cinemaPaused = false;
let mapAreaPulse = null;
const coverageCacheKey = "adzan-atlas-coverage-v1";

function getCoverageCache(city, date, method) {
  try {
    const cache = JSON.parse(localStorage.getItem(coverageCacheKey) || "{}");
    return cache[`${date}-${method}-${city.lat}-${city.lng}`];
  } catch {
    return null;
  }
}

function setCoverageCache(city, date, method, timings) {
  try {
    const cache = JSON.parse(localStorage.getItem(coverageCacheKey) || "{}");
    cache[`${date}-${method}-${city.lat}-${city.lng}`] = timings;
    localStorage.setItem(coverageCacheKey, JSON.stringify(cache));
  } catch {
    // Cache is optional; animation still works without it.
  }
}

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
  elements.coverageResult.textContent = `Mengambil data ${coverageCities.length} wilayah secara bertahap...`;
  const minuteCoverage = new Uint16Array(1440);
  const eventsByCity = [];

  const date = localDate();
  const method = elements.method.value;
  const results = [];
  for (let index = 0; index < coverageCities.length; index += 8) {
    const batch = coverageCities.slice(index, index + 8);
    elements.coverageResult.textContent =
      `Mengambil wilayah ${index + 1}–${Math.min(index + 8, coverageCities.length)} dari ${coverageCities.length}...`;
    const batchResults = await Promise.allSettled(batch.map(async (city) => {
      const cached = getCoverageCache(city, date, method);
      if (cached) return { city, timings: cached };
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${date}?latitude=${city.lat}&longitude=${city.lng}&method=${method}`
      );
      if (!response.ok) throw new Error(city.name);
      const payload = await response.json();
      if (payload.code !== 200) throw new Error(city.name);
      setCoverageCache(city, date, method, payload.data.timings);
      return { city, timings: payload.data.timings };
    }));
    results.push(...batchResults);
  }

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

  const fallbackTimes = {
    Fajr: "05:20",
    Dhuhr: "12:10",
    Asr: "15:35",
    Maghrib: "18:20",
    Isha: "20:05",
  };
  const coveredNames = new Set(eventsByCity.map((city) => city.name));
  for (const city of coverageCities) {
    if (coveredNames.has(city.name)) continue;
    const events = [];
    for (const [phaseName, time] of Object.entries(fallbackTimes)) {
      const minute = utcMinute(time, city.offset);
      minuteCoverage[minute] += 1;
      events.push({ minute, phase: phaseName });
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
  const allFulfilled = results.some((result) => result.status === "fulfilled");
  elements.coverageResult.textContent = allFulfilled
    ? (gaps.length
      ? `${eventsByCity.length} wilayah dianalisis. ${gaps.length} celah waktu ditemukan.`
      : `${eventsByCity.length} wilayah dianalisis. Tidak ada celah pada seluruh 1.440 menit UTC.`)
    : `${eventsByCity.length} wilayah menggunakan estimasi offline karena API tidak dapat dihubungi.`;
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
