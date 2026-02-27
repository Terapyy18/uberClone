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
    duration: number | null;
    travelMode: 'DRIVING' | 'BICYCLING' | 'TRANSIT' | 'WALKING';
}

const initialState: NavState = {
    origin: null,
    destination: null,
    distance: null,
    duration: null,
    travelMode: 'DRIVING',
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
        },
        setDuration: (state, action: PayloadAction<number | null>) => {
            state.duration = action.payload;
        },
        setTravelMode: (state, action: PayloadAction<'DRIVING' | 'BICYCLING' | 'TRANSIT' | 'WALKING'>) => {
            state.travelMode = action.payload;
        },
    }
});

export const { setOrigin, setDestination, setDistance, setDuration, setTravelMode } = navSlice.actions;

export const selectOrigin = (state: any) => state.nav.origin;
export const selectDestination = (state: any) => state.nav.destination;
export const selectDistance = (state: any) => state.nav.distance;
export const selectDuration = (state: any) => state.nav.duration;
export const selectTravelMode = (state: any) => state.nav.travelMode;

export default navSlice.reducer;
