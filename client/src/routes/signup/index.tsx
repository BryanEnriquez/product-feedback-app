import { useRef, useState } from 'react';
import FormWrapper from '../../layout/form-wrapper';
import FormItem from '../../components/form-item';
import Button from '../../components/button';
import { client } from '../../client';
import validators from '../../config/signupValidators';
import type { SignupFields } from '../../config/signupValidators';

type Password = 'password';
type PasswordConfirm = 'passwordConfirm';

type SignupFieldsFull = SignupFields | PasswordConfirm | Password;

type Field<T> = [field: T, label: string, description: string];

type FormField = Field<SignupFields>;

type PasswordField = Field<Password>;

type PasswordConfirmField = Field<PasswordConfirm>;

type FilteredFormInputs = {
  [key in SignupFieldsFull]: string;
};

const formFields: [PasswordConfirmField, PasswordField, ...FormField[]] = [
  ['passwordConfirm', 'Password Confirmation', 'Confirm your password.'],
  [
    'password',
    'Password',
    'Enter a password (8-72 characters). Valid characters include: letters, numbers, !@#$%^&*',
  ],
  [
    'username',
    'Username',
    'Pick a username between 4-20 characters. Valid characters include: letters, numbers, . (period), _ (underscore).',
  ],
  ['firstName', 'First Name', 'Enter your first name (2-15 letters).'],
  ['lastName', 'Last Name', 'Enter your last name (2-15 letters).'],
  ['email', 'Email Address', 'Enter a valid email.'],
];

type FormErrors = {
  [key in SignupFieldsFull]?: string;
};

type SignupFormProps = {
  setSignupComplete: React.Dispatch<React.SetStateAction<boolean>>;
};

const SignupForm = ({ setSignupComplete }: SignupFormProps) => {
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending'>('idle');
  const [reqErr, setReqErr] = useState<null | string>(null);
  const [disabled, setDisabled] = useState(false);
  const formEl = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (status !== 'idle' || !formEl.current) return;

    let validationErr = false;

    const filteredInputs: Partial<FilteredFormInputs> = {};

    const formData = new FormData(formEl.current);

    (
      [...formData.entries()] as [SignupFieldsFull, FormDataEntryValue][]
    ).forEach(([field, val]) => {
      filteredInputs[field] =
        val instanceof File ? '' : val.trim().replace(/\s+/g, ' ');
    });

    const errorsObj: FormErrors = {};

    (formFields.slice(1) as FormField[]).forEach(([field]) => {
      const err = validators[field](filteredInputs[field]!);

      if (err) {
        errorsObj[field] = err;
        validationErr = true;
      }
    });

    if (filteredInputs['password'] !== filteredInputs['passwordConfirm']) {
      validationErr = true;
      errorsObj.passwordConfirm = 'Passwords to not match.';
    } else errorsObj.passwordConfirm = '';

    if (validationErr) return setFormErrors(errorsObj);

    setStatus('pending');
    setDisabled(true);
    setReqErr(null);

    client('users/signup', {
      method: 'POST',
      body: filteredInputs,
    })
      .then(() => setSignupComplete(true))
      .catch((err: Error) => {
        setStatus('idle');
        setDisabled(false);
        setReqErr(
          err.message ||
            'Unable to reach server. Check your internet connection or try again later.'
        );
      });
  };

  const handleReset = () => {
    if (!disabled) {
      setFormErrors({});
      formEl.current!.reset();
      setShowPw(false);
    }
  };

  const [pwConfirmField, pwField, ...fields] = formFields;

  return (
    <form ref={formEl} className="form" onSubmit={handleSubmit}>
      <span className="form__reqErr">{reqErr}</span>
      {fields.map(([id, label, desc]) => (
        <FormItem
          key={id}
          id={id}
          label={label}
          desc={desc}
          err={formErrors[id]}
        />
      ))}
      <FormItem
        id={pwField[0]}
        type={showPw ? 'text' : 'password'}
        label={pwField[1]}
        desc={pwField[2]}
        err={formErrors[pwField[0]]}
      />
      <FormItem
        id={pwConfirmField[0]}
        type={showPw ? 'text' : 'password'}
        label={pwConfirmField[1]}
        desc={pwConfirmField[2]}
        err={formErrors[pwConfirmField[0]]}
      />
      <div className="form__toggleItem">
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
};

const Signup = () => {
  const [isSignupComplete, setIsSignupComplete] = useState(false);

  const SuccessMsg = () => (
    <p className="form__success">
      Your account has been created. Check your email's inbox for an activation
      link.
    </p>
  );

  return (
    <FormWrapper
      title={isSignupComplete ? 'Success!' : 'User Sign Up'}
      icon="signup"
    >
      {isSignupComplete ? (
        SuccessMsg()
      ) : (
        <SignupForm setSignupComplete={setIsSignupComplete} />
      )}
    </FormWrapper>
  );
};

export default Signup;
