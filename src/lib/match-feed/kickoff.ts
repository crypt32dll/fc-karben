/** Parse fussball.de local wall time ("So, 27.09.26" + "15:30") as Europe/Berlin → UTC Date. */

export function parseBerlinKickoff(dateLabel: string, time: string): Date | null {
  const dateMatch = dateLabel.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/)
  const timeMatch = time.match(/(\d{1,2}):(\d{2})/)
  if (!dateMatch || !timeMatch) return null

  let year = Number(dateMatch[3])
  if (year < 100) year += 2000
  const month = Number(dateMatch[2])
  const day = Number(dateMatch[1])
  const hour = Number(timeMatch[1])
  const minute = Number(timeMatch[2])

  if (
    !Number.isFinite(year) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour > 23 ||
    minute > 59
  ) {
    return null
  }

  return zonedTimeToUtc(year, month, day, hour, minute, 'Europe/Berlin')
}

/**
 * Convert a civil time in `timeZone` to a UTC Date without extra deps.
 * @see https://stackoverflow.com/a/53652131 (adapted)
 */
function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })

  const parts = Object.fromEntries(
    formatter.formatToParts(new Date(utcGuess)).map((p) => [p.type, p.value]),
  ) as Record<string, string>

  const asTz = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  )
  const offset = asTz - utcGuess
  return new Date(utcGuess - offset)
}
