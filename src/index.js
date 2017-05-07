// @flow
import React from 'react'
import { connect } from 'react-redux'
import { ScrollView } from 'react-native'

type Props = {
  scrollKey: string,
  component?: string,
  forceRestore?: boolean
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
  componentDidUpdate({ scrollKey, forceRestore }) {
    if (
      scrollKey !== this.props.scrollKey ||
      (this.props.forceRestore && forceRestore !== this.props.forceRestore)
    ) {
      this.restoreScroll()
    }
  }

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
  scrollTo(xy) {
    const scrollTo =
      this.scrollView.scrollTo ||
      (this.scrollView._listRef &&
        this.scrollView._listRef._scrollRef.scrollTo) ||
      (this.scrollView._scrollRef && this.scrollView._scrollRef.scrollTo)

    scrollTo
      ? scrollTo(xy)
      : console.warn(`[redux-first-router-scroll-container-native] the component
            you passed does not have a 'scrollTo' method. 'FlatList', 'SectionList',
            and 'ScrollView' have been tested. Please submit an issue if you think
            this is a mistake.`)
  }

  getLastXY({ backNext }) {
    return backNext && ScrollContainer.scrollViews[this.props.scrollKey]
  }
  setLastXY(e) {
    const { x, y } = e.nativeEvent.contentOffset
    const key = this.props.scrollKey

    ScrollContainer.scrollViews[key] = { x, y, animated: false }
  }
  reset() {
    delete ScrollContainer.scrollViews[this.props.scrollKey]
  }

  onScrollEndDrag = e => {
    this.setLastXY(e)
    if (this.props.onScrollEndDrag) {
      this.props.onScrollEndDrag(e)
    }
  }

  onMomentumScrollEnd = e => {
    this.setLastXY(e)
    if (this.props.onMomentumScrollEnd) {
      this.props.onMomentumScrollEnd(e)
    }
  }

  render() {
    const ScrollComponent = this.props.component

    return (
      <ScrollComponent
        {...this.props}
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

export default connect(mapStateToProps)(ScrollContainer)
