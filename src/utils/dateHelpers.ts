const DAY_IN_MS = 24 * 60 * 60 * 1000;

export type TimestampRange = {
  startDate: number;
  endDate: number;
};

export const normalizeDate = (value: number | Date): number => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

export const endOfDay = (value: number | Date): number => normalizeDate(value) + DAY_IN_MS - 1;

export const addDays = (value: number | Date, days: number): number => {
  const date = new Date(normalizeDate(value));
  date.setDate(date.getDate() + days);
  return date.getTime();
};

export const isSameDay = (left: number | Date, right: number | Date): boolean => {
  return normalizeDate(left) === normalizeDate(right);
};

export const getTodayRange = (baseDate: number | Date = Date.now()): TimestampRange => {
  const startDate = normalizeDate(baseDate);
  return {
    startDate,
    endDate: endOfDay(startDate),
  };
};

export const createDateRange = (startValue: number | Date, endValue: number | Date): TimestampRange => {
  const startDate = normalizeDate(startValue);
  const endDate = endOfDay(endValue);

  if (startDate <= endDate) {
    return { startDate, endDate };
  }

  return {
    startDate: normalizeDate(endValue),
    endDate: endOfDay(startValue),
  };
};

export const differenceInDays = (laterDate: number | Date, earlierDate: number | Date): number => {
  const later = normalizeDate(laterDate);
  const earlier = normalizeDate(earlierDate);
  return Math.max(0, Math.floor((later - earlier) / DAY_IN_MS));
};
