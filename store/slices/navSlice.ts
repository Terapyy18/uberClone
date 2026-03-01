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
    rideInfo: {
        id: string;
        title: string;
        price: number;
        multiplier: number;
        capacity: string;
        image: any; // ImageSourcePropType — peut être un require() local ou une URI
    } | null;
    rideHistory: Array<{
        origin: string;
        destination: string;
        price: number;
        title: string;
        date: string;
        distance: number;
    }>;
}

const initialState: NavState = {
    origin: null,
    destination: null,
    distance: null,
    duration: null,
    travelMode: 'DRIVING',
    rideInfo: null,
    rideHistory: [],
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
        setRideInfo: (state, action: PayloadAction<NavState['rideInfo']>) => {
            state.rideInfo = action.payload;
        },
        addRideToHistory: (state, action: PayloadAction<NavState['rideHistory'][0]>) => {
            state.rideHistory = [action.payload, ...state.rideHistory];
        },
    }
});

export const { setOrigin, setDestination, setDistance, setDuration, setTravelMode, setRideInfo, addRideToHistory } = navSlice.actions;

export const selectOrigin = (state: any) => state.nav.origin;
export const selectDestination = (state: any) => state.nav.destination;
export const selectDistance = (state: any) => state.nav.distance;
export const selectDuration = (state: any) => state.nav.duration;
export const selectTravelMode = (state: any) => state.nav.travelMode;
export const selectRideInfo = (state: any) => state.nav.rideInfo;
export const selectRideHistory = (state: any) => state.nav.rideHistory;

export default navSlice.reducer;
