import isEmail from 'validator/lib/isEmail';

const nameValidator = (field: string) => (name: string) => {
  if (name.length < 2 || name.length > 15)
    return 'Length requirement is not met.';
  else if (!/^[a-z]{2,15}$/i.test(name))
    return `${field} name may only contain letters.`;
};

type Validator = (val: string) => string | undefined;

export type SignupFields = 'username' | 'firstName' | 'lastName' | 'email';

const signupValidators: {
  [key in SignupFields | 'password']: Validator;
} = {
  username: (val: string) => {
    if (!/^[a-z0-9._]{4,20}$/i.test(val)) return 'Invalid username.';
  },
  firstName: nameValidator('First'),
  lastName: nameValidator('Last'),
  email: (val: string) => {
    if (!isEmail(val)) return 'Not a valid email.';
  },
  password: (val: string) => {
    if (!/^[a-zA-Z0-9!@#$%^&*]{8,72}$/.test(val))
      return 'Password criteria is not met.';
  },
};

export default signupValidators;
