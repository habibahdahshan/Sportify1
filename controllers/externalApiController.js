const ratesCache = { data: null, fetchedAt: 0 };
const CACHE_MS = 60 * 60 * 1000;

async function fetchEgpToUsdRate() {
  const now = Date.now();
  if (ratesCache.data && now - ratesCache.fetchedAt < CACHE_MS) {
    return ratesCache.data;
  }

  const response = await fetch("https://open.er-api.com/v6/latest/EGP");
  if (!response.ok) {
    throw new Error(`Currency API responded with ${response.status}`);
  }

  const payload = await response.json();
  const usdRate = payload && payload.rates && payload.rates.USD;

  if (!usdRate || !Number.isFinite(Number(usdRate))) {
    throw new Error("Currency API returned an invalid USD rate.");
  }

  ratesCache.data = {
    base: "EGP",
    baseSymbol: "LE",
    target: "USD",
    targetSymbol: "$",
    rate: Number(usdRate),
    provider: "open.er-api.com",
    updatedAt: payload.time_last_update_utc || new Date().toISOString()
  };
  ratesCache.fetchedAt = now;

  return ratesCache.data;
}

exports.getCurrencyRates = async (req, res) => {
  try {
    const rates = await fetchEgpToUsdRate();
    res.json({ success: true, ...rates });
  } catch (err) {
    res.json({
      success: true,
      base: "EGP",
      baseSymbol: "LE",
      target: "USD",
      targetSymbol: "$",
      rate: 0.021,
      provider: "fallback",
      updatedAt: new Date().toISOString(),
      warning: "Live rates unavailable; using fallback rate."
    });
  }
};

exports.getExternalInfo = async (req, res) => {
  res.json({
    success: true,
    message: "External API route is working.",
    endpoints: {
      currency: "GET /api/external/currency"
    }
  });
};
