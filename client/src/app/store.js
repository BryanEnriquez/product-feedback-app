import { configureStore } from '@reduxjs/toolkit';
import currentUserReducer from '../features/user/currentUserSlice';
import suggestionsReducer from '../features/suggestions/suggestionsSlice';
import roadmapSlice from '../features/roadmap/roadmapSlice';
import upvotesReducer from '../features/upvotes/upvotesSlice';

export default configureStore({
  reducer: {
    currentUser: currentUserReducer,
    suggestions: suggestionsReducer,
    roadmap: roadmapSlice,
    upvotes: upvotesReducer,
    // products: () => 1,
    // comments: () => 4,
  },
});
