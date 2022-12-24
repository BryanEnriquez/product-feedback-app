import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../../components/button';
import BackLink from '../../components/back-link';
import { client } from '../../client';
import style from './account.module.scss';

const ActivateAccount = () => {
  const [status, setStatus] = useState<
    'idle' | 'in-progress' | 'complete' | 'error'
  >('idle');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();

  useEffect(() => {
    if (status !== 'idle') return;

    setStatus('in-progress');

    client('users/activateAccount', {
      method: 'PATCH',
      body: {
        token: params.token,
      },
    })
      .then((res) => {
        setStatus('complete');
        setMsg(res.message!);
      })
      .catch((err: Error) => {
        setStatus('error');
        setError(
          err.message ||
            'Unable to reach server. Check your internet connection or try again later.'
        );
      });
  }, [status, params]);

  return (
    <div className={style.acc}>
      <div className={style.acc__backLink}>
        <BackLink replace />
      </div>
      <div className={style.acc__content}>
        <h1>Account Activation</h1>
        <p>Status: {status !== 'idle' && status}</p>
        <p>
          {msg
            ? `${msg}. You can now login.`
            : error
            ? `There was an error: ${error}`
            : ''}
        </p>
        {status === 'complete' && (
          <Button to="/login" label="Log In" color="blue" replace />
        )}
      </div>
    </div>
  );
};

export default ActivateAccount;
