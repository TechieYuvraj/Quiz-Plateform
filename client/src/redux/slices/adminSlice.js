// redux/slice/adminSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAdminLoggedIn: false,
    admin: null,
};

const adminSlice = createSlice({
    name: "adminAuth",
    initialState,
    reducers: {
        loginAdmin(state, action) {
            state.isAdminLoggedIn = true;
            state.admin = action.payload;
        },
        logoutAdmin(state) {
            state.isAdminLoggedIn = false;
            state.admin = null;
        },
    },
});

export const { loginAdmin, logoutAdmin } = adminSlice.actions;
export default adminSlice.reducer;
