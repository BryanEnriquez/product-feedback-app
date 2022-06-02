import isEmail from 'validator/lib/isEmail';

const nameValidator = field => name => {
  if (name.length < 2 || name.length > 15)
    return 'Length requirement is not met.';
  else if (!/^[a-z]{2,15}$/i.test(name))
    return `${field} name may only contain letters.`;
};

const signupValidators = {
  username: val => {
    if (!/^[a-z0-9._]{4,20}$/i.test(val)) return 'Invalid username.';
  },
  firstName: nameValidator('First'),
  lastName: nameValidator('Last'),
  email: val => {
    if (!isEmail(val)) return 'Not a valid email.';
  },
  password: val => {
    if (!/^[a-zA-Z0-9!@#$%^&*]{8,72}$/.test(val))
      return 'Password criteria is not met.';
  },
};

export default signupValidators;
