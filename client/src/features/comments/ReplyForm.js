import { useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from '../../components/Button';
import { postComment, calculateCommentStats } from './commentsThunks';
import '../../css/ReplyForm.scss';

function ReplyForm({ comment, closeForm, className }) {
  const [text, setText] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = e => {
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
      .then(_ => {
        closeForm();
        dispatch(calculateCommentStats());
      })
      .catch(err => {
        setError(err);
        setTimeout(() => setDisabled(false), 1200);
      });
  };

  return (
    <form className={className} onSubmit={handleSubmit}>
      <label htmlFor="reply-content">Your reply</label>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Min. character length: 10. Max: 250."
        id="reply-content"
      />
      <span>{error}</span>
      <Button label="Post Reply" onClick={handleSubmit} disabled={disabled} />
    </form>
  );
}

export default ReplyForm;
