import { Link } from 'react-router-dom';
import style from './button.module.scss';

type Props = {
  to?: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  color?: 'blue' | 'violet' | 'dark' | 'red';
  prevPage?: string;
  replace?: boolean;
  /**
   * Extra classes to add to the link/button
   */
  extraCn?: string;
};

/**
 * Defaults to `type="submit"` if no `onClick` or `to` prop is passed.
 */
const Button = ({
  to,
  label,
  onClick,
  disabled = false,
  color = 'violet',
  /**
   * Link to set on the `location.state` object. Used so the app knows the previous page the user was on.
   */
  prevPage = '/',
  replace = false,
  extraCn = '',
}: Props) => {
  const baseClass = style[to ? 'link' : 'btn'];
  let classes = `${baseClass} ${style[`btn--${color}`]}`;
  if (extraCn) classes += ` ${extraCn}`;

  return to ? (
    <Link
      className={classes}
      to={to}
      {...(replace ? { replace } : { state: { prevPage } })}
    >
      {label}
    </Link>
  ) : onClick ? (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  ) : (
    <button type="submit" className={classes} disabled={disabled}>
      {label}
    </button>
  );
};

export default Button;
