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
      // Pobieranie bazy URL z env LUB użycie domyślnego adresu produkcyjnego jako fallback
      const rawBaseUrl = import.meta.env.VITE_API_URL || 'https://func-equitylens-backend-prod-cph0efczgjdkbdaz.centralus-01.azurewebsites.net/api';
      
      // Czyszczenie ewentualnego ukośnika na końcu (żeby nie powstało /api//get_stock_data)
      const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');
      const fullUrl = `${cleanBaseUrl}/get_stock_data?symbol=${ticker.trim().toUpperCase()}`;

      const response = await fetch(fullUrl);

      if (!response.ok) {
        throw new Error(`Błąd serwera: ${response.status}`);
      }

      const data = await response.json();
      onStockFetched(data);
    } catch (err) {
      console.error('Błąd podczas pobierania:', err);
      setError('Nie udało się pobrać danych');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Wpisz symbol (np. LPP.WA, CDR.WA)..."
          style={{
            width: '100%',
            padding: '12px 16px 12px 42px',
            borderRadius: '8px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            color: '#f8fafc',
            fontSize: '15px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        <Search 
          size={18} 
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '12px 24px',
          borderRadius: '8px',
          backgroundColor: '#0284c7',
          color: '#fff',
          border: 'none',
          fontWeight: 'bold',
          cursor: loading ? 'wait' : 'pointer',
          transition: 'background-color 0.2s'
        }}
      >
        {loading ? 'Pobieranie...' : 'Pobierz'}
      </button>

      {error && <span style={{ color: '#ef4444', fontSize: '14px' }}>{error}</span>}
    </form>
  );
}