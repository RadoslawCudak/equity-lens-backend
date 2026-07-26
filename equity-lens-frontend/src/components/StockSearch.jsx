import { useState } from 'react';
import { fetchStockData } from '../services/api';

export default function StockSearch({ onStockFetched }) {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchStockData(symbol.trim().toUpperCase());
      onStockFetched(data);
      setSymbol('');
    } catch (err) {
      setError(err.message || 'Nie udało się pobrać danych dla podanego symbolu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Wpisz symbol spółki (np. PKN.WA, CDR.WA)..."
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid #334155',
            backgroundColor: '#1e293b',
            color: '#fff',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            backgroundColor: '#059669',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Pobieranie...' : 'Pobierz'}
        </button>
      </form>
      {error && <p style={{ color: '#f87171', marginTop: '8px' }}>{error}</p>}
    </div>
  );
}