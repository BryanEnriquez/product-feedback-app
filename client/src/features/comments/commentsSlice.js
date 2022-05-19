import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import {
  fetchComments,
  postComment,
  calculateCommentStats,
  resetComments,
} from './commentsThunks';

const dateComparer = (a, b) => {
  return a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0;
};

const commentsAdapter = createEntityAdapter({
  selectId: comment => comment.commentId,
  sortComparer: dateComparer,
});

const initialState = commentsAdapter.getInitialState({
  page: 1,
  total: 0,
  lastViewedFbById: null,
});

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { comments, id, nextPage } = action.payload;

        state.lastViewedFbById = id * 1;
        state.page = nextPage;

        // Sort children comments as well
        comments.forEach(comment => {
          comment.Comments = comment.Comments.slice().sort(dateComparer);
        });

        commentsAdapter.setMany(state, comments);

        // Recalculate stats
        state.total = 0;
        Object.values(state.entities).forEach(el => {
          state.total++;
          state.total += el.Comments.length;
        });
      })
      .addCase(postComment.fulfilled, (state, action) => {
        const comment = action.payload;

        if (comment.parentId) {
          state.entities[comment.parentId].Comments.push(comment);
        } else {
          commentsAdapter.setOne(state, comment);
        }
      })
      .addCase(calculateCommentStats, state => {
        state.total = 0;
        Object.values(state.entities).forEach(el => {
          state.total++;
          if (el.Comments) state.total += el.Comments.length;
        });
      })
      .addCase(resetComments, () => initialState);
  },
});

export default commentsSlice.reducer;

export const selectTotalComments = state => state.comments.total;
export const selectLastViewedFb = state => state.comments.lastViewedFbById;

export const { selectAll: selectAllComments } = commentsAdapter.getSelectors(
  state => state.comments
);
