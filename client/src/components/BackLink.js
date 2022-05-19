import { useNavigate } from 'react-router-dom';
import '../css/BackLink.scss';

function BackLink({ to }) {
  const navigate = useNavigate();

  return (
    <button className="back-link" onClick={() => navigate(to)}>
      Go Back
    </button>
  );
}

BackLink.defaultProps = { to: '/' };

export default BackLink;
