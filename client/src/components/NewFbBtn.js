import { useLocation } from 'react-router-dom';
import Button from './Button';

function NewFbBtn({ currentUser }) {
  const loc = useLocation();

  return (
    <Button
      to={currentUser ? '/new-feedback' : currentUser === null ? '/' : '/login'}
      label="+ Add Feedback"
      prevPage={loc.pathname}
    />
  );
}

export default NewFbBtn;
