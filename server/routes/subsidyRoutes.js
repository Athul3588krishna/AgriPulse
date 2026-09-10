const express = require('express');
const router = express.Router();

// Agricultural subsidies and government schemes database (Central & Kerala)
const schemesDatabase = [
  {
    id: 'pmfby',
    nameEn: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    nameMl: 'പ്രധാനമന്ത്രി ഫസൽ ബീമാ യോജന (വിള ഇൻഷുറൻസ്)',
    type: 'Insurance',
    authority: 'Central & State Government',
    targetCrops: ['Paddy', 'Banana', 'Vegetables', 'Tomato', 'Potato', 'Ginger', 'Chilli'],
    maxLandAcres: 50,
    minLandAcres: 0.05,
    farmerCategories: ['Marginal', 'Small', 'Medium', 'Large'],
    maxFinancialBenefitEn: 'Up to ₹25,000 to ₹40,000 per acre for notified crop damages',
    maxFinancialBenefitMl: 'ഏക്കറിന് ₹25,000 മുതൽ ₹40,000 വരെ വിളനാശ നഷ്ടപരിഹാരം',
    estimatedBenefitFormula: (acres, crop) => Math.round(acres * (crop === 'Paddy' ? 30000 : 35000)),
    premiumFarmerShare: '1.5% to 2% of sum insured (Remaining paid by Govt)',
    descriptionEn: 'Comprehensive financial safety net against non-preventable natural risks, pest outbreaks, and crop diseases from pre-sowing to post-harvest.',
    descriptionMl: 'പ്രകൃതിക്ഷോഭം, കീടബാധ, രോഗങ്ങൾ എന്നിവ മൂലമുണ്ടാകുന്ന വിളനാശത്തിന് സമഗ്ര ഇൻഷുറൻസ് പരിരക്ഷ.',
    requiredDocumentsEn: ['Aadhaar Card', 'Land Tax Receipt / RoR', 'Active Bank Passbook with IFSC', 'Sowing Certificate / Crop Photo with geotag'],
    requiredDocumentsMl: ['ആധാർ കാർഡ്', 'ഭൂനികുതി രസീത്', 'ബാങ്ക് പാസ്ബുക്ക്', 'വിള കൃഷി ചെയ്തതിന്റെ രേഖ / ജിയോടാഗ് ഫോട്ടോ'],
    applyUrl: 'https://pmfby.gov.in',
    localOfficeEn: 'Local Krishi Bhavan or Village Common Service Center (CSC)',
    localOfficeMl: 'തദ്ദേശ കൃഷിഭവൻ അല്ലെങ്കിൽ അക്ഷയ കേന്ദ്രം'
  },
  {
    id: 'pm-kisan',
    nameEn: 'PM-KISAN Samman Nidhi',
    nameMl: 'പി.എം. കിസാൻ സമ്മാൻ നിധി',
    type: 'Direct Benefit',
    authority: 'Ministry of Agriculture & Farmers Welfare, GoI',
    targetCrops: ['All'],
    maxLandAcres: 5,
    minLandAcres: 0.01,
    farmerCategories: ['Marginal', 'Small'],
    maxFinancialBenefitEn: '₹6,000 annually in three equal installments of ₹2,000 directly to bank account',
    maxFinancialBenefitMl: 'വർഷത്തിൽ ₹6,000 (₹2,000 വീതം 3 ഗഡുക്കളായി നേരിട്ട് അക്കൗണ്ടിലേക്ക്)',
    estimatedBenefitFormula: () => 6000,
    premiumFarmerShare: '100% Free Government Direct Benefit Transfer',
    descriptionEn: 'Direct income support scheme providing assured supplementary income to small and marginal landholding farmer families across India.',
    descriptionMl: 'ചെറുകിട, നാമമാത്ര കർഷക കുടുംബങ്ങൾക്ക് വർഷം തോറും ഉറപ്പായ ധനസഹായം ബാങ്ക് വഴി നൽകുന്നു.',
    requiredDocumentsEn: ['Aadhaar Card linked with Mobile', 'Land Title Document (Pattayam/Thandaper)', 'Aadhaar-seeded Bank Account'],
    requiredDocumentsMl: ['ആധാർ കാർഡ്', 'ഭൂമിയുടെ ഉടമസ്ഥാവകാശ രേഖ / കരം രസീത്', 'ആധാർ ലിങ്ക് ചെയ്ത ബാങ്ക് അക്കൗണ്ട്'],
    applyUrl: 'https://pmkisan.gov.in',
    localOfficeEn: 'Local Krishi Bhavan or PM-KISAN Portal',
    localOfficeMl: 'കൃഷിഭവൻ / അക്ഷയ കേന്ദ്രം'
  },
  {
    id: 'subhiksha-keralam',
    nameEn: 'Subhiksha Keralam Cultivation Incentive Scheme',
    nameMl: 'സുഭിക്ഷ കേരളം കാർഷിക ധനസഹായ പദ്ധതി',
    type: 'Cultivation Incentive',
    authority: 'Department of Agriculture Development and Farmers’ Welfare, Kerala',
    targetCrops: ['Vegetables', 'Banana', 'Paddy', 'Tomato', 'GreenChilli', 'Ginger'],
    maxLandAcres: 10,
    minLandAcres: 0.1,
    farmerCategories: ['Marginal', 'Small', 'Medium'],
    maxFinancialBenefitEn: '₹12,000 to ₹35,000 per hectare for fallow land and intensive commercial cultivation',
    maxFinancialBenefitMl: 'തരിശുഭൂമി കൃഷിക്കും പച്ചക്കറി കൃഷിക്കും ഹെക്ടറിന് ₹12,000 മുതൽ ₹35,000 വരെ',
    estimatedBenefitFormula: (acres) => Math.round(acres * 12000),
    premiumFarmerShare: 'Subsidy Grant (Non-repayable)',
    descriptionEn: 'State government initiative to encourage food self-sufficiency, fallow land farming, and modern commercial vegetable cultivation in Kerala.',
    descriptionMl: 'കേരളത്തിൽ തരിശുഭൂമി കൃഷിയും വാണിജ്യ പച്ചക്കറി കൃഷിയും പ്രോത്സാഹിപ്പിക്കുന്നതിനുള്ള സംസ്ഥാന സർക്കാർ സബ്‌സിഡി.',
    requiredDocumentsEn: ['Land Possession Certificate', 'Krishi Bhavan Registration Certificate', 'Bank Passbook Details'],
    requiredDocumentsMl: ['കൈവശാവകാശ സർട്ടിഫിക്കറ്റ്', 'കൃഷിഭവൻ കർഷക രജിസ്ട്രേഷൻ', 'ബാങ്ക് അക്കൗണ്ട് വിവരങ്ങൾ'],
    applyUrl: 'https://keralaagriculture.gov.in',
    localOfficeEn: 'Village Krishi Bhavan Agricultural Officer',
    localOfficeMl: 'ഗ്രാമപഞ്ചായത്ത് കൃഷി ഭവൻ'
  },
  {
    id: 'soil-health-card',
    nameEn: 'National Soil Health Card & Nutrient Management',
    nameMl: 'സോയിൽ ഹെൽത്ത് കാർഡ് & വളപ്രയോഗ സബ്‌സിഡി',
    type: 'Agronomy Support',
    authority: 'Department of Agriculture & Cooperation',
    targetCrops: ['All'],
    maxLandAcres: 100,
    minLandAcres: 0.01,
    farmerCategories: ['Marginal', 'Small', 'Medium', 'Large'],
    maxFinancialBenefitEn: 'Free professional soil testing + 50% subsidy on customized micronutrients & biofertilizers',
    maxFinancialBenefitMl: 'സൗജന്യ മണ്ണ് പരിശോധന + മൈക്രോ ന്യൂട്രിയന്റുകൾക്കും ജൈവവളങ്ങൾക്കും 50% സബ്‌സിഡി',
    estimatedBenefitFormula: (acres) => Math.round(acres * 3500) + 1500,
    premiumFarmerShare: '100% Free soil testing and subsidized inputs',
    descriptionEn: 'Comprehensive laboratory soil analysis detailing 12 parameters (N, P, K, pH, micronutrients) with tailored dosage recommendations to prevent over-fertilization.',
    descriptionMl: 'മണ്ണിലെ പോഷകങ്ങളുടെ അളവ് സൗജന്യമായി പരിശോധിച്ച് ആവശ്യമുള്ള വളങ്ങൾ മാത്രം നൽകാനുള്ള ശാസ്ത്രീയ കാർഡ്.',
    requiredDocumentsEn: ['Field location coordinates', 'Basic farmer identity card'],
    requiredDocumentsMl: ['കൃഷിയിടത്തിന്റെ വിലാസം', 'തിരിച്ചറിയൽ കാർഡ്'],
    applyUrl: 'https://soilhealth.dac.gov.in',
    localOfficeEn: 'Soil Testing Lab / KAU Krishi Vigyan Kendra (KVK)',
    localOfficeMl: 'മണ്ണ് പരിശോധനാ കേന്ദ്രം / KAU കൃഷി വിജ്ഞാന കേന്ദ്രം'
  },
  {
    id: 'pdmc-micro-irrigation',
    nameEn: 'Per Drop More Crop (PDMC) - Drip & Sprinkler Subsidy',
    nameMl: 'സൂക്ഷ്മ ജലസേചന പദ്ധതി (ഡ്രിപ്പ് / സ്പ്രിംഗ്ലർ സബ്‌സിഡി)',
    type: 'Infrastructure',
    authority: 'PMKSY / Kerala State Horticulture Mission',
    targetCrops: ['Banana', 'Vegetables', 'BlackPepper', 'Cardamom', 'Tomato'],
    maxLandAcres: 12.5,
    minLandAcres: 0.25,
    farmerCategories: ['Marginal', 'Small', 'Medium'],
    maxFinancialBenefitEn: 'Up to 55% subsidy for Small & Marginal farmers, 45% for other farmers on drip installations',
    maxFinancialBenefitMl: 'ഡ്രിപ്പ്/തുള്ളിനന ഉപകരണങ്ങൾക്ക് 55% വരെ സർക്കാർ സബ്‌സിഡി',
    estimatedBenefitFormula: (acres) => Math.min(65000, Math.round(acres * 35000)),
    premiumFarmerShare: 'Farmer contributes remaining 45-50% equipment cost',
    descriptionEn: 'Promotes precision micro-irrigation systems to maximize water use efficiency, reducing water and fertilizer expenditure by 40%.',
    descriptionMl: 'വെള്ളവും വളവും ലാഭിക്കുന്ന തുള്ളിനന സംവിധാനങ്ങൾ സ്ഥാപിക്കാൻ 55% വരെ സബ്‌സിഡി.',
    requiredDocumentsEn: ['Land Tax Receipt', 'Irrigation Source Certificate (Well/Pond)', 'Aadhaar', 'Equipment Quotation'],
    requiredDocumentsMl: ['കരം രസീത്', 'ജലസ്രോതസ്സ് സർട്ടിഫിക്കറ്റ്', 'ആധാർ', 'ഉപകരണ വില ക്വട്ടേഷൻ'],
    applyUrl: 'https://pmksy.gov.in',
    localOfficeEn: 'District Horticulture Mission / Krishi Bhavan',
    localOfficeMl: 'ഹോർട്ടികൾച്ചർ മിഷൻ / കൃഷി ഭവൻ'
  },
  {
    id: 'smam-machinery',
    nameEn: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    nameMl: 'കാർഷിക യന്ത്രവൽക്കരണ സബ്‌സിഡി പദ്ധതി',
    type: 'Equipment',
    authority: 'Ministry of Agriculture / Kerala Agri Dept',
    targetCrops: ['All'],
    maxLandAcres: 100,
    minLandAcres: 0.5,
    farmerCategories: ['Marginal', 'Small', 'Medium', 'Large'],
    maxFinancialBenefitEn: '40% to 50% subsidy on power tillers, weeders, brush cutters, sprayers, and solar pumps',
    maxFinancialBenefitMl: 'പവർ ടില്ലർ, വീഡർ, സ്പ്രേയർ തുടങ്ങിയ യന്ത്രങ്ങൾക്ക് 40% മുതൽ 50% വരെ സബ്‌സിഡി',
    estimatedBenefitFormula: () => 35000,
    premiumFarmerShare: 'Farmer pays net discounted balance',
    descriptionEn: 'Financial assistance for procurement of modern agricultural machinery to overcome farm labor shortages and enhance operational speed.',
    descriptionMl: 'കർഷകർക്ക് പവർ ടില്ലർ, സ്പ്രേയർ, കൊയ്ത്തുയന്ത്രം തുടങ്ങിയവ വാങ്ങാൻ പകുതി വില സർക്കാർ നൽകുന്നു.',
    requiredDocumentsEn: ['Aadhaar', 'Land Record', 'Bank Account', 'Machinery Model Selection'],
    requiredDocumentsMl: ['ആധാർ', 'ഭൂമി രേഖ', 'ബാങ്ക് അക്കൗണ്ട്', 'യന്ത്രത്തിന്റെ ക്വട്ടേഷൻ'],
    applyUrl: 'https://agrimachinery.nic.in',
    localOfficeEn: 'Executive Engineer (Agri), District Office / Krishi Bhavan',
    localOfficeMl: 'അസിസ്റ്റന്റ് എക്സിക്യൂട്ടീവ് എഞ്ചിനീയർ (കൃഷി) / കൃഷി ഭവൻ'
  },
  {
    id: 'state-calamity-relief',
    nameEn: 'Kerala State Disaster Crop Loss Relief Fund',
    nameMl: 'കേരള സംസ്ഥാന പ്രകൃതിക്ഷോഭ വിളനാശ നഷ്ടപരിഹാര നിധി',
    type: 'Emergency Relief',
    authority: 'Revenue & Agriculture Dept, Govt of Kerala',
    targetCrops: ['Paddy', 'Banana', 'Vegetables', 'Pepper', 'Coconut'],
    maxLandAcres: 25,
    minLandAcres: 0.05,
    farmerCategories: ['Marginal', 'Small', 'Medium', 'Large'],
    maxFinancialBenefitEn: 'Standard relief rates: Paddy ₹13,500/ha, Nendran Banana ₹100-300/plant, Pepper ₹100/vine',
    maxFinancialBenefitMl: 'വിള നഷ്ടത്തിന്: നെല്ല് ഹെക്ടറിന് ₹13,500, വാഴയൊന്നിന് ₹100-300, കുരുമുളകിന് ₹100',
    estimatedBenefitFormula: (acres, crop) => Math.round(acres * (crop === 'NendranBanana' ? 22000 : 15000)),
    premiumFarmerShare: '100% Free State Relief Compensation',
    descriptionEn: 'Immediate financial compensation granted to registered farmers suffering loss from flood, drought, wind damage, or severe disease blight.',
    descriptionMl: 'കനത്ത മഴ, കാറ്റ്, അല്ലെങ്കിൽ അപ്രതീക്ഷിത രോഗബാധ മൂലം വിള നശിച്ചാൽ ലഭിക്കുന്ന അടിയന്തര ധനസഹായം.',
    requiredDocumentsEn: ['Field Damage Verification Report from Krishi Bhavan', 'Land Tax Receipt', 'Geo-tagged leaf scan image proof'],
    requiredDocumentsMl: ['കൃഷി ഓഫീസറുടെ മഹസർ / പരിശോധനാ റിപ്പോർട്ട്', 'നികുതി രസീത്', 'രോഗബാധ തെളിയിക്കുന്ന ഫോട്ടോ'],
    applyUrl: 'https://keralaagriculture.gov.in/relief',
    localOfficeEn: 'Local Village Krishi Bhavan',
    localOfficeMl: 'ഗ്രാമപഞ്ചായത്ത് കൃഷി ഭവൻ'
  }
];

// 1. GET /api/subsidies/all - All available schemes
router.get('/all', (req, res) => {
  const { type, crop } = req.query;

  let filtered = schemesDatabase;
  if (type) {
    filtered = filtered.filter(s => s.type.toLowerCase() === type.toLowerCase());
  }
  if (crop) {
    filtered = filtered.filter(s => s.targetCrops.includes('All') || s.targetCrops.some(c => c.toLowerCase() === crop.toLowerCase()));
  }

  res.json({
    status: 'success',
    count: filtered.length,
    timestamp: new Date().toISOString(),
    schemes: filtered
  });
});

// 2. POST /api/subsidies/evaluate-eligibility - Autonomous AI eligibility matcher
router.post('/evaluate-eligibility', (req, res) => {
  const {
    landAcres = 1.0,
    crop = 'Paddy',
    farmerCategory = 'Small', // Marginal (<2.5 acres), Small (2.5-5 acres), Medium (5-10), Large (>10)
    district = 'Ernakulam',
    hasDamage = false,
    damageSeverityPercent = 0
  } = req.body;

  const acres = parseFloat(landAcres) || 1.0;
  const severity = parseFloat(damageSeverityPercent) || 0;

  // Evaluate matching schemes
  const eligibleSchemes = [];
  let totalEstimatedAid = 0;

  schemesDatabase.forEach(scheme => {
    const cropMatch = scheme.targetCrops.includes('All') || scheme.targetCrops.some(c => c.toLowerCase() === crop.toLowerCase());
    const landMatch = acres >= scheme.minLandAcres && acres <= scheme.maxLandAcres;
    const categoryMatch = scheme.farmerCategories.includes(farmerCategory);

    // Emergency relief or insurance schemes prioritize if damage is detected
    const isLossScheme = scheme.id === 'pmfby' || scheme.id === 'state-calamity-relief';
    const conditionMet = cropMatch && landMatch && categoryMatch;

    if (conditionMet) {
      const estimatedBenefit = scheme.estimatedBenefitFormula ? scheme.estimatedBenefitFormula(acres, crop) : 10000;
      totalEstimatedAid += estimatedBenefit;

      eligibleSchemes.push({
        ...scheme,
        isHighPriority: isLossScheme && severity > 20,
        calculatedBenefit: estimatedBenefit,
        matchScore: isLossScheme && severity > 20 ? 98 : 92
      });
    }
  });

  // Sort: High priority first, then highest benefit
  eligibleSchemes.sort((a, b) => (b.isHighPriority ? 1 : 0) - (a.isHighPriority ? 1 : 0) || b.calculatedBenefit - a.calculatedBenefit);

  res.json({
    status: 'success',
    inputs: { landAcres: acres, crop, farmerCategory, district, damageSeverityPercent: severity },
    totalSchemesMatched: eligibleSchemes.length,
    totalEstimatedAid: totalEstimatedAid,
    advisoryEn: `Based on your ${acres} acre plot cultivating ${crop} in ${district}, you are eligible for ${eligibleSchemes.length} state & central agricultural schemes with an estimated cumulative entitlement of up to ₹${totalEstimatedAid.toLocaleString('en-IN')}.`,
    advisoryMl: `${district} ജില്ലയിൽ ${acres} ഏക്കറിൽ ${crop} കൃഷി ചെയ്യുന്ന നിങ്ങൾക്ക് ${eligibleSchemes.length} സർക്കാർ കാർഷിക സ്കീമുകൾക്ക് അർഹതയുണ്ട്. ആകെ ₹${totalEstimatedAid.toLocaleString('en-IN')} രൂപയുടെ ആനുകൂല്യങ്ങൾ നേടാം.`,
    schemes: eligibleSchemes
  });
});

// 3. POST /api/subsidies/generate-claim-packet - Link leaf scan damage to insurance claim
router.post('/generate-claim-packet', (req, res) => {
  const { diagnosisId, cropName, diseaseName, severityPercentage, plotName, farmerName = 'Farmer' } = req.body;

  const claimId = `PMFBY-CLAIM-${Date.now().toString().slice(-6)}`;
  const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const claimPacket = {
    claimId,
    filingDate: date,
    farmerName,
    plotName: plotName || 'Registered Farm Plot',
    cropName: cropName || 'Paddy',
    diseaseName: diseaseName || 'Crop Pathogen Infestation',
    severityPercentage: severityPercentage || 32.5,
    eligibilityStatus: severityPercentage > 20 ? 'ELIGIBLE FOR DIRECT COMPENSATION' : 'MILD INFESTATION (Remedial Spraying Recommended)',
    recommendedScheme: severityPercentage > 30 ? 'PMFBY Crop Loss Cover & State Calamity Relief' : 'PMFBY Prevented Sowing / Mid-Season Adversity',
    documentsRequired: [
      '1. Printout of this Digital Severity Verification Report with OpenCV leaf lesion score',
      '2. Aadhaar card photocopy and Land Tax (Karom) receipt',
      '3. Bank account passbook copy linking IFSC',
      '4. Krishi Bhavan Agricultural Officer signature endorsement'
    ],
    filingDeadline: 'Within 72 hours of disease discovery (Rule 2.4 of PMFBY Guidelines)',
    actionStepsEn: [
      'Download this digital claim packet PDF.',
      'Submit the claim online at https://pmfby.gov.in or report to your local Krishi Bhavan within 72 hours.',
      'An Agricultural Officer (AO) will conduct geo-tagged inspection within 7 days.'
    ],
    actionStepsMl: [
      'ഈ ഡിജിറ്റൽ ക്ലെയിം വെരിഫിക്കേഷൻ റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുക.',
      '72 മണിക്കൂറിനുള്ളിൽ നിങ്ങളുടെ കൃഷിഭവനിലോ pmfby.gov.in വഴിയോ ക്ലെയിം രജിസ്റ്റർ ചെയ്യുക.',
      'കൃഷി ഓഫീസർ നേരിട്ടെത്തി മഹസർ തയ്യാറാക്കി നഷ്ടപരിഹാരം ബാങ്ക് അക്കൗണ്ടിലേക്ക് നൽകും.'
    ]
  };

  res.json({
    status: 'success',
    claimPacket
  });
});

module.exports = router;
