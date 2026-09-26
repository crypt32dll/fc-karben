import { describe, expect, it } from 'vitest'

import { TEAM_SECTION_IDS } from '../../src/components/teams/TeamJumpNav'

describe('TeamPage scroll sections', () => {
  it('exposes stable jump targets for hash deep links', () => {
    expect(TEAM_SECTION_IDS).toEqual(['ueber-uns', 'spielplan', 'tabelle', 'berichte', 'kontakt'])
  })
})
