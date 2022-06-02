import { Link, useLocation } from 'react-router-dom';
import { ReactComponent as LeftArrow } from '../images/shared/icon-arrow-left.svg';
import '../css/BackLink.scss';

function BackLink({ customLink, replace = false, color = 'blue' }) {
  const loc = useLocation();

  return (
    <Link
      className={`back-link back-link--${color}`}
      to={customLink || loc.state?.prevPage || '/'}
      replace={replace}
    >
      <LeftArrow aria-hidden={true} />
      Go Back
    </Link>
  );
}

export default BackLink;
