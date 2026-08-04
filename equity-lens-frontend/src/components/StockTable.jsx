export default function StockTable({ stocks, onRemoveFromTable }) {
  if (!stocks || stocks.length === 0) {
    return (
      <div style={{
        padding: '32px',
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#94a3b8',
        border: '1px solid #334155'
      }}>
        Tabela porównawcza jest pusta. Dodaj spółki z karty spółki, aby je tutaj zestawić.
      </div>
    );
  }

  // Helper do bezpiecznego formatowania procentów
  const formatPercent = (val) => {
    if (val === undefined || val === null || isNaN(val)) return 'N/A';
    return `${Number(val).toFixed(2)}%`;
  };

  return (
    <div style={{
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      border: '1px solid #334155',
      overflowX: 'auto',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #334155', backgroundColor: '#0f172a', color: '#38bdf8' }}>
            <th style={{ padding: '16px' }}>Symbol</th>
            <th style={{ padding: '16px' }}>Nazwa / Sektor</th>
            <th style={{ padding: '16px' }}>Indeks</th>
            <th style={{ padding: '16px' }}>Cena bieżąca</th>
            <th style={{ padding: '16px' }}>P/E (C/Z)</th>
            <th style={{ padding: '16px' }}>P/B (C/WK)</th>
            <th style={{ padding: '16px' }}>Stopa Dywidendy</th>
            <th style={{ padding: '16px' }}>Kapitalizacja</th>
            <th style={{ padding: '16px', textAlign: 'center' }}>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock, idx) => {
            const dataPayload = stock.data || {};
            const info = { ...stock, ...dataPayload };
            const currentPrice = info.currentPrice ?? info.regularMarketPrice ?? info.previousClose ?? info.open;

            return (
              <tr key={stock.symbol || idx} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '16px', fontWeight: 'bold', color: '#f8fafc' }}>
                  {info.symbol}
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ color: '#f8fafc', fontWeight: '500' }}>
                    {info.official_name || info.longName || info.symbol}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {info.sector || 'N/A'}
                  </div>
                </td>
                <td style={{ padding: '16px', color: '#94a3b8' }}>
                  {info.index || info.gpw_index || 'GPW'}
                </td>
                <td style={{ padding: '16px', fontWeight: 'bold', color: '#38bdf8' }}>
                  {currentPrice ? `${currentPrice} PLN` : 'N/A'}
                </td>
                <td style={{ padding: '16px', color: '#f8fafc' }}>
                  {info.trailingPE ? Number(info.trailingPE).toFixed(2) : 'N/A'}
                </td>
                <td style={{ padding: '16px', color: '#f8fafc' }}>
                  {info.priceToBook ? Number(info.priceToBook).toFixed(2) : 'N/A'}
                </td>
                <td style={{ padding: '16px', color: '#f8fafc' }}>
                  {formatPercent(info.dividendYield)}
                </td>
                <td style={{ padding: '16px', color: '#f8fafc' }}>
                  {info.marketCap ? `${(Number(info.marketCap) / 1e9).toFixed(2)} mld PLN` : 'N/A'}
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <button
                    onClick={() => onRemoveFromTable(stock.symbol)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}