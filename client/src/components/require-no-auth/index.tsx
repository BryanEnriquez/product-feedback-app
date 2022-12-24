import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import { selectCurrentUser } from '../../features/user/currentUserSlice';
import AuthGate from '../auth-gate';

const RequireNoAuth = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);

  if (currentUser) {
    setTimeout(
      () =>
        navigate(location.state ? location.state.prevPage || '/' : '/', {
          replace: true,
        }),
      250
    );

    return <AuthGate text="Redirecting.." />;
  }

  return currentUser === null ? (
    <AuthGate text="Checking auth status" />
  ) : (
    children
  );
};

export default RequireNoAuth;
