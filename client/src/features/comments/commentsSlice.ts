import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import {
  fetchComments,
  postComment,
  calculateCommentStats,
  resetComments,
} from './commentsThunks';
import type { RootState } from '../../store';
import type { CommentEntity, ParentOrChildComment } from '../../@types';

const dateComparer = (a: ParentOrChildComment, b: ParentOrChildComment) => {
  return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
};

const commentsAdapter = createEntityAdapter<CommentEntity>({
  selectId: (comment) => comment.commentId,
  sortComparer: dateComparer,
});

const initialState = commentsAdapter.getInitialState<{
  /**
   * The last page for which comments were loaded.
   * Note: Each page loads a set number of parent-level comments.
   */
  page: number;
  /**
   * Reflects number of comments loaded. Both parent and children comments.
   */
  total: number;
  lastViewedFeedbackById: null | number;
}>({
  page: 1,
  total: 0,
  lastViewedFeedbackById: null,
});

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { comments, id, nextPage } = action.payload;

        state.lastViewedFeedbackById = id;
        state.page = nextPage;

        // Sort children comments
        comments.forEach((comment) => {
          comment.Comments = comment.Comments.slice().sort(dateComparer);
        });

        commentsAdapter.setMany(state, comments);

        // Recalculate comment count
        state.total = 0;

        Object.values(state.entities).forEach((el) => {
          state.total++;
          state.total += el!.Comments.length;
        });
      })
      .addCase(postComment.fulfilled, (state, action) => {
        const comment = action.payload;

        if (comment.parentId === null) {
          commentsAdapter.setOne(state, {
            ...comment,
            Comments: [],
          });
        } else {
          const parent = state.entities[comment.parentId];
          if (parent) parent.Comments.push(comment);
        }
      })
      .addCase(calculateCommentStats, (state) => {
        state.total = 0;
        Object.values(state.entities).forEach((el) => {
          state.total++;
          if (el && el.Comments) state.total += el.Comments.length;
        });
      })
      .addCase(resetComments, () => initialState);
  },
});

export default commentsSlice.reducer;

export const selectTotalComments = (state: RootState) => state.comments.total;
export const selectLastViewedFb = (state: RootState) =>
  state.comments.lastViewedFeedbackById;

export const { selectAll: selectAllComments } = commentsAdapter.getSelectors(
  (state: RootState) => state.comments
);
