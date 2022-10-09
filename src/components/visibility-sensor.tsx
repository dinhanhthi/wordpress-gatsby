import React, { useState } from 'react'
import VSensor from 'react-visibility-sensor'

type VisibilitySensorProps = {
  once?: boolean
  children: (arg0: { isVisible: any }) => any
}

export default function VisibilitySensor(props: VisibilitySensorProps) {
  const [active, setActive] = useState(true)

  const { once, children, ...theRest } = props
  return (
    <VSensor
      active={active}
      onChange={(isVisible: any) => once && isVisible && setActive(false)}
      {...theRest}
    >
      {({ isVisible }: { isVisible: any }) => children({ isVisible })}
    </VSensor>
  )
}
