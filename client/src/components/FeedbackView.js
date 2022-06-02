import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Feedback from './Feedback';
import Button from './Button';
import BackLink from './BackLink';
import ErrorMsg from './ErrorMsg';
import Loader from './Loader';
import { fetchOneSuggestion } from '../features/suggestions/suggestionThunks';
import { findInvalidFbId } from '../features/user/currentUserSlice';
import '../css/FeedbackView.scss';

const SingleFeedback = ({ currentUser, feedback }) => {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const urlParams = useParams();
  const dispatch = useDispatch();
  const deleted = useSelector(state =>
    findInvalidFbId(state, urlParams.productRequestId)
  );

  useEffect(() => {
    if (feedback || status !== 'idle' || currentUser === null || deleted)
      return;

    setStatus('pending');

    dispatch(
      fetchOneSuggestion({ id: urlParams.productRequestId, currentUser })
    )
      .unwrap()
      .then(() => {
        setStatus('fulfilled');
      })
      .catch(err => {
        setStatus('rejected');
        setError(err);
      });
  }, [
    feedback,
    status,
    setError,
    currentUser,
    deleted,
    dispatch,
    urlParams.productRequestId,
  ]);

  if (feedback) {
    return (
      <Feedback
        item={feedback}
        dispatch={dispatch}
        currentUser={currentUser}
        group={false}
        prevPage={`/feedback/${feedback.productRequestId}`}
      />
    );
  } else if (status === 'rejected') {
    return <ErrorMsg msg={error} />;
  } else if (deleted) {
    return <ErrorMsg msg="This suggestion no longer exists!" />;
  }

  return <Loader />;
};

function FeedbackView({ currentUser, feedback }) {
  const renderBtn =
    currentUser && feedback && currentUser.accountUid === feedback.accountUid;

  const backLink = feedback
    ? feedback.status === 'suggestion'
      ? '/'
      : '/roadmap'
    : '/';

  return (
    <div className="fb-view">
      <div className="fb-view__nav">
        <BackLink customLink={backLink} />
        {renderBtn && (
          <Button
            to={`/edit-feedback/${feedback.productRequestId}`}
            label="Edit Feedback"
            color="blue"
            prevPage={`/feedback/${feedback.productRequestId}`}
          />
        )}
      </div>
      <SingleFeedback currentUser={currentUser} feedback={feedback} />
    </div>
  );
}

export default FeedbackView;
