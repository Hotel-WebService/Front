import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  username: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLogin(state, action) {
      state.isAuthenticated = true;
      state.username = action.payload;
    },
    setLogout(state) {
      state.isAuthenticated = false;
      state.username = '';
    },
  },
});

export const { setLogin, setLogout } = userSlice.actions;
export default userSlice.reducer;