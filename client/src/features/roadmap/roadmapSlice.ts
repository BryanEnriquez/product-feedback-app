import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
  createSelector,
} from '@reduxjs/toolkit';
import type { PayloadAction, Dictionary } from '@reduxjs/toolkit';
import { addFetchedUpvotes } from '../upvotes/upvotesSlice';
import { removeOneRmSuggestion, updateOneRmSuggestion } from './roadmapThunks';
import { client } from '../../client';
import type { RootState } from '../../store';
import type {
  Product,
  RoadmapStatusCount,
  ProductRequestRoadmap,
  RequestFetchStatus,
} from '../../@types';

const roadmapAdapter = createEntityAdapter<ProductRequestRoadmap>({
  selectId: (suggestion) => suggestion.productRequestId,
  sortComparer: (a, b) => b.upvotes - a.upvotes,
});

const initialState = roadmapAdapter.getInitialState<{
  page: number;
  /**
   * records in DB where `status = in-progress | live | planned`
   */
  results: number;
  loaded: number;
  /**
   * Tracks number of suggestions currently loaded
   */
  total: { [key in RoadmapStatusCount]: number };
  status: RequestFetchStatus;
  error: string | null;
  canLoadMore: boolean;
  /**
   * Holds a summary of a product's stats. Includes all categories except `suggestions`
   */
  summary: { [key in RoadmapStatusCount]: number };
  summaryStatus: RequestFetchStatus;
  summaryErr: string | null;
}>({
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

const calculateTotal = (entities: Dictionary<ProductRequestRoadmap>) => {
  const total = { all: 0, planned: 0, 'in-progress': 0, live: 0 };

  for (const keyId in entities) {
    total.all++;
    total[entities[keyId]!.status]++;
  }

  return total;
};

export const fetchRmSuggestions = createAsyncThunk<
  { data: ProductRequestRoadmap[]; results: number },
  void,
  { state: RootState; serializedErrorType: Error }
>('roadmap/fetchRmSuggestions', async (_, thunkAPI) => {
  const { page } = thunkAPI.getState().roadmap;

  const { data, results } = (await client(
    `productRequests?productId=1&status[ne]=suggestion&page=${page}&limit=${4}`
  )) as { results: number; data: { data: ProductRequestRoadmap[] } };

  thunkAPI.dispatch(
    addFetchedUpvotes(
      data.data.map(({ productRequestId, upvotes, userUpvoted = null }) => ({
        productRequestId,
        upvotes,
        upvoted: userUpvoted,
      }))
    )
  );

  return { data: data.data, results };
});

export const fetchRmSummary = createAsyncThunk<
  Product,
  void,
  { serializedErrorType: Error }
>('roadmap/fetchRmSummary', async () => {
  const { data } = await client<{ data: Product }>('products/1');

  return data.data;
});

const roadmapSlice = createSlice({
  name: 'roadmap',
  initialState,
  reducers: {
    incRoadmapCommentCount: (state, action: PayloadAction<number>) => {
      const entity = state.entities[action.payload];
      if (entity) entity.comments++;
    },
    resetRoadmapState: () => initialState,
    addOneRmSuggestion: (
      state,
      action: PayloadAction<ProductRequestRoadmap>
    ) => {
      roadmapAdapter.setOne(state, action.payload);

      state.total.all++;
      state.total[action.payload.status]++;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchRmSuggestions.pending, (state) => {
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
      .addCase(fetchRmSuggestions.rejected, (state, { error }) => {
        state.status = 'rejected';
        state.error = error.message;
      })
      .addCase(fetchRmSummary.pending, (state) => {
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
      .addCase(fetchRmSummary.rejected, (state, { error }) => {
        state.status = 'rejected';
        state.error = error.message;
      })
      .addCase(removeOneRmSuggestion, (state, action) => {
        const { productRequestId: id, status } = action.payload;

        roadmapAdapter.removeOne(state, id);

        state.total.all--;
        state.total[status]--;
      })
      .addCase(updateOneRmSuggestion, (state, { payload }) => {
        // https://redux-toolkit.js.org/api/createEntityAdapter#crud-functions
        roadmapAdapter.updateOne(state, {
          id: payload.productRequestId,
          changes: payload,
        });
        state.total = calculateTotal(state.entities);
      });
  },
});

export default roadmapSlice.reducer;

export const { resetRoadmapState, addOneRmSuggestion, incRoadmapCommentCount } =
  roadmapSlice.actions;

export const selectRmFetchStatus = (state: RootState) => state.roadmap.status;
export const selectError = (state: RootState) => state.roadmap.error;
export const selectRmTotal = (state: RootState) => state.roadmap.total;
export const selectCanLoadMore = (state: RootState) =>
  state.roadmap.canLoadMore;
export const selectRmSummary = (state: RootState) => state.roadmap.summary;
export const selectRmSummaryStatus = (state: RootState) =>
  state.roadmap.summaryStatus;
export const selectRmSummaryErr = (state: RootState) =>
  state.roadmap.summaryErr;

export const {
  selectAll: selectAllRmSuggestions,
  selectById: selectRmSuggestionById,
} = roadmapAdapter.getSelectors((state: RootState) => state.roadmap);

export const selectRmGroups = createSelector(
  [selectAllRmSuggestions],
  (suggestions) => {
    const planned: ProductRequestRoadmap[] = [];
    const inProgress: ProductRequestRoadmap[] = [];
    const live: ProductRequestRoadmap[] = [];

    suggestions.forEach((el) => {
      if (el.status === 'planned') planned.push(el);
      else if (el.status === 'in-progress') inProgress.push(el);
      else if (el.status === 'live') live.push(el);
    });

    return [planned, inProgress, live] as [
      planned: typeof planned,
      inProgress: typeof inProgress,
      live: typeof live
    ];
  }
);
