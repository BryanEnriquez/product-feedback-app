import {
  createSlice,
  createEntityAdapter,
  createSelector,
} from '@reduxjs/toolkit';
import {
  fetchSuggestions,
  addOneSuggestion,
  removeOneSuggestion,
  updateOneSuggestion,
} from './suggestionThunks';

const suggestionsAdapter = createEntityAdapter({
  selectId: suggestion => suggestion.productRequestId,
  sortComparer: (a, b) => a.productRequestId - b.productRequestId,
});

const initialState = suggestionsAdapter.getInitialState({
  page: 1,
  results: 0, // Count in DB
  loaded: 0, // Count in App
  total: {
    all: 0,
    ui: 0,
    ux: 0,
    bug: 0,
    feature: 0,
    enhancement: 0,
  },
  sortBy: 'most_upvotes',
  category: 'all',
  status: 'idle',
  error: null,
  canLoadMore: false,
});

const calculateTotal = entities => {
  const total = { all: 0, ui: 0, ux: 0, bug: 0, feature: 0, enhancement: 0 };

  for (const fbId in entities) {
    total.all++;
    total[entities[fbId].category]++;
  }

  return total;
};

const suggestionsSlice = createSlice({
  name: 'suggestions',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.category = action.payload.toLowerCase();
    },
    setSort: (state, action) => {
      state.sortBy = action.payload;
    },
    incSuggestCommentCount: (state, action) => {
      state.entities[action.payload].comments++;
    },
    resetSuggestState: () => initialState,
  },
  extraReducers(builder) {
    builder
      .addCase(fetchSuggestions.pending, (state, action) => {
        state.status = 'pending';
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        const { data, results } = action.payload;

        state.status = 'fulfilled';
        state.page++;
        state.results = results;

        suggestionsAdapter.setMany(state, data);

        state.total = calculateTotal(state.entities);

        state.loaded = state.ids.length;

        state.canLoadMore = state.results > state.loaded;
      })
      .addCase(fetchSuggestions.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.error.message;
      })
      .addCase(addOneSuggestion, (state, action) => {
        suggestionsAdapter.setOne(state, action.payload);

        state.total.all++;
        state.total[action.payload.category]++;
      })
      .addCase(removeOneSuggestion, (state, action) => {
        const { productRequestId: id, category } = action.payload;

        suggestionsAdapter.removeOne(state, id);

        state.total.all--;
        state.total[category]--;
      })
      .addCase(updateOneSuggestion, (state, action) => {
        suggestionsAdapter.setOne(state, action.payload);
        state.total = calculateTotal(state.entities);
      });
  },
});

export default suggestionsSlice.reducer;

///// Action creators /////
export const {
  setCategory,
  setSort,
  resetSuggestState,
  incSuggestCommentCount,
} = suggestionsSlice.actions;

///// Selectors /////
export const selectSuggestFetchStatus = state => state.suggestions.status;
export const selectError = state => state.suggestions.error;
export const selectCategory = state => state.suggestions.category;
export const selectSortBy = state => state.suggestions.sortBy;
export const selectCounters = state => state.suggestions.total;
export const selectCanLoadMore = state => state.suggestions.canLoadMore;
export const selectSuggestionsTotals = state => state.suggestions.total.all;

export const {
  selectAll: selectAllSuggestions,
  selectById: selectSuggestionById,
} = suggestionsAdapter.getSelectors(state => state.suggestions);

// Memoized selectors
// Ex: useSelector(state => selectFilteredList(state, category))
export const selectFilteredList = createSelector(
  // All callbacks receive the same arguments:
  // [selectAllSuggestions(state, category), anonymousF(state, category)]
  [selectAllSuggestions, (state, category) => category],
  // Recalculated on array ref or category change
  (suggestions, category) =>
    category === 'all'
      ? suggestions
      : suggestions.filter(el => el.category === category)
);
