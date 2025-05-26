import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  destination: '',
  startDate: null,
  endDate: null,
  people: 1
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setDestination: (state, action) => {
      state.destination = action.payload;
    },
    setDates: (state, action) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
    setPeople: (state, action) => {
      state.people = action.payload;
    },
    resetSearch: () => initialState
  },
});

export const { setDestination, setDates, setPeople, resetSearch } = searchSlice.actions;
export default searchSlice.reducer;