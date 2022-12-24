import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import Feedback from '../feedback';
import Button from '../button';
import NoContent from '../no-content';
import ErrorMsg from '../error-message';
import {
  selectCategory,
  selectCanLoadMore,
  selectSuggestFetchStatus,
  selectError,
  selectSortOptionId,
  selectFilteredList,
} from '../../features/suggestions/suggestionsSlice';
import { fetchSuggestions } from '../../features/suggestions/suggestionsThunks';
import { selectCurrentUser } from '../../features/user/currentUserSlice';
import type { ProductRequestSuggestion, SuggestionsSortBy } from '../../@types';
import style from './suggestionsList.module.scss';

const sorters: {
  [key in SuggestionsSortBy['id']]: (
    a: ProductRequestSuggestion,
    b: ProductRequestSuggestion
  ) => number;
} = {
  most_upvotes: (a, b) => b.upvotes - a.upvotes,
  least_upvotes: (a, b) => a.upvotes - b.upvotes,
  most_comments: (a, b) => b.comments - a.comments,
  least_comments: (a, b) => a.comments - b.comments,
};

const SuggestionsList = () => {
  const currentUser = useAppSelector(selectCurrentUser);
  const isLoadBtnVisible = useAppSelector(selectCanLoadMore);
  const sortBy = useAppSelector(selectSortOptionId);
  const category = useAppSelector(selectCategory);

  const filteredList = useAppSelector((state) =>
    selectFilteredList(state, category)
  );

  const fetchStatus = useAppSelector(selectSuggestFetchStatus);
  const error = useAppSelector(selectError);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (fetchStatus === 'idle') dispatch(fetchSuggestions());
  }, [fetchStatus, dispatch]);

  let content: JSX.Element | JSX.Element[];

  if (fetchStatus === 'rejected') {
    content = <ErrorMsg msg={error || ''} />;

    // Show CTA when: request is successful, there are 0 results, and there are no more pages to load
  } else if (
    !filteredList.length &&
    fetchStatus === 'fulfilled' &&
    !isLoadBtnVisible
  ) {
    content = <NoContent currentUser={currentUser} />;
  } else {
    const sortedList = filteredList.slice().sort(sorters[sortBy]);

    content = sortedList.map((el) => (
      <Feedback
        key={el.productRequestId}
        item={el}
        dispatch={dispatch}
        currentUser={currentUser}
        prevPage={'/'}
      />
    ));
  }

  const showLoadMoreBtn = category === 'all' && isLoadBtnVisible && !error;

  return (
    <div className={style.slWrapper}>
      <div className={style.sl}>{content}</div>
      <br />
      {showLoadMoreBtn && (
        <Button
          disabled={fetchStatus !== 'fulfilled'}
          onClick={() => dispatch(fetchSuggestions())}
          label="Load More Suggestions"
          color="blue"
        />
      )}
    </div>
  );
};

export default SuggestionsList;
