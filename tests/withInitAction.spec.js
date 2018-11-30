/* global expect, describe, it, jest */
import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';

import withInitAction, { clearComponentIds } from '../src/withInitAction';
import { MODE_INIT_SELF, MODE_PREPARE } from '../src/initMode';
import { INIT_SELF_ASYNC, INIT_SELF_BLOCKING } from '../src/initSelfMode';

import SimpleInitTestComponent from './fixtures/SimpleInitTestComponent';

const mockStore = configureMockStore([thunk]);

/* eslint-disable react/prefer-stateless-function, react/no-multi-comp */
describe('withInitAction', () => {
  describe('with a non-functional component', () => {
    describe('and no initProps or options', () => {
      clearComponentIds();

      const WithInit = withInitAction(() => Promise.resolve())(SimpleInitTestComponent);
      it('has an initConfig', () => expect(typeof WithInit.initConfig).toBe('object'));
      it('has a string componentId', () => {
        expect(typeof WithInit.initConfig.componentId).toBe('string');
        expect(WithInit.initConfig.componentId).not.toBe('');
      });
      it('has an allowLazy option of false', () => expect(WithInit.initConfig.options.allowLazy).toBe(false));
      it('has an empty array for initProps', () => {
        expect(WithInit.initConfig.initProps).toEqual([]);
      });
      it('has a initSelf option of INIT_SELF_ASYNC', () => {
        expect(WithInit.initConfig.options.initSelf).toBe(INIT_SELF_ASYNC);
      });
      it('has a reinitialize option of true', () => {
        expect(WithInit.initConfig.options.reinitialize).toBe(true);
      });
    });

    describe('and all options set', () => {
      clearComponentIds();
      const getInitStateDummy = state => state.foo;
      const onErrorDummy = e => e;

      const WithInit = withInitAction(
        () => Promise.resolve(),
        {
          reinitialize: false,
          initSelf: INIT_SELF_BLOCKING,
          allowLazy: true,
          getInitState: getInitStateDummy,
          onError: onErrorDummy,
        },
      )(SimpleInitTestComponent);

      it('sets the reinitialize option', () => {
        expect(WithInit.initConfig.options.reinitialize).toBe(false);
      });
      it('sets the initSelf option', () => {
        expect(WithInit.initConfig.options.initSelf).toBe(INIT_SELF_BLOCKING);
      });
      it('sets the allowLazy option', () => {
        expect(WithInit.initConfig.options.allowLazy).toBe(true);
      });
      it('sets the getInitState option', () => {
        expect(WithInit.initConfig.options.getInitState).toBe(getInitStateDummy);
      });
      it('sets the onError option', () => {
        expect(WithInit.initConfig.options.onError).toBe(onErrorDummy);
      });
    });
  });

  describe('with a component that has been prepared and no initSelf state and initMode === MODE_PREPARE', () => {
    // see issue #17
    it('does not set an { isInitializing: true } prop', () => {
      clearComponentIds();
      const store = mockStore({ init: {
        mode: MODE_PREPARE,
        prepared: {
          'SimpleInitTestComponent[]': true,
        },
        selfInit: {},
      } });

      const WithInit = withInitAction(() => Promise.resolve())(SimpleInitTestComponent);
      const tree = renderer.create(
        <Provider store={store}>
          <WithInit />
        </Provider>,
      ).toJSON();

      expect(tree).toMatchSnapshot();
    });
  });


  describe('with a component with no initSelf state and initMode === MODE_INIT_SELF', () => {
    // See issue #19
    it('sets an { isInitializing: true } prop', () => {
      clearComponentIds();
      const store = mockStore({ init: {
        mode: MODE_INIT_SELF,
        prepared: {
          'SimpleInitTestComponent[]': true,
        },
        selfInit: {},
      } });

      const WithInit = withInitAction(() => Promise.resolve())(SimpleInitTestComponent);
      const tree = renderer.create(
        <Provider store={store}>
          <WithInit />
        </Provider>,
      ).toJSON();

      expect(tree).toMatchSnapshot();
    });
  });

  describe('with a component that has been prepared and is re-initializing', () => {
    it('sets an { isInitializing: true } prop', () => {
      clearComponentIds();

      const store = mockStore({ init: {
        mode: MODE_INIT_SELF,
        prepared: {
          'SimpleInitTestComponent[]': true,
        },
        selfInit: {
          'SimpleInitTestComponent[]': false,
        },
      } });

      const WithInit = withInitAction(() => Promise.resolve())(SimpleInitTestComponent);
      const tree = renderer.create(
        <Provider store={store}>
          <WithInit />
        </Provider>,
      ).toJSON();

      expect(tree).toMatchSnapshot();
    });
  });

  describe('with a component that has been prepared and has completed re-initializing', () => {
    it('does not set an { isInitializing: true } prop', () => {
      clearComponentIds();
      const store = mockStore({ init: {
        mode: MODE_INIT_SELF,
        prepared: {
          'SimpleInitTestComponent[]': true,
        },
        selfInit: {
          'SimpleInitTestComponent[]': true,
        },
      } });

      const WithInit = withInitAction(() => Promise.resolve())(SimpleInitTestComponent);
      const tree = renderer.create(
        <Provider store={store}>
          <WithInit />
        </Provider>,
      ).toJSON();

      expect(tree).toMatchSnapshot();
    });
  });

  describe('with a functional component', () => {
    clearComponentIds();

    const WithInit = withInitAction(
      () => Promise.resolve(),
    )(SimpleInitTestComponent);

    it('has a string componentId', () => {
      expect(typeof WithInit.initConfig.componentId).toBe('string');
      expect(WithInit.initConfig.componentId).not.toBe('');
    });
  });

  it('throws an error for components without a name or displayName', () => {
    clearComponentIds();
    const FooComponent = () => <noscript />;
    delete FooComponent.name;

    expect(() => {
      // eslint-disable-next-line no-unused-vars
      const WithInit = withInitAction(
        () => Promise.resolve(),
      )(FooComponent);
    }).toThrow();
  });

  it('set the initProps', () => {
    clearComponentIds();

    const WithInit = withInitAction(
      ['a', 'b', 'c'],
      () => Promise.resolve(),
    )(SimpleInitTestComponent);
    expect(WithInit.initConfig.initProps).toEqual(['a', 'b', 'c']);
  });
});
