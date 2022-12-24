import { useState } from 'react';
import { useAppDispatch } from '../../hooks';
import Button from '../button';
import {
  postComment,
  calculateCommentStats,
} from '../../features/comments/commentsThunks';
import type { CommentEntity, ChildComment } from '../../@types';
import style from './form.module.scss';

type Props = {
  comment: CommentEntity | ChildComment;
  closeForm: () => void;
  cn?: string;
};

const CommentReplyForm = ({ comment, closeForm, cn }: Props) => {
  const [text, setText] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (disabled) return;
    if (text.length < 10) return setError('Insufficient character length.');
    if (text.length > 250) return setError('Character limit exceeded.');

    setDisabled(true);
    setError('');

    dispatch(
      postComment({
        content: text,
        productRequestId: comment.productRequestId,
        parentId: comment.commentId,
      })
    )
      .unwrap()
      .then(() => {
        closeForm();
        dispatch(calculateCommentStats());
      })
      .catch((err: Error) => {
        setError(err.message);
        setTimeout(() => setDisabled(false), 1200);
      });
  };

  return (
    <form
      className={`${style.form}${cn ? ` ${cn}` : ''}${
        comment.parentId ? ` ${style['form--1']}` : ''
      }`}
      onSubmit={handleSubmit}
    >
      <label htmlFor="reply-content">Your reply</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Min. character length: 10. Max: 250."
        id="reply-content"
      />
      <span>{error}</span>
      <Button label="Post Reply" disabled={disabled} />
    </form>
  );
};

export default CommentReplyForm;
