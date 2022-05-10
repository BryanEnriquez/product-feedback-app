import { Link } from "react-router-dom";
import "../css/Button.scss";

function Button(props) {
  const base = props.to ? "link" : "btn";
  const style = `${base} btn--${props.color}`;

  return props.to ? (
    <Link className={style} to={props.to}>
      {props.label}
    </Link>
  ) : (
    <button className={style} onClick={props.onClick} disabled={props.disabled}>
      {props.label}
    </button>
  );
}

Button.defaultProps = { color: "violet", disabled: false };

export default Button;
