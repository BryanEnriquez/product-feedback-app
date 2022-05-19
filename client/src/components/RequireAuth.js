import { useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/user/currentUserSlice';
import '../css/RequireAuth.scss';

function RequireAuth(props) {
  const location = useLocation();
  const currentUser = useSelector(selectCurrentUser);

  return currentUser ? (
    props.children
  ) : currentUser === null ? (
    <div className="auth-gate">
      <h1>Checking auth status</h1>
    </div>
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
}

export default RequireAuth;
