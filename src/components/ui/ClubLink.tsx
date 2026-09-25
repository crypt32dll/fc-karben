import Link from 'next/link'
import type { ComponentProps } from 'react'

type ClubLinkProps = ComponentProps<typeof Link>

/**
 * ClubSite Link — prefetch off by default to cut Vercel/edge prefetch compute.
 * Opt in with `prefetch` for primary CTAs (e.g. Mitglied werden).
 */
export function ClubLink({ prefetch = false, ...props }: ClubLinkProps) {
  return <Link prefetch={prefetch} {...props} />
}
