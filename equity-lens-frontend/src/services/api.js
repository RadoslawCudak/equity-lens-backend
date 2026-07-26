const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://func-equitylens-backend-prod-cph0efczgjdkbdaz.centralus-01.azurewebsites.net/api';

export const fetchStockData = async (symbol) => {
  const response = await fetch(`${API_BASE_URL}/get_stock_data?symbol=${symbol}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch stock data for ${symbol}`);
  }
  return await response.json();
};