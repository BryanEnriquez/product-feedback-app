import { useState } from 'react';
import axios from 'axios';
import FormWrapper from '../layout/FormWrapper';
import FormItem from '../components/FormItem';
import Button from '../components/Button';
import validators from '../config/signupValidators';

function SignupForm({ setSignupComplete }) {
  const [username, setUsername] = useState('');
  const [usernameErr, setUsernameErr] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [firstNameErr, setFirstNameErr] = useState(null);
  const [lastName, setLastName] = useState('');
  const [lastNameErr, setLastNameErr] = useState(null);
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState(null);
  const [password, setPassword] = useState('');
  const [pwErr, setPwErr] = useState(null);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [pwConfirmErr, setPwConfirmErr] = useState(null);
  const [showPw, setShowPw] = useState(false);

  const [status, setStatus] = useState('idle');
  const [reqErr, setReqErr] = useState(null);
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    if (status !== 'idle') return;

    let err = false;

    const inputs = [
      ['username', username, setUsernameErr],
      ['firstName', firstName, setFirstNameErr],
      ['lastName', lastName, setLastNameErr],
      ['email', email, setEmailErr],
      ['password', password, setPwErr],
    ];

    inputs.forEach(([field, input, setFieldErr]) => {
      const inputErr = validators[field](input);

      if (inputErr) {
        err = true;
        setFieldErr(inputErr);
      } else {
        setFieldErr(null);
      }
    });

    if (password !== passwordConfirm) {
      err = true;
      setPwConfirmErr('Passwords to not match.');
    } else {
      setPwConfirmErr(null);
    }

    if (err) return;

    setStatus('pending');
    setDisabled(true);
    setReqErr(null);

    axios
      .post('/api/v1/users/signup', {
        username,
        firstName,
        lastName,
        email,
        password,
        passwordConfirm,
      })
      .then(() => setSignupComplete(true))
      .catch(err => {
        setStatus('idle');
        setDisabled(false);
        const msg =
          err.response.data?.message ||
          'Unable to reach server. Check your internet connection or try again later.';
        setReqErr(msg);
      });
  };

  const handleReset = e => {
    e.preventDefault();
    if (disabled) return;

    setReqErr(null);
    setUsername('');
    setUsernameErr(null);
    setFirstName('');
    setFirstNameErr(null);
    setLastName('');
    setLastNameErr(null);
    setEmail('');
    setEmailErr(null);
    setPassword('');
    setPwErr(null);
    setPasswordConfirm('');
    setPwConfirmErr(null);
    setShowPw(false);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      {<span className="form__req-err">{reqErr}</span>}
      <FormItem
        id="username"
        label="Username"
        desc="Pick a username between 4-20 characters. Valid characters include: letters, numbers, . (period), _ (underscore)."
        val={username}
        setVal={setUsername}
        err={usernameErr}
      />
      <FormItem
        id="first-name"
        label="First Name"
        desc="Enter your first name (2-15 letters)."
        val={firstName}
        setVal={setFirstName}
        err={firstNameErr}
      />
      <FormItem
        id="last-name"
        label="Last Name"
        desc="Enter your last name (2-15 letters)."
        val={lastName}
        setVal={setLastName}
        err={lastNameErr}
      />
      <FormItem
        id="email"
        label="Email Address"
        desc="Enter a valid email."
        val={email}
        setVal={setEmail}
        err={emailErr}
      />
      <FormItem
        id="password"
        type={showPw ? 'text' : 'password'}
        label="Password"
        desc="Enter a password (8-72 characters). Valid characters include: letters, numbers, !@#$%^&*"
        val={password}
        setVal={setPassword}
        err={pwErr}
      />
      <FormItem
        id="password-confirm"
        type={showPw ? 'text' : 'password'}
        label="Password Confirmation"
        desc="Confirm your password."
        val={passwordConfirm}
        setVal={setPasswordConfirm}
        err={pwConfirmErr}
      />
      <div className="form__toggle-item">
        <label htmlFor="show-password">Show password</label>
        <input
          type="checkbox"
          checked={showPw}
          onChange={() => setShowPw(!showPw)}
          id="show-password"
        />
      </div>
      <div className="form__btns form__btns--2">
        <Button
          label={status === 'idle' ? 'Submit' : 'Sending..'}
          disabled={disabled}
          onSubmit={handleSubmit}
        />
        <Button
          label="Reset Form"
          disabled={disabled}
          onClick={handleReset}
          color="dark"
        />
      </div>
    </form>
  );
}

function Signup() {
  const [signupComplete, setSignupComplete] = useState(false);

  const SuccessMsg = () => (
    <p className="form__success">
      Your account has been created. Check your email's inbox for an activation
      link.
    </p>
  );

  return (
    <FormWrapper
      title={signupComplete ? 'Success!' : 'User Sign Up'}
      type="signup"
    >
      {signupComplete ? (
        SuccessMsg()
      ) : (
        <SignupForm setSignupComplete={setSignupComplete} />
      )}
    </FormWrapper>
  );
}

export default Signup;
