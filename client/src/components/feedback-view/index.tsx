import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks';
import Feedback from '../feedback';
import Button from '../button';
import BackLink from '../back-link';
import ErrorMsg from '../error-message';
import Loader from '../loader';
import { fetchOneSuggestion } from '../../features/suggestions/suggestionsThunks';
import { findInvalidFeedbackId } from '../../features/user/currentUserSlice';
import type { CurrentUserStates, ProductRequest } from '../../@types';
import style from './fb-view.module.scss';

type SingleFeedbackProps = {
  currentUser: CurrentUserStates;
  feedback?: ProductRequest;
};

const SingleFeedback = ({ currentUser, feedback }: SingleFeedbackProps) => {
  const [status, setStatus] = useState<
    'idle' | 'pending' | 'fulfilled' | 'rejected'
  >('idle');
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const urlParams = useParams();
  const feedbackId = Number(urlParams.productRequestId);
  const recentlyDeleted = useAppSelector((state) =>
    findInvalidFeedbackId(state, feedbackId)
  );

  useEffect(() => {
    // Only fetch feedback if not in state
    if (
      feedback ||
      status !== 'idle' ||
      currentUser === null ||
      recentlyDeleted
    )
      return;

    setStatus('pending');

    dispatch(fetchOneSuggestion({ id: feedbackId, currentUser }))
      .unwrap()
      .then(() => setStatus('fulfilled'))
      .catch((err: string) => {
        setStatus('rejected');
        setError(err);
      });
  }, [
    feedback,
    status,
    setError,
    currentUser,
    recentlyDeleted,
    dispatch,
    feedbackId,
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
    return <ErrorMsg msg={error || ''} />;
  } else if (recentlyDeleted) {
    return <ErrorMsg msg="This suggestion no longer exists!" />;
  }

  return <Loader />;
};

type FeedbackViewProps = {
  currentUser: CurrentUserStates;
  feedback?: ProductRequest;
};

const FeedbackView = ({ currentUser, feedback }: FeedbackViewProps) => {
  const showEditFeedbackButton =
    currentUser && feedback && currentUser.accountUid === feedback.accountUid;

  // Sends the user back to the homepage or roadmap page
  const backLink = feedback
    ? feedback.status === 'suggestion'
      ? '/'
      : '/roadmap'
    : '/';

  return (
    <div className={style.fbView}>
      <div className={style.fbView__nav}>
        <BackLink customLink={backLink} />
        {showEditFeedbackButton && (
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
};

export default FeedbackView;
