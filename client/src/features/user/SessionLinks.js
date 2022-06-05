import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, selectCurrentUser } from './currentUserSlice';
import '../../css/SessionLinks.scss';

const SessionLinks = () => {
  const [status, setStatus] = useState('idle');
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const onClickLogout = () => {
    if (status !== 'idle') return;

    setStatus('pending');

    dispatch(logout())
      .unwrap()
      .then(() => {
        window.location.reload();
      })
      .catch(_ => {
        setStatus('idle');
      });
  };

  return (
    <div className="session-links">
      {currentUser ? (
        <>
          <Link to="/" onClick={onClickLogout}>
            Log out
          </Link>
          <Link to="/settings" state={{ prevPage: '/' }}>
            Settings
          </Link>
        </>
      ) : currentUser === null ? (
        <span />
      ) : (
        <Link to="/login" state={{ prevPage: '/' }}>
          Log In
        </Link>
      )}
    </div>
  );
};

export default SessionLinks;
