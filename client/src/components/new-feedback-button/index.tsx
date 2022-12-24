import { useLocation } from 'react-router-dom';
import Button from '../button';
import type { CurrentUserStates } from '../../@types';

type Props = {
  currentUser: CurrentUserStates;
};

const AddFeedbackButton = ({ currentUser }: Props) => {
  const location = useLocation();

  return (
    <Button
      to={currentUser ? '/new-feedback' : currentUser === null ? '/' : '/login'}
      label="+ Add Feedback"
      prevPage={location.pathname}
    />
  );
};

export default AddFeedbackButton;
