import { useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/user/currentUserSlice';

function RequireAuth(props) {
  const location = useLocation();
  const currentUser = useSelector(selectCurrentUser);

  return currentUser ? (
    props.children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
}

export default RequireAuth;
