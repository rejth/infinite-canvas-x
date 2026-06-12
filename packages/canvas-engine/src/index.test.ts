import { describe, expect, test } from 'vitest'

import {
  CanvasEntityType,
  CanvasRect,
  CanvasText,
  DEFAULT_RECT_SIZE,
  DEFAULT_SCALE,
  DEFAULT_SELECTION_LINE_WIDTH,
  Layer,
  LayerSerializer,
  Selection,
  SMALL_PADDING,
  SpatialTileIndex,
  TextAlign,
  TextDecoration,
} from './index'
import { Colors } from './interfaces'

describe('canvas engine entities', () => {
  test('selection handles align with the inset stroke corners', () => {
    const selection = new Selection({
      x: 100,
      y: 120,
      width: 200,
      height: 200,
      lineWidth: DEFAULT_SELECTION_LINE_WIDTH,
      scale: DEFAULT_SCALE,
      color: Colors.SELECTION,
    })

    const inset = DEFAULT_SELECTION_LINE_WIDTH / 2
    const { topRight, bottomRight } = selection.getStrokeCorners()

    expect(topRight.x).toBe(100 + 200 - inset)
    expect(topRight.y).toBe(120 + inset)
    expect(bottomRight.x).toBe(100 + 200 - inset)
    expect(bottomRight.y).toBe(120 + 200 - inset)
  })

  test('selection syncs to content bounds when a child is added', () => {
    const layer = new Layer({
      x: 0,
      y: 0,
      width: DEFAULT_RECT_SIZE,
      height: DEFAULT_RECT_SIZE,
      scale: DEFAULT_SCALE,
    })
    const rect = new CanvasRect({
      x: 100,
      y: 120,
      width: DEFAULT_RECT_SIZE,
      height: DEFAULT_RECT_SIZE,
      color: '#f9c74f',
      scale: DEFAULT_SCALE,
    })

    layer.addChild(rect)

    const selection = layer.getChildByType(CanvasEntityType.SELECTION)

    expect(rect.getXY()).toEqual([100, 120])
    expect(rect.getWidthHeight()).toEqual([DEFAULT_RECT_SIZE, DEFAULT_RECT_SIZE])
    expect(selection?.getXY()).toEqual([100 - SMALL_PADDING, 120 - SMALL_PADDING])
    expect(selection?.getWidthHeight()).toEqual([
      DEFAULT_RECT_SIZE + SMALL_PADDING * 2,
      DEFAULT_RECT_SIZE + SMALL_PADDING * 2,
    ])
    expect(layer.getXY()).toEqual([100 - SMALL_PADDING, 120 - SMALL_PADDING])
    expect(layer.getWidthHeight()).toEqual([
      DEFAULT_RECT_SIZE + SMALL_PADDING * 2,
      DEFAULT_RECT_SIZE + SMALL_PADDING * 2,
    ])
  })

  test('selection stays padded around content after resize and move', () => {
    const layer = new Layer({
      x: 0,
      y: 0,
      width: DEFAULT_RECT_SIZE,
      height: DEFAULT_RECT_SIZE,
      scale: DEFAULT_SCALE,
    })
    const rect = new CanvasRect({
      x: 100,
      y: 120,
      width: DEFAULT_RECT_SIZE,
      height: DEFAULT_RECT_SIZE,
      color: '#f9c74f',
      scale: DEFAULT_SCALE,
    })

    layer.addChild(rect)
    layer.resize(20, 20, 'bottom-right')
    layer.move(15, -10)

    const selection = layer.getChildByType(CanvasEntityType.SELECTION)
    const [rectX, rectY] = rect.getXY()
    const [rectWidth, rectHeight] = rect.getWidthHeight()

    expect(selection?.getXY()).toEqual([rectX - SMALL_PADDING, rectY - SMALL_PADDING])
    expect(selection?.getWidthHeight()).toEqual([
      rectWidth + SMALL_PADDING * 2,
      rectHeight + SMALL_PADDING * 2,
    ])
    expect(layer.getXY()).toEqual([rectX - SMALL_PADDING, rectY - SMALL_PADDING])
    expect(layer.getWidthHeight()).toEqual([
      rectWidth + SMALL_PADDING * 2,
      rectHeight + SMALL_PADDING * 2,
    ])
  })

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
