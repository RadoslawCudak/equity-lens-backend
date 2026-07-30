
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';

// CSS dla AG Grid i motywu ciemnego (To naprawia biały prostokąt!)
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

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
    { field: 'index', headerName: 'Indeks', sortable: true, filter: true, width: 110 },
    { field: 'symbol', headerName: 'Ticker', sortable: true, filter: true, width: 120 },
    { 
      field: 'data.official_name', 
      headerName: 'Pełna nazwa', 
      sortable: true, 
      filter: true,
      valueGetter: params => params.data?.data?.official_name || params.data?.symbol || 'N/A',
      width: 200
    },
    { 
      field: 'data.currentPrice', 
      headerName: 'Cena bieżąca', 
      sortable: true, 
      filter: true,
      valueFormatter: params => params.value ? `${formatNumber(params.value)} PLN` : 'N/A',
      width: 140
    },
    { 
      field: 'data.previousClose', 
      headerName: 'Cena zamkn.', 
      sortable: true, 
      filter: true,
      valueFormatter: params => params.value ? `${formatNumber(params.value)} PLN` : 'N/A',
      width: 140
    },
    { 
      headerName: 'Różnica (%)', 
      sortable: true,
      filter: true,
      width: 130,
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
      field: 'data.trailingEps', 
      headerName: 'EPS (Zysk/akcję)', 
      sortable: true, 
      filter: true,
      valueFormatter: params => params.value ? `${formatNumber(params.value)} PLN` : 'N/A',
      width: 160
    },
    { 
      field: 'data.bookValue', 
      headerName: 'Wartość księgowa/akcję', 
      sortable: true, 
      filter: true,
      valueFormatter: params => params.value ? `${formatNumber(params.value)} PLN` : 'N/A',
      width: 190
    },
    { 
      field: 'data.enterpriseToEbitda', 
      headerName: 'EV / EBITDA', 
      sortable: true, 
      filter: true,
      valueFormatter: params => params.value ? formatNumber(params.value) : 'N/A',
      width: 130
    },
    { 
      field: 'data.ebitdaMargins', 
      headerName: 'Marża EBITDA', 
      sortable: true, 
      filter: true,
      valueFormatter: params => params.value ? `${formatNumber(params.value * 100)}%` : 'N/A',
      width: 140
    },
    { 
      field: 'data.returnOnAssets', 
      headerName: 'ROA', 
      sortable: true, 
      filter: true,
      valueFormatter: params => params.value ? `${formatNumber(params.value * 100)}%` : 'N/A',
      width: 110
    },
    { 
      field: 'data.returnOnEquity', 
      headerName: 'ROE', 
      sortable: true, 
      filter: true,
      valueFormatter: params => params.value ? `${formatNumber(params.value * 100)}%` : 'N/A',
      width: 110
    },
    { 
      field: 'data.debtToEquity', 
      headerName: 'Dług / Kapitał', 
      sortable: true, 
      filter: true,
      valueFormatter: params => params.value ? `${formatNumber(params.value)}%` : 'N/A',
      width: 140
    },
    { 
      field: 'data.sharesPercentSharesOut', 
      headerName: 'Free Float (%)', 
      sortable: true, 
      filter: true,
      valueFormatter: params => params.value ? `${formatNumber(params.value * 100)}%` : 'N/A',
      width: 140
    },
    { 
      field: 'data.dividendRate', 
      headerName: 'Dywidenda/akcję', 
      sortable: true, 
      filter: true,
      valueFormatter: params => params.value ? `${formatNumber(params.value)} PLN` : 'N/A',
      width: 160
    },
    { 
      field: 'data.targetLowPrice', 
      headerName: 'Target Min.', 
      sortable: true, 
      filter: true,
      valueFormatter: params => params.value ? `${formatNumber(params.value)} PLN` : 'N/A',
      width: 130
    },
    { 
      field: 'data.targetMeanPrice', 
      headerName: 'Target Śr.', 
      sortable: true, 
      filter: true,
      valueFormatter: params => params.value ? `${formatNumber(params.value)} PLN` : 'N/A',
      width: 130
    },
    { 
      field: 'data.targetMedianPrice', 
      headerName: 'Target Mediana', 
      sortable: true, 
      filter: true,
      valueFormatter: params => params.value ? `${formatNumber(params.value)} PLN` : 'N/A',
      width: 150
    },
    { 
      field: 'data.targetHighPrice', 
      headerName: 'Target Maks.', 
      sortable: true, 
      filter: true,
      valueFormatter: params => params.value ? `${formatNumber(params.value)} PLN` : 'N/A',
      width: 130
    },
    { 
      field: 'data.volume', 
      headerName: 'Wolumen', 
      sortable: true, 
      filter: true,
      valueFormatter: params => params.value ? formatNumber(params.value, 0) : 'N/A',
      width: 130
    },
    { 
      field: 'data.averageDailyVolume10Day', 
      headerName: 'Średnia 10d wolumenu', 
      sortable: true, 
      filter: true,
      valueFormatter: params => params.value ? formatNumber(params.value, 0) : 'N/A',
      width: 200
    },
    { 
      headerName: '% vs 10d wolumenu', 
      sortable: true,
      filter: true,
      width: 160,
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
      pinned: 'right',
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
      className="ag-theme-alpine-dark" 
      style={{ 
        height: 'calc(100vh - 220px)', 
        minHeight: '500px',
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