/*
 * ImageGallery.jsx — responsive image grid with accessible lightbox
 *
 * Lightbox state machine:
 *   closed ──(click thumbnail)──► open[index]
 *   open   ──(ESC / click-outside / close btn)──► closed
 *   open   ──(prev / next / swipe)──► open[index ± 1]
 *
 * Accessibility (WCAG 2.1 SC 2.4.3):
 *   - Custom focus trap via useEffect: Tab and Shift+Tab cycle only
 *     through focusable elements inside the dialog.
 *   - aria-modal, role="dialog", aria-label on the container.
 *   - Returns focus to the trigger thumbnail on close.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active || !ref.current) return

    const focusable = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    first?.focus()

    function onKeyDown(e) {
      if (e.key !== 'Tab') return
      if (focusable.length === 1) { e.preventDefault(); return }
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [active, ref])
}

export default function ImageGallery({ images = [] }) {
  const [open, setOpen] = useState(null) // null | number (index)
  const dialogRef = useRef(null)
  const triggerRefs = useRef([])

  useFocusTrap(dialogRef, open !== null)

  const close = useCallback(() => {
    const idx = open
    setOpen(null)
    // Return focus to the thumbnail that opened the lightbox
    requestAnimationFrame(() => triggerRefs.current[idx]?.focus())
  }, [open])

  const prev = useCallback(() => {
    setOpen(i => (i > 0 ? i - 1 : images.length - 1))
  }, [images.length])

  const next = useCallback(() => {
    setOpen(i => (i < images.length - 1 ? i + 1 : 0))
  }, [images.length])

  // Keyboard navigation
  useEffect(() => {
    if (open === null) return
    function onKey(e) {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close, prev, next])

  // Touch swipe
  const touchStart = useRef(null)
  function onTouchStart(e) { touchStart.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (touchStart.current === null) return
    const delta = e.changedTouches[0].clientX - touchStart.current
    if (Math.abs(delta) > 50) delta < 0 ? next() : prev()
    touchStart.current = null
  }

  if (!images || images.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((src, i) => (
          <button
            key={src}
            ref={el => (triggerRefs.current[i] = el)}
            onClick={() => setOpen(i)}
            className="rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={`Ver imagen ${i + 1} de ${images.length}`}
          >
            <img
              src={src}
              alt={`Captura ${i + 1}`}
              className="w-full h-32 object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={e => { if (e.target === e.currentTarget) close() }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={`Imagen ${open + 1} de ${images.length}`}
              className="relative max-w-4xl w-full flex flex-col items-center gap-4"
            >
              <motion.img
                key={open}
                src={images[open]}
                alt={`Captura ${open + 1}`}
                className="max-h-[80vh] w-full object-contain rounded-lg"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.15 }}
              />

              <div className="flex items-center gap-6">
                <button
                  onClick={prev}
                  disabled={images.length <= 1}
                  className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Imagen anterior"
                >
                  ←
                </button>

                <span className="text-sm text-zinc-400">
                  {open + 1} / {images.length}
                </span>

                <button
                  onClick={next}
                  disabled={images.length <= 1}
                  className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Imagen siguiente"
                >
                  →
                </button>
              </div>

              <button
                onClick={close}
                className="absolute top-0 right-0 p-2 text-zinc-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
