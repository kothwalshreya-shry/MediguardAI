
# MediGuard AI – Medical References

## Drug–Drug Interactions

### DDI-001: Warfarin + Ibuprofen

- **Risk:** Potential increased bleeding risk.
- **Reference 1:** US FDA/DailyMed, Warfarin Sodium Prescribing Information, Section 7.3 – Drugs that Increase Bleeding Risk.
- **URL:** https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=51e98fb6-ba76-497e-95d8-fe895ef0b7ed
- **Reference 2:** NHS – Warfarin medicine guidance.
- **URL:** https://www.nhs.uk/medicines/warfarin/
- **Prototype severity:** Caution.
- **Validation status:** Research-supported prototype rule; not independently clinically validated.


## Drug–Allergy Conflicts

### ALG-001: Amoxicillin + Penicillin Allergy

- **Risk:** Potential serious hypersensitivity reaction, including anaphylaxis.
- **Reference:** US FDA/DailyMed, Amoxicillin Prescribing Information, Section 4 – Contraindications.
- **Additional section:** Section 5.1 – Anaphylactic Reactions.
- **URL:** https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ad804b34-169c-44bf-a469-f1149433d96b
- **Prototype severity:** High Risk.
- **Validation status:** Research-supported prototype rule; not independently clinically validated.
- **Important limitation:** Applies to a history of serious hypersensitivity, not automatically to every reported penicillin allergy.


## Duplicate Therapy

### DUP-001: Ibuprofen + Naproxen

- **Risk:** Increased risk of NSAID-related adverse effects, including stomach ulcers and gastrointestinal bleeding.
- **Reference 1:** NHS – Ibuprofen for adults.
- **URL:** https://www.nhs.uk/medicines/ibuprofen-for-adults/
- **Reference 2:** NHS – Naproxen.
- **URL:** https://www.nhs.uk/medicines/naproxen/
- **Reference 3:** US FDA – Naproxen Prescribing Information, Warnings and Precautions.
- **URL:** https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/020353s036lbl.pdf
- **Prototype severity:** Moderate.
- **Validation status:** Research-supported prototype rule; not independently clinically validated.
