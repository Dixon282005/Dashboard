"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  Tooltip, XAxis, YAxis, CartesianGrid, Legend,
  ResponsiveContainer
} from "recharts";

export default function Home() {

  const [loading, setLoading] = useState(true);
 

  // filtros
  const [days, setDays] = useState("30");
  const [coin, setCoin] = useState("bitcoin");



  // Fetch datos de mercado
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/data?coin=${coin}&days=${days}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `HTTP ${res.status}`);
        }

        const json = await res.json();

        if (Array.isArray(json)) {
          setData(json);
        } else {
          throw new Error("Formato de datos inválido");
        }
      } catch (err) {
        console.error("Error fetching market data:", err);
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [coin, days]);



  // Loading state
  if (loading) {
    return (
      <main className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      </main>
    );
  }



  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <h1 className="col-span-full text-3xl font-bold text-gray-900 mb-2">Dashboard de Criptomonedas</h1>

        {/* Filtros */}
        <div className="col-span-full bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-6 items-end">
            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Fechas</label>
              <select
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">Últimos 7 días</option>
                <option value="30">Últimos 30 días</option>
                <option value="90">Últimos 90 días</option>
                <option value="365">Último año</option>
              </select>
            </div>
            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
              <select
                value={coin}
                onChange={(e) => setCoin(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="bitcoin">Bitcoin (BTC)</option>
                <option value="ethereum">Ethereum (ETH)</option>
                <option value="cardano">Cardano (ADA)</option>
                <option value="solana">Solana (SOL)</option>
                <option value="dogecoin">Dogecoin (DOGE)</option>
                <option value="binancecoin">Binance Coin (BNB)</option>
                <option value="ripple">XRP (XRP)</option>
                <option value="polkadot">Polkadot (DOT)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gráfico de precio histórico */}
        <div className="col-span-full bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Precio Histórico — {coin.charAt(0).toUpperCase() + coin.slice(1)}
          </h2>

         
   
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={histData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                  tickFormatter={(val) => `$${val.toLocaleString()}`}
                />
                <Tooltip
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Precio']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  name="Precio (USD)"
                />
              </LineChart>
            </ResponsiveContainer>
      
        </div>

        {/* PieChart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Distribución Market Cap</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topCoins}
                dataKey="market_cap"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(1)}%`
                }
                labelLine={false}
              >
                {topCoins.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BarChart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Market Cap Top 5</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCoins} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                stroke="#666"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="#666"
                tickFormatter={(val) => `$${(val / 1e9).toFixed(0)}B`}
              />
              <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
              <Bar dataKey="market_cap" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* LineChart volumen */}
        <div className="col-span-full bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Volumen 24h (Top 5)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={topCoins} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis
                stroke="#666"
                tickFormatter={(val) => `$${(val / 1e6).toFixed(0)}M`}
              />
              <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={2} name="Volumen" />
              <Line
                type="monotone"
                dataKey="rolling_volume"
                stroke="#f97316"
                strokeWidth={2}
                strokeDasharray="4 2"
                name="Media Móvil"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        </div>





    </main>
  );
}
