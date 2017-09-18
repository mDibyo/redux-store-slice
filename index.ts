import _get from 'lodash.get';
import _set from 'lodash.set';
import { Action, GenericStoreEnhancer, Reducer, Store, StoreCreator } from 'redux';

const withStoreSlices: GenericStoreEnhancer = (createStore: StoreCreator) =>
  (reducer: Reducer, ...rest: any[]) => {
    const store: Store = createStore(reducer, ...rest);

    function createStoreSlice<StateSlice>(slice: string): StoreCreator {
      function replaceSliceReducer(nextSliceReducer: Reducer<StateSlice>) {
        const reducer = _set({ ...reducer }, slice, nextSliceReducer);
        store.replaceReducer(reducer);
      }

      return (
        sliceReducer: Reducer<StateSlice> | undefined,
        initialStateSlice: StateSlice | undefined,
      ) => {
        if (initialStateSlice) {
          const sliceInitActionType: string = `redux-store-slice/@@INIT_SLICE_${slice}`;
          const sliceInitAction: Action = { type: sliceInitActionType };

          const currentReducer = reducer;
          replaceSliceReducer(
            (stateSlice, action) => action.type === sliceInitActionType ? initialStateSlice : stateSlice,
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
