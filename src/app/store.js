import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage 사용
import { combineReducers } from 'redux';

import userReducer from '../features/userSlice';
import reservationReducer from '../features/reservationSlice';
import filterReducer from '../features/filterSlice';
import searchReducer from '../features/searchSlice';
import likedHotelsReducer from '../features/likedHotelsSlice';

const rootReducer = combineReducers({
  user: userReducer,
  reservation: reservationReducer,
  filter: filterReducer,
  search: searchReducer,
  likedHotels: likedHotelsReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['likedHotels'], // 🔥 이 부분이 핵심!
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);