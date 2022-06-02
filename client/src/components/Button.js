import { Link } from 'react-router-dom';
import '../css/Button.scss';

function Button({
  to,
  label,
  onClick,
  onSubmit,
  disabled = false,
  color = 'violet',
  prevPage = '/',
  replace = false,
}) {
  const base = to ? 'link' : 'btn';
  const style = `${base} btn--${color}`;

  return to ? (
    <Link
      className={style}
      to={to}
      {...(replace ? { replace } : { state: { prevPage } })}
      // state={{ prevPage }
    >
      {label}
    </Link>
  ) : onClick ? (
    <button
      type="button"
      className={style}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  ) : (
    <button
      type="submit"
      className={style}
      onSubmit={onSubmit}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

export default Button;
