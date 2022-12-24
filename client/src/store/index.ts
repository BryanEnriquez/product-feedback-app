import { configureStore } from '@reduxjs/toolkit';
import upvotesReducer from '../features/upvotes/upvotesSlice';
import roadmapReducer from '../features/roadmap/roadmapSlice';
import suggestionsReducer from '../features/suggestions/suggestionsSlice';
import commentsReducers from '../features/comments/commentsSlice';
import currentUserReducer from '../features/user/currentUserSlice';

export const store = configureStore({
  reducer: {
    upvotes: upvotesReducer,
    roadmap: roadmapReducer,
    suggestions: suggestionsReducer,
    comments: commentsReducers,
    currentUser: currentUserReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
