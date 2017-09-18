import _get from 'lodash.get';
import _set from 'lodash.set';
import { GenericStoreEnhancer, Reducer, Store, StoreCreator } from 'redux';

const withStoreSlices: GenericStoreEnhancer = (createStore: StoreCreator) =>
  (reducer: Reducer, ...rest: any[]) => {
    const store: Store = createStore(reducer, ...rest);

    function createStoreSlice<StoreSlice>(slice: string): StoreCreator {
      function replaceSliceReducer(nextSliceReducer: Reducer<StoreSlice>) {
        const reducer = _set({ ...reducer }, slice, nextSliceReducer);
        store.replaceReducer(reducer);
      }

      return (sliceReducer: Reducer<StoreSlice> | undefined) => {
        if (sliceReducer) {
          replaceSliceReducer(sliceReducer);
        }

        return <Store<StoreSlice>>{
          ...store,
          getState: (): StoreSlice => _get(store.getState(), slice),
          replaceReducer: replaceSliceReducer,
        };
      };
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

export default withStoreSlices;
