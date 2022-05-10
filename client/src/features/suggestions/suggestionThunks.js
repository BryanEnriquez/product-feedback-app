import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { addFetchedUpvotes } from '../upvotes/upvotesSlice';
import { addOneSuggestion } from './suggestionsSlice';
import { addOneRmSuggestion } from '../roadmap/roadmapSlice';

export const fetchSuggestions = createAsyncThunk(
  'suggestions/fetchSuggestions',
  async (_, thunkAPI) => {
    const { page } = thunkAPI.getState().suggestions;

    const { data } = await axios.get('/api/v1/productRequests', {
      params: {
        productId: 1,
        status: 'suggestion',
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

export const fetchOneSuggestion = createAsyncThunk(
  'suggestions/fetchOneSuggestion',
  async (id, thunkAPI) => {
    const [suggestion, upvote] = await Promise.allSettled([
      axios.get(`/api/v1/productRequests/${id}`),
      axios.get('/api/v1/upvotes/user', { params: { ids: id } }),
    ]);

    if (suggestion.status !== 'fulfilled') {
      const reason =
        suggestion.reason.response.status === 404
          ? "This suggestion doesn't exist!"
          : 'Server error. Try again later.';
      return thunkAPI.rejectWithValue(reason);
    }

    // A value of null simply disables the upvote feature
    let upvoted = null;
    if (upvote.status === 'fulfilled') {
      if (upvote.value.data.data.upvotes[0]) upvoted = true;
      else upvoted = false;
    }

    const suggestionVal = suggestion.value.data.data.data;

    thunkAPI.dispatch(
      addFetchedUpvotes([
        {
          productRequestId: suggestionVal.productRequestId,
          upvotes: suggestionVal.upvotes,
          upvoted,
        },
      ])
    );

    thunkAPI.dispatch(
      suggestionVal.status === 'suggestion'
        ? addOneSuggestion(suggestionVal)
        : addOneRmSuggestion(suggestionVal)
    );
  }
);
