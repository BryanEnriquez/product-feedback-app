import { useState, useRef, useEffect } from "react";
import cn from "classnames";
import { ReactComponent as ArrowDown } from "../images/shared/icon-arrow-down.svg";
import { ReactComponent as ArrowUp } from "../images/shared/icon-arrow-up.svg";
import "../css/Dropdown.scss";

function Dropdown({ label, options, selected, setSelected, disabled, type }) {
  const [open, setOpen] = useState(false);
  const feedbackRef = useRef(null);

  useEffect(() => {
    const cb = e => {
      if (disabled) return;
      if (!feedbackRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", cb);

    return () => document.removeEventListener("click", cb);
  }, [disabled]);

  const renderedOptions = options.map(el => (
    <li
      key={el.value}
      {...(el.value === selected.value && { className: "active" })}
      onClick={() => setSelected(el)}
    >
      {el.label}
    </li>
  ));

  return (
    <div className={`dd dd--${type}`}>
      <div className={`dd__box dd__box--${!disabled ? "enabled" : "disabled"}`}>
        <div
          className={cn("dd__btn", { "dd__btn--enabled": !disabled })}
          ref={feedbackRef}
          onClick={() => !disabled && setOpen(!open)}
        >
          <span className="dd__label">{label}&nbsp;</span>
          <div className={"dd__selected"}>{selected.label}</div>
        </div>
        {open ? <ArrowUp /> : <ArrowDown />}
      </div>
      <div
        className={cn("dd__list-wrapper", { "dd__list-wrapper--open": open })}
      >
        <ul className="dd__list">{renderedOptions}</ul>
      </div>
    </div>
  );
}

Dropdown.defaultProps = { type: "b" };

export default Dropdown;
