import { createAsyncThunk, createAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { incSuggestCommentCount } from '../suggestions/suggestionsSlice';
import { incRoadmapCommentCount } from '../roadmap/roadmapSlice';

export const calculateCommentStats = createAction(
  'comments/calculateCommentStats'
);

export const resetComments = createAction('comments/resetComments');

export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async ({ id, reset = false }, thunkAPI) => {
    const page = reset ? 1 : thunkAPI.getState().comments.page;

    try {
      const { data } = await axios.get(
        `/api/v1/productRequests/${id}/comments`,
        { params: { page, limit: 1 } }
      );

      if (reset) thunkAPI.dispatch(resetComments());

      return { comments: data.data.comments, id, nextPage: page + 1 };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);

export const postComment = createAsyncThunk(
  'comments/postComment',
  async ({ content, productRequestId, parentId }, thunkAPI) => {
    const state = thunkAPI.getState();

    let feedback = state.suggestions.entities[productRequestId];
    if (!feedback) feedback = state.roadmap.entities[productRequestId];

    try {
      const { data } = await axios.post('/api/v1/comments', {
        content,
        productRequestId,
        ...(parentId && { parentId }),
      });

      thunkAPI.dispatch(
        (feedback.status === 'suggestion'
          ? incSuggestCommentCount
          : incRoadmapCommentCount)(feedback.productRequestId)
      );

      const { comment } = data.data;

      if (!comment.depth) comment.Comments = [];

      return comment;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  }
);
