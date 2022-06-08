import { useState } from 'react';
import { useDispatch } from 'react-redux';
import FormItem from '../../../components/FormItem';
import Button from '../../../components/Button';
import { updateBasicInfo } from '../currentUserSlice';
import validators from '../../../config/signupValidators';
import ax from '../../../utils/axios';

function UserInfoForm({ currentUser, setOptionLocked }) {
  const [firstName, setFirstName] = useState(currentUser.firstName);
  const [firstNameErr, setFirstNameErr] = useState(null);
  const [lastName, setLastName] = useState(currentUser.lastName);
  const [lastNameErr, setLastNameErr] = useState(null);
  const [status, setStatus] = useState('idle');
  const [reqErr, setReqErr] = useState(null);
  const dispatch = useDispatch();

  const handleSubmit = e => {
    e.preventDefault();
    if (status !== 'idle') return;

    let err = false;

    const inputs = [
      ['firstName', firstName, setFirstNameErr],
      ['lastName', lastName, setLastNameErr],
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

    if (err) return;

    if (
      firstName === currentUser.firstName &&
      lastName === currentUser.lastName
    ) {
      return setReqErr('Nothing to update.');
    }

    setOptionLocked(true);
    setStatus('pending');
    setReqErr(null);

    ax.patch('/users/me', { firstName, lastName })
      .then(res => {
        const { firstName, lastName } = res.data.data.data;

        dispatch(updateBasicInfo({ firstName, lastName }));
      })
      .catch(err => {
        setReqErr(
          err.response.data?.message ||
            'This action could not be completed at this time.'
        );
      })
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
      {reqErr && <span className="form__req-err">{reqErr}</span>}
      <FormItem
        id="first-name"
        label="First Name"
        desc="Update your first name."
        val={firstName}
        setVal={setFirstName}
        err={firstNameErr}
      />
      <FormItem
        id="last-name"
        label="Last Name"
        desc="Update your last name."
        val={lastName}
        setVal={setLastName}
        err={lastNameErr}
      />
      <div className="form__btns form__btns--2">
        <Button
          label="Update"
          disabled={status !== 'idle'}
          onSubmit={handleSubmit}
        />
        <Button
          label="Reset"
          disabled={status !== 'idle'}
          onClick={handleReset}
          color="dark"
        />
      </div>
    </form>
  );
}

export default UserInfoForm;
