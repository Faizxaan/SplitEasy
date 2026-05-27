const CURRENCY_CONFIG = {
  INR: { symbol: '₹', locale: 'en-IN', currency: 'INR' },
  USD: { symbol: '$', locale: 'en-US', currency: 'USD' },
  EUR: { symbol: '€', locale: 'en-EU', currency: 'EUR' },
  GBP: { symbol: '£', locale: 'en-GB', currency: 'GBP' },
};

export function formatCurrency(amount, currencyCode = 'INR') {
  const config = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.INR;
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatAmount(amount) {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toFixed(2);
}
