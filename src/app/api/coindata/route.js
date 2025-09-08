import { NextResponse } from "next/server";
import { logTrace } from "@/server/utils/logTrace";
import { sendWebhook } from "@/server/utils/sendWebhook";

export async function GET(req) {
  const start = Date.now();
  const { searchParams } = new URL(req.url);
  const coin = searchParams.get("coin") || "bitcoin";
  const days = searchParams.get("days") || "30";

  try {
    const validDays = ["1", "7",  "30", "90",  "365", ];
    if (!validDays.includes(days)) {
      const errorResponse = { 
        error: "Parámetro 'days' inválido. Valores permitidos: " + validDays.join(", ") 
      };

      logTrace({
        ts: new Date().toISOString(),
        endpoint: "/api/coindata",
        coin,
        days,
        status: 400,
        duration_ms: Date.now() - start,
        message: errorResponse.error
      });

      return NextResponse.json(errorResponse, { status: 400 });
    }

    const url = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      headers: { "Cache-Control": "no-cache" },
      next: { revalidate: days === "1" ? 10 : 300 },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      if (res.status === 404) {
        const msg = `Criptomoneda '${coin}' no encontrada`;
        logTrace({
          ts: new Date().toISOString(),
          endpoint: "/api/coindata",
          coin,
          days,
          status: 404,
          duration_ms: Date.now() - start,
          message: msg
        });
        return NextResponse.json({ error: msg }, { status: 404 });
      }
      throw new Error(`CoinGecko API error: ${res.status}`);
    }

    const data = await res.json();

    const response = {
      coin_id: coin,
      days,
      prices: data.prices || [],
      market_caps: data.market_caps || [],
      total_volumes: data.total_volumes || [],
      data_points: data.prices?.length || 0,
      timestamp: new Date().toISOString()
    };

    logTrace({
      ts: new Date().toISOString(),
      endpoint: "/api/coindata",
      coin,
      days,
      status: 200,
      duration_ms: Date.now() - start,
      data_points: response.data_points
    });

    return NextResponse.json(response);

  } catch (err) {
    console.error("Error in /api/coindata:", err);

    logTrace({
      ts: new Date().toISOString(),
      endpoint: "/api/coindata",
      coin,
      days,
      status: 500,
      duration_ms: Date.now() - start,
      error: err.message
    });

    // Enviar traza al webhook
    await sendWebhook({
      event: "fetch_coin_data_error",
      coin,
      days,
      ts: new Date().toISOString(),
      error: err.message
    });

    return NextResponse.json({
      error: "Error al obtener datos históricos",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
