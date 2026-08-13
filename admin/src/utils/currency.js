// ============================================================
// UTIL: currency
// ------------------------------------------------------------
// Fetches live USD -> INR rate from a free public API and
// converts currency-string cost input ($20, ₹1500) into a
// plain INR number before it's sent to the backend.
// ============================================================

const RATE_CACHE_KEY = 'usdToInrRateCache';
const CACHE_DURATION_MS = 1000 * 60 * 60; // 1 hour - avoid re-fetching on every keystroke/render

export const fetchUsdToInrRate = async () => {
  try {
    const cached = JSON.parse(localStorage.getItem(RATE_CACHE_KEY) || 'null');
    if (cached && Date.now() - cached.fetchedAt < CACHE_DURATION_MS) {
      return cached.rate;
    }
  } catch {
    // corrupt cache, ignore and re-fetch
  }

  const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
  if (!res.ok) throw new Error('Failed to fetch exchange rate');
  const data = await res.json();
  const rate = data.rates?.INR;
  if (!rate) throw new Error('INR rate not found in API response');

  localStorage.setItem(RATE_CACHE_KEY, JSON.stringify({ rate, fetchedAt: Date.now() }));
  return rate;
};

export const parseCurrencyToINR = (input, usdToInrRate) => {
  const trimmed = (input || '').trim();
  if (!trimmed) return null;

  const isDollar = /^\$|USD/i.test(trimmed);
  const numericValue = parseFloat(trimmed.replace(/[^0-9.]/g, ''));
  if (isNaN(numericValue)) return null;

  if (isDollar) {
    if (!usdToInrRate) return null; // rate hasn't loaded yet - caller should block submit
    return numericValue * usdToInrRate;
  }

  return numericValue; // ₹, Rs, INR, or no symbol -> already rupees
};