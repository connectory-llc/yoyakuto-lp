// LP の図で使う見本の予定。図ごとに空き枠を書くと食い違うので、空き枠は必ずここから計算する
const DAY_START_HOUR = 10;
const SLOT_MINUTES = 30;
const MINUTES_PER_HOUR = 60;
const TWO_DIGITS = 2;

export const SLOT_COUNT = 18;
export const SAMPLE_DATE_LABEL = 'Sat. 21 Nov';

// start と end は 10:00 から数えた 30 分枠の位置で、end の枠は含まない
export const STAFF = [
  { name: 'ミカ', initial: 'ミ', avatar: 1, busy: [{ start: 0, end: 3 }, { start: 5, end: 9 }, { start: 12, end: 14 }, { start: 15, end: 18 }] },
  { name: 'ユウト', initial: 'ユ', avatar: 2, busy: [{ start: 1, end: 4 }, { start: 6, end: 8 }, { start: 10, end: 13 }, { start: 14, end: 17 }] },
  { name: 'サキ', initial: 'サ', avatar: 3, busy: [{ start: 0, end: 2 }, { start: 3, end: 6 }, { start: 8, end: 11 }, { start: 13, end: 15 }, { start: 16, end: 18 }] },
] as const;

export type Staff = (typeof STAFF)[number];

export const NOMINATED = STAFF[2];

export const slotLabel = (slot: number) => {
  const minutes = DAY_START_HOUR * MINUTES_PER_HOUR + slot * SLOT_MINUTES;
  const hour = Math.floor(minutes / MINUTES_PER_HOUR);
  const minute = String(minutes % MINUTES_PER_HOUR).padStart(TWO_DIGITS, '0');
  return `${hour}:${minute}`;
};

export const freeSlotsOf = (staff: Staff) =>
  Array.from({ length: SLOT_COUNT }, (_, slot) => slot).filter(
    (slot) => !staff.busy.some((range) => range.start <= slot && slot < range.end),
  );

export const pageName = (staff: Staff) => `${staff.name}さんの予約ページ`;
