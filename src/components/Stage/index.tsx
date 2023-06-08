import React, { useRef } from 'react';
import Konva from 'konva'
import { Canvas } from '../Canvas';

export const Stage: React.FC = () => {
  const konvaRef = useRef<Konva.Stage>(null)

  return (
    <>
      <Canvas
         konvaRef={konvaRef}
      />
    </>
  )
}
