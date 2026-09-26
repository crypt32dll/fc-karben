import Image from 'next/image'

import logo from '../../../public/logo.png'

type Props = {
  src?: string | null
  alt?: string | null
  /** Hero / LCP — uses next/image priority (eager). Body images stay lazy. */
  priority?: boolean
  className?: string
  aspectClassName?: string
  sizes?: string
}

/**
 * ClubSite featured / header media with navy fallback when no image is set yet.
 * Fallback shows the club crest centered; real images render as-is.
 * Header: `priority` (eager). Inline/body images should omit priority (lazy default).
 */
export function FeaturedMedia({
  src,
  alt,
  priority = false,
  className = '',
  aspectClassName = 'aspect-[16/9]',
  sizes = '(max-width: 800px) 100vw, 800px',
}: Props) {
  return (
    <div className={`relative overflow-hidden bg-navy-mid ${aspectClassName} ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt || ''}
          fill
          className="object-cover"
          sizes={sizes}
          {...(priority ? { priority: true as const } : { loading: 'lazy' as const })}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-navy" aria-hidden>
          <Image
            src={logo}
            alt=""
            width={88}
            height={110}
            className="h-[46%] w-auto max-h-28 object-contain"
          />
        </div>
      )}
    </div>
  )
}
