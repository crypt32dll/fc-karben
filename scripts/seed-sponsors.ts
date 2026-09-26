/**
 * Seed / upsert sponsors from the legacy WordPress /sponsoren/ page.
 * Logos stay on fc-karben.de; website URLs come from the WP markup.
 *
 *   pnpm exec tsx --env-file=.env scripts/seed-sponsors.ts
 *   pnpm exec tsx --env-file=.env scripts/seed-sponsors.ts --apply
 */
import './load-env.ts'

import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { getPayload } from 'payload'

import { externalMediaStub } from '../src/lib/migration/media-loader'

type SponsorGroup = 'hauptsponsoren' | 'medienpartner' | 'ausruester' | 'kooperationspartner'

type SeedSponsor = {
  name: string
  group: SponsorGroup
  logoUrl: string
  url: string
  sortOrder: number
}

/** Source: https://fc-karben.de/sponsoren/ (logo src + wrapping <a href>) */
const SEED: SeedSponsor[] = [
  // Hauptsponsoren
  {
    name: 'Öl Beck Energie',
    group: 'hauptsponsoren',
    logoUrl:
      'https://fc-karben.de/wp-content/uploads/2023/01/Oel-Beck_Energie_TankStation-Logo-_4c.png',
    url: 'https://www.oel-beck.de/',
    sortOrder: 10,
  },
  {
    name: 'Karbener Kunststoff Fenster',
    group: 'hauptsponsoren',
    logoUrl: 'https://fc-karben.de/wp-content/uploads/2018/01/kk_logo_sp.jpg',
    url: 'https://www.karbener-kunststoff-fenster.de/',
    sortOrder: 20,
  },
  {
    name: 'REWE Fuchs Karben',
    group: 'hauptsponsoren',
    logoUrl: 'https://fc-karben.de/wp-content/uploads/2022/06/2018_04_10-LOGO-REWE-Fuchs-Karben.jpeg',
    url: 'https://www.rewe-karben.de/',
    sortOrder: 30,
  },
  {
    name: 'Reifen Weber Karben',
    group: 'hauptsponsoren',
    logoUrl: 'https://fc-karben.de/wp-content/uploads/2018/01/weber_logo_sp.jpg',
    url: 'https://www.reifenweberkarben.de/',
    sortOrder: 40,
  },
  {
    name: 'Schreiner Eckert',
    group: 'hauptsponsoren',
    logoUrl: 'https://fc-karben.de/wp-content/uploads/2018/01/eckert_logo_sp.jpg',
    url: 'https://www.der-schreiner-eckert.de/',
    sortOrder: 50,
  },
  {
    name: 'Friz Fleisch',
    group: 'hauptsponsoren',
    logoUrl: 'https://fc-karben.de/wp-content/uploads/2018/01/friz_logo_sp.jpg',
    url: 'https://friz-fleisch.com/',
    sortOrder: 60,
  },
  {
    name: 'Mario Balser',
    group: 'hauptsponsoren',
    logoUrl: 'https://fc-karben.de/wp-content/uploads/2018/01/balserkom_logo_sp.jpg',
    url: 'https://www.mario-balser.de/',
    sortOrder: 70,
  },
  {
    name: 'Rafael Martinez',
    group: 'hauptsponsoren',
    logoUrl: 'https://fc-karben.de/wp-content/uploads/2018/01/martinez-logo.jpg',
    url: 'https://rafael-martinez.de/',
    sortOrder: 80,
  },
  {
    name: 'Bunds Schneeräumung',
    group: 'hauptsponsoren',
    logoUrl: 'https://fc-karben.de/wp-content/uploads/2021/05/BS19Logo_33x17mm_oS_pfad.jpeg',
    url: 'https://www.schneeraeumung.com/',
    sortOrder: 90,
  },
  {
    name: 'porta Möbel',
    group: 'hauptsponsoren',
    logoUrl: 'https://fc-karben.de/wp-content/uploads/2023/01/porta-Moebel.jpg',
    url: 'https://porta.de/porta/',
    sortOrder: 100,
  },
  {
    name: 'We rooms Hotel',
    group: 'hauptsponsoren',
    logoUrl: 'https://fc-karben.de/wp-content/uploads/2022/01/We-rooms-Hotel-tuerkis-schwarz.png',
    url: 'https://we-rooms-hotel.de/',
    sortOrder: 110,
  },
  {
    name: 'THE LOFT Fitness',
    group: 'hauptsponsoren',
    logoUrl: 'https://fc-karben.de/wp-content/uploads/2022/12/THE-LOFT-Logo-e1670859933957.png',
    url: 'https://www.theloft.fitness/',
    sortOrder: 120,
  },
  {
    name: 'BAUHAUS Bad Vilbel',
    group: 'hauptsponsoren',
    logoUrl: 'https://fc-karben.de/wp-content/uploads/2024/01/Bauhaus.png',
    url: 'https://www.bauhaus.info/fachcentren/fachcentrum-bad-vilbel/fc/898',
    sortOrder: 130,
  },
  {
    name: 'Frank Lindner Zürich',
    group: 'hauptsponsoren',
    logoUrl: 'https://fc-karben.de/wp-content/uploads/2025/05/20250507_Logo_Frank-Lindner_FC_Karben.jpg',
    url: 'https://www.zurich.de/de-de/vor-ort/frank-lindner',
    sortOrder: 140,
  },
  // Medienpartner
  {
    name: 'FNP',
    group: 'medienpartner',
    logoUrl: 'https://fc-karben.de/wp-content/uploads/2018/01/fnp.jpg',
    url: 'https://www.fnp.de/',
    sortOrder: 210,
  },
  {
    name: 'fussball.de',
    group: 'medienpartner',
    logoUrl: 'https://fc-karben.de/wp-content/uploads/2018/01/fb-de-logo1.jpg',
    url: 'https://www.fussball.de/',
    sortOrder: 220,
  },
  {
    name: 'Wetterauer Zeitung',
    group: 'medienpartner',
    logoUrl: 'https://fc-karben.de/wp-content/uploads/2018/01/wz_logo_sp.jpg',
    url: 'https://www.wetterauer-zeitung.de/',
    sortOrder: 230,
  },
  {
    name: 'Kunisch Display',
    group: 'medienpartner',
    logoUrl: 'https://fc-karben.de/wp-content/uploads/2018/01/kunisch_logo_sp.jpg',
    url: 'https://www.kunisch-display.de/',
    sortOrder: 240,
  },
  // Ausrüster
  {
    name: 'MS Textilveredelung',
    group: 'ausruester',
    logoUrl: 'https://fc-karben.de/wp-content/uploads/2026/01/IMG_7947.png',
    url: 'https://ms-textilveredelung.de/',
    sortOrder: 310,
  },
  // Kooperationspartner
  {
    name: 'KSV Kleinkarben',
    group: 'kooperationspartner',
    logoUrl: 'https://fc-karben.de/wp-content/uploads/2020/07/image005.png',
    url: 'https://www.ksv-kleinkarben.de/?inhalt=start/',
    sortOrder: 410,
  },
]

const apply = process.argv.includes('--apply')

const configModule = await import(pathToFileURL(path.resolve('src/payload.config.ts')).href)
const payload = await getPayload({ config: configModule.default })

const ensureLogoMedia = async (logoUrl: string, alt: string) => {
  const existing = await payload.find({
    collection: 'media',
    where: { wpSourceUrl: { equals: logoUrl } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs[0]) return existing.docs[0].id

  const stub = externalMediaStub(logoUrl)
  const doc = await payload.create({
    collection: 'media',
    data: { alt, wpSourceUrl: logoUrl },
    file: stub,
    overrideAccess: true,
    context: { disableRevalidate: true },
  })
  return doc.id
}

let created = 0
let updated = 0

for (const row of SEED) {
  console.log(apply ? 'upsert' : 'would upsert', row.name, '→', row.url)
  if (!apply) continue

  const logoId = await ensureLogoMedia(row.logoUrl, row.name)
  const existing = await payload.find({
    collection: 'sponsors',
    where: { name: { equals: row.name } },
    limit: 1,
    overrideAccess: true,
  })

  const data = {
    name: row.name,
    group: row.group,
    url: row.url,
    logo: logoId,
    sortOrder: row.sortOrder,
    active: true,
  }

  if (existing.docs[0]) {
    await payload.update({
      collection: 'sponsors',
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
    updated += 1
  } else {
    await payload.create({
      collection: 'sponsors',
      data,
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
    created += 1
  }
}

console.log(JSON.stringify({ apply, created, updated, total: SEED.length }, null, 2))
process.exit(0)
