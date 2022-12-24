import { useAppSelector } from '../../hooks';
import { useSuggestion } from '../../hooks/useSuggestion';
import FeedbackView from '../../components/feedback-view';
import Comments from '../../components/comments';
import CommentForm from '../../components/comment-form';
import { selectCurrentUser } from '../../features/user/currentUserSlice';
import style from './feedback-page.module.scss';

const FeedbackPage = () => {
  const currentUser = useAppSelector(selectCurrentUser);
  const [id, feedback] = useSuggestion();

  return (
    <div className={style.fbPage}>
      <FeedbackView currentUser={currentUser} feedback={feedback} />
      <Comments currentUser={currentUser} feedback={feedback} />
      <CommentForm currentUser={currentUser} productRequestId={id} />
    </div>
  );
};

export default FeedbackPage;
