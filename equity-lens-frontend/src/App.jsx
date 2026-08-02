import { useState, useEffect } from 'react';
import { LayoutGrid, Table } from 'lucide-react';
import StockSearch from './components/StockSearch';
import StockCard from './components/StockCard';
import StockTable from './components/StockTable';

export default function App() {
  const [activeTab, setActiveTab] = useState('single');
  
  const [stocks, setStocks] = useState(() => {
    try {
      const savedStocks = localStorage.getItem('equity_lens_stocks');
      return savedStocks ? JSON.parse(savedStocks) : [];
    } catch {
      return [];
    }
  });

  const [selectedStock, setSelectedStock] = useState(() => {
    try {
      const savedSelected = localStorage.getItem('equity_lens_selected');
      return savedSelected ? JSON.parse(savedSelected) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('equity_lens_stocks', JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    if (selectedStock) {
      localStorage.setItem('equity_lens_selected', JSON.stringify(selectedStock));
    }
  }, [selectedStock]);

  const handleStockFetched = (newStockData) => {
    // Nadpisujemy stan nowo pobranymi danymi z API
    setSelectedStock(newStockData);
  };

  const handleAddToTable = (stockToAdd) => {
    setStocks((prevStocks) => {
      const exists = prevStocks.some((item) => item.symbol === stockToAdd.symbol);
      if (!exists) {
        return [...prevStocks, stockToAdd];
      }
      return prevStocks;
    });
  };

  const handleRemoveFromTable = (symbolToRemove) => {
    setStocks((prevStocks) => prevStocks.filter((stock) => stock.symbol !== symbolToRemove));
  };

  const isAlreadyInTable = selectedStock
    ? stocks.some((item) => item.symbol === selectedStock.symbol)
    : false;

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw', 
      maxWidth: '100%',
      backgroundColor: '#0f172a', 
      color: '#f8fafc', 
      padding: '24px 32px',
      boxSizing: 'border-box'
    }}>
      {/* Header & Tabs */}
      <header style={{ 
        display: 'flex', 
        justify: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px', 
        borderBottom: '1px solid #1e293b', 
        paddingBottom: '16px',
        width: '100%',
        gap: '24px'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#38bdf8',
          margin: 0,
          marginRight: '16px'
        }}>
          Equity Lens
        </h1>
        
        <div style={{ display: 'flex', backgroundColor: '#1e293b', padding: '4px', borderRadius: '8px', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('single')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'single' ? '#0284c7' : 'transparent',
              color: activeTab === 'single' ? '#fff' : '#94a3b8',
              fontWeight: 'bold',
              transition: 'background-color 0.2s'
            }}
          >
            <LayoutGrid size={18} /> Karta Spółki
          </button>
          <button
            onClick={() => setActiveTab('table')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'table' ? '#0284c7' : 'transparent',
              color: activeTab === 'table' ? '#fff' : '#94a3b8',
              fontWeight: 'bold',
              transition: 'background-color 0.2s'
            }}
          >
            <Table size={18} /> Tabela Porównawcza ({stocks.length})
          </button>
        </div>
      </header>

      {/* Global Search Bar */}
      <div style={{ width: '100%', marginBottom: '24px' }}>
        <StockSearch onStockFetched={handleStockFetched} />
      </div>

      {/* Content area */}
      <main style={{ width: '100%' }}>
        {activeTab === 'single' ? (
          <StockCard 
            stock={selectedStock} 
            onAddToTable={handleAddToTable}
            isAlreadyInTable={isAlreadyInTable}
          />
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <StockTable 
              stocks={stocks} 
              onRemoveFromTable={handleRemoveFromTable}
            />
          </div>
        )}
      </main>
    </div>
  );
}