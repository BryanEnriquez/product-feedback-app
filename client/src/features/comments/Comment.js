import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';
import ReplyForm from './ReplyForm';
// Temporary
import userImg from '../../images/user-images/user.png';
import '../../css/Comment.scss';

function Comment({ comment, currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const onClickReply = () => {
    if (!currentUser) return navigate('/login');
    setShowForm(!showForm);
  };

  const closeForm = () => setShowForm(false);

  const hasChildren = comment.Comments?.length > 0;

  return (
    <div
      key={comment.commentId}
      className={cn('comment', {
        'comment--child': comment.parentId,
        'comment--parent': hasChildren,
      })}
    >
      <div className="comment__content">
        <div className="comment__grid">
          <img src={userImg} alt="user img" />
          <div className="comment__user">
            <h2>{comment.author[1]}</h2>
            <span>@{comment.author[0]}</span>
          </div>
          <button className="comment__reply" onClick={onClickReply}>
            {!showForm ? 'Reply' : 'Cancel'}
          </button>
        </div>
        <div
          className={`comment__copy comment__copy--${
            comment.parentId ? '1' : '0'
          }`}
        >
          <p>
            {comment.replyTo && <span>@{comment.replyTo}</span>}
            {comment.content}
          </p>
        </div>
      </div>
      {hasChildren && <div className="comment__line" />}
      {showForm && (
        <ReplyForm
          comment={comment}
          closeForm={closeForm}
          className={cn('reply-form', { 'reply-form--1': comment.parentId })}
        />
      )}
      {hasChildren && (
        <div className="comment__replies">
          {comment.Comments.map(el => (
            <Comment
              key={el.commentId}
              comment={el}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Comment;
