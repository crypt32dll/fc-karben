/** Public Google Calendar used for Platzbelegung (legacy WP embed). */
export const PLATZBELEGUNG_CALENDAR_SRC = 's3pcc71vpmcf3eji3giagqo6l8@group.calendar.google.com'

/**
 * Google Calendar embed URL.
 * Only limited chrome colors are supported inside the iframe (`bgcolor`, `color`);
 * fonts and layout stay Google’s UI.
 */
export function platzbelegungCalendarEmbedUrl(opts?: { height?: number }): string {
  const height = opts?.height ?? 720
  const params = new URLSearchParams({
    height: String(height),
    wkst: '2',
    bgcolor: '#f4f4f8',
    src: PLATZBELEGUNG_CALENDAR_SRC,
    color: '#2b2b5c',
    ctz: 'Europe/Berlin',
    showTitle: '0',
    showPrint: '0',
    showTabs: '1',
    showCalendars: '0',
    showTz: '0',
  })
  return `https://calendar.google.com/calendar/embed?${params.toString()}`
}
