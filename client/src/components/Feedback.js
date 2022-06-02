import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import cn from 'classnames';
import { selectByUpvoteId } from '../features/upvotes/upvotesSlice';
import { upvoteAdded, upvoteRemoved } from '../features/upvotes/upvoteThunks';
import { ReactComponent as UpvoteIcon } from '../images/shared/icon-arrow-up.svg';
import '../css/Feedback.scss';

const tags = {
  ui: 'UI',
  ux: 'UX',
  bug: 'Bug',
  feature: 'Feature',
  enhancement: 'Enhancement',
};

const trimText = text => {
  return `${text.substring(0, 72)}${text.length > 72 ? '..' : ''}`;
};

function Feedback({
  item,
  dispatch,
  currentUser,
  group = true,
  type = 'a',
  prevPage,
}) {
  const [reqStatus, setReqStatus] = useState('idle');
  const [err, setErr] = useState(false);
  const upvote = useSelector(state =>
    selectByUpvoteId(state, item.productRequestId)
  );
  const navigate = useNavigate();

  const onUpvoteClick = async () => {
    if (!currentUser) return navigate('/login', { state: { prevPage } });
    // Return if in progress or request for upvote data failed
    if (reqStatus !== 'idle' || upvote.upvoted === null) return;

    setReqStatus('pending');
    try {
      if (upvote?.upvoted) {
        await dispatch(upvoteRemoved(upvote.productRequestId)).unwrap();
      } else {
        await dispatch(upvoteAdded(upvote.productRequestId)).unwrap();
      }
      setTimeout(() => setReqStatus('idle'), 1000);
    } catch (err) {
      setErr(true);
    }
  };

  const copy = (
    <>
      <h3>{item.title}</h3>
      <p>{group ? trimText(item.description) : item.description}</p>
      <div>{tags[item.category]}</div>
    </>
  );
  const copyCn = cn('feedback__copy', `feedback__copy--${type}`, {
    'feedback__copy--g': group,
  });

  return (
    <div className={`feedback feedback--${type}`}>
      <button
        className={cn('feedback__upvotes', `feedback__upvotes--${type}`, {
          'feedback__upvotes--upvoted': upvote.upvoted || false,
          'feedback__upvotes--err': err,
        })}
        onClick={onUpvoteClick}
      >
        <UpvoteIcon />
        {upvote.upvotes}
      </button>
      {group ? (
        <Link
          to={`/feedback/${item.productRequestId}`}
          state={{ prevPage }}
          className={copyCn}
        >
          {copy}
        </Link>
      ) : (
        <div className={copyCn}>{copy}</div>
      )}
      <div className={`feedback__comments feedback__comments--${type}`}>
        <span {...(!item.comments && { className: 'none' })}>
          {item.comments}
        </span>
      </div>
    </div>
  );
}

export default Feedback;
