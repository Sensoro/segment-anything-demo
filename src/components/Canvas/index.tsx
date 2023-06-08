import React from 'react'
import Konva from 'konva'
import { Circle, Image, Layer, Path, Rect, Ring, Stage } from 'react-konva'

export interface CanvasProps {
  konvaRef: React.RefObject<Konva.Stage> | null
}

Konva.pixelRatio = 1

export const Canvas: React.FC<CanvasProps> = ({
  konvaRef,
}) => {
  return (
    <>
      <Stage
        ref={konvaRef}
      >
        <Layer name="svgMask">

        </Layer>
      </Stage>
    </>
  )
}

