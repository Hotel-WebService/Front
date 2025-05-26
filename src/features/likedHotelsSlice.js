import { createSlice } from '@reduxjs/toolkit';

const likedHotelsSlice = createSlice({
  name: 'likedHotels',
  initialState: [],
  reducers: {
    toggleLike(state, action) {
      const hotel = action.payload;
      const exists = state.find(item => item.id === hotel.id);
      if (exists) {
        return state.filter(item => item.id !== hotel.id);
      } else {
        return [...state, hotel];
      }
    },
    clearLikes() {
      return [];
    }
  }
});

export const { toggleLike, clearLikes } = likedHotelsSlice.actions;
export default likedHotelsSlice.reducer;