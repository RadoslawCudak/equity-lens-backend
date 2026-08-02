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
      <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
        Brak danych historycznych do wyświetlenia wykresu.
      </div>
    );
  }

  // Upewniamy się, że cena to liczba float oraz formatujemy obiekt pod wykres
  const formattedData = data.map(d => ({
    ...d,
    price: Number(d.price)
  }));

  // Poprawione wyznaczanie min/max z użyciem właściwego klucza 'price'
  const prices = formattedData.map(d => d.price).filter(p => !isNaN(p));
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 100;
  const padding = (maxPrice - minPrice) * 0.05 || 1;

  return (
    <div style={{
      backgroundColor: '#0f172a',
      borderRadius: '8px',
      padding: '16px',
      marginTop: '20px',
      border: '1px solid #1e293b'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#f8fafc', marginBottom: '16px' }}>
        Historia cenowa (Ostatnie 3 lata)
      </h3>
      
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#34d399" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12}
              domain={[Math.floor(minPrice - padding), Math.ceil(maxPrice + padding)]}
              tickLine={false}
              orientation="right"
              unit=" PLN"
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '6px', color: '#f8fafc' }}
              labelStyle={{ color: '#34d399', fontWeight: 'bold' }}
              formatter={(value) => [`${value} PLN`, 'Cena']}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#34d399" 
              strokeWidth={2}
              fill="url(#colorClose)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}