import { useLocation, Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import { selectCurrentUser } from '../../features/user/currentUserSlice';
import AuthGate from '../auth-gate';

type Props = {
  children: JSX.Element;
};

const RequireAuth = (props: Props) => {
  const location = useLocation();
  const currentUser = useAppSelector(selectCurrentUser);

  return currentUser ? (
    props.children
  ) : currentUser === null ? (
    <AuthGate text="Checking auth status" />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequireAuth;
