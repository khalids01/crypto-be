export function getRelativeTime(date: Date | number) {
  const locale = 'en';
  const now = Date.now();
  const deltaInSeconds = Math.round(
    ((typeof date === 'number' ? date : +date) - now) / 1000,
  );

  const units = [
    'year',
    'month',
    'week',
    'day',
    'hour',
    'minute',
    'second',
  ] as const;
  const thresholds = [31536000, 2592000, 604800, 86400, 3600, 60, 1];
  const idx = thresholds.findIndex((t) => Math.abs(deltaInSeconds) >= t);
  const unit = units[idx];
  const value = Math.floor(deltaInSeconds / thresholds[idx]);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  return rtf.format(value, unit);
}
