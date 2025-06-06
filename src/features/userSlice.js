import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isAuthenticated: false,
    userID: '',
    username: '',
    email: '',
    loginID: '',
    punNumber: '',
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setLogin(state, action) {
            state.isAuthenticated = true;
            state.username = action.payload;
        },
        setUserInfo(state, action) {
            const { userID, username, email, loginID, punNumber } = action.payload; // 백엔드추가
            state.userID = userID;
            state.username = username;
            state.email = email;
            state.loginID = loginID;
            state.punNumber = punNumber;
            state.isAuthenticated = true;
        },
        updateUserInfo(state, action) {
            const { email, punNumber } = action.payload;
            if (email !== undefined) state.email = email;
            if (punNumber !== undefined) state.punNumber = punNumber;
        },
        setLogout(state) {
            state.isAuthenticated = false;
            state.userID = '';
            state.username = '';
            state.email = '';
            state.loginID = '';
            state.punNumber = '';
        },
    },
});

export const { setLogin, setLogout, setUserInfo, updateUserInfo } = userSlice.actions;
export default userSlice.reducer;