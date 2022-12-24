export const getAvatarUrl = (file: string) =>
  `${import.meta.env.VITE_S3_BUCKET}/users/${file}`;
