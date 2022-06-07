import UserInfoForm from './UserInfoForm';
import ProfilePictureForm from './ProfilePictureForm';
import UpdatePasswordForm from './UpdatePasswordForm';

export const settings = [
  { id: 'user-info', label: 'Basic Information', Form: UserInfoForm },
  { id: 'profile-pic', label: 'Profile Picture', Form: ProfilePictureForm },
  { id: 'update-password', label: 'Update Password', Form: UpdatePasswordForm },
];
