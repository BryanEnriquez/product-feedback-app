import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import { selectUpvoteById } from '../../features/upvotes/upvotesSlice';
import {
  upvoteAdded,
  upvoteRemoved,
} from '../../features/upvotes/upvotesThunks';
import ArrowUp from '../icons/arrow-up';
import type { CurrentUserStates, ProductRequest } from '../../@types';
import type { AppDispatch } from '../../store';
import style from './feedback.module.scss';

const tags = {
  ui: 'UI',
  ux: 'UX',
  bug: 'Bug',
  feature: 'Feature',
  enhancement: 'Enhancement',
} as const;

const trimText = (text: string) =>
  `${text.substring(0, 72)}${text.length > 72 ? '..' : ''}`;

type Props = {
  item: ProductRequest;
  dispatch: AppDispatch;
  currentUser: CurrentUserStates;
  group?: boolean;
  type?: 'a' | 'b';
  prevPage: string;
};

const Feedback = ({
  item,
  dispatch,
  currentUser,
  group = true,
  type = 'a',
  prevPage,
}: Props) => {
  const [reqStatus, setReqStatus] = useState<'idle' | 'pending'>('idle');
  const [err, setErr] = useState(false);
  const upvote = useAppSelector((state) =>
    selectUpvoteById(state, item.productRequestId)
  );

  const navigate = useNavigate();

  const onUpvoteClick = async () => {
    if (!currentUser) return navigate('/login', { state: { prevPage } });

    if (reqStatus !== 'idle' || err || !upvote || upvote.upvoted === null)
      return;

    setReqStatus('pending');

    try {
      if (upvote.upvoted) {
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
      <span>{item.title}</span>
      <p>{group ? trimText(item.description) : item.description}</p>
      <div>{tags[item.category]}</div>
    </>
  );

  const copyClasses = `${style.feedback__copy} ${
    style[`feedback__copy--${type}`]
  }${group ? ` ${style[`feedback__copy--g`]}` : ''}`;

  return (
    <div className={`${style.feedback} ${style[`feedback--${type}`]}`}>
      <button
        className={`${style.feedback__upvotes} ${
          style[`feedback__upvotes--${type}`]
        }${
          upvote && upvote.upvoted
            ? ` ${style[`feedback__upvotes--upvoted`]}`
            : ''
        }${err ? ` ${style[`feedback__upvotes--err`]} ${style.err}` : ''}`}
        onClick={onUpvoteClick}
      >
        <ArrowUp />
        {upvote ? upvote.upvotes : 0}
      </button>
      {group ? (
        <Link
          to={`/feedback/${item.productRequestId}`}
          state={{ prevPage }}
          className={copyClasses}
        >
          {copy}
        </Link>
      ) : (
        <div className={copyClasses}>{copy}</div>
      )}
      <div
        className={`${style.feedback__comments} ${
          style[`feedback__comments--${type}`]
        }`}
      >
        <span {...(!item.comments && { className: style.none })}>
          {item.comments}
        </span>
      </div>
    </div>
  );
};

export default Feedback;
