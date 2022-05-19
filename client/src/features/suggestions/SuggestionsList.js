import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Feedback from '../../components/Feedback';
import {
  selectCategory,
  selectCanLoadMore,
  selectSuggestFetchStatus,
  selectError,
  selectSortBy,
  selectFilteredList,
} from './suggestionsSlice';
import { fetchSuggestions } from './suggestionThunks';
import { selectCurrentUser } from '../user/currentUserSlice';
import '../../css/SuggestionsList.scss';

const sorters = {
  most_upvotes: (a, b) => b.upvotes - a.upvotes,
  least_upvotes: (a, b) => a.upvotes - b.upvotes,
  most_comments: (a, b) => b.comments - a.comments,
  least_comments: (a, b) => a.comments - b.comments,
};

function SuggestionsList() {
  const currentUser = useSelector(selectCurrentUser);
  const isLoadBtnVisible = useSelector(selectCanLoadMore);
  const sortBy = useSelector(selectSortBy);
  const category = useSelector(selectCategory);
  const filteredList = useSelector(state =>
    selectFilteredList(state, category)
  );
  const fetchStatus = useSelector(selectSuggestFetchStatus);
  const error = useSelector(selectError);
  const dispatch = useDispatch();

  useEffect(() => {
    if (fetchStatus === 'idle') dispatch(fetchSuggestions());
  }, [fetchStatus, dispatch]);

  let content;

  if (fetchStatus === 'rejected') {
    content = `An error occured: $${error}`;
  } else if (!filteredList.length && fetchStatus === 'fulfilled') {
    content = 'There appears to be nothing here!';
  } else {
    // 'idle' or 'fulfilled'
    const sortedList = filteredList.slice().sort(sorters[sortBy]);

    content = sortedList.map(el => (
      <Feedback
        key={el.productRequestId}
        item={el}
        dispatch={dispatch}
        currentUser={currentUser}
      />
    ));
  }

  const showLoadMoreBtn = category === 'all' && isLoadBtnVisible;

  return (
    <div className="sl-wrapper">
      <ul className="sl">{content}</ul>
      <br />
      {showLoadMoreBtn && (
        <button
          disabled={fetchStatus !== 'fulfilled'}
          onClick={() => dispatch(fetchSuggestions())}
        >
          Load more results
        </button>
      )}
    </div>
  );
}

export default SuggestionsList;
