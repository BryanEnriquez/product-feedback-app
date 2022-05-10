import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { resetSuggestState } from '../suggestions/suggestionsSlice';

const FEATURE = 'currentUser';

const initialState = { user: null, status: 'idle', error: null };

export const fetchCurrentUser = createAsyncThunk(
  `${FEATURE}/fetchCurrentUser`,
  async () => {
    const { data } = await axios.get('/api/v1/users/loginStatus');

    return data.user || null;
  }
);

export const login = createAsyncThunk(
  `${FEATURE}/login`,
  async ({ email, password }, thunkAPI) => {
    try {
      const { data } = await axios.post('/api/v1/users/login', {
        email,
        password,
      });

      // Reset data
      thunkAPI.dispatch(resetSuggestState());

      return data.data.user;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response.data?.message || 'Server error. Try again later.'
      );
    }
  }
);

export const logout = createAsyncThunk(`${FEATURE}/logout`, async () => {
  await axios.get('/api/v1/users/logout');

  return null;
});

const currentUserSlice = createSlice({
  name: FEATURE,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchCurrentUser.pending, state => {
        state.status = 'pending';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'fulfilled';
        state.user = action.payload;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logout.fulfilled, state => {
        state.user = null;
      });
  },
});

export default currentUserSlice.reducer;

///// Action creators /////
// export const { ___, __ } = currentUserSlice.actions;

///// Selectors /////
export const selectCurrentUser = state => state.currentUser.user;
export const selectStatus = state => state.currentUser.status;
