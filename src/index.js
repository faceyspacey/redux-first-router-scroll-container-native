// @flow

// $FlowFixMe - react-native is ignored, which produces an error
import { ScrollView } from 'react-native'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import type { Connector } from 'react-redux'

type GenericComponent = Class<React.Component<*, *, *>>

type OwnProps = {
  scrollKey: string,
  component: GenericComponent,
  forceRestore?: boolean,
  onScrollEndDrag?: Event => void,
  onMomentumScrollEnd?: Event => void
}

type StateProps = {
  backNext: ?boolean
}

type Props = OwnProps & StateProps

type XY = {
  x: number,
  y: number,
  animated: boolean
}

type Event = {
  nativeEvent: {
    contentOffset: { x: number, y: number }
  }
}

export class ScrollContainer extends React.Component {
  props: Props

  static scrollViews = {}

  static defaultProps = {
    component: ScrollView
  }

  componentDidMount() {
    this.restoreScroll()
  }

  // `componentDidUpdate` msut also be used in addition to `componentDidMount`
  // since if the `ScrollView` is rendered in the exact same place, the same
  // component instance will be re-used and won't re-mount
  componentDidUpdate({ scrollKey, forceRestore }: Props) {
    if (
      scrollKey !== this.props.scrollKey ||
      (this.props.forceRestore && forceRestore !== this.props.forceRestore)
    ) {
      this.restoreScroll()
    }
  }

  scrollView: Object

  restoreScroll() {
    if (this.props.backNext) {
      const xy = this.getLastXY(this.props)

      if (xy) {
        this.scrollTo(xy)
      }
    }
    else {
      // reset if scroll appears not through a `backNext` action
      // so that if user leaves a 2nd time and returns via `backNext` a stale
      // scroll position is not restored
      this.reset()
    }
  }
  scrollTo(xy: XY) {
    const scrollTo =
      this.scrollView.scrollTo ||
      (this.scrollView._listRef &&
        this.scrollView._listRef._scrollRef.scrollTo) ||
      (this.scrollView._scrollRef && this.scrollView._scrollRef.scrollTo)

    scrollTo
      ? setTimeout(() => scrollTo(xy))
      : console.warn(`[redux-first-router-scroll-container-native] the component
            you passed does not have a 'scrollTo' method. 'FlatList', 'SectionList',
            and 'ScrollView' have been tested. Please submit an issue if you think
            this is a mistake.`)
  }

  getLastXY(): XY {
    return ScrollContainer.scrollViews[this.props.scrollKey]
  }
  setLastXY(e: Event) {
    const { x, y } = e.nativeEvent.contentOffset
    const key = this.props.scrollKey

    ScrollContainer.scrollViews[key] = { x, y, animated: false }
  }
  reset() {
    delete ScrollContainer.scrollViews[this.props.scrollKey]
  }

  onScrollEndDrag = (e: Event) => {
    this.setLastXY(e)
    if (this.props.onScrollEndDrag) {
      this.props.onScrollEndDrag(e)
    }
  }

  onMomentumScrollEnd = (e: Event) => {
    this.setLastXY(e)
    if (this.props.onMomentumScrollEnd) {
      this.props.onMomentumScrollEnd(e)
    }
  }

  render() {
    const {
      scrollKey,
      backNext,
      forceRestore,
      component: ScrollComponent,
      ...props
    } = this.props

    return (
      <ScrollComponent
        {...props}
        ref={node => (this.scrollView = node)}
        key={this.props.scrollKey}
        onScrollEndDrag={this.onScrollEndDrag}
        onMomentumScrollEnd={this.onMomentumScrollEnd}
      />
    )
  }
}

const mapStateToProps = ({ location }) => ({
  backNext: location.backNext
})

const connector: Connector<OwnProps, Props> = connect(mapStateToProps)

const Container = connector(ScrollContainer)

Container.propTypes = {
  scrollKey: PropTypes.string.isRequired,
  component: PropTypes.object, // not required unlike Flow which requires it if you have its defaultProp
  forceRestore: PropTypes.bool,
  onScrollEndDrag: PropTypes.func,
  onMomentumScrollEnd: PropTypes.func
}

export default Container
