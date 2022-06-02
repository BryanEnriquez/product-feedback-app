import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
  createSelector,
} from '@reduxjs/toolkit';
import axios from 'axios';
import { addFetchedUpvotes } from '../upvotes/upvotesSlice';
import { removeOneRmSuggestion, updateOneRmSuggestion } from './roadmapExtras';

const roadmapAdapter = createEntityAdapter({
  selectId: suggestion => suggestion.productRequestId,
  sortComparer: (a, b) => b.upvotes - a.upvotes,
});

const initialState = roadmapAdapter.getInitialState({
  page: 1,
  results: 0,
  loaded: 0,
  total: {
    all: 0,
    planned: 0,
    'in-progress': 0,
    live: 0,
  },
  status: 'idle',
  error: null,
  canLoadMore: false,
  summary: { all: 0, planned: 0, 'in-progress': 0, live: 0 },
  summaryStatus: 'idle',
  summaryErr: null,
});

const calculateTotal = entities => {
  const total = { all: 0, planned: 0, 'in-progress': 0, live: 0 };

  for (const keyId in entities) {
    total.all++;
    total[entities[keyId].status]++;
  }

  return total;
};

export const fetchRmSuggestions = createAsyncThunk(
  'roadmap/fetchRmSuggestions',
  async (_, thunkAPI) => {
    const { page } = thunkAPI.getState().roadmap;

    const { data } = await axios.get('/api/v1/productRequests', {
      params: {
        productId: 1,
        'status[ne]': 'suggestion',
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

export const fetchRmSummary = createAsyncThunk(
  'roadmap/fetchRmSummary',
  async () => {
    const { data } = await axios.get('/api/v1/products/1');
    return data.data.data;
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

      state.total.all++;
      state.total[action.payload.status]++;
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

        roadmapAdapter.setMany(state, data);

        state.total = calculateTotal(state.entities);

        state.loaded = state.ids.length;

        state.canLoadMore = state.results > state.loaded;
      })
      .addCase(fetchRmSuggestions.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.error.message;
      })
      .addCase(fetchRmSummary.pending, state => {
        state.summaryStatus = 'pending';
      })
      .addCase(fetchRmSummary.fulfilled, (state, action) => {
        const { live, planned, inProgress } = action.payload;

        state.summaryStatus = 'fulfilled';
        state.summary = {
          all: live + planned + inProgress,
          planned,
          'in-progress': inProgress,
          live,
        };
      })
      .addCase(fetchRmSummary.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.error.message;
      })
      .addCase(removeOneRmSuggestion, (state, action) => {
        const { productRequestId: id, status } = action.payload;

        roadmapAdapter.removeOne(state, id);

        state.total.all--;
        state.total[status]--;
      })
      .addCase(updateOneRmSuggestion, (state, action) => {
        roadmapAdapter.setOne(state, action.payload);
        state.total = calculateTotal(state.entities);
      });
  },
});

export default roadmapSlice.reducer;

export const { resetRoadmapState, addOneRmSuggestion, incRoadmapCommentCount } =
  roadmapSlice.actions;

///// Selectors /////
export const selectRmFetchStatus = state => state.roadmap.status;
export const selectError = state => state.roadmap.error;
export const selectRmTotal = state => state.roadmap.total;
export const selectCanLoadMore = state => state.roadmap.canLoadMore;
export const selectRmSummary = state => state.roadmap.summary;
export const selectRmSummaryStatus = state => state.roadmap.summaryStatus;
export const selectRmSummaryErr = state => state.roadmap.summaryErr;

export const {
  selectAll: selectAllRmSuggestions,
  selectById: selectRmSuggestionById,
} = roadmapAdapter.getSelectors(state => state.roadmap);

export const selectRmGroups = createSelector(
  [selectAllRmSuggestions],
  suggestions => {
    const planned = [];
    const inProgress = [];
    const live = [];

    // Data should already be sorted due to sort comparer
    suggestions.forEach(el => {
      if (el.status === 'planned') planned.push(el);
      else if (el.status === 'in-progress') inProgress.push(el);
      else if (el.status === 'live') live.push(el);
    });

    return [planned, inProgress, live];
  }
);
