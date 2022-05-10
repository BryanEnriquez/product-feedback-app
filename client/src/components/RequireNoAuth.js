import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/user/currentUserSlice';

function RequireNoAuth(props) {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  if (!currentUser) return props.children;

  setTimeout(() => navigate('/', { replace: true }), 1000);

  return (
    <div className="login-wrapper">
      <div className="login">
        <h1>Redirecting..</h1>
      </div>
    </div>
  );
}

export default RequireNoAuth;
