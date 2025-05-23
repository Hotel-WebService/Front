import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/userSlice';
import reservationReducer from '../features/reservationSlice';
import filterReducer from '../features/filterSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    reservation: reservationReducer,
    filter: filterReducer,
  },
});