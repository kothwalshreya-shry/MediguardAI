
import { safetyRules } from "./data";

// ------------------------------------------
// 1. MEDICATION NAME NORMALIZATION
// ------------------------------------------

export const normalize = (value = "") =>
  String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ");

// ------------------------------------------
// 2. SEVERITY PRIORITY
// ------------------------------------------

const severityRank = {
  "High Risk": 4,
  Moderate: 3,
  Caution: 2,
  Safe: 1
};

// ------------------------------------------
// 3. PATIENT INPUT VALIDATION
// ------------------------------------------

export function validatePatient(patient) {
  const errors = [];

  if (!patient || typeof patient !== "object" || Array.isArray(patient)) {
    return ["Invalid patient information."];
  }

  if (!String(patient.name ?? "").trim()) {
    errors.push("Patient name is required.");
  }

  const age = Number(patient.age);

  if (!Number.isFinite(age) || age < 1 || age > 120) {
    errors.push("Patient age must be between 1 and 120.");
  }

  if (!Array.isArray(patient.medications)) {
    errors.push("Medication list must be an array.");
  } else {
    const validMedications = patient.medications.filter(
      medication =>
        medication &&
        typeof medication === "object" &&
        !Array.isArray(medication) &&
        normalize(medication.name)
    );

    if (validMedications.length === 0) {
      errors.push("At least one valid medication is required.");
    }
  }

  if (
    patient.conditions !== undefined &&
    !Array.isArray(patient.conditions)
  ) {
    errors.push("Medical conditions must be provided as a list.");
  }

  if (
    patient.allergies !== undefined &&
    !Array.isArray(patient.allergies)
  ) {
    errors.push("Allergies must be provided as a list.");
  }

  return errors;
}

// ------------------------------------------
// 4. MEDICATION DOSE PARSER
// ------------------------------------------

function parseDoseMg(dose = "") {
  const match = String(dose).trim().match(
    /^(\d+(?:\.\d+)?)\s*(mg|mcg|µg|g)\b/i
  );

  if (!match) return null;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (!Number.isFinite(amount)) return null;

  const conversions = {
    mg: 1,
    mcg: 0.001,
    "µg": 0.001,
    g: 1000
  };

  return amount * conversions[unit];
}

// ------------------------------------------
// 5. FINDING GENERATOR
// ------------------------------------------

function makeFinding(rule, involved, extra = {}) {
  return {
    id: rule.id,
    type: rule.type,
    severity: rule.severity,
    title: rule.title,
    involved,
    what: rule.title,
    why: extra.why ?? rule.why,
    review: rule.review,
    source: rule.source
  };
}

// ------------------------------------------
// 6. SAFE MATCHING HELPERS
// ------------------------------------------

function hasMedication(medications, drugName) {
  const target = normalize(drugName);

  return medications.some(
    medication => medication.normalized === target
  );
}

function hasRelatedEntry(entries, keywords) {
  return entries.some(entry =>
    keywords.some(keyword => {
      const target = normalize(keyword);
      return target && entry.includes(target);
    })
  );
}

// ------------------------------------------
// 7. MAIN PATIENT SAFETY ENGINE
// ------------------------------------------

export function analyzePatient(patient) {
  const validationErrors = validatePatient(patient);

  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join(" "));
  }

  // Normalize medication information.
  const medications = patient.medications
    .filter(m => m && typeof m === "object")
    .map(m => ({
      ...m,
      normalized: normalize(m.name),
      doseMg: parseDoseMg(m.dose)
    }))
    .filter(m => m.normalized);

  // Normalize patient context.
  const conditions = (patient.conditions || [])
    .map(normalize)
    .filter(Boolean);

  const allergies = (patient.allergies || [])
    .map(normalize)
    .filter(a => a && a !== "none recorded" && a !== "none");

  const findings = [];

  const rules = Array.isArray(safetyRules)
    ? safetyRules
    : [];

  // ----------------------------------------
  // CHECK 1: DRUG-DRUG INTERACTIONS
  // ----------------------------------------

  for (const rule of rules.filter(
    r => r.type === "Drug–drug interaction"
  )) {
    if (!Array.isArray(rule.drugs) || !rule.drugs.length) continue;

    const matched = rule.drugs.every(drug =>
      hasMedication(medications, drug)
    );

    if (matched) {
      findings.push(
        makeFinding(rule, rule.drugs.join(" + "))
      );
    }
  }

  // ----------------------------------------
  // CHECK 2: DRUG-ALLERGY CONFLICTS
  // ----------------------------------------

  for (const rule of rules.filter(
    r => r.type === "Drug–allergy conflict"
  )) {
    if (!rule.drugs?.length || !rule.allergies?.length) continue;

    const hasDrug = hasMedication(
      medications,
      rule.drugs[0]
    );

    const hasAllergy = hasRelatedEntry(
      allergies,
      rule.allergies
    );

    if (hasDrug && hasAllergy) {
      findings.push(
        makeFinding(rule, rule.drugs[0])
      );
    }
  }

  // ----------------------------------------
  // CHECK 3: DUPLICATE THERAPY
  // ----------------------------------------

  for (const rule of rules.filter(
    r => r.type === "Duplicate therapy"
  )) {
    if (!Array.isArray(rule.drugs) || !rule.drugs.length) continue;

    const matched = rule.drugs.every(drug =>
      hasMedication(medications, drug)
    );

    if (matched) {
      findings.push(
        makeFinding(rule, rule.drugs.join(" + "))
      );
    }
  }

  // ----------------------------------------
  // CHECK 4: DRUG-DISEASE INTERACTIONS
  // ----------------------------------------

  for (const rule of rules.filter(
    r => r.type === "Drug–disease interaction"
  )) {
    if (!rule.drugs?.length || !rule.conditions?.length) continue;

    const hasDrug = hasMedication(
      medications,
      rule.drugs[0]
    );

    const hasCondition = hasRelatedEntry(
      conditions,
      rule.conditions
    );

    if (hasDrug && hasCondition) {
      findings.push(
        makeFinding(rule, rule.drugs[0])
      );
    }
  }

  // ----------------------------------------
  // CHECK 5: DEMONSTRATION DOSE THRESHOLD
  // ----------------------------------------

  for (const rule of rules.filter(
    r => r.type === "Dosage check"
  )) {
    if (!rule.drugs?.length) continue;

    const medicine = medications.find(
      m => m.normalized === normalize(rule.drugs[0])
    );

    if (!medicine) continue;

    if (
      medicine.doseMg !== null &&
      Number.isFinite(rule.maxDoseMg) &&
      medicine.doseMg > rule.maxDoseMg
    ) {
      findings.push(
        makeFinding(rule, medicine.name, {
          why:
            rule.why +
            " This prototype compares the entered amount only. " +
            "It does not calculate total daily exposure from medication frequency."
        })
      );
    }
  }

  // ----------------------------------------
  // 8. RANK FINDINGS BY SEVERITY
  // ----------------------------------------

  findings.sort((a, b) => {
    const severityDifference =
      (severityRank[b.severity] || 0) -
      (severityRank[a.severity] || 0);

    return severityDifference ||
      String(a.id).localeCompare(String(b.id));
  });

  // ----------------------------------------
  // 9. RETURN ANALYSIS RESULT
  // ----------------------------------------

  return {
    patient,
    findings,

    status: findings.length
      ? findings[0].severity
      : "Safe",

    checksRun: 5,

    analyzedAt: new Date().toLocaleString()
  };
}

// ------------------------------------------
// 10. FINDINGS SUMMARY
// ------------------------------------------

export function summarize(result) {
  const counts = {
    "High Risk": 0,
    Moderate: 0,
    Caution: 0
  };

  (result?.findings || []).forEach(finding => {
    if (Object.prototype.hasOwnProperty.call(
      counts,
      finding.severity
    )) {
      counts[finding.severity]++;
    }
  });

  return counts;
}
