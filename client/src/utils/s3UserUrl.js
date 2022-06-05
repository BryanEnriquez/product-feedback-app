export const getAvatarUrl = file =>
  `${process.env.REACT_APP_S3_BUCKET}/users/${file}`;
