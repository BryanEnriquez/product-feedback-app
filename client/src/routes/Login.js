import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Button from '../components/Button';
import isEmail from 'validator/lib/isEmail';
import { login } from '../features/user/currentUserSlice';
import '../css/Login.scss';

function Login() {
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [pw, setPw] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [status, setStatus] = useState('idle');
  const [loginMsg, setLoginMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef(null);
  const dispatch = useDispatch();

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
      setStatus('filfilled');
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
    <div className="login-wrapper" onSubmit={onLoginClick}>
      <div className="login">
        <div>Go Back</div>
        <h1>Log in with an existing account</h1>
        <p>{loginMsg}</p>
        <form ref={formRef}>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              name="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <span>{emailErr}</span>
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
            />
            <span>{pwErr}</span>
          </div>
          <div>
            <label htmlFor="pw-checkbox">Show password</label>
            <input
              type="checkbox"
              value={showPassword}
              onClick={() => setShowPassword(!showPassword)}
              id="pw-checkbox"
            />
          </div>
          <Button
            onClick={onLoginClick}
            label="Log In"
            color="blue"
            disabled={status !== 'idle'}
          />
        </form>
        <Link to="/signup">Don't have an account? Sign up here!</Link>
      </div>
    </div>
  );
}

export default Login;
