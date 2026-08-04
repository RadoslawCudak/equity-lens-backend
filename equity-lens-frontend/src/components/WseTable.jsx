import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

export default function WseTable({ stocks, setStocks, initialLoading, onSelectStock }) {
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Handle manual batch update
  const handleManualRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const baseUrl = import.meta.env.VITE_API_URL || 'https://func-equitylens-backend-prod-cph0efczgjdkbdaz.centralus-01.azurewebsites.net/api';
      const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
      
      const refreshResponse = await fetch(`${cleanBaseUrl}/refresh_wse_stocks`, { method: 'POST' });
      if (!refreshResponse.ok) throw new Error('Failed to refresh market data');
      
      const fetchResponse = await fetch(`${cleanBaseUrl}/get_wse_stocks`);
      if (!fetchResponse.ok) throw new Error('Failed to reload stock data');

      const updatedData = await fetchResponse.json();
      setStocks(updatedData); // Updates state in App.jsx
    } catch (err) {
      console.error('Error triggering WSE refresh:', err);
      setError('Failed to refresh WSE database.');
    } finally {
      setRefreshing(false);
    }
  };

  const formatPercent = (val) => {
    if (val === undefined || val === null || isNaN(val)) return 'N/A';
    return `${Number(val).toFixed(2)}%`;
  };

  const filteredStocks = stocks.filter((stock) => {
    const term = searchFilter.toLowerCase();
    const symbol = (stock.symbol || '').toLowerCase();
    const name = (stock.official_name || stock.longName || '').toLowerCase();
    return symbol.includes(term) || name.includes(term);
  });

  if (initialLoading && stocks.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#38bdf8' }}>
        Loading WSE 140 stock dataset...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
      {/* Table controls and structure */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Filter WSE 140 companies (e.g. Orlen, LPP...)"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: '6px',
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            color: '#f8fafc',
            width: '300px',
            outline: 'none'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>
            Showing: <strong>{filteredStocks.length}</strong> / {stocks.length}
          </span>

          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '6px',
              cursor: refreshing ? 'wait' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Updating...' : 'Refresh WSE Data'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', backgroundColor: '#0f172a', color: '#38bdf8' }}>
              <th style={{ padding: '12px 16px' }}>Symbol</th>
              <th style={{ padding: '12px 16px' }}>Name / Sector</th>
              <th style={{ padding: '12px 16px' }}>Current Price</th>
              <th style={{ padding: '12px 16px' }}>P/E</th>
              <th style={{ padding: '12px 16px' }}>P/B</th>
              <th style={{ padding: '12px 16px' }}>Dividend Yield</th>
              <th style={{ padding: '12px 16px' }}>Market Cap</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock, idx) => {
              const info = { ...stock, ...(stock.data || {}) };
              const currentPrice = info.currentPrice ?? info.regularMarketPrice ?? info.previousClose;

              return (
                <tr key={stock.symbol || idx} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#f8fafc' }}>
                    {info.symbol}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ color: '#f8fafc', fontWeight: '500' }}>{info.official_name || info.longName || info.symbol}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{info.sector || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#38bdf8' }}>
                    {currentPrice ? `${currentPrice} PLN` : 'N/A'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{info.trailingPE ? Number(info.trailingPE).toFixed(2) : 'N/A'}</td>
                  <td style={{ padding: '12px 16px' }}>{info.priceToBook ? Number(info.priceToBook).toFixed(2) : 'N/A'}</td>
                  <td style={{ padding: '12px 16px' }}>{formatPercent(info.dividendYield)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {info.marketCap ? `${(Number(info.marketCap) / 1e9).toFixed(2)} B PLN` : 'N/A'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button
                      onClick={() => onSelectStock(stock)}
                      style={{
                        backgroundColor: '#0284c7',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      Show Card
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}