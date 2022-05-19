import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import FeedbackView from '../components/FeedbackView';
import Comments from '../features/comments/Comments';
import CommentForm from '../features/comments/CommentForm';
import { selectCurrentUser } from '../features/user/currentUserSlice';
import { selectSuggestionById } from '../features/suggestions/suggestionsSlice';
import { selectRmSuggestionById } from '../features/roadmap/roadmapSlice';
import '../css/FeedbackPage.scss';

function FeedbackPage() {
  const currentUser = useSelector(selectCurrentUser);
  const urlParams = useParams();
  const suggestion = useSelector(state =>
    selectSuggestionById(state, urlParams.productRequestId)
  );
  const rmSuggestion = useSelector(state =>
    selectRmSuggestionById(state, urlParams.productRequestId)
  );

  const feedback = suggestion || rmSuggestion;

  return (
    <div className="fb-page">
      <FeedbackView currentUser={currentUser} feedback={feedback} />
      <Comments currentUser={currentUser} feedback={feedback} />
      <CommentForm
        currentUser={currentUser}
        productRequestId={urlParams.productRequestId}
      />
    </div>
  );
}

export default FeedbackPage;
