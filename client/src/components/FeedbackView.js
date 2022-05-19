import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Feedback from './Feedback';
import Button from './Button';
import BackLink from './BackLink';
import { fetchOneSuggestion } from '../features/suggestions/suggestionThunks';
import '../css/FeedbackView.scss';

const SingleFeedback = ({ currentUser, feedback }) => {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const urlParams = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    if (feedback || status !== 'idle') return;

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
  }, [feedback, status, dispatch, urlParams.productRequestId]);

  if (feedback) {
    return (
      <Feedback
        item={feedback}
        dispatch={dispatch}
        currentUser={currentUser}
        group={false}
      />
    );
  } else if (status === 'rejected') {
    return <div>{error}</div>;
  }

  // TODO
  return <div>Loading...</div>;
};

function FeedbackView({ currentUser, feedback }) {
  const renderBtn =
    currentUser && feedback && currentUser.accountUid === feedback.accountUid;

  return (
    <div className="fb-view">
      <div className="fb-view__nav">
        <BackLink />
        {renderBtn && (
          <Button
            to={`/edit-feedback/${feedback.productRequestId}`}
            label="Edit Feedback"
            color="blue"
          />
        )}
      </div>
      <SingleFeedback currentUser={currentUser} feedback={feedback} />
    </div>
  );
}

export default FeedbackView;
