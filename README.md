
# 🚀 Dashboard

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge\&logo=next.js\&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge\&logo=tailwind-css\&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-FCA311?style=for-the-badge)

## 📖 Descripción

**Dashboard** es un mini-dashboard para **monitoreo de criptomonedas en tiempo real**, desarrollado como parte del reto técnico de Admira.

Cumple con los requisitos del reto:

1. **Backend ligero (Next.js API routes)** para consumir la API de **CoinGecko** (`/api/data` y `/api/coindata`).

   * Registro de trazas en `server/utils/logTrace.js`
   * Datos históricos y de mercado pasan por el backend, nunca se llama directamente al navegador.

2. **Transformaciones de datos** implementadas:

   * **Top-N**: se filtran las top 15 monedas por **capitalización de mercado**.
   * **Rolling window**: cálculo de volumen promedio móvil para las top 5 monedas.
   * **Agregación temporal**: datos históricos de precios se muestrean y limitan para gráficos (\~50 puntos máximo).
   * **Normalización / Formato**: precios y porcentajes se formatean para presentación.

3. **Visualizaciones (≥4)** usando **Recharts**:

   * **LineChart**: historial de precios de la moneda seleccionada.
   * **BarChart**: volumen comparativo de las top 5 monedas.
   * **PieChart / Donut**: distribución de capitalización de mercado.
   * **Tabla interactiva**: ranking de las top 15 monedas con detalle de precios, % cambio, volumen y capitalización.

4. **Filtros e interactividad**:

   * Rango de días: `1, 7, 14, 30, 90, 180, 365, max`.
   * Selección de moneda (`coin`) para mostrar detalle.
   * Drill-down: clic en tabla abre modal con detalles de la moneda.
   * Tooltips en todos los gráficos.

5. **Estados de UI**:

   * Cargando, error y vacío claramente indicados.
   * Mensajes amigables si hay fallo de red o datos vacíos.
   * Diseño **responsive** usando Tailwind CSS.

## 🌐 Endpoints utilizados

| Endpoint                             | Descripción                                                     |
| ------------------------------------ | --------------------------------------------------------------- |
| `/api/data?coin=bitcoin&days=30`     | Devuelve mercado completo + histórico de la moneda seleccionada |
| `/api/coindata?coin=bitcoin&days=30` | Devuelve solo histórico de precios de la moneda                 |

## ⚡ Instalación

```bash
git clone https://github.com/Dixon282005/Dashboard.git
cd dashboard
npm install
npm run dev
```

Abrir en el navegador: `http://localhost:3000`

## 🔐 Variables de entorno

Crea un `.env.local`:

```env
WEBHOOK_URL=YOUR_WEBHOOK_URL_HERE
```

Incluye `.env.example` **sin valores reales**.

## 🛠️ Estructura del proyecto

```
/app
  └─ page.js        # Página principal con gráficos y tabla
/components
  ├─ CoinDetailModal.jsx   # Modal de detalle de moneda
  └─ Sidebar.jsx           # Sidebar responsive
/pages/api
  ├─ coindata.js   # Endpoint histórico de precios
  └─ data.js       # Endpoint mercado + histórico
/server/utils
  └─ logTrace.js   # Función de log a webhook/archivo
/public
  └─ images        # Iconos de monedas, logos
```

## 📊 Transformaciones implementadas

1. **Top-N por capitalización**: `sortedByMC.slice(0, 15)`
2. **Rolling window volumen**: promedio de volumen móvil para top 5.
3. **Agregación temporal**: puntos de precios históricos limitados a 50.
4. **Normalización de datos**: precios a 2–8 decimales, porcentajes con signo.

## 💡 Decisiones de diseño / trade-offs

* Se usó **Next.js API routes** en lugar de Express para simplificar deployment.
* Modal para drill-down en lugar de páginas separadas, por simplicidad.
* Gráficos limitados a top 5 monedas para mantener rendimiento y claridad.

## 🧪 Evidencia de ejecución

* Archivo `server/logs/http_trace.jsonl` registra todas las llamadas a la API y la duración.
* Modal y tabla permiten ver el detalle de cada moneda y su histórico.
* Se puede enviar trazas a un webhook mediante `logTrace()` (configurable vía `.env`).

## 📝 Declaración de uso de IA

* Se utilizó **IA** para generar sugerencias de optimización de estructura de código y README.
* No se generó código crítico sin revisión; todo fue adaptado manualmente y testeado.


