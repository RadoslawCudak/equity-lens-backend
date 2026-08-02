import StockChart from './StockChart.jsx';

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

  // Odczyt pod-obiektu data z dokumentu Cosmos/Backend
  const info = stock.data || stock || {};

  // Cena bieżąca (z priorytetem dla currentPrice / regularMarketPrice)
  const currentPrice = info.currentPrice ?? info.regularMarketPrice ?? info.previousClose ?? info.open;

  // Bezpieczne formatowanie waluty PLN
  const formatPLN = (val) => {
    if (val === undefined || val === null || isNaN(val)) return 'N/A';
    return `${Number(val).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN`;
  };

  // Bezpieczne formatowanie procentów
  const formatPercent = (val) => {
    if (val === undefined || val === null || isNaN(val)) return 'N/A';
    return `${Number(val).toFixed(2)}%`;
  };

  // Główny zestaw metryk podstawowych
  const mainMetrics = [
    { label: 'Cena bieżąca', value: currentPrice ? `${currentPrice} PLN` : 'N/A', highlight: true },
    { label: 'Cena / Zysk (P/E)', value: info.trailingPE ? Number(info.trailingPE).toFixed(2) : 'N/A' },
    { label: 'Cena / Wartość Księgowa (P/B)', value: info.priceToBook ? Number(info.priceToBook).toFixed(2) : 'N/A' },
    { label: 'Stopa Dywidendy', value: formatPercent(info.dividendYield) },
    { label: 'Dywidenda / akcję', value: formatPLN(info.dividendRate ?? info.lastDividendValue) },
    { label: 'Free Float (Liczba akcji)', value: info.freeFloat ? `${(Number(info.freeFloat) / 1e6).toFixed(2)} mln` : 'N/A' },
    { label: 'Kapitalizacja', value: info.marketCap ? `${(Number(info.marketCap) / 1e9).toFixed(2)} mld PLN` : 'N/A' },
    { label: 'Sektor', value: info.sector || 'N/A' },
  ];

  // Sekcja Ceny Docelowej Analityków (Targety)
  const targetMetrics = [
    { label: 'Target Min.', value: formatPLN(info.targetMin ?? info.targetLowPrice) },
    { label: 'Target Śr.', value: formatPLN(info.targetMean ?? info.targetMeanPrice) },
    { label: 'Target Mediana', value: formatPLN(info.targetMedian ?? info.targetMedianPrice) },
    { label: 'Target Maks.', value: formatPLN(info.targetMax ?? info.targetHighPrice) },
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
        justify: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #334155',
        paddingBottom: '16px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>
            {info.official_name || info.longName || stock.symbol}
          </h2>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>
            Symbol: <strong>{stock.symbol}</strong> | Indeks: <strong>{info.gpw_index || stock.index || 'GPW'}</strong>
          </span>
        </div>

        <button
          onClick={() => onAddToTable(stock)}
          disabled={isAlreadyInTable}
          style={{
            padding: '10px 18px',
            borderRadius: '6px',
            backgroundColor: isAlreadyInTable ? '#334155' : '#0284c7',
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

      {/* Grid 1: Podstawowe metryki */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {mainMetrics.map((metric, idx) => (
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
              color: metric.highlight ? '#38bdf8' : '#f8fafc'
            }}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      {/* Grid 2: Ceny docelowe analityków (Targety) */}
      <div style={{
        backgroundColor: '#0f172a',
        borderRadius: '8px',
        padding: '16px',
        border: '1px solid #334155',
        marginBottom: '24px'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Ceny Docelowe Analityków (Targety)
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          {targetMetrics.map((target, idx) => (
            <div key={idx} style={{
              backgroundColor: '#1e293b',
              padding: '12px 16px',
              borderRadius: '6px',
              border: '1px solid #334155'
            }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
                {target.label}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f8fafc' }}>
                {target.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wykres historyczny */}
      <StockChart data={info.priceHistory} />
    </div>
  );
}