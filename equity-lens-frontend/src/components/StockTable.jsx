import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

export default function StockTable({ stocks, onRemoveFromTable }) {
  const formatNumber = (value, decimals = 2) => {
    if (value === undefined || value === null || isNaN(value)) return 'N/A';
    return Number(value).toLocaleString('pl-PL', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const columnDefs = [
    { field: 'index', headerName: 'Index', sortable: true, filter: true, width: 110 },
    { field: 'symbol', headerName: 'Ticker', sortable: true, filter: true, width: 120 },
    { 
      field: 'data.official_name', 
      headerName: 'Pełna nazwa', 
      sortable: true, 
      filter: true,
      valueGetter: params => params.data?.data?.official_name || params.data?.symbol || 'N/A',
      flex: 1 
    },
    { 
      field: 'data.currentPrice', 
      headerName: 'currentPrice', 
      sortable: true, 
      valueFormatter: params => params.value ? `${formatNumber(params.value)} PLN` : 'N/A',
      width: 140
    },
    { 
      field: 'data.previousClose', 
      headerName: 'previousClose', 
      sortable: true, 
      valueFormatter: params => params.value ? `${formatNumber(params.value)} PLN` : 'N/A',
      width: 140
    },
    { 
      headerName: 'Różnica', 
      sortable: true,
      width: 120,
      valueGetter: params => {
        const current = params.data?.data?.currentPrice;
        const prev = params.data?.data?.previousClose;
        if (!current || !prev) return null;
        return ((current - prev) / prev) * 100;
      },
      valueFormatter: params => params.value !== null ? `${params.value > 0 ? '+' : ''}${formatNumber(params.value)}%` : 'N/A',
      cellStyle: params => {
        if (params.value > 0) return { color: '#34d399', fontWeight: 'bold' };
        if (params.value < 0) return { color: '#f87171', fontWeight: 'bold' };
        return null;
      }
    },
    { 
      field: 'data.volume', 
      headerName: 'volume', 
      sortable: true, 
      valueFormatter: params => params.value ? formatNumber(params.value, 0) : 'N/A',
      width: 130
    },
    { 
      field: 'data.averageDailyVolume10Day', 
      headerName: 'averageDailyVolume10Day', 
      sortable: true, 
      valueFormatter: params => params.value ? formatNumber(params.value, 0) : 'N/A',
      width: 220
    },
    { 
      headerName: '% vs 10 days', 
      sortable: true,
      width: 140,
      valueGetter: params => {
        const vol = params.data?.data?.volume;
        const avgVol = params.data?.data?.averageDailyVolume10Day;
        if (!vol || !avgVol) return null;
        return (vol / avgVol) * 100;
      },
      valueFormatter: params => params.value !== null ? `${formatNumber(params.value, 0)}%` : 'N/A'
    },
    {
      headerName: 'Akcje',
      field: 'symbol',
      width: 90,
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <button
          onClick={() => onRemoveFromTable(params.value)}
          style={{
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          Usuń
        </button>
      )
    }
  ];

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
        Brak spółek w zestawieniu. Wyszukaj i pobierz pierwsze spółki, aby wypełnić tabelę!
      </div>
    );
  }

  return (
    <div 
      className="custom-dark-grid"
      style={{ 
        height: '500px', 
        width: '100%', 
        borderRadius: '8px', 
        overflow: 'hidden',
        border: '1px solid #334155'
      }}
    >
      <AgGridReact
        rowData={stocks}
        columnDefs={columnDefs}
        multiSortKey="ctrl"
        animateRows={true}
        pagination={true}
        paginationPageSize={20}
      />
    </div>
  );
}