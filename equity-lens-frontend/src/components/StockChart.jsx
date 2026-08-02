import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function StockChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b'
      }}>
        Brak danych historycznych do wyświetlenia wykresu.
      </div>
    );
  }

  const prices = data.map(d => d.price);
  const minPrice = Math.floor(Math.min(...prices) * 0.98);
  const maxPrice = Math.ceil(Math.max(...prices) * 1.02);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('pl-PL', { month: 'short', year: '2-digit' });
  };

  return (
    <div style={{ marginTop: '24px', width: '100%' }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#f8fafc',
        marginBottom: '20px'
      }}>
        Historia cenowa (Ostatnie 3 lata)
      </h3>

      <div style={{ width: '100%', height: '360px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
          >
            {/* Definicja cyjanowego gradientu */}
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              tickFormatter={formatDate}
              minTickGap={50}
              dy={10}
            />
            
            <YAxis
              yAxisId="left"
              stroke="#94a3b8"
              fontSize={12}
              domain={[minPrice, maxPrice]}
              orientation="left"
              tickLine={false}
              tickFormatter={(val) => `${val.toLocaleString('pl-PL')} PLN`}
              dx={-5}
            />

            <YAxis
              yAxisId="right"
              stroke="#94a3b8"
              fontSize={12}
              domain={[minPrice, maxPrice]}
              orientation="right"
              tickLine={false}
              tickFormatter={(val) => `${val.toLocaleString('pl-PL')} PLN`}
              dx={5}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#f8fafc',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}
              labelFormatter={(label) => `Data: ${label}`}
              formatter={(value) => [`${value.toLocaleString('pl-PL')} PLN`, 'Cena']}
            />

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="price"
              stroke="#38bdf8" /* Błękitna linia wykresu */
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorPrice)"
              activeDot={{ r: 6, fill: '#38bdf8', stroke: '#0f172a', strokeWidth: 2 }}
            />

            <Area
              yAxisId="right"
              type="monotone"
              dataKey="price"
              stroke="transparent"
              fill="none"
              legendType="none"
              tooltipType="none"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}