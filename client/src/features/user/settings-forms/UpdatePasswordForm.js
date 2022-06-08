import { useState } from 'react';
import axios from 'axios';
import FormItem from '../../../components/FormItem';
import Button from '../../../components/Button';
import validators from '../../../config/signupValidators';

function UpdatePasswordForm({ currentUser, setOptionLocked }) {
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [pwCurrentErr, setPwCurrentErr] = useState(null);
  const [password, setPassword] = useState('');
  const [pwErr, setPwErr] = useState(null);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [pwConfirmErr, setPwConfirmErr] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState('idle');
  const [reqErr, setReqErr] = useState(null);
  const [msg, setMsg] = useState(null);

  const disabled = currentUser.role === 'demo user';

  const resetForm = () => {
    if (status !== 'idle') return;

    setPasswordCurrent('');
    setPwCurrentErr(null);
    setPassword('');
    setPwErr(null);
    setPasswordConfirm('');
    setPwConfirmErr(null);
    setShowPw(false);
    setReqErr(null);
  };

  const handleReset = () => {
    if (status !== 'idle') return;
    resetForm();
    setMsg(null);
  };

  const handleSubmit = e => {
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

    const newPwErr = validators.password(password);
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

    axios
      .patch(`${process.env.REACT_APP_API}/users/updateMyPassword`, {
        passwordCurrent: currentPwInput,
        password,
        passwordConfirm,
      })
      .then(_ => {
        resetForm();
        setMsg('Password was successfully updated!');
      })
      .catch(err => {
        setReqErr(
          err.response.data?.message ||
            'Unable to reach server. Try again later.'
        );
      })
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
      {reqErr && <span className="form__req-err">{reqErr}</span>}
      <FormItem
        type={showPw ? 'text' : 'password'}
        id="current-password"
        label="Current Password"
        desc="Enter your current password."
        val={passwordCurrent}
        setVal={setPasswordCurrent}
        err={pwCurrentErr}
        disabled={disabled}
      />
      <FormItem
        type={showPw ? 'text' : 'password'}
        id="new-password"
        label="New Password"
        desc="Enter your new password. Valid characters include: letters, numbers, !@#$%^&*"
        val={password}
        setVal={setPassword}
        err={pwErr}
        disabled={disabled}
      />
      <FormItem
        type={showPw ? 'text' : 'password'}
        id="new-password-confirm"
        label="New Password Confirmation"
        desc="Confirm your new password."
        val={passwordConfirm}
        setVal={setPasswordConfirm}
        err={pwConfirmErr}
        disabled={disabled}
      />
      <div className="form__toggle-item">
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
        <Button
          label="Update"
          disabled={status !== 'idle' || disabled}
          onSubmit={handleSubmit}
        />
        <Button
          label="Reset"
          disabled={status !== 'idle' || disabled}
          onClick={handleReset}
          color="dark"
        />
      </div>
    </form>
  );
}

export default UpdatePasswordForm;
