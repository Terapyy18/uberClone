import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LocationState {
    location: {
        lat: number;
        lng: number;
    } | null;
    description: string | null;
}

interface NavState {
    origin: LocationState | null;
    destination: LocationState | null;
    distance: number | null;
}

const initialState: NavState = {
    origin: null,
    destination: null,
    distance: null,
}

export const navSlice = createSlice({
    name: 'nav',
    initialState,
    reducers: {
        setOrigin: (state, action: PayloadAction<LocationState | null>) => {
            state.origin = action.payload;
        },
        setDestination: (state, action: PayloadAction<LocationState | null>) => {
            state.destination = action.payload;
        },
        setDistance: (state, action: PayloadAction<number | null>) => {
            state.distance = action.payload;
        }
    }
});

export const { setOrigin, setDestination, setDistance } = navSlice.actions;

export const selectOrigin = (state: any) => state.nav.origin;
export const selectDestination = (state: any) => state.nav.destination;
export const selectDistance = (state: any) => state.nav.distance;

export default navSlice.reducer;
