export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  SGD: 'S$',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
};

export function formatCurrency(
  amount: number | string | undefined | null,
  currency = 'USD',
  compact = false
): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '$0';
  }

  const num = Number(amount);
  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  if (compact) {
    if (Math.abs(num) >= 1_000_000_000) {
      return `${symbol}${(num / 1_000_000_000).toFixed(2)}B`;
    }
    if (Math.abs(num) >= 1_000_000) {
      return `${symbol}${(num / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(num) >= 1_000) {
      return `${symbol}${(num / 1_000).toFixed(1)}k`;
    }
  }

  return `${symbol}${num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return '0';
  return num.toLocaleString('en-US');
}

export function formatPercent(num: number | string | undefined | null): string {
  if (num === undefined || num === null || isNaN(Number(num))) return '0%';
  return `${Number(num).toFixed(1)}%`;
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
