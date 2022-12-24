import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks';
import Button from '../button';
import {
  postComment,
  calculateCommentStats,
} from '../../features/comments/commentsThunks';
import type { CurrentUserStates } from '../../@types';
import style from './form.module.scss';

type Props = {
  currentUser: CurrentUserStates;
  productRequestId: string;
};

const CommentForm = ({ currentUser, productRequestId }: Props) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 250) setContent(e.target.value);
  };

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentUser)
      return navigate('/login', {
        state: { prevPage: `/feedback/${productRequestId}` },
      });

    if (disabled) return;

    if (content.length < 10) return setError('Insufficient character length.');

    setDisabled(true);
    setError('');

    dispatch(
      postComment({ content, productRequestId: Number(productRequestId) })
    )
      .unwrap()
      .then(() => {
        setContent('');
        dispatch(calculateCommentStats());
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setTimeout(() => setDisabled(false), 1200));
  };

  return (
    <form className={style.form} onSubmit={onFormSubmit}>
      <label htmlFor="comment-content">Add Comment</label>
      <span className={style.form__err}>{error}</span>
      <textarea
        id="comment-content"
        value={content}
        onChange={onInputChange}
        placeholder="Type your comment here. Min. 10 characters."
      />
      <div className={style.form__fb}>
        <span>{250 - content.length} Characters left</span>
        <Button label="Post Comment" disabled={disabled} />
      </div>
    </form>
  );
};

export default CommentForm;
