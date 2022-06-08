import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/Button';
import BackLink from '../components/BackLink';
import '../css/ActivateAccount.scss';

function ActivateAccount() {
  const [status, setStatus] = useState('idle');
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const params = useParams();

  useEffect(() => {
    if (status !== 'idle') return;

    setStatus('In-progress');

    axios
      .patch(`${process.env.REACT_APP_API}/users/activateAccount`, {
        token: params.token,
      })
      .then(res => {
        setStatus('Complete');
        setMsg(res.data.message);
      })
      .catch(err => {
        setStatus('Error');
        setError(
          err.response.data?.message ||
            'Unable to reach server. Check your internet connection or try again later.'
        );
      });
  }, [status, params]);

  return (
    <div className="acc-activate">
      <div className="acc-activate__backlink">
        <BackLink replace={true} />
      </div>
      <div className="acc-activate__main">
        <h1>Account Activation</h1>
        <p>Status: {status !== 'idle' && status}</p>
        <p>
          {msg
            ? `${msg}. You can now login.`
            : error
            ? `There was an error: ${error}`
            : ''}
        </p>
        {status === 'Complete' && (
          <Button to="/login" label="Log In" color="blue" replace={true} />
        )}
      </div>
    </div>
  );
}

export default ActivateAccount;
