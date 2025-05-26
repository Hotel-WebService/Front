import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    location: '',
    checkin: null,
    checkout: null,
    guests: 1,
};

const reservationSlice = createSlice({
    name: 'reservation',
    initialState,
    reducers: {
        setLocation(state, action) {
            state.location = action.payload;
        },
        setCheckin(state, action) {
            state.checkin = action.payload;
        },
        setCheckout(state, action) {
            state.checkout = action.payload;
        },
        setGuests(state, action) {
            state.guests = action.payload;
        },
        setDateRange(state, action) {
            state.dateRange = action.payload;
        },
    },
});

export const { setLocation, setCheckin, setCheckout, setGuests, setDateRange } = reservationSlice.actions;
export default reservationSlice.reducer;