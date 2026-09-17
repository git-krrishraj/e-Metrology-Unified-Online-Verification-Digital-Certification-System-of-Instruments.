export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';

  const defaultOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  };

  return date.toLocaleDateString('en-IN', { ...defaultOptions, ...options });
};

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const getDaysRemaining = (validTill) => {
  if (!validTill) return 0;
  const now = new Date();
  const target = new Date(validTill);
  const diffTime = target - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
