---
title: Setup
nav_order: 3
---
# Setup

Make sure you have an existing setup with the prerequisites listed [here](./index.html#prerequisites)
{: .bg-yellow-000.p-3 }

## Attach the reducer
Attach the `react-redux-component-init` reducer to your Redux store under the `init` key. The
easiest way to do this is by
using [Redux combineReducers()](http://redux.js.org/docs/api/combineReducers.html):

```js
import { combineReducers, createStore } from 'redux';
import { initReducer as init } from 'react-redux-component-init';

const mainReducer = combineReducers({
  init: initReducer,
  // ... other reducers in the application
});
const store = createStore(mainReducer);
```

Note: it is recommended to attach the reducer to the `init` key, but it is also possible to include
the reducer elsewhere in the state. See the `getInitState` option of
the [withInitAction() HOC](./api.html#withInitAction)
{: .bg-grey-lt-100.p-3 }

## Server side page rendering
In the function that renders your page on the server, call `prepareComponent` with the top-level
page component(s) and the props that will be passed to them. The example below is
using [express](https://expressjs.com/) and
[react-router](https://github.com/ReactTraining/react-router) 3, but these are not required.

```js
import { prepareComponents } from 'react-redux-component-init';
import { match, RouterContext } from 'react-router';
import { Provider } from 'react-redux';
import { renderToString } from 'react-dom/server';
// ...
function renderPage(req, res) {
  // ...
  match({ routes: Routes, location: req.url }, (error, redirectLocation, renderProps) => {
    // ...
    // note: prepareComponents is just a shorthand for multiple prepareComponent() wrapped in Promise.all()
    store.dispatch(prepareComponents(
      renderProps.routes.map(route => route.component),
      renderProps
    )).then(() => {
      res.send(renderToString(
        <Provider store={store}>
          <RouterContext {...renderProps} />
        </Provider>
      );
    });
  });
}
```

## Set initMode on client
On the client side of your application you should switch the initMode to `MODE_INIT_SELF`
**after the first render**.
```js
import { setInitMode, MODE_INIT_SELF } from 'react-redux-component-init';
// ...
store.dispatch(setInitMode(MODE_INIT_SELF));
```

---

[Continue reading: Usage guide](./usage){: .btn .btn-purple }
