import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks';
import Comment from '../comment';
import Button from '../button';
import {
  selectAllComments,
  selectTotalComments,
  selectLastViewedFb,
} from '../../features/comments/commentsSlice';
import { fetchComments } from '../../features/comments/commentsThunks';
import type { CurrentUserStates, ProductRequest } from '../../@types';
import style from './comments.module.scss';

type Props = {
  currentUser: CurrentUserStates;
  feedback?: ProductRequest;
};

const Comments = ({ currentUser, feedback }: Props) => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'fulfilled'>(
    'idle'
  );
  const [disabled, setDisabled] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const comments = useAppSelector(selectAllComments);
  const totalLoadedComments = useAppSelector(selectTotalComments);
  const lastViewedFbById = useAppSelector(selectLastViewedFb);
  const location = useLocation();
  const dispatch = useAppDispatch();

  const isSameFeedback = feedback
    ? feedback.productRequestId === lastViewedFbById
    : false;

  const canLoadMore =
    isSameFeedback && totalLoadedComments < (feedback ? feedback.comments : 0);

  const onClickLoadMore = () => {
    if (!feedback) return;

    setDisabled(true);

    dispatch(fetchComments({ id: feedback.productRequestId }))
      .unwrap()
      .then(() => setDisabled(false))
      .catch((err: Error) => setErr(err.message));
  };

  useEffect(() => {
    if (!feedback || status !== 'idle') return;

    setStatus('pending');
    setDisabled(true);

    let args: { id: number; reset?: boolean } = {
      id: feedback.productRequestId,
    };

    (async () => {
      try {
        // Check if user previously viewed some feedback
        if (lastViewedFbById) {
          // If so, is the user revisiting the same feedback?
          // If different then clear the loaded comments in state and fetch the correct comments
          if (lastViewedFbById !== feedback.productRequestId) {
            args.reset = true;
            await dispatch(fetchComments(args)).unwrap();
          }

          setStatus('fulfilled');
          setDisabled(false);
          return;

          // First time visiting "/feedback/:productRequestId" > load comments
        } else {
          await dispatch(fetchComments(args)).unwrap();
        }

        setStatus('fulfilled');
        setDisabled(false);
      } catch (err) {
        setErr((err as Error).message);
      }
    })();
  }, [dispatch, feedback, status, lastViewedFbById]);

  return (
    <div className={style.comments}>
      <h1>{isSameFeedback ? totalLoadedComments : 0} Comments</h1>
      <div className={style.comments__list}>
        {isSameFeedback &&
          comments.map((el) => (
            <Comment
              key={el.commentId}
              comment={el}
              currentUser={currentUser}
              prevPage={location.pathname}
            />
          ))}
      </div>
      {err && <div className={style.comments__err}>{err}</div>}
      {canLoadMore && !err && (
        <Button
          onClick={onClickLoadMore}
          disabled={disabled}
          label="Load More"
          color="blue"
        />
      )}
    </div>
  );
};

export default Comments;
