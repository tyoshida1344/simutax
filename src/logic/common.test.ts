import { describe, it, expect } from 'vitest';
import { roundDownTo, clampMin } from './common';

describe('roundDownTo', () => {
  it('1,000円未満を切り捨て', () => {
    expect(roundDownTo(1234567, 1000)).toBe(1234000);
  });

  it('100円未満を切り捨て', () => {
    expect(roundDownTo(12345, 100)).toBe(12300);
  });

  it('ちょうど割り切れる場合はそのまま', () => {
    expect(roundDownTo(3000000, 1000)).toBe(3000000);
  });

  it('unitより小さい値は0', () => {
    expect(roundDownTo(999, 1000)).toBe(0);
  });

  it('0は0', () => {
    expect(roundDownTo(0, 1000)).toBe(0);
  });
});

describe('clampMin', () => {
  it('負の値を0にクランプ', () => {
    expect(clampMin(-100, 0)).toBe(0);
  });

  it('正の値はそのまま', () => {
    expect(clampMin(100, 0)).toBe(100);
  });

  it('ちょうどminの場合はそのまま', () => {
    expect(clampMin(0, 0)).toBe(0);
  });
});
