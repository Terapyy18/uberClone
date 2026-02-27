import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    session: any | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    session: null,
    isAuthenticated: false,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setSession: (state, action: PayloadAction<any | null>) => {
            state.session = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        clearSession: (state) => {
            state.session = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setSession, clearSession } = authSlice.actions;

export default authSlice.reducer;
