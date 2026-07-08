const formatter = new Intl.NumberFormat('ja-JP');

export function formatYen(amount: number): string {
  return `${formatter.format(amount)}円`;
}

export function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}
