import { useState } from 'react';
import { useAppDispatch } from '../../../hooks';
import FormItem from '../../../components/form-item';
import Button from '../../../components/button';
import { updateBasicInfo } from '../currentUserSlice';
import signupValidators from '../../../config/signupValidators';
import { client } from '../../../client';
import type { CurrentUser } from '../../../@types';

type Props = {
  currentUser: CurrentUser;
  setOptionLocked: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserInfoForm = ({ currentUser, setOptionLocked }: Props) => {
  const [firstName, setFirstName] = useState(currentUser.firstName);
  const [firstNameErr, setFirstNameErr] = useState<string | null>(null);
  const [lastName, setLastName] = useState(currentUser.lastName);
  const [lastNameErr, setLastNameErr] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending'>('idle');
  const [reqErr, setReqErr] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (status !== 'idle') return;

    let err = false;

    const inputs = [
      ['firstName', firstName, setFirstNameErr],
      ['lastName', lastName, setLastNameErr],
    ] as const;

    inputs.forEach(([field, input, setFieldErr]) => {
      const inputErr = signupValidators[field](input);

      if (inputErr) {
        err = true;
        setFieldErr(inputErr);
      } else setFieldErr(null);
    });

    if (err) return;

    if (
      firstName === currentUser.firstName &&
      lastName === currentUser.lastName
    )
      return setReqErr('Nothing to update.');

    setOptionLocked(true);
    setStatus('pending');
    setReqErr(null);

    client<{
      data: {
        accountUid: string;
        firstName: string;
        lastName: string;
      };
    }>('users/me', {
      method: 'PATCH',
      body: { firstName, lastName },
    })
      .then((res) => {
        const { firstName, lastName } = res.data.data;
        dispatch(updateBasicInfo({ firstName, lastName }));
      })
      .catch((err: Error) => setReqErr(err.message))
      .finally(() => {
        setOptionLocked(false);
        setStatus('idle');
      });
  };

  const handleReset = () => {
    if (status !== 'idle') return;

    setFirstName(currentUser.firstName);
    setFirstNameErr(null);
    setLastName(currentUser.lastName);
    setLastNameErr(null);
    setReqErr(null);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      {reqErr && <span className="form__reqErr">{reqErr}</span>}
      <FormItem
        id="first-name"
        label="First Name"
        desc="Update your first name."
        value={firstName}
        onChange={setFirstName}
        err={firstNameErr}
      />
      <FormItem
        id="last-name"
        label="Last Name"
        desc="Update your last name."
        value={lastName}
        onChange={setLastName}
        err={lastNameErr}
      />
      <div className="form__btns form__btns--2">
        <Button label="Update" disabled={status !== 'idle'} />
        <Button
          label="Reset"
          disabled={status !== 'idle'}
          onClick={handleReset}
          color="dark"
        />
      </div>
    </form>
  );
};

export default UserInfoForm;
