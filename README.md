# redux-first-router-scroll-container-native 

A straightforward scroll restoration component for React Native using Redux First Router

<p align="center">
  <a href="https://www.npmjs.com/package/redux-first-router-scroll-container-native">
    <img src="https://img.shields.io/npm/v/redux-first-router-scroll-container-native.svg" alt="Version" />
  </a>

  <a href="https://travis-ci.org/faceyspacey/redux-first-router-scroll-container-native">
    <img src="https://travis-ci.org/faceyspacey/redux-first-router-scroll-container-native.svg?branch=master" alt="Build Status" />
  </a>

  <a href="https://lima.codeclimate.com/github/faceyspacey/redux-first-router-scroll-container-native/coverage">
    <img src="https://lima.codeclimate.com/github/faceyspacey/redux-first-router-scroll-container-native/badges/coverage.svg" alt="Coverage Status"/>
  </a>

  <a href="https://greenkeeper.io">
    <img src="https://badges.greenkeeper.io/faceyspacey/redux-first-router-scroll-container-native.svg" alt="Green Keeper" />
  </a>

  <a href="https://lima.codeclimate.com/github/faceyspacey/redux-first-router-scroll-container-native">
    <img src="https://lima.codeclimate.com/github/faceyspacey/redux-first-router-scroll-container-native/badges/gpa.svg" alt="GPA" />
  </a>

  <a href="https://www.npmjs.com/package/redux-first-router-scroll-container-native">
    <img src="https://img.shields.io/npm/dt/redux-first-router-scroll-container-native.svg" alt="Downloads" />
  </a>

  <a href="https://www.npmjs.com/package/redux-first-router-scroll-container-native">
    <img src="https://img.shields.io/npm/l/redux-first-router-scroll-container-native.svg" alt="License" />
  </a>
</p>


## Installation
```
yarn add redux-first-router-scroll-container-native
```

## Usage

```js
import React from 'react'
import { connect } from 'react-redux'
import { FlatList, TouchableOpacity } from 'react-native'
import { back } from 'redux-first-router'
import ScrollContainer from 'redux-first-router-scroll-container-native'

export default ({ scene, dispatch }) =>
  scene === 'SCENE1'
    ? <ScrollContainer
        component={FlatList}// FlatList, ScrollView, SectionList, ListView, etc
        scrollKey='scene-1' // used to differentiate between multiple scrollViews
        forceRestore={0}    // increment to force restoration after asynchrony
      >
        <TouchableOpacity onPress={() => dispatch({ type: 'SCENE2' })} />
      </ScrollContainer>
    : <ScrollContainer 
        component={ScrollView} // ScrollView is default by the way, no need to pass it
        scrollKey='scene-2'
      >
        <TouchableOpacity onPress={back} />
      </ScrollContainer>

const mapState = ({ location }) => ({
  scene: location.type
})

export default connect(mapState)(MyComponent)
```


## Pros
- no HOCs are needed
- both y and x values can be restored
- no *additional* `<Provider />` components are needed (it's redux-powered)
- scroll position recorded in both `onMomentumScrollEnd` and `onScrollEndDrag`
- even if you don't use the `back`/`next` methods from `redux-first-router`, and you navigate to a route you were just at, it will be determined you are revisiting a page worth of a nifty scroll restoration. Hurray!
- increment `forceRestore` or call `ref.restoreScroll()` after asynchronous events update the page with more data and a longer/wider page. Won't be needed if you are using things like `redux-persist`--that way when you return to the page you already have the data you needed and it renders in its full dimensions on mount :)
- will handle the case where you render a `ScrollContainer` in the exact same place within the component tree and React re-uses it and doesn't remount it. In that case, instead of `componentDidMount` handling scroll restoration, `componentDidUpdate` handles scroll restoration. Long live React! *If you want to force mounting a new component, simply give it a unique `key` prop.*


## Contributing
We use [commitizen](https://github.com/commitizen/cz-cli), so run `npm run commit` to make commits. A command-line form will appear, requiring you answer a few questions to automatically produce a nicely formatted commit. Releases, semantic version numbers, tags and changelogs will automatically be generated based on these commits thanks to [semantic-release](https://github.com/semantic-release/semantic-release). Be good.
