"use client";

import { useState, useEffect } from "react";
import CoinDetailModal from "@/components/CoinDetailModal";
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  Tooltip, XAxis, YAxis, CartesianGrid, Legend,
  ResponsiveContainer
} from "recharts";

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState(null);

  // filtros
  const [days, setDays] = useState("30");
  const [coin, setCoin] = useState("bitcoin");

  // historial de precios para la moneda seleccionada
  const [histData, setHistData] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histError, setHistError] = useState(null);

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

  // Fetch histórico
  useEffect(() => {
    async function fetchHistory() {
      try {
        setHistLoading(true);
        setHistError(null);

        const res = await fetch(`/api/coindata?coin=${coin}&days=${days}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `HTTP ${res.status}`);
        }

        const json = await res.json();

        if (json.prices && Array.isArray(json.prices)) {
          const mapped = json.prices.map(([ts, price]) => ({
            time: new Date(ts).toLocaleDateString("es-ES", {
              month: 'short',
              day: 'numeric'
            }),
            price: parseFloat(price.toFixed(2)),
            timestamp: ts
          }));

          // Limitamos puntos para que no traigamos mas de los que se pueden manejar
          const maxPoints = 50;
          const step = Math.max(1, Math.floor(mapped.length / maxPoints));
          const sampledData = mapped.filter((_, index) => index % step === 0);

          setHistData(sampledData);
        } else {
          setHistData([]);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
        setHistError(err.message);
        setHistData([]);
      } finally {
        setHistLoading(false);
      }
    }

    fetchHistory();
  }, [coin, days]);

  // Estado de carga 
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

  // Estado de error 
  if (error) {
    return (
      <main className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-red-800 font-semibold mb-2">Error al cargar datos</h2>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  // Si no hay datos manda el mensaje para evitar que explote la app 
  if (!data || data.length === 0) {
    return (
      <main className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      </main>
    );
  }

  // Preparar datos para gráficos
  const sortedByMC = [...data]
    .filter(c => c.market_cap > 0)
    .sort((a, b) => b.market_cap - a.market_cap);

  const topCoins = sortedByMC.slice(0, 5).map((c, idx, arr) => {
    const window = arr.slice(Math.max(0, idx - 2), idx + 1);
    const rolling_volume = window.reduce((sum, coin) => sum + (coin.total_volume || 0), 0) / window.length;

    return {
      name: c.name,
      market_cap: c.market_cap,
      volume: c.total_volume || 0,
      rolling_volume,
    };
  });

  const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

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


        {/*Aqui Se vaalida la carga  */}
          {histLoading ? (
            <div className="flex items-center justify-center h-[350px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Cargando histórico...</p>
              </div>
            </div>
          ) : histError ? (
            <div className="flex items-center justify-center h-[350px] bg-red-50 rounded-lg">
              <p className="text-red-600 text-sm">Error: {histError}</p>
            </div>
          ) : histData.length === 0 ? (
            <div className="flex items-center justify-center h-[350px] bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay datos históricos disponibles</p>
            </div>
          ) : (
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
          )}
        </div>

        {/* PieChart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Distribución Market Cap</h2>
        <ResponsiveContainer width="80%" height={300}>
  <PieChart>
    <Pie
      data={topCoins}
      dataKey="market_cap"
      nameKey="name"
      cx="50%"
      cy="50%"
      outerRadius="80%"   // Escala con el contenedor
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



    
        <div className="col-span-full bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
         
          <div className="p-4 md:p-6 border-b border-gray-100">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              Top Criptomonedas
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Haz clic en cualquier fila para ver el detalle histórico
            </p>
          </div>

          {/* Tabla  */}
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-left text-xs md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-left text-xs md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-right text-xs md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="hidden md:table-cell px-2 md:px-6 py-2 md:py-4 text-right text-xs md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    24h %
                  </th>
                  <th className="hidden lg:table-cell px-2 md:px-6 py-2 md:py-4 text-right text-xs md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Cap
                  </th>
                  <th className="hidden lg:table-cell px-2 md:px-6 py-2 md:py-4 text-right text-xs md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volumen 24h
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sortedByMC.slice(0, 15).map((c, index) => (
                  <tr
                    key={c.id}
                    className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => setSelectedCoin(c.id)}
                  >
                    
                    <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>

                    
                    <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <img
                          src={c.image}
                          alt={c.name}
                          className="w-6 h-6 md:w-8 md:h-8 rounded-full"
                        />
                        <div>
                          <div className="text-sm md:text-sm font-medium text-gray-900">
                            {c.name}
                          </div>
                          <div className="text-xs md:text-xs text-gray-500 uppercase">
                            {c.symbol}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Precio */}
                    <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                      ${c.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                    </td>

                    {/* Variación 24h */}
                    <td className="hidden md:table-cell px-2 md:px-6 py-2 md:py-4 whitespace-nowrap text-right text-sm font-medium">
                      <span className={c.price_change_percentage_24h >= 0 ? "text-green-600" : "text-red-600"}>
                        {c.price_change_percentage_24h >= 0 ? "+" : ""}
                        {c.price_change_percentage_24h.toFixed(2)}%
                      </span>
                    </td>

                    {/* Market Cap */}
                    <td className="hidden lg:table-cell px-2 md:px-6 py-2 md:py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      ${c.market_cap.toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 })}
                    </td>

                    {/* Volumen */}
                    <td className="hidden lg:table-cell px-2 md:px-6 py-2 md:py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      ${c.total_volume.toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal */}
          <CoinDetailModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} />
        </div>
      </div>


    </main>
  );
}
