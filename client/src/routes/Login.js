import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import isEmail from 'validator/lib/isEmail';
import BackLink from '../components/BackLink';
import Button from '../components/Button';
import Dropdown from '../components/Dropdown';
import { login } from '../features/user/currentUserSlice';
import { demoUsers } from '../config/demoUsers';
import '../css/Login.scss';

function Login() {
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [pw, setPw] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [demoUser, setDemoUser] = useState(demoUsers[0]);
  const [status, setStatus] = useState('idle');
  const [loginMsg, setLoginMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    setEmail(demoUser.email);
    setPw(demoUser.pw);
    setShowPassword(false);
  }, [demoUser]);

  const onLoginClick = async e => {
    e.preventDefault();
    setLoginMsg('');

    const inputEmail = email.trim().slice(0, 50);
    const inputPw = pw.trim();

    let emailFb = '';
    let pwFb = '';
    if (!isEmail(inputEmail)) emailFb = 'Not a valid email.';
    setEmailErr(emailFb);
    if (inputPw.length < 8) pwFb = 'Invalid password.';
    setPwErr(pwFb);

    if (emailFb || pwFb) return;
    setStatus('pending');

    try {
      await dispatch(login({ email, password: pw })).unwrap();
      setStatus('fulfilled');
      setEmail('');
      setPw('');
    } catch (err) {
      setLoginMsg(err);
      setTimeout(() => {
        if (!formRef.current) return;
        setStatus('idle');
      }, 2000);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login">
        <BackLink />
        <h1>Log in with an existing account</h1>
        <p>{loginMsg}</p>
        <form className="login-form" ref={formRef} onSubmit={onLoginClick}>
          <div className="login-form__item">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              name="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <span className="login-form__err">{emailErr}</span>
          </div>
          <div className="login-form__item">
            <label htmlFor="password">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
            />
            <span className="login-form__err">{pwErr}</span>
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
          <div className="login-form__toggle-item">
            <label htmlFor="pw-checkbox">Show password</label>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              id="pw-checkbox"
            />
          </div>
          <Button
            onSubmit={onLoginClick}
            label="Log In"
            disabled={status !== 'idle'}
          />
        </form>
        <Link
          to="/signup"
          state={{ prevPage: '/login' }}
          className="login__signup"
        >
          Don't have an account? Sign up here!
        </Link>
      </div>
    </div>
  );
}

export default Login;
