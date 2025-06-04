import { createSlice } from '@reduxjs/toolkit';

const likedHotelsSlice = createSlice({
  name: 'likedHotels',
  initialState: [],
  reducers: {
    // DB에서 받아온 hotelId 배열을 직접 세팅할 때 / 백엔드추가
    setLikedHotels: (state, action) => action.payload, // [hotelId, hotelId, ...]

    toggleLike: (state, action) => {
      const hotelID = Number(action.payload);
      if (state.includes(hotelID)) {
        return state.filter(id => id !== hotelID);
      } else {
        return [...state, hotelID];
      }
    },

    clearLikes: () => [],
  },
});

export const { setLikedHotels, toggleLike, clearLikes } = likedHotelsSlice.actions;
export default likedHotelsSlice.reducer;