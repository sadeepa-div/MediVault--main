// Demo data used when VITE_USE_MOCK is not "false". Lets you build the UI before the backend exists.
const inDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

export const CATEGORIES = [
  { id: 1, name: 'Pain relief' },
  { id: 2, name: 'Antibiotics' },
  { id: 3, name: 'Vitamins' },
  { id: 4, name: 'Diabetes' },
  { id: 5, name: 'Allergy' },
];

export const PHARMACIES = { 1: 'City Care Pharmacy', 2: 'Green Cross Pharmacy', 3: 'Lanka Health Pharmacy' };
export const MY_PHARMACY = 1; // the demo account belongs to pharmacy 1

const row = (id, pharmacy_id, medicine_id, name, generic_name, category_id, quantity, price, status, days) => ({
  id, pharmacy_id, pharmacy_name: PHARMACIES[pharmacy_id], medicine_id, name, generic_name,
  category_id, quantity, price, status, expiry_date: inDays(days),
});

export const seedItems = () => [
  row(1, 1, 1, 'Paracetamol 500mg', 'Paracetamol', 1, 120, 45, 'in_stock', 400),
  row(2, 2, 1, 'Paracetamol 500mg', 'Paracetamol', 1, 8, 48, 'low', 250),
  row(3, 3, 1, 'Paracetamol 500mg', 'Paracetamol', 1, 60, 44, 'in_stock', 300),
  row(4, 1, 2, 'Amoxicillin 500mg', 'Amoxicillin', 2, 0, 180, 'out_of_stock', 200),
  row(5, 2, 2, 'Amoxicillin 500mg', 'Amoxicillin', 2, 35, 175, 'in_stock', 220),
  row(6, 1, 3, 'Vitamin C 500mg', 'Ascorbic acid', 3, 6, 320, 'low', 20),
  row(7, 3, 3, 'Vitamin C 500mg', 'Ascorbic acid', 3, 90, 310, 'in_stock', 300),
  row(8, 1, 4, 'Metformin 500mg', 'Metformin', 4, 200, 95, 'in_stock', 500),
  row(9, 2, 5, 'Cetirizine 10mg', 'Cetirizine', 5, 45, 60, 'in_stock', 350),
  row(10, 1, 5, 'Cetirizine 10mg', 'Cetirizine', 5, 15, 62, 'in_stock', 25),
];
