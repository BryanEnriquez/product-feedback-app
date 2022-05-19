import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Button from '../../components/Button';
import { postComment, calculateCommentStats } from './commentsThunks';
import '../../css/CommentForm.scss';

function CommentForm({ currentUser, productRequestId }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onTextChange = e => {
    if (e.target.value.length <= 250) setContent(e.target.value);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!currentUser) return navigate('/login');
    if (disabled) return;

    if (content.length < 10) return setError('Insufficient character length.');

    setDisabled(true);
    setError('');

    dispatch(postComment({ content, productRequestId }))
      .unwrap()
      .then(_ => {
        setContent('');
        dispatch(calculateCommentStats());
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => {
        setTimeout(() => setDisabled(false), 1200);
      });
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <label htmlFor="comment-content">Add Comment</label>
      <span className="comment-form__err">{error}</span>
      <textarea
        value={content}
        onChange={onTextChange}
        placeholder="Type your comment here. Min. 10 characters."
        id="comment-content"
      />
      <div className="comment-form__fb">
        <span>{250 - content.length} Characters left</span>
        <Button
          label="Post Comment"
          onClick={handleSubmit}
          disabled={disabled}
        />
      </div>
    </form>
  );
}

export default CommentForm;
