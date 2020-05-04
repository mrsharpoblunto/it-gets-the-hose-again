/*
 * @format
 */
import React from 'react';
import useReducerWithThunk from './reducers/useReducerWithThunk';
import reducer from './reducers';

export const StoreContext = React.createContext();

export const StoreProvider = ({children}) => {
  const [state, dispatch] = useReducerWithThunk(
    reducer.Reducer,
    reducer.InitialState,
  );

  return (
    <StoreContext.Provider value={[state, dispatch]}>
      {children}
    </StoreContext.Provider>
  );
};
