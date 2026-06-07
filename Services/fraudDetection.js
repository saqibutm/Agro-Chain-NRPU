// Client-side anomaly detection for the supply chain. These rules mirror the
// checks that should also live in chaincode — surfacing them in-app gives
// field staff and regulators an early warning before a transaction is signed.

export const Severity = { HIGH: "HIGH", MEDIUM: "MEDIUM", LOW: "LOW" };

// Tunable thresholds.
export const Thresholds = {
  WEIGHT_VARIANCE_PCT: 2, // > 2% pickup-vs-delivery weight loss is suspicious
  MIN_EXTRACTION_RATIO: 0.6, // flour-out / wheat-in below 60% = under-reporting
  MAX_EXTRACTION_RATIO: 0.85, // above ~85% is physically implausible (padding)
  TRANSIT_MAX_HOURS: 72, // cane/wheat sitting in transit too long
};

// Flag weight loss between pickup and delivery.
export function checkWeightVariance({ weightAtPickup, weightAtDelivery, batchID }) {
  if (!weightAtPickup || weightAtDelivery == null) return null;
  const variance = ((weightAtPickup - weightAtDelivery) / weightAtPickup) * 100;
  if (variance > Thresholds.WEIGHT_VARIANCE_PCT) {
    return {
      type: "WEIGHT_VARIANCE",
      severity: variance > 5 ? Severity.HIGH : Severity.MEDIUM,
      batchID,
      message: `Weight dropped ${variance.toFixed(1)}% in transit (pickup ${weightAtPickup}kg → delivery ${weightAtDelivery}kg).`,
    };
  }
  return null;
}

// Flour output vs wheat input must fall within a realistic extraction range.
export function checkExtractionRatio({ wheatInputKg, flourOutputKg, batchID }) {
  if (!wheatInputKg || !flourOutputKg) return null;
  const ratio = flourOutputKg / wheatInputKg;
  if (ratio > Thresholds.MAX_EXTRACTION_RATIO) {
    return {
      type: "EXTRACTION_IMPOSSIBLE",
      severity: Severity.HIGH,
      batchID,
      message: `Flour output (${flourOutputKg}kg) exceeds plausible yield from ${wheatInputKg}kg wheat (ratio ${(ratio * 100).toFixed(0)}%). Possible adulteration/padding.`,
    };
  }
  if (ratio < Thresholds.MIN_EXTRACTION_RATIO) {
    return {
      type: "EXTRACTION_LOW",
      severity: Severity.MEDIUM,
      batchID,
      message: `Flour yield only ${(ratio * 100).toFixed(0)}% — possible diversion/under-reporting.`,
    };
  }
  return null;
}

// Same product QR scanned as "sold" in more than one district = counterfeiting.
export function checkDuplicateQR(scans) {
  const byProduct = {};
  const alerts = [];
  for (const s of scans || []) {
    if (!byProduct[s.productID]) byProduct[s.productID] = new Set();
    byProduct[s.productID].add(s.district);
  }
  for (const [productID, districts] of Object.entries(byProduct)) {
    if (districts.size > 1) {
      alerts.push({
        type: "DUPLICATE_QR",
        severity: Severity.HIGH,
        batchID: productID,
        message: `QR for ${productID} scanned in multiple districts: ${[...districts].join(", ")}. Possible counterfeit.`,
      });
    }
  }
  return alerts;
}

// Flag stale transit (e.g. sugarcane must be milled within ~48h of cutting).
export function checkTransitDuration({ departureTime, arrivalTime, batchID }) {
  if (!departureTime || !arrivalTime) return null;
  const hours = (new Date(arrivalTime) - new Date(departureTime)) / 36e5;
  if (hours > Thresholds.TRANSIT_MAX_HOURS) {
    return {
      type: "TRANSIT_TOO_LONG",
      severity: Severity.MEDIUM,
      batchID,
      message: `Transit took ${hours.toFixed(0)}h (limit ${Thresholds.TRANSIT_MAX_HOURS}h). Quality/spoilage risk.`,
    };
  }
  return null;
}

// Flag failed lab tests, contamination, or low grades from a QualityReport.
export function checkQualityReport(report = {}) {
  const subject = report.subjectID || report.reportID;
  const contaminated = report.pesticidesDetected || report.aflatoxinDetected;

  if (report.result === "Fail" || contaminated) {
    const reasons = [];
    if (report.result === "Fail") reasons.push("lab result FAIL");
    if (report.pesticidesDetected) reasons.push("pesticides detected");
    if (report.aflatoxinDetected) reasons.push("aflatoxin detected");
    return {
      type: "QUALITY_FAILURE",
      severity: Severity.HIGH,
      batchID: subject,
      message: `Quality report for ${subject}: ${reasons.join(", ")}. Unsafe for sale.`,
    };
  }

  if (report.grade && report.grade.toUpperCase() === "C") {
    return {
      type: "QUALITY_LOW_GRADE",
      severity: Severity.MEDIUM,
      batchID: subject,
      message: `Quality report for ${subject} graded C (lowest). Review before distribution.`,
    };
  }
  return null;
}

// Run quality rules across a list of reports.
export function evaluateQualityReports(reports = []) {
  return reports.map(checkQualityReport).filter(Boolean);
}

// Run every applicable rule over one record and return the list of alerts.
export function evaluate(record = {}) {
  const alerts = [
    checkWeightVariance(record),
    checkExtractionRatio(record),
    checkTransitDuration(record),
  ].filter(Boolean);
  return alerts;
}
