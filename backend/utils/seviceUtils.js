// backend/utils/seviceUtils.js

export function safeNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function meanStd(values) {
  const arr = values.map(safeNumber).filter((x) => x >= 0);
  if (arr.length === 0) return { mean: 0, std: 0 };

  const mean = arr.reduce((s, x) => s + x, 0) / arr.length;
  const variance = arr.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / arr.length;
  const std = Math.sqrt(variance);

  return { mean, std };
}

export const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

export const pct = (num, den) => (den ? Number(((num / den) * 100).toFixed(2)) : 0);

export function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function startOfNextMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

export function startOfPrevMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() - 1, 1);
}

export function monthKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function pctChange(now, prev) {
  if (!prev || prev === 0) return null;
  return Number((((now - prev) / prev) * 100).toFixed(2));
}

export function toYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function buildDateRange(startDate, endDate) {
  const dates = [];
  const cur = new Date(startDate);
  cur.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (cur <= end) {
    dates.push(toYMD(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export function computeHealth({ ops7j, pctClassed, hasGoal, solde }) {
  let score = 0;
  if (ops7j >= 1) score += 25;
  if (pctClassed >= 80) score += 25;
  if (hasGoal) score += 25;
  if (solde >= 0) score += 25;
  return score;
}

export function denominateurSafe(x) {
  return Number.isFinite(Number(x)) ? Number(x) : 0;
}
