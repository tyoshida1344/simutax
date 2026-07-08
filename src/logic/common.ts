export function roundDownTo(value: number, unit: number): number {
  return Math.floor(value / unit) * unit;
}

export function clampMin(value: number, min: number): number {
  return Math.max(value, min);
}
