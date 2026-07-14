// Maund <-> kg conversion. Farmers and mills weigh raw wheat/sugarcane in
// maund (the traditional unit used in Pakistan) — that's the only place this
// conversion happens. Everything the maund figure feeds into downstream
// (quality reports, fraud-detection weight variance, KPIs, the printed batch
// label) stores and compares kg, so a single stored unit never has to be
// re-derived or risk a unit mismatch between pickup and delivery weights.
export const KG_PER_MAUND = 40;

export function maundToKg(maund) {
  return (Number(maund) || 0) * KG_PER_MAUND;
}

export function kgToMaund(kg) {
  return (Number(kg) || 0) / KG_PER_MAUND;
}

// A lab sample is a small pinch pulled from a much larger batch — capped so
// a "sample" can't actually be a chunk of the bulk quantity in disguise.
export const MAX_SAMPLE_GRAMS = 1000;
