import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Presse' }

export default function PressePage() {
  return (
    <div className="mx-auto max-w-[1120px] px-8 py-16">
      <h1 className="text-5xl text-navy">Presse</h1>
      <p className="mt-4 max-w-2xl text-ink-soft">
        Beiträge erscheinen hier nach der WordPress-Migration. Autorennamen werden nicht angezeigt.
      </p>
      <p className="mt-8 text-sm">
        <Link href="/" className="font-semibold text-navy">
          ← Zur Startseite
        </Link>
      </p>
    </div>
  )
}
