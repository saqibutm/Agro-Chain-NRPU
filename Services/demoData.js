// ─────────────────────────────────────────────────────────────────────────────
// AgroChain — Pakistan-specific demo / seed dataset
// Realistic wheat & sugar traceability data for Punjab, Pakistan.
// Time window: 1 Oct 2024 – 31 May 2026 (all generated dates fall in range).
//
// Used by the app in DEMO_MODE (see Services/config.js) so every screen —
// dashboard, tracking, product journey, map, fraud alerts — displays meaningful
// content for demos, screenshots, reports, and HEC presentations.
//
// Data is generated deterministically (seeded RNG) so it is stable across
// reloads and screenshots.
// ─────────────────────────────────────────────────────────────────────────────

const RANGE_START = new Date("2024-10-01");
const RANGE_END = new Date("2026-05-31");

// Deterministic PRNG (mulberry32).
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (arr, r) => arr[Math.floor(r() * arr.length)];
const pad = (n, w = 4) => String(n).padStart(w, "0");
const iso = (d) => d.toISOString().split("T")[0];
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const clampInRange = (d) => d >= RANGE_START && d <= RANGE_END;

// ── Geography (real Punjab districts + approximate GPS) ──
const WHEAT_DISTRICTS = [
  { name: "Faisalabad", code: "FSD", lat: 31.4504, lng: 73.135 },
  { name: "Jhang", code: "JHG", lat: 31.2681, lng: 72.3181 },
  { name: "Toba Tek Singh", code: "TTS", lat: 30.9709, lng: 72.4826 },
  { name: "Sahiwal", code: "SWL", lat: 30.6682, lng: 73.1114 },
  { name: "Okara", code: "OKR", lat: 30.8138, lng: 73.4534 },
  { name: "Bahawalpur", code: "BWP", lat: 29.3956, lng: 71.6836 },
];
const SUGAR_DISTRICTS = [
  { name: "Jhang", code: "JHG", lat: 31.2681, lng: 72.3181 },
  { name: "Khanewal", code: "KWL", lat: 30.3017, lng: 71.9321 },
  { name: "Muzaffargarh", code: "MZG", lat: 30.0703, lng: 71.1933 },
  { name: "Rahim Yar Khan", code: "RYK", lat: 28.4202, lng: 70.2952 },
  { name: "Bahawalnagar", code: "BWN", lat: 29.9994, lng: 73.2536 },
];
const jitter = (v, r) => +(v + (r() - 0.5) * 0.12).toFixed(5);

// ── People & organizations (authentic Pakistani names) ──
const FARMER_NAMES = [
  "Muhammad Aslam", "Ghulam Mustafa", "Rana Tahir Mehmood", "Allah Ditta", "Muhammad Boota",
  "Chaudhry Iqbal Ahmad", "Haji Muhammad Akram", "Muhammad Yousaf", "Ali Hassan", "Abdul Rehman",
  "Muhammad Saleem", "Zulfiqar Ali", "Nazir Ahmad", "Muhammad Ramzan", "Sardar Hussain",
  "Liaquat Ali", "Muhammad Arshad", "Ghulam Abbas", "Riaz Ahmad", "Maqsood Ahmad",
  "Sajjad Haider", "Tariq Mehmood", "Asghar Ali", "Mukhtar Ahmad", "Muhammad Shafiq",
  "Abdul Ghaffar", "Imtiaz Hussain", "Muhammad Naeem", "Khalid Mahmood", "Shaukat Ali",
];
const RB = ["R.B.", "G.B.", "J.B.", "W.B."];
const WHEAT_VARIETIES = ["Akbar-2019", "Faisalabad-2008", "Galaxy-2013", "Ujala-2016", "Dilkash-2020", "Subhani-2021", "Anaj-2017"];
const CANE_VARIETIES = ["CPF-247", "CPF-246", "HSF-240", "CP-77400", "SPF-234", "CPF-251"];

const COLLECTION_CENTERS = [
  "Faisalabad Wheat Collection Centre", "Jhang Grain Collection Hub", "Sahiwal Procurement Centre",
  "Toba Tek Singh Grain Market", "Okara Wheat Procurement Centre", "Bahawalpur Grain Collection Point",
  "Gojra Collection Centre", "Samundri Wheat Hub", "Kamalia Grain Centre", "Chichawatni Procurement Point",
];
const FLOUR_MILLS = [
  "Faisalabad Flour Mills", "Punjab Roller Flour Mills", "Sahiwal Flour Industries",
  "Okara Atta Mills", "Bahawalpur Flour & General Mills",
];
const SUGAR_MILLS = [
  "JDW Sugar Mills (Rahim Yar Khan)", "Hamza Sugar Mills (Rahim Yar Khan)", "Almoiz Sugar Mills",
  "Ashraf Sugar Mills (Bahawalpur)", "Fatima Sugar Mills (Muzaffargarh)", "Layyah Sugar Mills",
];
const PROCUREMENT_CENTERS = [
  "Jhang Cane Procurement Centre", "Khanewal Sugarcane Hub", "Muzaffargarh Procurement Yard",
  "Rahim Yar Khan Cane Centre", "Bahawalnagar Sugarcane Collection",
];
const DISTRIBUTORS = [
  "Punjab Food Distributors", "Al-Karam Distribution Network", "Indus Wholesale Traders",
  "Metro Cash & Carry (Lahore)", "Faisalabad Wholesale Traders",
];
const TRANSPORTERS = ["Daewoo Logistics", "National Freight Carriers", "Punjab Goods Transport", "Indus Road Carriers"];
const RETAILERS = [
  "Utility Store Faisalabad", "Utility Store Sahiwal", "Utility Store Bahawalpur",
  "Imtiaz Super Market", "Al-Fatah Store", "Metro Cash & Carry", "Carrefour Lahore",
  "Chase Up Superstore", "Madina Cash & Carry", "Greenvalley Supermarket",
  "Bismillah Kiryana Store", "Al-Madina General Store", "Rehman Karyana Store",
  "Ittefaq General Store", "Naveed Super Store", "Sabir Kiryana Mart",
  "City Mart Okara", "Shaheen Super Store", "Punjab Kiryana Store", "Al-Noor Grocery",
];
const LABS = ["Punjab Food Authority Lab", "UAF Food Quality Lab", "PCSIR Lab Faisalabad"];

// ── Entity registries (named exports for reports / counts) ──
function buildFarmers(districts, varieties, seedBase) {
  const r = rng(seedBase);
  return FARMER_NAMES.slice(0, 20).map((name, i) => {
    const d = districts[i % districts.length];
    const chak = 100 + Math.floor(r() * 600);
    const sizeAcres = 5 + Math.floor(r() * 45);
    return {
      farmerID: `${seedBase === 11 ? "FARM-W" : "FARM-S"}-${pad(i + 1, 3)}`,
      name,
      farmName: `Chak ${chak} ${pick(RB, r)} ${districts === SUGAR_DISTRICTS ? "Cane" : ""}Farm`.replace("  ", " "),
      district: d.name,
      gps: { latitude: jitter(d.lat, r), longitude: jitter(d.lng, r) },
      variety: pick(varieties, r),
      farmSizeAcres: sizeAcres,
    };
  });
}
export const WHEAT_FARMERS = buildFarmers(WHEAT_DISTRICTS, WHEAT_VARIETIES, 11);
export const SUGARCANE_FARMERS = buildFarmers(SUGAR_DISTRICTS, CANE_VARIETIES, 22);

// ── Journey builders ──
// Wheat stages (full): farm → consumer. Sugar stages mirror the cane chain.
const WHEAT_STAGES = [
  "Land Preparation", "Seed Purchase", "Sowing", "Fertilizer Application", "Irrigation",
  "Harvesting", "Transportation", "Milling", "Packaging", "Distribution", "Retail Delivery",
];
const SUGAR_STAGES = [
  "Plantation", "Fertilization", "Irrigation", "Harvesting", "Transport to Mill",
  "Processing", "Packaging", "Distribution", "Retail Delivery",
];

// Build a chronological journey from a start date with per-stage day gaps,
// truncating any stage that would fall after RANGE_END (keeps data in-range and
// yields realistic "in progress" products for the latest season).
function buildJourney(stages, start, gaps, actors) {
  const out = [];
  let d = new Date(start);
  for (let i = 0; i < stages.length; i++) {
    if (i > 0) d = addDays(d, gaps[i] || 14);
    if (!clampInRange(d)) break;
    out.push({ stage: stages[i], entity: actors[i] || "", location: actors[`loc${i}`] || "", date: iso(d) });
  }
  return out;
}

function geoFromStops(stops, r) {
  return stops
    .filter((s) => s)
    .map((s) => ({ label: s.label, latitude: jitter(s.d.lat, r), longitude: jitter(s.d.lng, r), timestamp: s.date }));
}

// ── Product generation ──
function buildWheatProducts(count) {
  const products = [];
  const counters = {};
  for (let i = 0; i < count; i++) {
    const r = rng(1000 + i);
    const season = i % 2 === 0 ? "2024-2025" : "2025-2026"; // alternate seasons
    const farmer = WHEAT_FARMERS[i % WHEAT_FARMERS.length];
    const dFarm = WHEAT_DISTRICTS.find((x) => x.name === farmer.district);
    const millName = pick(FLOUR_MILLS, r);
    const cc = pick(COLLECTION_CENTERS, r);
    const retailer = pick(RETAILERS, r);
    const distributor = pick(DISTRIBUTORS, r);
    const lab = pick(LABS, r);
    const millD = pick(WHEAT_DISTRICTS, r);
    const year = season === "2024-2025" ? 2025 : 2026;
    const ckey = `${dFarm.code}-${year}`;
    counters[ckey] = (counters[ckey] || 0) + 1;
    const seq = counters[ckey];
    const productID = `WHT-${dFarm.code}-${year}-${pad(seq)}`;

    // Sowing Oct–Dec of season-start year.
    const sowYear = season === "2024-2025" ? 2024 : 2025;
    const sow = new Date(sowYear, 9 + Math.floor(r() * 3), 1 + Math.floor(r() * 27)); // Oct..Dec
    const gaps = [0, 7, 10, 25, 20, 95, 4, 8, 3, 9, 7]; // days between stages → harvest ~Apr/May
    const actors = {
      0: farmer.name, 1: "Punjab Seed Corporation", 2: farmer.name, 3: farmer.name, 4: farmer.name,
      5: farmer.name, 6: pick(TRANSPORTERS, r), 7: millName, 8: millName, 9: distributor, 10: retailer,
      loc0: farmer.district, loc1: farmer.district, loc2: farmer.district, loc3: farmer.district,
      loc4: farmer.district, loc5: farmer.district, loc6: `${farmer.district} → ${cc}`,
      loc7: millD.name, loc8: millD.name, loc9: distributor.split("(")[0].trim(), loc10: retailer,
    };
    const journey = buildJourney(WHEAT_STAGES, sow, gaps, actors);
    const last = journey[journey.length - 1];
    const reached = last ? last.stage : "Sowing";
    const status = reached === "Retail Delivery" ? "Delivered" : reached === "Transportation" ? "In Transit" : "Processing";

    const geoPoints = geoFromStops([
      { label: "Harvested", d: dFarm, date: journey.find((j) => j.stage === "Harvesting")?.date },
      journey.find((j) => j.stage === "Transportation") && { label: cc, d: dFarm, date: journey.find((j) => j.stage === "Transportation").date },
      journey.find((j) => j.stage === "Milling") && { label: millName, d: millD, date: journey.find((j) => j.stage === "Milling").date },
      journey.find((j) => j.stage === "Retail Delivery") && { label: retailer, d: pick(WHEAT_DISTRICTS, r), date: journey.find((j) => j.stage === "Retail Delivery").date },
    ].filter((s) => s && s.date), r);

    const fail = i % 17 === 0; // a few failures for fraud demos
    const tested = journey.find((j) => j.stage === "Milling");
    products.push({
      productID,
      commodity: "wheat",
      productName: pick(["Wheat Flour 10kg", "Wheat Flour 20kg", "Premium Atta 10kg", "Chakki Atta 5kg", "Fine Atta 20kg"], r),
      productType: "Atta",
      variety: farmer.variety,
      wheatBatchID: `WBATCH-${dFarm.code}-${year}-${pad(seq)}`,
      season,
      qrCode: productID,
      qualityGrade: fail ? "C" : r() > 0.5 ? "A" : "B",
      quality: tested ? {
        result: fail ? "Failed" : "Passed",
        moisture: +(10 + r() * 2.5).toFixed(1),
        protein: +(10.5 + r() * 2.5).toFixed(1),
        gluten: +(26 + r() * 5).toFixed(1),
        pesticides: fail && r() > 0.5,
        aflatoxin: fail && r() > 0.5,
        testedBy: lab,
        hasReport: true,
      } : { result: "—", hasReport: false },
      farmOrigin: { farmer: farmer.name, district: farmer.district, province: "Punjab" },
      currentHolder: actors[journey.length - 1] || farmer.name,
      currentStage: reached,
      status,
      productionDate: tested?.date || sow.toISOString().split("T")[0],
      journey,
      geoPoints,
    });
  }
  return products;
}

function buildSugarProducts(count) {
  const products = [];
  const counters = {};
  for (let i = 0; i < count; i++) {
    const r = rng(5000 + i);
    const season = i % 2 === 0 ? "2024-2025" : "2025-2026";
    const farmer = SUGARCANE_FARMERS[i % SUGARCANE_FARMERS.length];
    const dFarm = SUGAR_DISTRICTS.find((x) => x.name === farmer.district);
    const mill = pick(SUGAR_MILLS, r);
    const proc = pick(PROCUREMENT_CENTERS, r);
    const distributor = pick(DISTRIBUTORS, r);
    const retailer = pick(RETAILERS, r);
    const lab = pick(LABS, r);
    const millD = pick(SUGAR_DISTRICTS, r);
    const year = season === "2024-2025" ? 2025 : 2026;
    const ckey = `${dFarm.code}-${year}`;
    counters[ckey] = (counters[ckey] || 0) + 1;
    const seq = counters[ckey];
    const productID = `SGR-${dFarm.code}-${year}-${pad(seq)}`;

    // Plantation Feb–Mar; crushing/harvest Nov–Mar.
    const plantYear = season === "2024-2025" ? 2024 : 2025;
    const plant = new Date(plantYear, 1 + Math.floor(r() * 2), 1 + Math.floor(r() * 27)); // Feb..Mar (2024 plant for 24-25 crush; for 25-26 use 2025)
    // For 2024-2025, plantation in early-mid 2024 may precede range; clamp to Oct 2024 if needed.
    const start = plant < RANGE_START ? new Date(2024, 9, 5 + Math.floor(r() * 20)) : plant;
    const gaps = [0, 20, 25, 120, 3, 7, 4, 10, 8];
    const actors = {
      0: farmer.name, 1: farmer.name, 2: farmer.name, 3: farmer.name, 4: pick(TRANSPORTERS, r),
      5: mill, 6: mill, 7: distributor, 8: retailer,
      loc0: farmer.district, loc1: farmer.district, loc2: farmer.district, loc3: farmer.district,
      loc4: `${farmer.district} → ${proc}`, loc5: millD.name, loc6: millD.name,
      loc7: distributor.split("(")[0].trim(), loc8: retailer,
    };
    const journey = buildJourney(SUGAR_STAGES, start, gaps, actors);
    const last = journey[journey.length - 1];
    const reached = last ? last.stage : "Plantation";
    const status = reached === "Retail Delivery" ? "Delivered" : reached === "Transport to Mill" ? "In Transit" : "Processing";

    const geoPoints = geoFromStops([
      { label: "Harvested", d: dFarm, date: journey.find((j) => j.stage === "Harvesting")?.date },
      journey.find((j) => j.stage === "Transport to Mill") && { label: proc, d: dFarm, date: journey.find((j) => j.stage === "Transport to Mill").date },
      journey.find((j) => j.stage === "Processing") && { label: mill, d: millD, date: journey.find((j) => j.stage === "Processing").date },
      journey.find((j) => j.stage === "Retail Delivery") && { label: retailer, d: pick(SUGAR_DISTRICTS, r), date: journey.find((j) => j.stage === "Retail Delivery").date },
    ].filter((s) => s && s.date), r);

    const fail = i % 19 === 0;
    const tested = journey.find((j) => j.stage === "Processing");
    products.push({
      productID,
      commodity: "sugarcane",
      productName: pick(["Refined Sugar 1kg", "Refined Sugar 5kg", "Refined Sugar 10kg", "Commercial Sugar Bag 50kg"], r),
      productType: "Refined Sugar",
      variety: farmer.variety,
      wheatBatchID: `SBATCH-${dFarm.code}-${year}-${pad(seq)}`,
      season,
      qrCode: productID,
      qualityGrade: fail ? "C" : r() > 0.5 ? "A" : "B",
      quality: tested ? (() => {
        // Sugarcane is tested for sugar content, not wheat's milling
        // metrics — Brix (total soluble solids), Pol (sucrose %), and
        // Purity (Pol/Brix ratio), taken from cane juice/raw sugar during
        // milling.
        const brix = +(19 + r() * 3).toFixed(1);
        const purity = +(78 + r() * 14).toFixed(1);
        const pol = +(brix * (purity / 100)).toFixed(1);
        return {
          result: fail ? "Failed" : "Passed",
          brix,
          pol,
          purity,
          pesticides: fail && r() > 0.5,
          aflatoxin: false,
          testedBy: lab,
          hasReport: true,
        };
      })() : { result: "—", hasReport: false },
      farmOrigin: { farmer: farmer.name, district: farmer.district, province: "Punjab" },
      currentHolder: actors[journey.length - 1] || farmer.name,
      currentStage: reached,
      status,
      productionDate: tested?.date || iso(start),
      journey,
      geoPoints,
    });
  }
  return products;
}

export const WHEAT_PRODUCTS = buildWheatProducts(60);
export const SUGAR_PRODUCTS = buildSugarProducts(60);
export const ALL_PRODUCTS = [...WHEAT_PRODUCTS, ...SUGAR_PRODUCTS];

// ── Selectors used by screens ──
export function getProductById(id) {
  return ALL_PRODUCTS.find((p) => p.productID === id || p.qrCode === id);
}

export function getTrackingItems() {
  return ALL_PRODUCTS.map((p) => ({
    id: p.productID,
    name: p.currentHolder,
    commodity: p.commodity,
    date: p.productionDate,
    product: p,
  }));
}

export function getQualityReports() {
  return ALL_PRODUCTS.filter((p) => p.quality?.hasReport).map((p) => ({
    reportID: `QR-${p.productID}`,
    subjectID: p.productID,
    grade: p.qualityGrade,
    result: p.quality.result === "Failed" ? "Fail" : "Pass",
    moistureContent: p.quality.moisture,
    proteinContent: p.quality.protein,
    glutenContent: p.quality.gluten,
    brixContent: p.quality.brix,
    polContent: p.quality.pol,
    purityContent: p.quality.purity,
    pesticidesDetected: !!p.quality.pesticides,
    aflatoxinDetected: !!p.quality.aflatoxin,
    testDate: p.productionDate,
    testedBy: p.quality.testedBy,
  }));
}

export function getKpis() {
  const total = ALL_PRODUCTS.length;
  const inTransit = ALL_PRODUCTS.filter((p) => p.status === "In Transit").length;
  const delivered = ALL_PRODUCTS.filter((p) => p.status === "Delivered").length;
  const reports = getQualityReports();
  const failed = reports.filter((r) => r.result === "Fail" || r.pesticidesDetected || r.aflatoxinDetected).length;
  const passRate = reports.length ? Math.round(((reports.length - failed) / reports.length) * 100) : null;
  return { created: total, inTransit, delivered, products: total, passRate, qualityFlags: failed };
}

export function getRecentActivity() {
  // Latest few journey events across products.
  const events = [];
  for (const p of ALL_PRODUCTS) {
    const last = p.journey[p.journey.length - 1];
    if (last) events.push({ date: last.date, text: `${p.productID} · ${last.stage} → ${last.entity}`, status: p.status });
  }
  events.sort((a, b) => (a.date < b.date ? 1 : -1));
  const color = { Delivered: "#2e7d32", "In Transit": "#ef6c00", Processing: "#1565c0" };
  return events.slice(0, 6).map((e) => ({ text: e.text, status: color[e.status] || "#1565c0" }));
}

// Counts for reports / documentation.
export const DEMO_COUNTS = {
  wheatFarmers: WHEAT_FARMERS.length,
  sugarcaneFarmers: SUGARCANE_FARMERS.length,
  collectionCenters: COLLECTION_CENTERS.length,
  flourMills: FLOUR_MILLS.length,
  sugarMills: SUGAR_MILLS.length,
  procurementCenters: PROCUREMENT_CENTERS.length,
  distributors: DISTRIBUTORS.length,
  retailers: RETAILERS.length,
  wheatProducts: WHEAT_PRODUCTS.length,
  sugarProducts: SUGAR_PRODUCTS.length,
  totalProducts: ALL_PRODUCTS.length,
};

export { COLLECTION_CENTERS, FLOUR_MILLS, SUGAR_MILLS, PROCUREMENT_CENTERS, DISTRIBUTORS, RETAILERS, RANGE_START, RANGE_END };
