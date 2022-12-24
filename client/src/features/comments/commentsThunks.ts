import { createAsyncThunk, createAction } from '@reduxjs/toolkit';
import { incSuggestCommentCount } from '../suggestions/suggestionsSlice';
import { incRoadmapCommentCount } from '../roadmap/roadmapSlice';
import { client } from '../../client';
import type { RootState } from '../../store';
import type {
  Optional,
  ParentOrChildComment,
  CommentModel,
  CommentEntity,
} from '../../@types';

const COMMENTS = 'comments';

export const calculateCommentStats = createAction(
  `${COMMENTS}/calculateCommentStats`
);

export const resetComments = createAction(`${COMMENTS}/resetComments`);

/**
 * Thrown error type: `Error`
 */
export const fetchComments = createAsyncThunk<
  { comments: CommentEntity[]; id: number; nextPage: number },
  { id: number; reset?: boolean },
  { state: RootState; serializedErrorType: Error }
>(`${COMMENTS}/fetchComments`, async ({ id, reset = false }, thunkAPI) => {
  const page = reset ? 1 : thunkAPI.getState().comments.page;

  const { data } = await client<{ comments: CommentEntity[] }>(
    `productRequests/${id}/comments?page=${page}&limit=5`
  );

  if (reset) thunkAPI.dispatch(resetComments());

  return { comments: data.comments, id, nextPage: page + 1 };
});

export const postComment = createAsyncThunk<
  ParentOrChildComment,
  Optional<
    Pick<CommentModel, 'content' | 'productRequestId' | 'parentId'>,
    'parentId'
  >,
  { state: RootState; serializedErrorType: Error; rejectValue: Error }
>(
  'comments/postComment',
  async ({ content, productRequestId, parentId }, thunkAPI) => {
    const state = thunkAPI.getState();

    const feedback =
      state.suggestions.entities[productRequestId] ||
      state.roadmap.entities[productRequestId];

    if (!feedback)
      return thunkAPI.rejectWithValue(
        new Error("Error: Can't create comment for non-existent feedback")
      );

    const { data } = await client<{ comment: ParentOrChildComment }>(
      'comments',
      {
        method: 'POST',
        body: {
          content,
          productRequestId,
          ...(parentId && { parentId }),
        },
      }
    );

    thunkAPI.dispatch(
      (feedback.status === 'suggestion'
        ? incSuggestCommentCount
        : incRoadmapCommentCount)(feedback.productRequestId)
    );

    return data.comment;
  }
);
