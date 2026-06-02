import { describe, expect, test } from 'vitest'

import {
  CanvasEntityType,
  CanvasRect,
  CanvasText,
  DEFAULT_SCALE,
  Layer,
  LayerSerializer,
  SpatialTileIndex,
  TextAlign,
  TextDecoration,
} from './index'

describe('canvas engine entities', () => {
  test('moving a layer moves its child entities with it', () => {
    const layer = new Layer(
      {
        x: 10,
        y: 20,
        width: 100,
        height: 80,
        scale: DEFAULT_SCALE,
      },
      { withSelection: false },
    )
    const rect = new CanvasRect({
      x: 15,
      y: 25,
      width: 30,
      height: 20,
      color: '#ffffff',
      scale: DEFAULT_SCALE,
    })

    layer.addChild(rect)

    layer.move(5, -10)

    expect(layer.getXY()).toEqual([15, 10])
    expect(rect.getXY()).toEqual([20, 15])
  })

  test('layers serialize and deserialize without app code', () => {
    const layer = new Layer(
      {
        x: 10,
        y: 20,
        width: 100,
        height: 80,
        scale: DEFAULT_SCALE,
      },
      { id: 7, withSelection: false },
    )

    layer.addChild(
      new CanvasRect({
        x: 10,
        y: 20,
        width: 100,
        height: 80,
        color: '#ffffff',
        scale: DEFAULT_SCALE,
      }),
    )
    layer.addChild(
      new CanvasText({
        x: 15,
        y: 25,
        width: 90,
        height: 30,
        scale: DEFAULT_SCALE,
        text: 'Hello',
        font: 'Arial',
        fontSize: 16,
        fontStyle: '400',
        textAlign: TextAlign.LEFT,
        textDecoration: TextDecoration.NONE,
      }),
    )

    const serialized = LayerSerializer.serialize(layer)
    const restored = serialized ? LayerSerializer.deserialize(serialized) : null

    expect(serialized?.id).toBe(7)
    expect(restored?.getId()).toBe(7)
    expect(restored?.getChildren().map((child) => child.getType())).toEqual([
      CanvasEntityType.SELECTION,
      CanvasEntityType.RECT,
      CanvasEntityType.TEXT,
    ])
  })

  test('spatial index tracks inserted and moved layers by bounds', () => {
    const index = new SpatialTileIndex(100)
    const layer = new Layer(
      {
        x: 10,
        y: 10,
        width: 20,
        height: 20,
        scale: DEFAULT_SCALE,
      },
      { id: 1, withSelection: false },
    )

    index.insert(layer)

    expect(index.getLayersInBounds({ x: 0, y: 0, width: 99, height: 99 })).toEqual([1])

    index.move(layer, 150, 10)

    expect(index.getLayersInBounds({ x: 0, y: 0, width: 99, height: 99 })).toEqual([])
    expect(index.getLayersInBounds({ x: 100, y: 0, width: 99, height: 99 })).toEqual([1])
  })
})
