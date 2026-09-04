'use client'

import Script from 'next/script'

interface NeighborbriteEmbedProps {
  token?: string
  hardinessZone?: string
}

export function NeighborbriteEmbed({
  token = 'nb_live_a00c37e53a23381fca42a00de04622be',
  hardinessZone = '7a',
}: NeighborbriteEmbedProps) {
  const iframeSrc = `https://app.neighborbrite.com/embed?token=${token}&hardinessZone=${hardinessZone}`

  return (
    <div className="w-full">
      <iframe
        src={iframeSrc}
        width="100%"
        height="800"
        style={{ border: 0 }}
        allow="clipboard-write"
        loading="lazy"
        title="Neighborbrite Garden Design Tool"
      />
      {/* Resizer script required by Neighborbrite to dynamically adjust iframe height */}
      <Script src="https://app.neighborbrite.com/embed-resizer.js" strategy="afterInteractive" />
    </div>
  )
}
