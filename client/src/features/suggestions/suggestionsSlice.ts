import {
  createSlice,
  createEntityAdapter,
  createSelector,
} from '@reduxjs/toolkit';
import type { PayloadAction, Dictionary } from '@reduxjs/toolkit';
import {
  addOneSuggestion,
  fetchSuggestions,
  removeOneSuggestion,
  updateOneSuggestion,
} from './suggestionsThunks';
import type {
  ProductRequestSuggestion,
  FeedbackCategory,
  SuggestionsSortBy,
  RequestFetchStatus,
} from '../../@types';
import type { RootState } from '../../store';

const suggestionsAdapter = createEntityAdapter<ProductRequestSuggestion>({
  selectId: (suggestion) => suggestion.productRequestId,
  sortComparer: (a, b) => a.productRequestId - b.productRequestId,
});

const initialState = suggestionsAdapter.getInitialState<{
  page: number;
  /**
   * Count in DB
   */
  results: number;
  loaded: number;
  total: {
    [key in FeedbackCategory]: number;
  };
  sortBy: SuggestionsSortBy;
  category: FeedbackCategory;
  status: RequestFetchStatus;
  error: null | string;
  canLoadMore: boolean;
}>({
  page: 1,
  results: 0,
  loaded: 0,
  total: {
    all: 0,
    ui: 0,
    ux: 0,
    bug: 0,
    feature: 0,
    enhancement: 0,
  },
  sortBy: { id: 'most_upvotes', label: 'Most Upvotes' },
  category: 'all',
  status: 'idle',
  error: null,
  canLoadMore: false,
});

const calculateTotal = (entities: Dictionary<ProductRequestSuggestion>) => {
  const total = { all: 0, ui: 0, ux: 0, bug: 0, feature: 0, enhancement: 0 };

  for (const fbId in entities) {
    total.all++;
    total[entities[fbId]!.category]++;
  }

  return total;
};

const suggestionsSlice = createSlice({
  name: 'suggestions',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<FeedbackCategory>) => {
      state.category = action.payload;
    },
    setSort: (state, action: PayloadAction<SuggestionsSortBy>) => {
      state.sortBy = action.payload;
    },
    incSuggestCommentCount: (state, action: PayloadAction<number>) => {
      const entity = state.entities[action.payload];
      if (entity) entity.comments++;
    },
    resetSuggestState: () => initialState,
  },
  extraReducers(builder) {
    builder
      .addCase(fetchSuggestions.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchSuggestions.fulfilled, (state, { payload }) => {
        const { data, results } = payload;

        state.status = 'fulfilled';
        state.page++;
        state.results = results;

        suggestionsAdapter.setMany(state, data);

        state.total = calculateTotal(state.entities);

        state.loaded = state.ids.length;

        state.canLoadMore = state.results > state.loaded;
      })
      .addCase(fetchSuggestions.rejected, (state, { error }) => {
        state.status = 'rejected';
        state.error = error.message;
      })
      .addCase(addOneSuggestion, (state, { payload }) => {
        suggestionsAdapter.setOne(state, payload);

        state.total.all++;
        state.total[payload.category]++;
      })
      .addCase(removeOneSuggestion, (state, { payload }) => {
        const { productRequestId: id, category } = payload;

        suggestionsAdapter.removeOne(state, id);

        state.total.all--;
        state.total[category]--;
      })
      .addCase(updateOneSuggestion, (state, { payload }) => {
        suggestionsAdapter.updateOne(state, {
          id: payload.productRequestId,
          changes: payload,
        });
      });
  },
});

export default suggestionsSlice.reducer;

export const {
  setCategory,
  setSort,
  resetSuggestState,
  incSuggestCommentCount,
} = suggestionsSlice.actions;

export const selectSuggestFetchStatus = (state: RootState) =>
  state.suggestions.status;
export const selectError = (state: RootState) => state.suggestions.error;
export const selectCategory = (state: RootState) => state.suggestions.category;
export const selectSortBy = (state: RootState) => state.suggestions.sortBy;
export const selectSortOptionId = (state: RootState) => selectSortBy(state).id;
export const selectCounters = (state: RootState) => state.suggestions.total;
export const selectCanLoadMore = (state: RootState) =>
  state.suggestions.canLoadMore;
export const selectSuggestionsTotals = (state: RootState) =>
  state.suggestions.total.all;

export const {
  selectAll: selectAllSuggestions,
  selectById: selectSuggestionById,
} = suggestionsAdapter.getSelectors((state: RootState) => state.suggestions);

export const selectFilteredList = createSelector(
  [
    selectAllSuggestions,
    (_: RootState, category: FeedbackCategory) => category,
  ],
  // Recalculated on array reference or category change
  (suggestions, category) =>
    category === 'all'
      ? suggestions
      : suggestions.filter((el) => el.category === category)
);
