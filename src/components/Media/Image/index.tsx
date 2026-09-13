'use client'

import { cn } from '@/utilities/cn'
import React from 'react'

import type { Props as MediaProps } from '../types'

export const Image: React.FC<MediaProps> = (props) => {
  const {
    alt: altFromProps,
    fill,
    height: heightFromProps,
    imgClassName,
    onClick,
    onLoad: onLoadFromProps,
    resource,
    src: srcFromProps,
    width: widthFromProps,
  } = props

  const [isLoading, setIsLoading] = React.useState(true)

  let width: number | undefined | null
  let height: number | undefined | null
  let alt = altFromProps

  let src = typeof srcFromProps === 'string' ? srcFromProps : srcFromProps?.src || ''

  if (!src && resource && typeof resource === 'object') {
    const { alt: altFromResource, height: fullHeight, url, width: fullWidth } = resource

    width = widthFromProps ?? fullWidth
    height = heightFromProps ?? fullHeight
    alt = altFromResource

    src = url || ''
  }

  return (
    <img
      src={src}
      alt={alt || ''}
      width={!fill ? width || widthFromProps || undefined : undefined}
      height={!fill ? height || heightFromProps || undefined : undefined}
      onClick={onClick}
      onLoad={() => {
        setIsLoading(false)

        if (typeof onLoadFromProps === 'function') {
          onLoadFromProps()
        }
      }}
      className={cn(imgClassName, fill && 'absolute inset-0 h-full w-full')}
    />
  )
}
