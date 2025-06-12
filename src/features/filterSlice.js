import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sortOption: 'rating',
  filters: {
    services: [],
    star: null,
    price: 1000000,
  }
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setSortOption(state, action) {
      state.sortOption = action.payload;
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    toggleService(state, action) {
      const value = action.payload;
      if (state.filters.services.includes(value)) {
        state.filters.services = state.filters.services.filter(s => s !== value);
      } else {
        state.filters.services.push(value);
      }
    },
  },
});

export const { setSortOption, setFilters, toggleService } = filterSlice.actions;
export default filterSlice.reducer;