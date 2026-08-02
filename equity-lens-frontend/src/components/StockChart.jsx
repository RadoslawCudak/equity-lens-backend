import {
  ResponsiveContainer,
  LineChart,
  Line,
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

  // Wyznaczenie min i max dla osi Y z lekkim buforem
  const prices = data.map(d => d.price);
  const minPrice = Math.floor(Math.min(...prices) * 0.98);
  const maxPrice = Math.ceil(Math.max(...prices) * 1.02);

  return (
    <div style={{ marginTop: '24px', width: '100%' }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#f8fafc',
        marginBottom: '16px'
      }}>
        Historia cenowa (Ostatnie 3 lata)
      </h3>

      <div style={{ width: '100%', height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data}
            /* Dodany prawy margines (right: 40), żeby daty nie wchodziły na oś Y */
            margin={{ top: 10, right: 40, left: 10, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              /* Obrót dat o -25 stopni daje idealny odstęp od osi Y */
              angle={-25}
              textAnchor="end"
              interval="preserveStartEnd"
              minTickGap={40}
            />
            
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              domain={[minPrice, maxPrice]}
              orientation="right"
              tickLine={false}
              tickFormatter={(val) => `${val} PLN`}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#f8fafc'
              }}
              labelStyle={{ color: '#34d399', fontWeight: 'bold' }}
              formatter={(value) => [`${value} PLN`, 'Cena']}
            />

            <Line
              type="monotone"
              dataKey="price"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#34d399' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}