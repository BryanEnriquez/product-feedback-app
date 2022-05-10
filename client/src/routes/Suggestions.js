import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Suggestion from '../features/suggestions/Suggestion';
import Button from '../components/Button';
import { selectCurrentUser } from '../features/user/currentUserSlice';
import { selectSuggestionById } from '../features/suggestions/suggestionsSlice';
import { selectRmSuggestionById } from '../features/roadmap/roadmapSlice';
import { fetchOneSuggestion } from '../features/suggestions/suggestionThunks';

const SuggestionById = () => {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const urlParams = useParams();
  const currentUSer = useSelector(selectCurrentUser);
  const suggestion = useSelector(state =>
    selectSuggestionById(state, urlParams.productRequestId)
  );
  const rmSuggestion = useSelector(state =>
    selectRmSuggestionById(state, urlParams.productRequestId)
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (suggestion || rmSuggestion || status !== 'idle') return;

    setStatus('pending');

    dispatch(fetchOneSuggestion(urlParams.productRequestId))
      .unwrap()
      .then(() => {
        setStatus('fulfilled');
      })
      .catch(err => {
        setStatus('rejected');
        setError(err);
      });
  }, [suggestion, rmSuggestion, status, dispatch, urlParams.productRequestId]);

  const item = suggestion || rmSuggestion;
  if (item) {
    return (
      <Suggestion
        item={item}
        dispatch={dispatch}
        currentUser={currentUSer}
        group={false}
      />
    );
  } else if (status === 'rejected') {
    return <div>{error}</div>;
  }

  return <div>Loading...</div>;
};

function Suggestions() {
  const currentUser = useSelector(selectCurrentUser);
  const urlParams = useParams();

  return (
    <div className="suggestions">
      <div className="suggestions__nav">
        <Link to="/">Go Back</Link>
        {currentUser && (
          <Button
            to={`/edit-suggestion/${urlParams.productRequestId}`}
            label="Edit Feedback"
            color="blue"
          />
        )}
      </div>
      <SuggestionById />
    </div>
  );
}

export default Suggestions;
