// Names only. These demo catalogue entries have no pharmacy inventory or prices.
// Verify actual products, strengths and availability with a pharmacy before publishing real data.
const groups = [
  [1, ['Ibuprofen', 'Naproxen', 'Aspirin', 'Diclofenac', 'Mefenamic acid', 'Celecoxib', 'Meloxicam', 'Ketoprofen', 'Etoricoxib', 'Indomethacin', 'Piroxicam']],
  [2, ['Azithromycin', 'Doxycycline', 'Cephalexin', 'Cefuroxime', 'Ciprofloxacin', 'Clarithromycin', 'Clindamycin', 'Erythromycin', 'Metronidazole', 'Flucloxacillin', 'Co-amoxiclav']],
  [3, ['Vitamin D3', 'Vitamin B12', 'Vitamin B1', 'Vitamin B6', 'Folic acid', 'Vitamin E', 'Vitamin A', 'Vitamin K', 'Calcium carbonate', 'Zinc sulfate', 'Ferrous sulfate']],
  [4, ['Glimepiride', 'Gliclazide', 'Glipizide', 'Sitagliptin', 'Linagliptin', 'Vildagliptin', 'Empagliflozin', 'Dapagliflozin', 'Pioglitazone', 'Acarbose', 'Repaglinide']],
  [5, ['Loratadine', 'Fexofenadine', 'Levocetirizine', 'Desloratadine', 'Chlorphenamine', 'Diphenhydramine', 'Promethazine', 'Hydroxyzine', 'Bilastine', 'Rupatadine', 'Ebastine']],
];

export const demoCatalogue = groups.flatMap(([category_id, names], groupIndex) =>
  names.map((name, index) => ({
    id: 1000 + groupIndex * 100 + index,
    name,
    generic_name: name,
    category_id,
    availability: [],
    demoCatalogue: true,
  }))
);
