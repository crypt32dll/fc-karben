export type { MatchDto, MatchFeedSource } from './dto'
export {
  emptyMatchFeedSource,
  FIRST_TEAM_FUSSBALL_DE_ID,
  normalizeFussballDeMatch,
  pickNextMatch,
  pickNextMatchForTeam,
  SECOND_TEAM_FUSSBALL_DE_ID,
} from './dto'
export { fussballDeMatchFeedSource } from './fussball-de'
export { parseBerlinKickoff } from './kickoff'
export { extractFussballDeTeamId, parseFussballDeMatchplanHtml } from './parse-html'
export {
  getNextMatch,
  getScoreboardFixtures,
  listUpcomingMatches,
  syncMatchFeed,
} from './sync'
export type { ScoreboardFixture } from './sync'
