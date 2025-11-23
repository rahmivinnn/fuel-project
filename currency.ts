// Currency formatting utility for USD
export const formatCurrency = (amount: number): string => {
  if (isNaN(amount) || amount === 0) {
    return 'N/A';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPrice = (amount: number): string => {
  if (isNaN(amount) || amount === 0) {
    return 'N/A';
  }
  
  return `$${amount.toFixed(2)}`;
};