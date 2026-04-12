/*
 * TechBadge.jsx — small pill showing a technology name
 * Icons are inline SVGs. Falls back to text-only if no icon exists.
 */

const icons = {
  React: (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
      <path d="M12 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
      <path
        fillRule="evenodd"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 2c2.12 0 4.07.74 5.61 1.97C16.05 7.3 14.1 8 12 8s-4.05-.7-5.61-1.03A7.963 7.963 0 0 1 12 4ZM4 12c0-.93.16-1.82.44-2.65C5.93 10.3 8.84 11 12 11s6.07-.7 7.56-1.65c.28.83.44 1.72.44 2.65 0 4.41-3.59 8-8 8s-8-3.59-8-8Z"
        clipRule="evenodd"
      />
    </svg>
  ),
}

export default function TechBadge({ tech }) {
  const icon = icons[tech] || null

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
      {icon}
      {tech}
    </span>
  )
}
