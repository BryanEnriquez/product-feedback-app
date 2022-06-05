import { createAsyncThunk, createAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { addFetchedUpvotes } from '../upvotes/upvotesSlice';
import { addOneRmSuggestion } from '../roadmap/roadmapSlice';
import {
  removeOneRmSuggestion,
  updateOneRmSuggestion,
} from '../roadmap/roadmapExtras';

export const addOneSuggestion = createAction('suggestions/addOneSuggestion');

export const removeOneSuggestion = createAction(
  'suggestion/removeOneSuggestion'
);

export const updateOneSuggestion = createAction(
  'suggestions/updateOneSuggestion'
);

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
  async ({ id, currentUser }, thunkAPI) => {
    const requests = [];

    requests.push(axios.get(`/api/v1/productRequests/${id}`));
    if (currentUser)
      requests.push(axios.get('/api/v1/upvotes/user', { params: { ids: id } }));

    const [suggestion, upvote] = await Promise.allSettled(requests);

    if (suggestion.status !== 'fulfilled') {
      const reason =
        suggestion.reason.response.status === 404
          ? "This suggestion doesn't exist!"
          : 'Server error. Try again later.';
      return thunkAPI.rejectWithValue(reason);
    }

    // A value of null simply disables the upvote feature
    let upvoted = null;
    // 2nd request isn't made if not logged in
    if (currentUser && upvote.status === 'fulfilled') {
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

export const submitSuggestion = createAsyncThunk(
  'suggestions/submitSuggestion',
  async ({ title, description, category }, thunkAPI) => {
    try {
      const { data } = await axios.post('/api/v1/productRequests', {
        productId: 1,
        title,
        description,
        category: category.label.toLowerCase(),
      });

      const newSuggestion = data.data.data;

      // Starts as not upvoted by user
      thunkAPI.dispatch(
        addFetchedUpvotes([
          {
            productRequestId: newSuggestion.productRequestId,
            upvotes: newSuggestion.upvotes,
            upvoted: false,
          },
        ])
      );

      thunkAPI.dispatch(addOneSuggestion(newSuggestion));

      // Not processed by reducer but used for redirect link
      return newSuggestion.productRequestId;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);

export const updateFeedback = createAsyncThunk(
  'suggestions/updateFeedback',
  async ({ prevFb, updatedFb }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axios.patch(
        `/api/v1/productRequests/${prevFb.productRequestId}`,
        {
          title: updatedFb.title,
          description: updatedFb.description,
          category: updatedFb.category,
          status: updatedFb.status,
          accountUid: prevFb.accountUid,
        }
      );

      const newFb = data.data.data;

      if (prevFb.status === newFb.status) {
        // status is the same
        dispatch(
          (prevFb.status === 'suggestion'
            ? updateOneSuggestion
            : updateOneRmSuggestion)(newFb)
        );
      } else if (prevFb.status === 'suggestion') {
        // Move from suggestions to roadmap
        dispatch(
          removeOneSuggestion({
            productRequestId: prevFb.productRequestId,
            category: prevFb.category,
          })
        );
        dispatch(addOneRmSuggestion(newFb));
      } else if (newFb.status === 'suggestion') {
        // Move from roadmap to suggestions
        dispatch(
          removeOneRmSuggestion({
            productRequestId: prevFb.productRequestId,
            status: prevFb.status,
          })
        );
        dispatch(addOneSuggestion(newFb));
      } else {
        // status was never 'suggestion' at any point
        dispatch(updateOneRmSuggestion(newFb));
      }
    } catch (err) {
      rejectWithValue(
        err.response.data?.message || 'Failed to update feedback.'
      );
    }
  }
);

export const deleteFeedback = createAsyncThunk(
  'suggestions/deleteFeedback',
  async (feedback, { dispatch, rejectWithValue }) => {
    try {
      await axios.delete(
        `/api/v1/productRequests/${feedback.productRequestId}`,
        { data: { accountUid: feedback.accountUid } }
      );

      dispatch(
        (feedback.status === 'suggestion'
          ? removeOneSuggestion
          : removeOneRmSuggestion)(feedback)
      );
    } catch (err) {
      rejectWithValue(
        err.response.data?.message || 'Failed to delete feedback.'
      );
    }
  }
);
