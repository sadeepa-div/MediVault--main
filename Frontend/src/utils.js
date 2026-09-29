export const STATUS = {
  in_stock: 'In stock',
  low: 'Low stock',
  out_of_stock: 'Out of stock',
};

// Suggested status from a quantity. The user can still override it in the form.
export function statusFor(quantity, lowThreshold = 10) {
  const q = Number(quantity);
  if (!(q > 0)) return 'out_of_stock';
  return q <= lowThreshold ? 'low' : 'in_stock';
}

// Best status across all pharmacies that stock a medicine.
export function overallStatus(availability = []) {
  if (availability.some((a) => a.status === 'in_stock')) return 'in_stock';
  if (availability.some((a) => a.status === 'low')) return 'low';
  return 'out_of_stock';
}

export const money = (n) => `Rs. ${Number(n).toFixed(2)}`;

// Whole days from now until a date (negative if already past). null if no date.
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}
