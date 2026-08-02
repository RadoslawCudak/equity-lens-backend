import { useState } from 'react';
import { Search } from 'lucide-react';

export default function StockSearch({ onStockFetched }) {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Pobieranie danych z Twojego API
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_BASE_URL}/get_stock_data?symbol=${ticker.toUpperCase()}`);
      
      if (!response.ok) {
        throw new Error('Nie udało się pobrać danych dla podanego symbolu.');
      }

      const data = await response.json();
      onStockFetched({ symbol: ticker.toUpperCase(), data });
      setTicker('');
    } catch (err) {
      setError(err.message || 'Wystąpił błąd podczas pobierania danych.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '500px' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Wpisz symbol (np. LPP.WA, CDR.WA)..."
          style={{
            width: '100%',
            padding: '10px 14px 10px 38px',
            borderRadius: '6px',
            border: '1px solid #334155',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        <Search 
          size={18} 
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '10px 20px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: loading ? '#334155' : '#0284c7', /* Nowy błękitny kolor */
          color: '#ffffff',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
          whiteSpace: 'nowrap'
        }}
      >
        {loading ? 'Pobieranie...' : 'Pobierz'}
      </button>

      {error && (
        <span style={{ color: '#ef4444', fontSize: '14px', alignSelf: 'center' }}>
          {error}
        </span>
      )}
    </form>
  );
}