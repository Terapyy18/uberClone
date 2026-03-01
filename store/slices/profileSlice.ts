import { supabase } from '@/lib/supabase';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// ── Types ──────────────────────────────────────────────────────────────────
interface ProfileState {
    fullName: string | null;
    email: string | null;
    avatarUrl: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProfileState = {
    fullName: null,
    email: null,
    avatarUrl: null,
    loading: false,
    error: null,
};

// ── Thunk : charge le profil depuis auth.getUser() ─────────────────────────
export const fetchProfile = createAsyncThunk('profile/fetchProfile', async (_, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return rejectWithValue(error?.message || 'Utilisateur introuvable');
    const { user } = data;
    return {
        fullName: user.user_metadata?.full_name ?? null,
        email: user.email ?? null,
        avatarUrl: user.user_metadata?.avatar_url ?? null,
    };
});

// ── Slice ──────────────────────────────────────────────────────────────────
export const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        clearProfile: (state) => {
            state.fullName = null;
            state.email = null;
            state.avatarUrl = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfile.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.fullName = action.payload.fullName;
                state.email = action.payload.email;
                state.avatarUrl = action.payload.avatarUrl;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearProfile } = profileSlice.actions;
export const selectProfile = (state: any) => state.profile;
export default profileSlice.reducer;
