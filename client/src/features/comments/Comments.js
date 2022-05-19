import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Comment from './Comment';
import Button from '../../components/Button';
import {
  selectAllComments,
  selectTotalComments,
  selectLastViewedFb,
} from './commentsSlice';
import { fetchComments } from './commentsThunks';
import '../../css/Comments.scss';

function Comments({ currentUser, feedback }) {
  const [status, setStatus] = useState('idle');
  const [disabled, setDisabled] = useState(false);
  const [err, setErr] = useState(null);
  const comments = useSelector(selectAllComments);
  const totalComments = useSelector(selectTotalComments);
  const lastViewedFb = useSelector(selectLastViewedFb);
  const dispatch = useDispatch();

  const canLoadMore = totalComments < feedback?.comments;

  const isSameFeedback = feedback?.productRequestId === lastViewedFb;

  const onClickLoadMore = () => {
    if (!feedback) return;
    setDisabled(true);
    dispatch(fetchComments({ id: feedback.productRequestId }))
      .unwrap()
      .then(() => setDisabled(false))
      .catch(err => setErr(err));
  };

  useEffect(() => {
    if (!feedback || status !== 'idle') return;

    setStatus('pending');

    let args = { id: feedback.productRequestId };

    (async () => {
      try {
        if (lastViewedFb) {
          if (lastViewedFb !== feedback.productRequestId) {
            args.reset = true;
            await dispatch(fetchComments(args)).unwrap();
          }
          return;
        } else {
          await dispatch(fetchComments(args)).unwrap();
        }
        setStatus('fulfilled');
      } catch (err) {
        setErr(err);
      }
    })();
  }, [dispatch, feedback, status, lastViewedFb]);

  return (
    <div className="comments">
      <h1>{isSameFeedback ? totalComments : 0} Comments</h1>
      <div className="comments__list">
        {isSameFeedback &&
          comments.map(el => (
            <Comment
              key={el.commentId}
              comment={el}
              currentUser={currentUser}
            />
          ))}
      </div>
      {err && <div className="comments__err">{err}</div>}
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
}

export default Comments;
