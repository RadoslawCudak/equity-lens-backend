import { useState, useEffect } from 'react';
import { LayoutGrid, Table } from 'lucide-react';
import StockSearch from './components/StockSearch';
import StockCard from './components/StockCard';
import StockTable from './components/StockTable';

export default function App() {
  const [activeTab, setActiveTab] = useState('single');
  
  // Wczytywanie początkowego stanu z localStorage
  const [stocks, setStocks] = useState(() => {
    const savedStocks = localStorage.getItem('equity_lens_stocks');
    return savedStocks ? JSON.parse(savedStocks) : [];
  });

  const [selectedStock, setSelectedStock] = useState(() => {
    const savedSelected = localStorage.getItem('equity_lens_selected');
    return savedSelected ? JSON.parse(savedSelected) : null;
  });

  // Automatyczny zapis do localStorage przy każdej zmianie tabeli
  useEffect(() => {
    localStorage.setItem('equity_lens_stocks', JSON.stringify(stocks));
  }, [stocks]);

  // Automatyczny zapis wybranej karty spółki
  useEffect(() => {
    if (selectedStock) {
      localStorage.setItem('equity_lens_selected', JSON.stringify(selectedStock));
    }
  }, [selectedStock]);

  const handleStockFetched = (newStockData) => {
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
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '24px' }}>
      {/* Header & Tabs */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#34d399', margin: 0 }}>Equity Lens</h1>
        
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
              backgroundColor: activeTab === 'single' ? '#059669' : 'transparent',
              color: activeTab === 'single' ? '#fff' : '#94a3b8'
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
              backgroundColor: activeTab === 'table' ? '#059669' : 'transparent',
              color: activeTab === 'table' ? '#fff' : '#94a3b8'
            }}
          >
            <Table size={18} /> Tabela Porównawcza ({stocks.length})
          </button>
        </div>
      </header>

      {/* Global Search Bar */}
      <StockSearch onStockFetched={handleStockFetched} />

      {/* Content area */}
      <main>
        {activeTab === 'single' ? (
          <StockCard 
            stock={selectedStock} 
            onAddToTable={handleAddToTable}
            isAlreadyInTable={isAlreadyInTable}
          />
        ) : (
          <StockTable 
            stocks={stocks} 
            onRemoveFromTable={handleRemoveFromTable}
          />
        )}
      </main>
    </div>
  );
}