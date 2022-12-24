import { Link, useLocation } from 'react-router-dom';
import ArrowLeft from '../icons/arrow-left';
import style from './link.module.scss';

type Props = {
  /**
   * Link to send the user to when clicked. Uses the value in `location.state.prevPage` if any, otherwise it's `"/"`
   */
  customLink?: string;
  cn?: string;
  replace?: boolean;
  color?: 'blue' | 'white';
};

const BackLink = ({
  customLink,
  cn,
  replace = false,
  color = 'blue',
}: Props) => {
  const location = useLocation();

  return (
    <Link
      className={`${style.backLink} ${style[`backLink--${color}`]}${
        cn ? ` ${cn}` : ''
      }`}
      to={customLink || (location.state && location.state.prevPage) || '/'}
      replace={replace}
    >
      <ArrowLeft />
      Go Back
    </Link>
  );
};

export default BackLink;
