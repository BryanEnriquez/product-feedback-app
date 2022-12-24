import { createAsyncThunk, createAction } from '@reduxjs/toolkit';
import { addFetchedUpvotes } from '../upvotes/upvotesSlice';
import { addOneRmSuggestion } from '../roadmap/roadmapSlice';
import {
  removeOneRmSuggestion,
  updateOneRmSuggestion,
} from '../roadmap/roadmapThunks';
import { client } from '../../client';
import type { RootState, AppDispatch } from '../../store';
import type {
  RequireSome,
  CurrentUserStates,
  ProductRequest,
  ProductRequestSuggestion,
  ProductRequestRoadmap,
  UpdatedProductRequest,
  SuggestionUpdatePayload,
} from '../../@types';

const SUGGESTIONS = 'suggestions';

export const addOneSuggestion = createAction<ProductRequestSuggestion>(
  `${SUGGESTIONS}/addOneSuggestion`
);

export const removeOneSuggestion = createAction<
  Pick<ProductRequestSuggestion, 'productRequestId' | 'category'>
>(`${SUGGESTIONS}/removeOneSuggestion`);

export const updateOneSuggestion = createAction<SuggestionUpdatePayload>(
  `${SUGGESTIONS}/updateOneSuggestion`
);

export const fetchSuggestions = createAsyncThunk<
  { data: ProductRequestSuggestion[]; results: number },
  void,
  // https://redux-toolkit.js.org/usage/usage-with-typescript#manually-defining-thunkapi-types
  { state: RootState; serializedErrorType: Error }
>(`${SUGGESTIONS}/fetchSuggestions`, async (_, thunkAPI) => {
  const { page } = thunkAPI.getState().suggestions;

  const { data, results } = (await client(
    `productRequests?productId=${1}&status=${'suggestion'}&page=${page}&limit=${4}`
  )) as { results: number; data: { data: ProductRequestSuggestion[] } };

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

type UpvoteData = {
  upvotes: [{ productRequestId: number }?];
};

export const fetchOneSuggestion = createAsyncThunk<
  undefined,
  {
    id: number;
    currentUser: CurrentUserStates;
  },
  { rejectValue: string }
>(
  `${SUGGESTIONS}/fetchOneSuggestion`,
  async ({ id, currentUser }, thunkAPI) => {
    const [suggestion, upvote] = await Promise.allSettled([
      client<{ data: ProductRequestSuggestion | ProductRequestRoadmap }>(
        `productRequests/${id}`
      ),
      ...(currentUser
        ? [client<UpvoteData>(`upvotes/user?ids=${id}`)]
        : ([] as const)),
    ]);

    if (suggestion.status !== 'fulfilled') {
      const err = suggestion.reason as Error;

      return thunkAPI.rejectWithValue(err.message);
    }

    // null is used to disable the upvote feature if there is no logged in user
    let upvoted: null | boolean = null;

    if (currentUser && upvote && upvote.status === 'fulfilled') {
      upvoted = Boolean(upvote.value.data.upvotes[0]);
    }

    const suggestionRecord = suggestion.value.data.data;

    thunkAPI.dispatch(
      addFetchedUpvotes([
        {
          productRequestId: suggestionRecord.productRequestId,
          upvotes: suggestionRecord.upvotes,
          upvoted,
        },
      ])
    );

    thunkAPI.dispatch(
      suggestionRecord.status === 'suggestion'
        ? addOneSuggestion(suggestionRecord)
        : addOneRmSuggestion(suggestionRecord)
    );
  }
);

export const submitSuggestion = createAsyncThunk<
  number,
  Pick<ProductRequest, 'title' | 'description' | 'category'>,
  { dispatch: AppDispatch; serializedErrorType: Error }
>(
  `${SUGGESTIONS}/submitSuggestion`,
  async ({ title, description, category }, thunkAPI) => {
    const newSuggestion = (
      await client<{ data: ProductRequestSuggestion }>('productRequests', {
        method: 'POST',
        body: {
          productId: 1,
          title,
          description,
          category,
        },
      })
    ).data.data;

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

    // Not processed by reducer but component uses it to generate redirect link
    return newSuggestion.productRequestId;
  }
);

export const updateFeedback = createAsyncThunk<
  void,
  {
    prevFb: ProductRequestSuggestion | ProductRequestRoadmap;
    updatedFb: RequireSome<
      ProductRequest,
      'title' | 'description' | 'status' | 'category'
    >;
  },
  { dispatch: AppDispatch; serializedErrorType: Error }
>(
  `${SUGGESTIONS}/updateFeedback`,
  async ({ prevFb, updatedFb }, { dispatch }) => {
    const { data } = await client<{
      data: UpdatedProductRequest;
    }>(`productRequests/${prevFb.productRequestId}`, {
      method: 'PATCH',
      body: {
        title: updatedFb.title,
        description: updatedFb.description,
        category: updatedFb.category,
        status: updatedFb.status,
        accountUid: prevFb.accountUid,
      },
    });

    const newFb: ProductRequestSuggestion | ProductRequestRoadmap = {
      ...prevFb,
      status: updatedFb.status,
      category: updatedFb.category,
      title: data.data.title,
      description: data.data.description,
    };

    // No change in `status`
    if (prevFb.status === newFb.status) {
      if (newFb.status === 'suggestion') dispatch(updateOneSuggestion(newFb));
      else dispatch(updateOneRmSuggestion(newFb));

      // Move from suggestions to roadmap
    } else if (prevFb.status === 'suggestion') {
      if (newFb.status !== 'suggestion') {
        dispatch(
          removeOneSuggestion({
            productRequestId: prevFb.productRequestId,
            category: prevFb.category,
          })
        );
        dispatch(addOneRmSuggestion(newFb));
      }

      // Move from roadmap to suggestions
    } else if (newFb.status === 'suggestion') {
      dispatch(
        removeOneRmSuggestion({
          productRequestId: newFb.productRequestId,
          status: prevFb.status,
        })
      );
      dispatch(addOneSuggestion(newFb));

      // status was never `suggestion` at any point
    } else {
      dispatch(updateOneRmSuggestion(newFb));
    }
  }
);

type FeedbackDeleteInfo<T extends ProductRequest> = Pick<
  T,
  'productRequestId' | 'accountUid' | 'status' | 'category'
>;

export const deleteFeedback = createAsyncThunk<
  void,
  | FeedbackDeleteInfo<ProductRequestSuggestion>
  | FeedbackDeleteInfo<ProductRequestRoadmap>,
  { dispatch: AppDispatch; serializedErrorType: Error }
>(`${SUGGESTIONS}/deleteFeedback`, async (feedback, { dispatch }) => {
  await client(`productRequests/${feedback.productRequestId}`, {
    method: 'DELETE',
    body: { accountUid: feedback.accountUid },
  });

  dispatch(
    feedback.status === 'suggestion'
      ? removeOneSuggestion(feedback)
      : removeOneRmSuggestion(feedback)
  );
});
