import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import {
  fetchCurrentUser,
  selectStatus,
} from '../../features/user/currentUserSlice';

const LoadUser = () => {
  const fetchStatus = useAppSelector(selectStatus);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (fetchStatus === 'idle') dispatch(fetchCurrentUser());
  }, [fetchStatus, dispatch]);

  return null;
};

export default LoadUser;
