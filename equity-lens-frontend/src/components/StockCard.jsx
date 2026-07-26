
export default function StockCard({ stock, onAddToTable, isAlreadyInTable }) {
  if (!stock) {
    return (
      <div style={{
        padding: '32px',
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#94a3b8',
        border: '1px solid #334155'
      }}>
        Wyszukaj spółkę powyżej, aby zobaczyć szczegółowe dane analityczne.
      </div>
    );
  }
console.log(stock)
  const info = stock.data || {};
  const metrics = [
    { label: 'Cena bieżąca', value: info.currentPrice ? `${info.currentPrice} PLN` : 'N/A', highlight: true },
    { label: 'Cena / Zysk (P/E)', value: info.trailingPE || 'N/A' },
    { label: 'Cena / Wartość Księgowa (P/B)', value: info.priceToBook || 'N/A' },
    { label: 'Stopa Dywidendy', value: info.dividendYield ? `${(info.dividendYield * 100).toFixed(2)}%` : 'N/A' },
    { label: 'Kapitalizacja', value: info.marketCap ? `${(info.marketCap / 1e9).toFixed(2)} mld PLN` : 'N/A' },
    { label: 'Sektor', value: info.sector || 'N/A' },
  ];

  return (
    <div style={{
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #334155',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Nagłówek karty z przyciskiem akcji */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #334155',
        paddingBottom: '16px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#34d399', margin: 0 }}>
            {info.official_name || stock.symbol}
          </h2>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>
            Symbol: <strong>{stock.symbol}</strong> | Indeks: <strong>{stock.index || 'GPW'}</strong>
          </span>
        </div>

        <button
          onClick={() => onAddToTable(stock)}
          disabled={isAlreadyInTable}
          style={{
            padding: '10px 18px',
            borderRadius: '6px',
            backgroundColor: isAlreadyInTable ? '#334155' : '#059669',
            color: isAlreadyInTable ? '#94a3b8' : '#fff',
            border: 'none',
            cursor: isAlreadyInTable ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.2s'
          }}
        >
          {isAlreadyInTable ? '✓ W tabeli porównawczej' : '+ Dodaj do tabeli porównawczej'}
        </button>
      </div>

      {/* Grid z kafelkami metryk */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {metrics.map((metric, idx) => (
          <div key={idx} style={{
            backgroundColor: '#0f172a',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #1e293b'
          }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {metric.label}
            </div>
            <div style={{
              fontSize: metric.highlight ? '22px' : '18px',
              fontWeight: 'bold',
              color: metric.highlight ? '#34d399' : '#f8fafc'
            }}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}