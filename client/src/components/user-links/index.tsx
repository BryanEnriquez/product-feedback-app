import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks';
import {
  logout,
  selectCurrentUser,
} from '../../features/user/currentUserSlice';
import style from './links.module.scss';

const UserLinks = () => {
  const [reqStatus, setReqStatus] = useState<'idle' | 'pending'>('idle');
  const currentUser = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();

  const onClickLogout = () => {
    if (reqStatus !== 'idle') return;

    setReqStatus('pending');

    dispatch(logout())
      .unwrap()
      .then(() => window.location.reload())
      .catch((_) => setReqStatus('idle'));
  };

  return (
    <div className={style.links}>
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
          Log in
        </Link>
      )}
    </div>
  );
};

export default UserLinks;
