import { createSlice } from '@reduxjs/toolkit';

const likedHotelsSlice = createSlice({
  name: 'likedHotels',
  initialState: [],
  reducers: {
    toggleLike: (state, action) => {
      const hotel = action.payload;
      const exists = state.find(h => h.id === hotel.id);
      if (exists) {
        return state.filter(h => h.id !== hotel.id);
      } else {
        return [...state, hotel];
      }
    },
  },
}); 

export const { toggleLike, clearLikes } = likedHotelsSlice.actions;
export default likedHotelsSlice.reducer;