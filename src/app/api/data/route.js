import { NextResponse } from "next/server";
import { logTrace } from "@/server/utils/logTrace";
import { sendWebhook } from "@/server/utils/sendWebhook";


export async function GET(req) {
  const start = Date.now();
  const { searchParams } = new URL(req.url);
  const coin = searchParams.get("coin") || "bitcoin";
  const days = searchParams.get("days") || "30";

  try {
    // URLs
    const marketUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h,24h,7d`;
    const historyUrl = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}`;

    // Abort controllers para timeout
    const controllerMarket = new AbortController();
    const controllerHistory = new AbortController();
    const timeoutMarket = setTimeout(() => controllerMarket.abort(), 5000);
    const timeoutHistory = setTimeout(() => controllerHistory.abort(), 5000);

    // Fetch concurrente
    const [marketRes, historyRes] = await Promise.all([
      fetch(marketUrl, { headers: { "Cache-Control": "no-store" }, next: { revalidate: 300 }, signal: controllerMarket.signal }),
      fetch(historyUrl, { headers: { "Cache-Control": "no-store" }, next: { revalidate: days === "7" ? 10 : 3600 }, signal: controllerHistory.signal })
    ]);

    clearTimeout(timeoutMarket);
    clearTimeout(timeoutHistory);

    if (!marketRes.ok) throw new Error(`Error al obtener datos de mercado: ${marketRes.status}`);

    const marketData = await marketRes.json();

    let historyData = { prices: [] };
    if (historyRes.ok) {
      const raw = await historyRes.json();
      if (days === "7" && raw.prices?.length > 0) {
        const step = Math.ceil(raw.prices.length / 50); // máximo 50 puntos
        historyData.prices = raw.prices.filter((_, i) => i % step === 0);
      } else {
        historyData = raw;
      }
    }

    // Formatear datos
    const formattedMarketData = marketData.map(c => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol.toUpperCase(),
      image: c.image,
      current_price: c.current_price || 0,
      market_cap: c.market_cap || 0,
      total_volume: c.total_volume || 0,
      price_change_24h: c.price_change_24h || 0,
      price_change_percentage_24h: c.price_change_percentage_24h || 0,
      price_change_percentage_1h_in_currency: c.price_change_percentage_1h_in_currency || 0,
      price_change_percentage_7d_in_currency: c.price_change_percentage_7d_in_currency || 0,
      market_cap_rank: c.market_cap_rank || 0,
      history: c.id === coin
        ? historyData.prices.map(([timestamp, price]) => ({
            timestamp,
            price: parseFloat(price.toFixed(8))
          }))
        : []
    }));

    // Log
    logTrace({
      ts: new Date().toISOString(),
      endpoint: "/api/data",
      coin,
      days,
      status: 200,
      duration_ms: Date.now() - start,
      coins_returned: formattedMarketData.length
    });

    // Enviar webhook de éxito
    await sendWebhook({
      event: "fetch_coin_data_success",
      coin,
      days,
      data_points: formattedMarketData.find(c => c.id === coin)?.history.length || 0,
      ts: new Date().toISOString()
    });

    return NextResponse.json(formattedMarketData);

  } catch (err) {
    console.error("Error in /api/data:", err);

    logTrace({
      ts: new Date().toISOString(),
      endpoint: "/api/data",
      coin,
      days,
      status: 500,
      duration_ms: Date.now() - start,
      error: err.message
    });

    // Enviar webhook de error
    await sendWebhook({
      event: "fetch_coin_data_error",
      coin,
      days,
      ts: new Date().toISOString(),
      error: err.message
    });

    return NextResponse.json({
      error: "Error al obtener datos de mercado",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
