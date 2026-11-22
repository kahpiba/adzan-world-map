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
  highLatitudeMethod: $("#high-latitude-method"),
  suggestions: $("#location-suggestions"),
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

const additionalCoverageCities = [
  ["Abha",18.2164,42.5053,3],["Al Kharj",24.1557,47.3340,3],["Tabuk",28.3998,36.5718,3],
  ["Jizan",16.8892,42.5511,3],["Najran",17.4917,44.1277,3],["Taif",21.4373,40.5127,3],
  ["Yanbu",24.0892,38.0618,3],["Buraidah",26.3260,43.9750,3],["Al Ahsa",25.3801,49.5831,3],
  ["Hail",27.5114,41.7208,3],["Sana'a",15.3694,44.1910,3],["Aden",12.7855,45.0187,3],
  ["Taiz",13.5789,44.0219,3],["Al Mukalla",14.5400,49.1242,3],["Al Hudaydah",14.7978,42.9545,3],
  ["Muslim Quarter Jerusalem",31.7767,35.2345,2],["Gaza",31.5017,34.4668,2],["Ramallah",31.9045,35.2042,2],
  ["Bethlehem",31.7054,35.2024,2],["Nablus",32.2211,35.2544,2],["Aqaba",29.5321,35.0063,3],
  ["Erbil",36.1911,44.0091,3],["Sulaymaniyah",35.5558,45.4351,3],["Mosul",36.3489,43.1577,3],
  ["Basra",30.5085,47.7835,3],["Najaf",32.0259,44.3463,3],["Karbala",32.6027,44.0249,3],
  ["Aleppo",36.2012,37.1612,3],["Homs",34.7324,36.7137,3],["Latakia",35.5310,35.7903,3],
  ["Isfahan",32.6539,51.6660,3],["Shiraz",29.5918,52.5837,3],["Tabriz",38.0962,46.2738,3],
  ["Ahvaz",31.3183,48.6706,3],["Qom",34.6401,50.8764,3],["Yazd",31.8974,54.3569,3],
  ["Kerman",30.2832,57.0834,3],["Bandar Abbas",27.1832,56.2666,3],["Zahedan",29.4963,60.8629,3],
  ["Ashgabat",37.9601,58.3261,5],["Dushanbe",38.5598,68.7870,5],["Samarkand",39.6542,66.9597,5],
  ["Bukhara",39.7676,64.4231,5],["Namangan",40.9983,71.6726,5],["Fergana",40.3842,71.7874,5],
  ["Nukus",42.4531,59.6103,5],["Aktobe",50.2839,57.1670,5],["Almaty",43.2220,76.8512,6],
  ["Shymkent",42.3417,69.5901,5],["Pavlodar",52.2873,76.9674,6],["Kostanay",53.2143,63.6246,5],
  ["Oral",51.2333,51.3650,5],["Karaganda",49.8047,73.1094,5],["Baku",40.4093,49.8671,4],
  ["Ganja",40.6828,46.3606,4],["Tbilisi",41.7151,44.8271,4],["Kutaisi",42.2679,42.6940,4],
  ["Yerevan",40.1792,44.4991,4],["Gyumri",40.7896,43.8472,4],
  ["Nicosia",35.1856,33.3823,2],["Limassol",34.7071,33.0226,2],
  ["Skopje",41.9981,21.4279,1],["Podgorica",42.4304,19.2594,1],["Tirana",41.3275,19.8187,1],
  ["Pristina",42.6629,21.1655,1],["Zagreb",45.8150,15.9780,1],["Ljubljana",46.0569,14.5058,1],
  ["Bratislava",48.1486,17.1077,1],["Chisinau",47.0105,28.8638,2],["Odessa",46.4825,30.7233,2],
  ["Kharkiv",49.9935,36.2304,2],["Dnipro",48.4647,35.0462,2],["Lviv",49.8397,24.0297,2],
  ["Birmingham",52.4862,-1.8904,0],["Liverpool",53.4084,-2.9916,0],["Glasgow",55.8642,-4.2518,0],
  ["Edinburgh",55.9533,-3.1883,0],["Cardiff",51.4816,-3.1791,0],["Belfast",54.5973,-5.9301,0],
  ["Dublin",53.3498,-6.2603,0],["Amsterdam",52.3676,4.9041,1],["Rotterdam",51.9244,4.4777,1],
  ["Brussels",50.8503,4.3517,1],["Luxembourg",49.6116,6.1319,1],["Bern",46.9480,7.4474,1],
  ["Zurich",47.3769,8.5417,1],["Geneva",46.2044,6.1432,1],["Marrakesh",31.6295,-7.9811,1],
  ["Fez",34.0181,-5.0078,1],["Tangier",35.7595,-5.8340,1],["Oujda",34.6810,-1.9086,1],
  ["Oran",35.6969,-0.6331,1],["Constantine",36.3650,6.6147,1],["Annaba",36.9000,7.7667,1],
  ["Sfax",34.7406,10.7603,1],["Benghazi",32.1167,20.0667,2],["Misrata",32.3775,15.0920,2],
  ["Nouakchott",18.0735,-15.9582,0],["Bamako",12.6392,-8.0029,0],["Ouagadougou",12.3714,-1.5197,0],
  ["Niamey",13.5116,2.1254,1],["Conakry",9.6412,-13.5784,0],["Abidjan",5.3600,-4.0083,0],
  ["Yamoussoukko",6.8276,-5.2893,0],["Cotonou",6.3703,2.3912,1],["Lome",6.1375,1.2123,0],
  ["Porto-Novo",6.4969,2.6289,1],["Yaounde",3.8480,11.5021,1],["Douala",4.0511,9.7679,1],
  ["Libreville",0.4162,9.4673,1],["Kinshasa",-4.4419,15.2663,1],["Lubumbashi",-11.6876,27.5026,2],
  ["Brazzaville",-4.2634,15.2429,1],["Luanda",-8.8390,13.2894,1],["Port Harcourt",4.8156,7.0498,1],
  ["Kano",12.0022,8.5920,1],["Ibadan",7.3775,3.9470,1],["Enugu",6.4584,7.5464,1],
  ["Dodoma",-6.1630,35.7516,3],["Mombasa",-4.0435,39.6582,3],["Arusha",-3.3869,36.6830,3],
  ["Kigali",-1.9706,30.1044,2],["Bujumbura",-3.3614,29.3599,2],["Antananarivo",-18.8792,47.5079,3],
  ["Port Louis",-20.1609,57.5012,4],["Victoria",-4.6191,55.4513,4],["Lilongwe",-13.9626,33.7741,2],
  ["Lusaka",-15.3875,28.3228,2],["Harare",-17.8252,31.0335,2],["Bulawayo",-20.1325,28.6267,2],
  ["Gaborone",-24.6282,25.9231,2],["Windhoek",-22.5609,17.0658,2],["Maputo",-25.9653,32.5832,2],
  ["Islamabad",33.738045,73.084488,5],
  ["Multan",30.1575,71.5249,5],["Faisalabad",31.4504,73.1350,5],["Quetta",30.1798,66.9750,5],
  ["Sialkot",32.4945,74.5229,5],["Srinagar",34.0837,74.7973,5.5],["Lucknow",26.8467,80.9462,5.5],
  ["Patna",25.5941,85.1376,5.5],["Jaipur",26.9124,75.7873,5.5],["Ahmedabad",23.0225,72.5714,5.5],
  ["Surat",21.1702,72.8311,5.5],["Pune",18.5204,73.8567,5.5],["Kochi",9.9312,76.2673,5.5],
  ["Thiruvananthapuram",8.5241,76.9366,5.5],["Varanasi",25.3176,82.9739,5.5],["Nagpur",21.1458,79.0882,5.5],
  ["Malang",-7.9826,112.6308,7],["Semarang",-6.9667,110.4203,7],["Pontianak",-0.0263,109.3425,7],
  ["Palembang",-2.9761,104.7754,7],["Padang",-0.9471,100.4172,7],["Medan",3.5952,98.6722,7],
  ["Pekanbaru",0.5071,101.4478,7],["Denpasar",-8.6500,115.2167,8],["Jayapura",-2.5489,140.7066,9],
  ["Dili",-8.5574,125.5603,9],["Kupang",-10.1772,123.6070,8],["Bandar Seri Begawan",4.9031,114.9398,8],
  ["Ulan Bator",47.9184,106.9177,8],["Pyongyang",39.0392,125.7625,9],["Incheon",37.4563,126.7052,9],
  ["Gwangju",35.1595,126.8526,9],["Daejeon",36.3504,127.3845,9],["Kyoto",35.0116,135.7681,9],
  ["Nagoya",35.1815,136.9066,9],["Sendai",38.2682,140.8694,9],["Okinawa",26.2124,127.6809,9],
  ["Hiroshima",34.3853,132.4553,9],["Noumea",-22.2711,166.4416,11],["Suva",-18.1416,178.4419,12],
  ["Port Moresby",-9.4438,147.1803,10],["Honiara",-9.4456,159.9729,11],["Apia",-13.8507,-171.7513,-11],
  ["Honolulu",21.3069,-157.8583,-10],
  ["Halifax",44.6488,-63.5752,-4],["Ottawa",45.4215,-75.6972,-5],["Quebec City",46.8139,-71.2080,-5],
  ["Calgary",51.0447,-114.0719,-7],["Edmonton",53.5461,-113.4938,-7],["Winnipeg",49.8951,-97.1384,-6],
  ["St John's",47.5615,-52.7126,-3],["Guatemala City",14.6349,-90.5069,-6],["San Salvador",13.6929,-89.2182,-6],
  ["Tegucigalpa",14.0723,-87.1921,-6],["Managua",12.1364,-86.2514,-6],["San Juan",18.4655,-66.1057,-4],
  ["Port-au-Prince",18.5944,-72.3074,-5],["Santo Domingo",18.4861,-69.9312,-4],["Kingston",17.9714,-76.7931,-5],
  ["Nassau",25.0443,-77.3504,-5],["Georgetown",6.8013,-58.1551,-4],["Paramaribo",5.8520,-55.2038,-3],
  ["Cayenne",4.9224,-52.3135,-3],["Campinas",-22.9099,-47.0626,-3],["Salvador",-12.9714,-38.5014,-3],
  ["Fortaleza",-3.7172,-38.5434,-3],["Manaus",-3.1190,-60.0217,-4],["Curitiba",-25.4284,-49.2733,-3],
  ["Porto Alegre",-30.0346,-51.2177,-3],["Belem",-1.4558,-48.5044,-3],["Maracaibo",10.6427,-71.6125,-4],
  ["Barquisimeto",10.0650,-69.3570,-4],["Cusco",-13.5320,-71.9675,-5],["Arequipa",-16.4090,-71.5375,-5],
  ["Cali",3.4516,-76.5320,-5],["Cartagena",10.3910,-75.4794,-5],["Santa Cruz",-17.7863,-63.1812,-4],
  ["Cordoba",-31.4201,-64.1888,-3],["Rosario",-32.9442,-60.6505,-3],["Mendoza",-32.8894,-68.8458,-3],
  ["Valparaiso",-33.0458,-71.6197,-4],["Concepcion",-36.8270,-73.0503,-4],
  ["Casablanca",33.5731,-7.5898,1]
].map(([name, lat, lng, offset]) => ({ name, lat, lng, offset }));

coverageCities.push(...additionalCoverageCities);
const uniqueCoverageCities = Array.from(
  new Map(coverageCities.map((city) => [city.name, city])).values()
);
coverageCities.splice(0, coverageCities.length, ...uniqueCoverageCities);
coverageCities.push(
  { name: "Longyearbyen", lat: 78.2232, lng: 15.6469, offset: 1 },
  { name: "Qaanaaq", lat: 77.4676, lng: -69.2317, offset: -2 },
  { name: "Tromsø", lat: 69.6492, lng: 18.9553, offset: 1 },
  { name: "Barrow (Utqiagvik)", lat: 71.2906, lng: -156.7887, offset: -9 },
  { name: "Alert, Nunavut", lat: 82.5018, lng: -62.3481, offset: -4 },
  { name: "Reykjavik", lat: 64.1466, lng: -21.9426, offset: 0 },
  { name: "McMurdo Station", lat: -77.8419, lng: 166.6863, offset: 12 },
  { name: "Scott Base", lat: -77.849, lng: 166.768, offset: 12 },
  { name: "Rothera Research Station", lat: -67.5687, lng: -68.1258, offset: -3 },
  { name: "Concordia Station", lat: -75.0998, lng: 123.3322, offset: 6 },
  { name: "Amundsen-Scott South Pole", lat: -90, lng: 0, offset: 0 }
);
const polarCoverageNames = new Set([
  "Longyearbyen","Qaanaaq","Tromsø","Barrow (Utqiagvik)","Alert, Nunavut","Reykjavik",
  "McMurdo Station","Scott Base","Rothera Research Station","Concordia Station","Amundsen-Scott South Pole"
]);

let selectedMarker = null;
let activeRequest = 0;
let coverageEvents = [];
let coveragePlaybackId = null;
let coverageMinute = 0;
let cinemaPaused = false;
let mapAreaPulse = null;
let coverageAreas = [];
const coverageCacheKey = "adzan-atlas-coverage-v1";

function getCoverageCache(city, date, method) {
  try {
    const cache = JSON.parse(localStorage.getItem(coverageCacheKey) || "{}");
    const highLat = Math.abs(city.lat) >= 55 ? "-angle3" : "";
    return cache[`${date}-${method}${highLat}-${city.lat}-${city.lng}`];
  } catch {
    return null;
  }
}

function setCoverageCache(city, date, method, timings) {
  try {
    const cache = JSON.parse(localStorage.getItem(coverageCacheKey) || "{}");
    const highLat = Math.abs(city.lat) >= 55 ? "-angle3" : "";
    cache[`${date}-${method}${highLat}-${city.lat}-${city.lng}`] = timings;
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

function renderCoverageAreas(eventsByCity) {
  coverageAreas.forEach((area) => area.remove());
  coverageAreas = eventsByCity.map((city) =>
    L.circle([city.lat, city.lng], {
      radius: 300000,
      weight: 0,
      fillColor: phases.Fajr.color,
      fillOpacity: 0.035,
      interactive: false,
    }).addTo(map)
  );
}

function formatClock(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")} UTC`;
}

function addCoverageCity(name, lat, lng) {
  const normalizedName = name.split(",")[0].trim();
  if (coverageCities.some((city) => city.name === normalizedName)) return;
  coverageCities.push({
    name: normalizedName,
    lat,
    lng,
    offset: Math.max(-12, Math.min(14, Math.round(lng / 15))),
  });
  elements.coverageButton.textContent = `Analisis ${coverageCities.length} wilayah`;
}

async function loadPrayerTimes(lat, lng, label = "Lokasi terpilih") {
  const requestId = ++activeRequest;
  elements.locationName.textContent = label;
  elements.coordinates.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  addCoverageCity(label, lat, lng);
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
    const latitudeAdjustment =
      elements.highLatitudeMethod.value === "0"
        ? (Math.abs(lat) >= 55 ? "&latitudeAdjustmentMethod=3" : "")
        : `&latitudeAdjustmentMethod=${elements.highLatitudeMethod.value}`;
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${localDate()}?latitude=${lat}&longitude=${lng}&method=${elements.method.value}${latitudeAdjustment}`
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

async function showLocationSuggestions() {
  const query = elements.search.value.trim();
  if (query.length < 2) {
    elements.suggestions.classList.remove("visible");
    elements.suggestions.replaceChildren();
    return;
  }
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&q=${encodeURIComponent(query)}`
    );
    if (!response.ok) return;
    const results = await response.json();
    elements.suggestions.replaceChildren();
    for (const place of results) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "location-suggestion";
      button.textContent = place.display_name;
      button.addEventListener("click", () => {
        elements.search.value = place.display_name;
        elements.suggestions.classList.remove("visible");
        addCoverageCity(place.display_name, Number(place.lat), Number(place.lon));
        loadPrayerTimes(
          Number(place.lat),
          Number(place.lon),
          place.display_name.split(",").slice(0, 2).join(",")
        );
      });
      elements.suggestions.appendChild(button);
    }
    elements.suggestions.classList.toggle("visible", results.length > 0);
  } catch {
    elements.suggestions.classList.remove("visible");
  }
}

async function searchLocation() {
  const query = elements.search.value.trim();
  if (!query) return;
  setStatus("Mencari lokasi...");
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&q=${encodeURIComponent(query)}`
    );
    const results = await response.json();
    if (!results.length) throw new Error("Not found");
    const place = results[0].lat != null ? results[0] : null;
    if (!place) throw new Error("Not found");
    const label = place.display_name.split(",").slice(0, 2).join(",");
    addCoverageCity(label, Number(place.lat), Number(place.lon));
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
    const activeCityNames = new Set(activeEvents.map((event) => event.city));
    coverageAreas.forEach((area, index) => {
      const city = eventsByCity[index];
      const active = activeCityNames.has(city.name);
      const event = activeEvents.find((item) => item.city === city.name);
      area.setRadius(active ? 520000 : 300000);
      area.setStyle({
        fillColor: event ? phases[event.phase].color : phases.Fajr.color,
        fillOpacity: active ? 0.16 : 0.035,
      });
    });
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
      const latitudeAdjustment = Math.abs(city.lat) >= 55
        ? "&latitudeAdjustmentMethod=3"
        : "";
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${date}?latitude=${city.lat}&longitude=${city.lng}&method=${method}${latitudeAdjustment}`
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
  renderCoverageAreas(eventsByCity);
  startCoveragePlayback(eventsByCity);
  coverageEvents = eventsByCity;
  elements.coverageButton.disabled = false;
  elements.coverageButton.textContent = "Hitung ulang";
}

map.on("click", (event) => loadPrayerTimes(event.latlng.lat, event.latlng.lng));
elements.searchButton.addEventListener("click", searchLocation);
let suggestionTimer;
elements.search.addEventListener("input", () => {
  clearTimeout(suggestionTimer);
  suggestionTimer = setTimeout(showLocationSuggestions, 350);
});
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

if (elements.coverageButton) {
  elements.coverageButton.textContent = `Analisis ${coverageCities.length} wilayah`;
}
