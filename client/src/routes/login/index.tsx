import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../hooks';
import isEmail from 'validator/lib/isEmail';
import BackLink from '../../components/back-link';
import Button from '../../components/button';
import Dropdown from '../../components/dropdown';
import { login } from '../../features/user/currentUserSlice';
import { demoUsers } from '../../config/demoUsers';
import style from './login.module.scss';

const Login = () => {
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [pw, setPw] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [demoUser, setDemoUser] = useState(demoUsers[0]);
  const [status, setStatus] = useState<'idle' | 'pending' | 'fulfilled'>(
    'idle'
  );
  const [loginMsg, setLoginMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setEmail(demoUser.email);
    setPw(demoUser.pw);
    setShowPassword(false);
  }, [demoUser]);

  const onLoginClick = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginMsg('');

    const inputEmail = email.trim().slice(0, 50);
    const inputPw = pw.trim();

    let emailFeedback = '';
    let pwFeedback = '';

    if (!isEmail(inputEmail)) emailFeedback = 'Not a valid email.';
    setEmailErr(emailFeedback);

    if (inputPw.length < 8) pwFeedback = 'Invalid password.';
    setPwErr(pwFeedback);

    if (emailFeedback || pwFeedback) return;
    setStatus('pending');

    try {
      await dispatch(login({ email: inputEmail, password: inputPw })).unwrap();
      setStatus('fulfilled');
      setEmail('');
      setPw('');
    } catch (err) {
      setLoginMsg((err as SerializedError).message!);
      setTimeout(() => {
        if (!formRef.current) return;
        setStatus('idle');
      }, 2000);
    }
  };

  return (
    <div className={style.loginWrapper}>
      <div className={style.login}>
        <BackLink cn={style.backLink} />
        <h1>Log in with an existing account</h1>
        <p>{loginMsg}</p>
        <form className={style.form} ref={formRef} onSubmit={onLoginClick}>
          <div className={style.form__item}>
            <label htmlFor="email">Email</label>
            <input
              type="text"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <span className={style.form__err}>{emailErr}</span>
          </div>
          <div className={style.form__item}>
            <label htmlFor="password">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="current-password"
            />
            <span className={style.form__err}>{pwErr}</span>
          </div>
          <div>
            <Dropdown
              label="Demo User"
              description="Login as a demo user."
              options={demoUsers}
              selected={demoUser}
              setSelected={setDemoUser}
              disabled={status !== 'idle'}
              type="b"
            />
          </div>
          <div className={style.form__toggleItem}>
            <label htmlFor="pw-checkbox">Show password</label>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              id="pw-checkbox"
            />
          </div>
          <Button label="Log In" disabled={status !== 'idle'} />
        </form>
        <Link
          to="/signup"
          state={{ prevPage: '/login' }}
          className={style.login__signup}
        >
          Don't have an account? Sign up here!
        </Link>
      </div>
    </div>
  );
};

export default Login;
