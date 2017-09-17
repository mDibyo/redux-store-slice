import _get from 'lodash.get';
import _set from 'lodash.set';
import { GenericStoreEnhancer, Reducer, Store, StoreCreator } from 'redux';

const withStoreSlices: GenericStoreEnhancer = (createStore: StoreCreator) =>
  (reducer: Reducer, ...rest: any[]) => {
    const store: Store = createStore(reducer, ...rest);
    function createStoreSlice<StoreSlice>(slice: string): StoreCreator {
      return () => {
        return <Store<StoreSlice>>{
          ...store,
          getState: (): StoreSlice => _get(store.getState(), slice),
          replaceReducer: (nextSliceReducer) => _set({ ...reducer }, slice, nextSliceReducer),
        }
      }
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
