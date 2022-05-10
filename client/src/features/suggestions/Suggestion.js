import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import cn from 'classnames';
import { selectByUpvoteId } from '../upvotes/upvotesSlice';
import { upvoteAdded, upvoteRemoved } from '../upvotes/upvoteThunks';
import { ReactComponent as UpvoteIcon } from '../../images/shared/icon-arrow-up.svg';
import '../../css/Suggestion.scss';

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

function Suggestion({ item, dispatch, currentUser, group }) {
  const [reqStatus, setReqStatus] = useState('idle');
  const upvote = useSelector(state =>
    selectByUpvoteId(state, item.productRequestId)
  );
  const navigate = useNavigate();

  const onUpvoteClick = async () => {
    if (!currentUser) return navigate('/login');
    // Return if in progress or request for upvote data failed
    if (reqStatus !== 'idle' || upvote.upvoted === null) return;

    setReqStatus('pending');
    try {
      if (upvote?.upvoted) {
        await dispatch(upvoteRemoved(upvote.productRequestId)).unwrap();
      } else {
        await dispatch(upvoteAdded(upvote.productRequestId)).unwrap();
      }
    } catch (err) {
      // TODO
      console.log('Upvote error: ', err);
    } finally {
      setTimeout(() => setReqStatus('idle'), 1500);
    }
  };

  const classes = cn('suggestion__content', {
    'suggestion__content--g': group,
  });

  const content = (
    <>
      <h3>{item.title}</h3>
      <p>{group ? trimText(item.description) : item.description}</p>
      <div>{tags[item.category]}</div>
    </>
  );

  return (
    <li className="suggestion">
      <button
        className={cn('suggestion__upvotes', {
          'suggestion__upvotes--upvoted': upvote.upvoted || false,
        })}
        onClick={onUpvoteClick}
      >
        <UpvoteIcon />
        {upvote.upvotes}
      </button>
      {group ? (
        <Link to={`/suggestions/${item.productRequestId}`} className={classes}>
          {content}
        </Link>
      ) : (
        <div className={classes}>{content}</div>
      )}
      <div className="suggestion__comments">
        <span {...(!item.comments && { className: 'none' })}>
          {item.comments}
        </span>
      </div>
    </li>
  );
}

Suggestion.defaultProps = { group: true };

export default Suggestion;
