import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CommentReplyForm from '../comment-reply-form';
import { getAvatarUrl } from '../../utils/s3UserUrl';
import type {
  CommentEntity,
  ChildComment,
  CurrentUserStates,
} from '../../@types';
import style from './comment.module.scss';

type Props = {
  comment: CommentEntity | ChildComment;
  currentUser: CurrentUserStates;
  prevPage: string;
};

const Comment = ({ comment, currentUser, prevPage }: Props) => {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const onClickReply = () => {
    if (!currentUser) return navigate('/login', { state: { prevPage } });
    setShowForm(!showForm);
  };

  const hasChildren = comment.depth === 0 && comment.Comments.length > 0;

  return (
    <div
      className={`${style.comment}${
        comment.parentId ? ` ${style['comment--child']}` : ''
      }${hasChildren ? ` ${style['comment--parent']}` : ''}`}
    >
      <div className={style.comment__content}>
        <div className={style.comment__grid}>
          <img
            src={
              comment.authorImg
                ? getAvatarUrl(comment.authorImg)
                : '/images/default-avatar.png'
            }
            alt={`${comment.author[1]}'s profile pic`}
          />
          <div className={style.comment__user}>
            <h2>{comment.author[1]}</h2>
            <span>@{comment.author[0]}</span>
          </div>
          <button className={style.comment__replyBtn} onClick={onClickReply}>
            {!showForm ? 'Reply' : 'Cancel'}
          </button>
        </div>
        <div
          className={`${style.comment__copy} ${
            style[`comment__copy--${comment.parentId ? 1 : 0}`]
          }`}
        >
          <p>
            {comment.replyTo && <span>@{comment.replyTo}&nbsp;</span>}
            {comment.content}
          </p>
        </div>
      </div>
      {hasChildren && <div className={style.comment__line} />}
      {showForm && (
        <CommentReplyForm
          comment={comment}
          closeForm={() => setShowForm(false)}
          cn={style.comment__form}
        />
      )}
      {hasChildren && (
        <div className={style.comment__replies}>
          {comment.Comments.map((el) => (
            <Comment
              key={el.commentId}
              comment={el}
              currentUser={currentUser}
              prevPage={prevPage}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
