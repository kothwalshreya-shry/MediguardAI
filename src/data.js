export const demoPatients = [
  {
    id: "MG-2048", name: "Alex Morgan", age: 67, sex: "Female",
    conditions: ["Atrial fibrillation", "Hypertension"],
    allergies: ["None recorded"],
    medications: [
      { name: "Warfarin", dose: "5 mg", frequency: "Once daily" },
      { name: "Ibuprofen", dose: "400 mg", frequency: "As needed" },
      { name: "Amlodipine", dose: "5 mg", frequency: "Once daily" }
    ],
    scenario: "Potential interaction example",
    note: "Illustrative profile demonstrating a known interaction category."
  },
  {
    id: "MG-3172", name: "Jamie Rivera", age: 34, sex: "Male",
    conditions: ["Seasonal allergies"],
    allergies: ["Penicillin"],
    medications: [
      { name: "Amoxicillin", dose: "500 mg", frequency: "Three times daily" },
      { name: "Cetirizine", dose: "10 mg", frequency: "Once daily" }
    ],
    scenario: "Recorded allergy conflict example",
    note: "Illustrative profile demonstrating allergy matching."
  },
  {
    id: "MG-4821", name: "Taylor Brooks", age: 29, sex: "Female",
    conditions: ["Migraine"],
    allergies: ["None recorded"],
    medications: [
      { name: "Acetaminophen", dose: "500 mg", frequency: "As needed" },
      { name: "Cetirizine", dose: "10 mg", frequency: "Once daily" }
    ],
    scenario: "No matching demo rules",
    note: "No matching rule in this small demo rule set; this does not establish clinical safety."
  }
];

export const initialStats = {
  patients: 1284,
  checks: 3862,
  high: 18,
  moderate: 42,
  caution: 76
};

export const safetyRules = [
  {
    id: "DDI-001", type: "Drug–drug interaction", severity: "High Risk",
    drugs: ["warfarin", "ibuprofen"],
    title: "Potential increased bleeding risk",
    why: "The illustrative rule flags the combination of warfarin and an NSAID such as ibuprofen because it may increase bleeding risk.",
    review: "A qualified clinician or pharmacist should review the combination, patient history and current treatment plan.",
    source: "Illustrative demo rule · requires validation"
  },
  {
    id: "ALG-001", type: "Drug–allergy conflict", severity: "High Risk",
    drugs: ["amoxicillin"], allergies: ["penicillin"],
    title: "Recorded penicillin allergy match",
    why: "Amoxicillin is a penicillin-class antibiotic. The demo rule flags it when a penicillin allergy is recorded.",
    review: "Verify the allergy history, reaction details and clinical record with a qualified healthcare professional.",
    source: "Illustrative demo rule · requires validation"
  },
  {
    id: "DUP-001", type: "Duplicate therapy", severity: "Caution",
    drugs: ["ibuprofen", "naproxen"],
    title: "Potential duplicate NSAID therapy",
    why: "Both listed medicines are NSAIDs. Concurrent use may increase adverse-effect risk and should be reviewed.",
    review: "Confirm whether both medicines are intended and review the medication list with a clinician or pharmacist.",
    source: "Illustrative demo rule · requires validation"
  },
  {
    id: "DOD-001", type: "Dosage check", severity: "Moderate",
    drugs: ["acetaminophen"],
    maxDoseMg: 3000,
    title: "Demo dosage threshold exceeded",
    why: "The entered daily dose estimate is above the example threshold configured in this prototype. Actual limits depend on patient-specific factors and authoritative guidance.",
    review: "Verify the total daily dose from all products and consult an authoritative reference or clinician.",
    source: "Illustrative demo threshold · not a prescribing limit"
  },
  {
    id: "DSD-001", type: "Drug–disease interaction", severity: "Caution",
    drugs: ["ibuprofen"], conditions: ["chronic kidney disease"],
    title: "Condition-specific review suggested",
    why: "The demo rule flags ibuprofen when chronic kidney disease is recorded, prompting a patient-specific review.",
    review: "A clinician should assess kidney function, treatment alternatives and the patient's full clinical context.",
    source: "Illustrative demo rule · requires validation"
  }
];