import { exitPreviewAction } from '@/lib/preview/exit-preview'

/** Visible only while Next draftMode is enabled (Preview / Live Preview). */
export function DraftModeBanner() {
  return (
    <div className="sticky top-0 z-[100] flex items-center justify-between gap-4 bg-pitch px-4 py-2 text-sm text-white">
      <p className="font-semibold tracking-wide">
        Entwurfsvorschau — unveröffentlichte Inhalte werden angezeigt
      </p>
      <form action={exitPreviewAction}>
        <input type="hidden" name="path" value="/" />
        <button
          type="submit"
          className="inline-flex min-h-11 shrink-0 items-center rounded-[2px] bg-white/15 px-3 font-medium transition-colors motion-reduce:transition-none hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-white/30"
        >
          Vorschau beenden
        </button>
      </form>
    </div>
  )
}
