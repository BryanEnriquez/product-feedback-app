import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { upvoteAdded, upvoteRemoved } from './upvotesThunks';
import type { UpvoteTracked } from '../../@types';
import type { RootState } from '../../store';

const upvotesAdapter = createEntityAdapter<UpvoteTracked>({
  selectId: (upvote) => upvote.productRequestId,
});

const initialState = upvotesAdapter.getInitialState();

const upvotesSlice = createSlice({
  name: 'upvotes',
  initialState,
  reducers: {
    addFetchedUpvotes: upvotesAdapter.setMany,
  },
  extraReducers(builder) {
    builder
      .addCase(
        upvoteAdded.fulfilled,
        (state, action: PayloadAction<number>) => {
          const upvote = state.entities[action.payload];
          if (upvote) {
            upvote.upvoted = true;
            upvote.upvotes++;
          }
        }
      )
      .addCase(
        upvoteRemoved.fulfilled,
        (state, action: PayloadAction<number>) => {
          const upvote = state.entities[action.payload];
          if (upvote) {
            upvote.upvoted = false;
            upvote.upvotes--;
          }
        }
      );
  },
});

export default upvotesSlice.reducer;

export const { addFetchedUpvotes } = upvotesSlice.actions;

export const { selectById: selectUpvoteById } = upvotesAdapter.getSelectors(
  (state: RootState) => state.upvotes
);
