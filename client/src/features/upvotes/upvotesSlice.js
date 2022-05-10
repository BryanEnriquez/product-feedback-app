import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { upvoteAdded, upvoteRemoved } from './upvoteThunks';

const upvotesAdapter = createEntityAdapter({
  selectId: upvote => upvote.productRequestId,
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
      .addCase(upvoteAdded.fulfilled, (state, action) => {
        state.entities[action.payload].upvoted = true;
        state.entities[action.payload].upvotes++;
      })
      .addCase(upvoteRemoved.fulfilled, (state, action) => {
        state.entities[action.payload].upvoted = false;
        state.entities[action.payload].upvotes--;
      });
  },
});

export default upvotesSlice.reducer;

///// Action creators /////
export const { addFetchedUpvotes } = upvotesSlice.actions;

///// Selectors /////
export const { selectById: selectByUpvoteId } = upvotesAdapter.getSelectors(
  state => state.upvotes
);
