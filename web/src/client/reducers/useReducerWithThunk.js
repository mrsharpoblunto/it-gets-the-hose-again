/*
 * @format
 */
import {useState, useRef, useCallback} from 'react';

export default function useReducerWithThunk(reducer, initialState) {
  const [hookState, setHookState] = useState(initialState);

  const state = useRef(hookState);
  const getState = useCallback(() => state.current, [state]);
  const setState = useCallback(
    newState => {
      state.current = newState;
      setHookState(newState);
    },
    [state, setHookState],
  );

  const reduce = useCallback(
    action => {
      return reducer(getState(), action);
    },
    [reducer, getState],
  );

  const dispatch = useCallback(
    action => {
      return typeof action === 'function'
        ? action(dispatch, getState)
        : setState(reduce(action));
    },
    [getState, setState, reduce],
  );

  return [hookState, dispatch];
}
