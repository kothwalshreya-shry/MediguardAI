import { safetyRules } from "./data";

export const normalize = (value = "") =>
  value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, " ");

const severityRank = { "High Risk": 4, Moderate: 3, Caution: 2, Safe: 1 };

export function analyzePatient(patient) {
  const meds = (patient.medications || []).map(m => ({
    ...m,
    normalized: normalize(m.name),
    doseNumber: Number.parseFloat(m.dose || "")
  })).filter(m => m.normalized);

  const conditions = (patient.conditions || []).map(normalize);
  const allergies = (patient.allergies || []).map(normalize);
  const findings = [];

  // Drug–drug interaction rules
  for (const rule of safetyRules.filter(r => r.type === "Drug–drug interaction")) {
    const matched = rule.drugs.every(drug => meds.some(m => m.normalized === normalize(drug)));
    if (matched) findings.push(makeFinding(rule, rule.drugs.join(" + ")));
  }

  // Drug–allergy rules
  for (const rule of safetyRules.filter(r => r.type === "Drug–allergy conflict")) {
    const hasDrug = meds.some(m => m.normalized === normalize(rule.drugs[0]));
    const hasAllergy = allergies.some(a => rule.allergies.some(x => a.includes(normalize(x))));
    if (hasDrug && hasAllergy) findings.push(makeFinding(rule, rule.drugs[0]));
  }

  // Duplicate therapy demonstration rule
  for (const rule of safetyRules.filter(r => r.type === "Duplicate therapy")) {
    const matched = rule.drugs.every(drug => meds.some(m => m.normalized === normalize(drug)));
    if (matched) findings.push(makeFinding(rule, rule.drugs.join(" + ")));
  }

  // Disease-specific rule
  for (const rule of safetyRules.filter(r => r.type === "Drug–disease interaction")) {
    const hasDrug = meds.some(m => m.normalized === normalize(rule.drugs[0]));
    const hasCondition = conditions.some(c => rule.conditions.some(x => c.includes(normalize(x))));
    if (hasDrug && hasCondition) findings.push(makeFinding(rule, rule.drugs[0]));
  }

  // Dosage demo rule: parse a single entered dose and compare against a deliberately
  // limited example threshold. This is not a clinical dosing calculator.
  for (const rule of safetyRules.filter(r => r.type === "Dosage check")) {
    const medicine = meds.find(m => m.normalized === normalize(rule.drugs[0]));
    if (medicine && Number.isFinite(medicine.doseNumber) && medicine.doseNumber > rule.maxDoseMg) {
      findings.push(makeFinding(rule, medicine.name));
    }
  }

  findings.sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);
  return {
    patient,
    findings,
    status: findings.length ? findings[0].severity : "Safe",
    checksRun: 5,
    analyzedAt: new Date().toLocaleString()
  };
}

function makeFinding(rule, involved) {
  return {
    id: rule.id, type: rule.type, severity: rule.severity,
    title: rule.title, involved, what: rule.title, why: rule.why,
    review: rule.review, source: rule.source
  };
}

export function summarize(result) {
  const counts = { "High Risk": 0, Moderate: 0, Caution: 0 };
  result.findings.forEach(f => { counts[f.severity] = (counts[f.severity] || 0) + 1; });
  return counts;
}