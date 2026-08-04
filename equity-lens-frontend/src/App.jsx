import { useState, useEffect } from 'react';
import { LayoutGrid, Table, ListFilter } from 'lucide-react';
import StockSearch from './components/StockSearch';
import StockCard from './components/StockCard';
import StockTable from './components/StockTable';
import WseTable from './components/WseTable';

export default function App() {
  const [activeTab, setActiveTab] = useState('single');

  // Comparative table state with localStorage persistence
  const [stocks, setStocks] = useState(() => {
    try {
      const savedStocks = localStorage.getItem('equity_lens_stocks');
      return savedStocks ? JSON.parse(savedStocks) : [];
    } catch {
      return [];
    }
  });

  // Selected single stock state with localStorage persistence
  const [selectedStock, setSelectedStock] = useState(() => {
    try {
      const savedSelected = localStorage.getItem('equity_lens_selected');
      return savedSelected ? JSON.parse(savedSelected) : null;
    } catch {
      return null;
    }
  });

  // WSE 140 dataset state loaded once application-wide
  const [wseStocks, setWseStocks] = useState(() => {
    try {
      const cachedWse = localStorage.getItem('equity_lens_wse140');
      return cachedWse ? JSON.parse(cachedWse) : [];
    } catch {
      return [];
    }
  });
  const [wseLoading, setWseLoading] = useState(wseStocks.length === 0);

  // Sync comparative stocks state to localStorage
  useEffect(() => {
    if (Array.isArray(stocks)) {
      localStorage.setItem('equity_lens_stocks', JSON.stringify(stocks));
    }
  }, [stocks]);

  // Sync selected stock state to localStorage
  useEffect(() => {
    if (selectedStock) {
      localStorage.setItem('equity_lens_selected', JSON.stringify(selectedStock));
    }
  }, [selectedStock]);

  // Sync WSE 140 dataset to localStorage
  useEffect(() => {
    if (Array.isArray(wseStocks) && wseStocks.length > 0) {
      localStorage.setItem('equity_lens_wse140', JSON.stringify(wseStocks));
    }
  }, [wseStocks]);

  // Fetch initial WSE 140 stock list once on application mount
  useEffect(() => {
    const fetchInitialWseData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'https://func-equitylens-backend-prod-cph0efczgjdkbdaz.centralus-01.azurewebsites.net/api';
        const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
        
        const response = await fetch(`${cleanBaseUrl}/get_wse_stocks`);
        if (response.ok) {
          const data = await response.json();
          setWseStocks(data);
        }
      } catch (err) {
        console.error('Failed to load initial WSE 140 dataset:', err);
      } finally {
        setWseLoading(false);
      }
    };

    fetchInitialWseData();
  }, []);

  // Handle stock selection from search bar or WSE table
  const handleStockFetched = (newStockData) => {
    setSelectedStock(newStockData);
    setActiveTab('single');
  };

  // Add stock to comparative table
  const handleAddToTable = (stockToAdd) => {
    if (!stockToAdd) return;
    setStocks((prevStocks) => {
      const currentList = Array.isArray(prevStocks) ? prevStocks : [];
      const exists = currentList.some((item) => item?.symbol === stockToAdd.symbol);
      if (!exists) return [...currentList, stockToAdd];
      return currentList;
    });
  };

  // Remove stock from comparative table
  const handleRemoveFromTable = (symbolToRemove) => {
    setStocks((prevStocks) => {
      const currentList = Array.isArray(prevStocks) ? prevStocks : [];
      return currentList.filter((stock) => stock?.symbol !== symbolToRemove);
    });
  };

  const safeStocks = Array.isArray(stocks) ? stocks : [];
  const isAlreadyInTable = selectedStock && selectedStock.symbol
    ? safeStocks.some((item) => item?.symbol === selectedStock.symbol)
    : false;

  return (
    <div style={{ minHeight: '100vh', width: '100vw', maxWidth: '100%', backgroundColor: '#0f172a', color: '#f8fafc', padding: '24px 32px', boxSizing: 'border-box' }}>
      {/* Header & Tabs */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #1e293b', paddingBottom: '16px', width: '100%', gap: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#38bdf8', margin: 0, marginRight: '16px' }}>
          Equity Lens
        </h1>
        
        <div style={{ display: 'flex', backgroundColor: '#1e293b', padding: '4px', borderRadius: '8px', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('single')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              backgroundColor: activeTab === 'single' ? '#0284c7' : 'transparent', color: activeTab === 'single' ? '#fff' : '#94a3b8', fontWeight: 'bold'
            }}
          >
            <LayoutGrid size={18} /> Karta Spółki
          </button>

          <button
            onClick={() => setActiveTab('table')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              backgroundColor: activeTab === 'table' ? '#0284c7' : 'transparent', color: activeTab === 'table' ? '#fff' : '#94a3b8', fontWeight: 'bold'
            }}
          >
            <Table size={18} /> Tabela Porównawcza ({safeStocks.length})
          </button>

          <button
            onClick={() => setActiveTab('wse140')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              backgroundColor: activeTab === 'wse140' ? '#0284c7' : 'transparent', color: activeTab === 'wse140' ? '#fff' : '#94a3b8', fontWeight: 'bold'
            }}
          >
            <ListFilter size={18} /> WSE 140
          </button>
        </div>
      </header>

      {/* Global Search Bar */}
      <div style={{ width: '100%', marginBottom: '24px' }}>
        <StockSearch onStockFetched={handleStockFetched} />
      </div>

      {/* Content area */}
      <main style={{ width: '100%' }}>
        {activeTab === 'single' && (
          <StockCard 
            stock={selectedStock} 
            onAddToTable={handleAddToTable}
            isAlreadyInTable={isAlreadyInTable}
          />
        )}

        {activeTab === 'table' && (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <StockTable 
              stocks={safeStocks} 
              onRemoveFromTable={handleRemoveFromTable}
            />
          </div>
        )}

        {activeTab === 'wse140' && (
          <WseTable 
            stocks={wseStocks}
            setStocks={setWseStocks}
            initialLoading={wseLoading}
            onSelectStock={handleStockFetched} 
          />
        )}
      </main>
    </div>
  );
}