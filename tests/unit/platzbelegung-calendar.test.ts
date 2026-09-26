import { describe, expect, it } from 'vitest'

import {
  PLATZBELEGUNG_CALENDAR_SRC,
  platzbelegungCalendarEmbedUrl,
} from '../../src/lib/platzbelegung-calendar'

describe('platzbelegung calendar', () => {
  it('builds a Google embed URL with club colors and Berlin timezone', () => {
    const url = platzbelegungCalendarEmbedUrl({ height: 720 })
    expect(url.startsWith('https://calendar.google.com/calendar/embed?')).toBe(true)
    expect(url).toContain(`src=${encodeURIComponent(PLATZBELEGUNG_CALENDAR_SRC)}`)
    expect(url).toContain(encodeURIComponent('#f4f4f8'))
    expect(url).toContain(encodeURIComponent('#2b2b5c'))
    expect(url).toContain('ctz=Europe%2FBerlin')
    expect(url).toContain('wkst=2')
    expect(url).toContain('showTitle=0')
  })
})
