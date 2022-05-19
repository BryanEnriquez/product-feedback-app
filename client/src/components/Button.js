import { Link } from 'react-router-dom';
import '../css/Button.scss';

function Button({ to, label, onClick, onSubmit, disabled, color }) {
  const base = to ? 'link' : 'btn';
  const style = `${base} btn--${color}`;

  return to ? (
    <Link className={style} to={to}>
      {label}
    </Link>
  ) : onClick ? (
    <button className={style} onClick={onClick} disabled={disabled}>
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

Button.defaultProps = { color: 'violet', disabled: false };

export default Button;
