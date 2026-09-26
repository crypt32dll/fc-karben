'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

const easeOut = [0.22, 1, 0.36, 1] as const

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  /** Use on first paint (hero); otherwise animates when scrolled into view. */
  immediate?: boolean
}

/** Soft fade/slide-in — skipped when the user prefers reduced motion.
 *  `immediate` = first-paint / LCP content: no opacity:0 (avoids delayed LCP). */
export function Reveal({ children, className, delay = 0, immediate = false }: RevealProps) {
  const reduce = useReducedMotion()

  if (reduce || immediate) {
    return <div className={className}>{children}</div>
  }

  const transition = { duration: 0.45, delay, ease: easeOut }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18, margin: '0px 0px -6% 0px' }}
      transition={transition}
    >
      {children}
    </motion.div>
  )
}

type StaggerProps = {
  children: ReactNode
  className?: string
  delayChildren?: number
  stagger?: number
  as?: 'div' | 'ul'
  /** Animate when scrolled into view (homepage sections). Default: on mount. */
  inView?: boolean
}

/** Parent for staggered list children (`StaggerItem`). */
export function Stagger({
  children,
  className,
  delayChildren = 0.04,
  stagger = 0.055,
  as = 'div',
  inView = false,
}: StaggerProps) {
  const reduce = useReducedMotion()
  const MotionTag = as === 'ul' ? motion.ul : motion.div

  if (reduce) {
    const Static = as
    return <Static className={className}>{children}</Static>
  }

  const show = {
    transition: { staggerChildren: stagger, delayChildren },
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      {...(inView
        ? {
            whileInView: 'show',
            viewport: { once: true, amount: 0.2, margin: '0px 0px -6% 0px' },
          }
        : { animate: 'show' })}
      variants={{
        hidden: {},
        show,
      }}
    >
      {children}
    </MotionTag>
  )
}

export function StaggerItem({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'li'
}) {
  const reduce = useReducedMotion()
  const MotionTag = as === 'li' ? motion.li : motion.div

  if (reduce) {
    const Static = as
    return <Static className={className}>{children}</Static>
  }

  return (
    <MotionTag
      className={className}
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, ease: easeOut },
        },
      }}
    >
      {children}
    </MotionTag>
  )
}

/** Subtle press/hover feedback for CTAs and cards. */
export function MotionPressable({
  children,
  className,
  intensity = 'subtle',
}: {
  children: ReactNode
  className?: string
  /** `lift` = gallery tiles (slight scale + rise). */
  intensity?: 'subtle' | 'lift'
}) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      whileHover={
        intensity === 'lift' ? { y: -4, scale: 1.03 } : { y: -2 }
      }
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
    >
      {children}
    </motion.div>
  )
}
