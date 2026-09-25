import { createLogger } from '../logger'
import type { MatchDto, MatchFeedSource } from './dto'
import { extractFussballDeTeamId, parseFussballDeMatchplanHtml } from './parse-html'

const log = createLogger('MatchFeed')

const NEXT_GAMES_URL =
  'https://www.fussball.de/ajax.team.next.games/-/mime-type/JSON/mode/PAGE/team-id'

/**
 * Live MatchFeedSource — fussball.deAjax next-games (HTML fragment, no API key).
 * Scores for finished fixtures are font-obfuscated; we only use upcoming fixtures.
 */
export const fussballDeMatchFeedSource: MatchFeedSource = {
  async fetchUpcoming(teamId: string): Promise<MatchDto[]> {
    const id = extractFussballDeTeamId(teamId)
    if (!id) {
      log.warn('invalid fussball.de team id', { teamId })
      return []
    }

    const url = `${NEXT_GAMES_URL}/${id}`
    const res = await fetch(url, {
      headers: {
        Accept: 'text/html,application/json',
        'User-Agent': 'FC-Karben-ClubSite/1.0 (+https://fc-karben.de)',
      },
      signal: AbortSignal.timeout(12_000),
      // Caller wraps with unstable_cache — avoid Next fetch cache double-layer surprises
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`fussball.de next.games HTTP ${res.status}`)
    }

    const body = await res.text()
    // Endpoint sometimes wraps HTML in JSON `{ "html": "..." }` and sometimes returns raw HTML
    const html = unwrapFussballDeBody(body)
    const matches = parseFussballDeMatchplanHtml(html)
    log.debug('fetched upcoming', { teamId: id, count: matches.length })
    return matches.filter((m) => m.status === 'scheduled' || m.status === 'live')
  },
}

function unwrapFussballDeBody(body: string): string {
  const trimmed = body.trim()
  if (!trimmed.startsWith('{')) return body
  try {
    const json = JSON.parse(trimmed) as { html?: string; content?: string }
    return json.html || json.content || body
  } catch {
    return body
  }
}
