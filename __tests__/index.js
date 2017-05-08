// @noflow
import React from 'react'
import { View } from 'react-native'
import renderer from 'react-test-renderer'
import { ScrollContainer } from '../src'

const createScroll = props => (
  <ScrollContainer {...props}>
    <View {...props} />
  </ScrollContainer>
)

test('saves scroll position onMomentumScrollEnd and restores on componentDidMount', () => {
  let ref
  let component
  let instance
  const contentOffset = { x: 10, y: 69, animated: false }

  expect(ScrollContainer.scrollViews).toEqual({})
  const onMomentumScrollEnd = jest.fn()
  component = createScroll({
    ref: node => (ref = node),
    scrollKey: 'foo',
    onMomentumScrollEnd
  })
  instance = renderer.create(component)
  expect(instance.toJSON()).toMatchSnapshot()

  const event = { nativeEvent: { contentOffset } }
  ref.onMomentumScrollEnd(event)
  expect(ScrollContainer.scrollViews.foo).toEqual(contentOffset)
  expect(onMomentumScrollEnd).toHaveBeenCalledWith(event)

  component = createScroll({
    ref: node => (ref = node),
    scrollKey: 'foo',
    backNext: true
  })

  instance = renderer.create(component)

  ref.scrollTo = jest.fn()
  ref.componentDidMount()
  expect(ref.scrollTo).toHaveBeenCalledWith(contentOffset)
})

test('saves scroll position onScrollEndDrag and restores on componentDidUpdate', () => {
  let ref
  let component
  const contentOffset = { x: 10, y: 69, animated: false }

  ScrollContainer.scrollViews = {}
  const onScrollEndDrag = jest.fn()
  component = createScroll({
    ref: node => (ref = node),
    scrollKey: 'foo',
    onScrollEndDrag
  })
  const instance = renderer.create(component)
  expect(instance.toJSON()).toMatchSnapshot()

  const event = { nativeEvent: { contentOffset } }
  ref.onScrollEndDrag(event)
  expect(ScrollContainer.scrollViews.foo).toEqual(contentOffset)
  expect(onScrollEndDrag).toHaveBeenCalledWith(event)

  component = createScroll({
    scrollKey: 'foo',
    backNext: true
  })

  instance.update(component)

  ref.scrollView.scrollTo = jest.fn() // also test actual ScrollView.scrollTo methods
  ref.componentDidUpdate({ scrollKey: 'bar' })
  expect(ref.scrollView.scrollTo).toHaveBeenCalledWith(contentOffset)
})

test('restores scroll on componentDidUpdate when prevProps.forceRestore === false and props.forceRestore is truthy or incremented', () => {
  let ref
  const contentOffset = { x: 10, y: 69, animated: false }
  const component = createScroll({
    ref: node => (ref = node),
    scrollKey: 'foo',
    backNext: true,
    forceRestore: 1
  })

  ScrollContainer.scrollViews = {
    foo: contentOffset
  }

  renderer.create(component)

  ref.scrollTo = jest.fn()
  ref.componentDidUpdate({ scrollKey: 'foo', forceRestore: 0 })
  expect(ref.scrollTo).toHaveBeenCalledWith(contentOffset)
})

test('resets scroll position on mount/update if !props.backNext', () => {
  let ref
  const contentOffset = { x: 10, y: 69, animated: false }
  const component = createScroll({
    ref: node => (ref = node),
    scrollKey: 'foo'
  })

  ScrollContainer.scrollViews = {
    foo: contentOffset
  }

  renderer.create(component)

  // since !props.backNext, scroll position is reset (deleted)
  // so that the scene starts at the top of the page
  ref.reset = jest.fn()
  ref.componentDidMount()
  expect(ref.reset).toHaveBeenCalled()
  expect(ScrollContainer.scrollViews).toEqual({})

  // the scrollKey must change below as `componentDidUpdate` serves the use
  // case where the same component instance is re-used because it appears
  // at the same place in the component tree, but it in fact is representing
  // another scene
  ref.reset = jest.fn()
  ref.scrollTo = jest.fn()
  ref.componentDidUpdate({ scrollKey: 'bar' })
  expect(ref.reset).toHaveBeenCalled()
  expect(ref.scrollTo).not.toHaveBeenCalled()
  expect(ScrollContainer.scrollViews).toEqual({})
})

test('console.warn called when Component without scrollTo method passed as prop', () => {
  let ref
  const contentOffset = { x: 10, y: 69, animated: false }
  const component = createScroll({
    ref: node => (ref = node),
    scrollKey: 'foo',
    backNext: true,
    forceRestore: 1,
    Component: View
  })

  ScrollContainer.scrollViews = {
    foo: contentOffset
  }

  renderer.create(component)

  console.warn = jest.fn()
  ref.componentDidUpdate({ scrollKey: 'foo', forceRestore: 0 })
  expect(console.warn).toHaveBeenCalled()
})
