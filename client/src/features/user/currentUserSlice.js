import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { resetSuggestState } from '../suggestions/suggestionsSlice';
import { resetRoadmapState } from '../roadmap/roadmapSlice';

const FEATURE = 'currentUser';

const initialState = {
  user: null,
  status: 'idle',
  error: null,
  invalidFbIds: {},
};

export const fetchCurrentUser = createAsyncThunk(
  `${FEATURE}/fetchCurrentUser`,
  async () => {
    const { data } = await axios.get(
      `${process.env.REACT_APP_API}/users/loginStatus`
    );

    return data.user || false;
  }
);

export const login = createAsyncThunk(
  `${FEATURE}/login`,
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API}/users/login`,
        {
          email,
          password,
        }
      );

      // Reset data
      dispatch(resetSuggestState());
      dispatch(resetRoadmapState());

      return data.data.user;
    } catch (err) {
      return rejectWithValue(
        err.response.data?.message || 'Server error. Try again later.'
      );
    }
  }
);

export const logout = createAsyncThunk(`${FEATURE}/logout`, async () => {
  await axios.get(`${process.env.REACT_APP_API}/users/logout`);

  return null;
});

const currentUserSlice = createSlice({
  name: FEATURE,
  initialState,
  reducers: {
    addInvalidFbId: (state, action) => {
      state.invalidFbIds[action.payload] = true;
    },
    updateBasicInfo: (state, action) => {
      const { firstName, lastName } = action.payload;

      state.user.firstName = firstName;
      state.user.lastName = lastName;
    },
    updateUserImg: (state, action) => {
      state.user.profileImg = action.payload;
    },
  },
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
        state.user = false;
      });
  },
});

export default currentUserSlice.reducer;

///// Action creators /////
export const { addInvalidFbId, updateBasicInfo, updateUserImg } =
  currentUserSlice.actions;

///// Selectors /////
export const selectCurrentUser = state => state.currentUser.user;
export const selectStatus = state => state.currentUser.status;
export const findInvalidFbId = (state, id) =>
  state.currentUser.invalidFbIds[id];
