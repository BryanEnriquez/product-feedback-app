import { useState } from 'react';
import FormItem from '../../../components/form-item';
import Button from '../../../components/button';
import signupValidators from '../../../config/signupValidators';
import { client } from '../../../client';
import type { CurrentUser } from '../../../@types';

type Props = {
  currentUser: CurrentUser;
  setOptionLocked: React.Dispatch<React.SetStateAction<boolean>>;
};

const UpdatePasswordForm = ({ currentUser, setOptionLocked }: Props) => {
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [pwCurrentErr, setPwCurrentErr] = useState<string | null>('');
  const [password, setPassword] = useState('');
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [pwConfirmErr, setPwConfirmErr] = useState<string | null>('');
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending'>('idle');
  const [reqErr, setReqErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>('');

  const disabled = currentUser.role === 'demo user';

  const resetForm = () => {
    setPasswordCurrent('');
    setPwCurrentErr(null);
    setPassword('');
    setPwErr(null);
    setPasswordConfirm('');
    setPwConfirmErr(null);
    setShowPw(false);
    setReqErr(null);
  };

  const onFormReset = () => {
    if (status === 'idle') {
      resetForm();
      setMsg(null);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (status !== 'idle' || disabled) return;

    setReqErr(null);
    setMsg(null);

    let err = false;

    const currentPwInput = passwordCurrent.trim();

    if (currentPwInput.length < 8) {
      err = true;
      setPwCurrentErr(
        'Double check your input. Minimum password length is 8 characters.'
      );
    } else setPwCurrentErr(null);

    const newPwErr = signupValidators.password(password);

    if (newPwErr) {
      err = true;
      setPwErr(newPwErr);
    } else setPwErr(null);

    if (password !== passwordConfirm) {
      err = true;
      setPwConfirmErr('New password and password confirmation do not match.');
    } else setPwConfirmErr(null);

    if (err) return;

    setOptionLocked(true);
    setStatus('pending');

    client('users/updateMyPassword', {
      method: 'PATCH',
      body: {
        passwordCurrent: currentPwInput,
        password,
        passwordConfirm,
      },
    })
      .then((_) => {
        resetForm();
        setMsg('Password was successfully updated!');
      })
      .catch((err: Error) => setReqErr(err.message))
      .finally(() => {
        setOptionLocked(false);
        setStatus('idle');
        setShowPw(false);
      });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      {(disabled || msg) && (
        <span className="form__notice">
          {disabled ? 'This feature is restricted to regular users.' : msg}
        </span>
      )}
      {reqErr && <span className="form__reqErr">{reqErr}</span>}
      <FormItem
        type="text"
        id="username"
        label="Username"
        desc={`Updating password for: ${currentUser.username}`}
        hidden
        disabled
        autoComplete="username"
      />
      <FormItem
        type={showPw ? 'text' : 'password'}
        id="current-password"
        label="Current Password"
        desc="Enter your current password."
        value={passwordCurrent}
        onChange={setPasswordCurrent}
        err={pwCurrentErr}
        disabled={disabled}
        autoComplete="current-password"
      />
      <FormItem
        type={showPw ? 'text' : 'password'}
        id="new-password"
        label="New Password"
        desc="Enter your new password. Valid characters include: letters, numbers, !@#$%^&*"
        value={password}
        onChange={setPassword}
        err={pwErr}
        disabled={disabled}
        autoComplete="new-password"
      />
      <FormItem
        type={showPw ? 'text' : 'password'}
        id="new-password-confirm"
        label="New Password Confirmation"
        desc="Confirm your new password."
        value={passwordConfirm}
        onChange={setPasswordConfirm}
        err={pwConfirmErr}
        disabled={disabled}
        autoComplete="new-password"
      />
      <div className="form__toggleItem">
        <label htmlFor="show-password">Show password</label>
        <input
          type="checkbox"
          id="show-password"
          checked={showPw}
          onChange={() => setShowPw(!showPw)}
          disabled={disabled}
        />
      </div>
      <div className="form__btns form__btns--2">
        <Button label="Update" disabled={status !== 'idle' || disabled} />
        <Button
          label="Reset"
          disabled={status !== 'idle' || disabled}
          onClick={onFormReset}
          color="dark"
        />
      </div>
    </form>
  );
};

export default UpdatePasswordForm;
