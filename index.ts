import _get from 'lodash.get';
import _set from 'lodash.set';
import { Action, GenericStoreEnhancer, Reducer, Store, StoreCreator, StoreEnhancer } from 'redux';

const withSlicing: GenericStoreEnhancer = (createStore: StoreCreator) =>
  (reducer: Reducer, ...rest: any[]) => {
    const store: Store = createStore(reducer, ...rest);

    function createStoreSlice<StateSlice>(slice: string): StoreCreator {
      function replaceSliceReducer(nextSliceReducer: Reducer<StateSlice>) {
        const reducer = _set({ ...reducer }, slice, nextSliceReducer);
        store.replaceReducer(reducer);
      }

      function createStoreSlice(
        sliceReducer: Reducer<StateSlice>,
        preloadedStateSlice?: StateSlice,
        sliceEnhancer?: StoreEnhancer<StateSlice>,
      ): Store<StateSlice> {
        if (typeof preloadedStateSlice === 'function' && typeof sliceEnhancer === 'undefined') {
          sliceEnhancer = preloadedStateSlice;
          preloadedStateSlice = undefined
        }

        if (sliceEnhancer) {
          return sliceEnhancer(createStoreSlice)(sliceReducer, preloadedStateSlice);
        }

        if (preloadedStateSlice) {
          const sliceInitActionType: string = `redux-store-slice/@@INIT_SLICE_${slice}`;
          const sliceInitAction: Action = { type: sliceInitActionType };

          const currentReducer = reducer;
          replaceSliceReducer(
            (stateSlice, action) => action.type === sliceInitActionType ? preloadedStateSlice : stateSlice,
          );
          store.dispatch(sliceInitAction);
          replaceSliceReducer(currentReducer);
        }

        if (sliceReducer) {
          replaceSliceReducer(sliceReducer);
        }

        return <Store<StateSlice>>{
          ...store,
          getState: (): StateSlice => _get(store.getState(), slice),
          replaceReducer: replaceSliceReducer,
        };
      }

      return createStoreSlice;
    }

    return {
      ...store,
      replaceReducer: (nextReducer) => {
        reducer = nextReducer;
        store.replaceReducer(nextReducer);
      },
      createStoreSlice,
    }
  };

export default withSlicing;
