import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { resetSuggestState } from '../suggestions/suggestionsSlice';
import { resetRoadmapState } from '../roadmap/roadmapSlice';
import { client } from '../../client';
import type { RootState } from '../../store';
import type { CurrentUser, CurrentUserStates } from '../../@types';

const CURRENT_USER = 'currentUser';

export type CurrentUserState = {
  /**
   * `null` = Currently not known, `false` = `api/v1/loginStatus` returned no user
   */
  user: CurrentUserStates;
  status: 'idle' | 'pending' | 'fulfilled';
  error: null | string;
  /**
   * Holds invalidated feedback ids
   */
  invalidFbIds: {
    [id: string]: true | undefined;
  };
};

const initalState: CurrentUserState = {
  user: null,
  status: 'idle',
  error: null,
  invalidFbIds: {},
};

export const fetchCurrentUser = createAsyncThunk(
  `${CURRENT_USER}/fetchCurrentUser`,
  async () => {
    const res = await client<{ user: CurrentUser | null }>('users/loginStatus');

    return res.data.user || false;
  }
);

// https://redux-toolkit.js.org/api/createAsyncThunk
export const login = createAsyncThunk(
  `${CURRENT_USER}/login`,
  async (
    { email, password }: { email: string; password: string },
    { dispatch }
  ) => {
    const { data } = await client<{ user: CurrentUser }>('users/login', {
      method: 'POST',
      body: { email, password },
    });

    dispatch(resetSuggestState());
    dispatch(resetRoadmapState());

    return data.user;
  }
);

export const logout = createAsyncThunk(`${CURRENT_USER}/logout`, async () => {
  await client('users/logout');

  return null;
});

const currentUserSlice = createSlice({
  name: CURRENT_USER,
  initialState: initalState,
  reducers: {
    addInvalidFbId: (state, action: PayloadAction<number>) => {
      state.invalidFbIds[action.payload] = true;
    },
    updateBasicInfo: (
      state,
      action: PayloadAction<{ firstName: string; lastName: string }>
    ) => {
      const { firstName, lastName } = action.payload;

      if (state.user) {
        state.user.firstName = firstName;
        state.user.lastName = lastName;
      }
    },
    updateUserImg: (state, action: PayloadAction<string>) => {
      if (state.user) state.user.profileImg = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'fulfilled';
        state.user = action.payload;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = false;
      });
  },
});

export default currentUserSlice.reducer;

export const { addInvalidFbId, updateBasicInfo, updateUserImg } =
  currentUserSlice.actions;

export const selectCurrentUser = (state: RootState) => state.currentUser.user;
export const selectStatus = (state: RootState) => state.currentUser.status;
export const findInvalidFeedbackId = (state: RootState, id: number) =>
  state.currentUser.invalidFbIds[id];
