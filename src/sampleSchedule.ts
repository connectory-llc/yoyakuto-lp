// LP の図で使う見本の予定。図ごとに空き枠を書くと食い違うので、空き枠は必ずここから計算する
const DAY_START_HOUR = 10;
const SLOT_MINUTES = 30;
const MINUTES_PER_HOUR = 60;
const TWO_DIGITS = 2;
const HOURS_PER_DAY = 24;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const MS_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND;

const SAMPLE_YEAR = 2026;
const SAMPLE_MONTH_INDEX = 10;
const SAMPLE_DAY = 21;
const SAMPLE_DATE = new Date(Date.UTC(SAMPLE_YEAR, SAMPLE_MONTH_INDEX, SAMPLE_DAY));

export const SLOT_COUNT = 18;

const dateAfter = (days: number) => new Date(SAMPLE_DATE.getTime() + days * MS_PER_DAY);

// 図の見出しに使う英語の日付。例: Sat. 21 Nov
export const sampleDateLabel = (days = 0) => {
  const date = dateAfter(days);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
  const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  return `${weekday}. ${date.getUTCDate()} ${month}`;
};

// 予約一覧に使う日本語の日付。例: 11/21 土
export const sampleDateLabelJa = (days = 0) => {
  const date = dateAfter(days);
  const weekday = date.toLocaleDateString('ja-JP', { weekday: 'short', timeZone: 'UTC' });
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()} ${weekday}`;
};

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

export const slotAt = (hour: number, minute = 0) => (hour * MINUTES_PER_HOUR + minute - DAY_START_HOUR * MINUTES_PER_HOUR) / SLOT_MINUTES;

export const freeSlotsOf = (staff: Staff) =>
  Array.from({ length: SLOT_COUNT }, (_, slot) => slot).filter(
    (slot) => !staff.busy.some((range) => range.start <= slot && slot < range.end),
  );

export const pageName = (staff: Staff) => `${staff.name}さんの予約ページ`;
