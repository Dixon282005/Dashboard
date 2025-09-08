"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function CoinDetailModal({ coin, onClose }) {
  const [histData, setHistData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null); // info de la moneda: nombre, imagen, precio

  useEffect(() => {
    if (!coin) return;

    setLoading(true);

    // Fetch histórico
    fetch(`/api/coindata?coin=${coin}&days=30`)
      .then((res) => res.json())
      .then((data) => {
        if (data.prices) {
          const mapped = data.prices.map(([ts, price]) => ({
            time: new Date(ts).toLocaleDateString("es-ES", {
              month: "short",
              day: "numeric",
            }),
            price: parseFloat(price.toFixed(2)),
          }));
          setHistData(mapped);
        }
      });

    // Fetch info de la moneda
    fetch(`/api/data?coin=${coin}&days=1`)
      .then((res) => res.json())
      .then((current) => {
        if (Array.isArray(current) && current.length > 0) {
          const c = current.find((item) => item.id === coin);
          if (c) {
            setInfo({
              name: c.name,
              symbol: c.symbol.toUpperCase(),
              price: c.current_price,
              image: c.image,
              market_cap: c.market_cap,
            });
          }
        }
      })
      .finally(() => setLoading(false));
  }, [coin]);

  if (!coin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md md:max-w-2xl p-4 md:p-6 relative animate-fadeIn">

      
        <button
          onClick={onClose}
          className="absolute top-3 right-2 px-3 py-1 text-sm  rounded-md hover:bg-gray-200 transition"
        >
          ✕
        </button>

        {/* Header con imagen y precio */}
        {info && (
          <div className="flex items-center justify-between mb-4 p-3.5">
            <div className="flex items-center space-x-3">
              <img src={info.image} alt={info.name} className="w-10 h-10 rounded-full" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{info.name}</h2>
                <p className="text-gray-500 uppercase">{info.symbol}</p>
              </div>
            </div>
            <div >
              <p className="text-gray-500 text-sm">Precio actual</p>
              <p className="text-xl font-semibold text-gray-900">
                ${info.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
              </p>
            </div>
          </div>
        )}

        {/* Contenido: gráfico */}
        {loading ? (
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Cargando datos...</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={histData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis
                stroke="#6b7280"
                tickFormatter={(val) => `$${val.toLocaleString()}`}
              />
              <Tooltip
                formatter={(val) => `$${val.toLocaleString()}`}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
