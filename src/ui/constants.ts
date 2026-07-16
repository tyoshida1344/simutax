import type { FilingType } from '../data/types';

export const MAX_AMOUNT = 9_999_999_999;
export const MAX_PEOPLE = 99;
export const MAX_PERCENT = 100;

export const filingTypeLabels: Record<FilingType, string> = {
  blue65: '青色申告（65万円控除）',
  blue55: '青色申告（55万円控除）',
  blue10: '青色申告（10万円控除）',
  white: '白色申告',
};
