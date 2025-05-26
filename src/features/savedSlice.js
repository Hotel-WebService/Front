import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  savedHotels: [],
};

const savedSlice = createSlice({
  name: 'saved',
  initialState,
  reducers: {
    addSavedHotel(state, action) {
      state.savedHotels.push(action.payload);
    },
    removeSavedHotel(state, action) {
      state.savedHotels = state.savedHotels.filter(hotel => hotel.id !== action.payload);
    },
  },
});

export const { addSavedHotel, removeSavedHotel } = savedSlice.actions;
export default savedSlice.reducer;