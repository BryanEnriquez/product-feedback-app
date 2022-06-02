import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/user/currentUserSlice';

const AuthGate = ({ text }) => (
  <div className="auth-gate">
    <h1>{text}</h1>
  </div>
);

function RequireNoAuth({ children }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  if (currentUser) {
    setTimeout(
      () => navigate(loc.state?.prevPage || '/', { replace: true }),
      250
    );

    return <AuthGate text="Redirecting.." />;
  }

  return currentUser === null ? (
    <AuthGate text="Checking auth status" />
  ) : (
    children
  );
}

export default RequireNoAuth;
