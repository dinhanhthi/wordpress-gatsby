import React from 'react'
import VisibilitySensor from './visibility-sensor'

type ImgurSize = 't' | 'm' | 'l' | 'h' | 'o' // sizes for imgur images (except 'o' which is my custom size)

type LazyloadImageProps = {
  src: string
  alt?: string
  sizes?: string
  srcsetSizes?: {
    imageWidth: ImgurSize
    viewPortWidth: number
  }[]
}

const defaultProps: LazyloadImageProps = {
  alt: '',
  sizes: '100vw',
  src: '',
  srcsetSizes: [
    { imageWidth: 't', viewPortWidth: 160 },
    { imageWidth: 'm', viewPortWidth: 320 },
    { imageWidth: 'l', viewPortWidth: 640 },
    { imageWidth: 'h', viewPortWidth: 1024 },
    { imageWidth: 'o', viewPortWidth: 1366 },
  ],
}

export default function LazyloadImage(
  props: LazyloadImageProps = defaultProps
) {
  let srcSetAttributeValue = ''
  const sanitiseImageSrc = props.src.replace(' ', '%20')
  const srcsetSizes = props.srcsetSizes || defaultProps.srcsetSizes

  if (srcsetSizes) {
    for (let i = 0; i < srcsetSizes.length; i++) {
      srcSetAttributeValue += `${getImageUrl(
        sanitiseImageSrc,
        srcsetSizes[i].imageWidth
      )} ${srcsetSizes[i].viewPortWidth}w`
      if (srcsetSizes.length - 1 !== i) {
        srcSetAttributeValue += ', '
      }
    }
  }

  const visibilitySensorProps = {
    partialVisibility: true,
    key: sanitiseImageSrc,
    delayedCall: true,
    once: true,
  }

  return (
    <VisibilitySensor {...visibilitySensorProps}>
      {({ isVisible }) => (
        <>
          {isVisible ? (
            <img
              src={`${sanitiseImageSrc}`}
              alt={props.alt}
              sizes={
                props.sizes ||
                `(min-width: 1366px) 1366px, ${defaultProps.sizes}`
              }
              srcSet={srcSetAttributeValue}
              loading="lazy"
            />
          ) : (
            <img src={`${sanitiseImageSrc}`} alt={props.alt} />
          )}
        </>
      )}
    </VisibilitySensor>
  )
}

function getImageUrl(originalImageUrl: string, size: ImgurSize) {
  /**
   * https://i.imgur.com/CBEDn0j.jpg
   * becomes
   * https://i.imgur.com/CBEDn0jt.jpg
   */
  const ar = originalImageUrl.split('.')
  return size === 'o'
    ? originalImageUrl
    : ar.slice(0, ar.length - 1).join('.') + `${size}.` + ar[ar.length - 1]
}
