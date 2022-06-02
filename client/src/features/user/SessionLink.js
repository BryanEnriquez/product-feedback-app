import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, selectCurrentUser } from './currentUserSlice';
import '../../css/SessionLink.scss';

const SessionLink = ({ className }) => {
  const [status, setStatus] = useState('idle');
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const onClickLogout = async () => {
    if (status === 'pending') return;
    try {
      setStatus('pending');
      await dispatch(logout()).unwrap();
      window.location.reload();
    } catch (err) {
      // TODO
      console.log('error logging out: ', err);
      setStatus('idle');
    }
  };

  return (
    <div className={className}>
      {currentUser ? (
        <Link to="/" onClick={onClickLogout}>
          Log out
        </Link>
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

export default SessionLink;
