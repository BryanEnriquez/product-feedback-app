import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { addFetchedUpvotes } from '../upvotes/upvotesSlice';
import axios from 'axios';

const roadmapAdapter = createEntityAdapter({
  selectId: suggestion => suggestion.productRequestId,
  sortComparer: (a, b) => b.upvotes - a.upvotes,
});

const initialState = roadmapAdapter.getInitialState({
  page: 1,
  results: 0,
  loaded: 0,
  total: {
    planned: 0,
    'in-progress': 0,
    live: 0,
  },
  status: 'idle',
  error: null,
  canLoadMore: false,
});

export const fetchRmSuggestions = createAsyncThunk(
  'roadmap/fetchRmSuggestions',
  async (_, thunkAPI) => {
    const { page } = thunkAPI.getState().roadmap;

    const { data } = await axios.get('/api/v1/productRequests', {
      params: {
        productId: 1,
        status: { ne: 'suggestion' },
        page,
        limit: 4,
      },
    });

    const results = data.data.data;

    thunkAPI.dispatch(
      addFetchedUpvotes(
        results.map(({ productRequestId, upvotes, userUpvoted = null }) => ({
          productRequestId,
          upvotes,
          upvoted: userUpvoted,
        }))
      )
    );

    return { data: results, results: data.results };
  }
);

const roadmapSlice = createSlice({
  name: 'roadmap',
  initialState,
  reducers: {
    incRoadmapCommentCount: (state, action) => {
      state.entities[action.payload].comments++;
    },
    resetRoadmapState: () => initialState,
    addOneRmSuggestion: (state, action) => {
      roadmapAdapter.setOne(state, action.payload);

      Object.values(state.entities).forEach(el => {
        state.total[el.status]++;
      });
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchRmSuggestions.pending, state => {
        state.status = 'pending';
      })
      .addCase(fetchRmSuggestions.fulfilled, (state, action) => {
        const { data, results } = action.payload;

        state.status = 'fulfilled';
        state.page++;
        state.results = results;

        state.total = { planned: 0, 'in-progress': 0, live: 0 };

        roadmapAdapter.setMany(state, data);

        Object.values(state.entities).forEach(el => {
          state.total[el.status]++;
        });

        state.loaded = state.ids.length;

        state.canLoadMore = state.results > state.loaded;
      })
      .addCase(fetchRmSuggestions.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.error.message;
      });
  },
});

export default roadmapSlice.reducer;

export const { resetRoadmapState, addOneRmSuggestion, incRoadmapCommentCount } =
  roadmapSlice.actions;

///// Selectors /////
export const selectRmFetchStatus = state => state.roadmap.status;
export const selectError = state => state.roadmap.error;
export const selectCounters = state => state.roadmap.total;
export const selectCanLoadMore = state => state.roadmap.canLoadMore;

export const {
  selectAll: selectAllRmSuggestions,
  selectById: selectRmSuggestionById,
} = roadmapAdapter.getSelectors(state => state.roadmap);
