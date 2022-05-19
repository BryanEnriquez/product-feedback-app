import { useState, useRef, useEffect } from 'react';
import cn from 'classnames';
import { ReactComponent as ArrowDown } from '../images/shared/icon-arrow-down.svg';
import { ReactComponent as ArrowUp } from '../images/shared/icon-arrow-up.svg';
import '../css/Dropdown.scss';

function Dropdown({
  label,
  description,
  options,
  selected,
  setSelected,
  disabled,
  type,
}) {
  const [open, setOpen] = useState(false);
  const labelRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const cb = e => {
      if (disabled) return;
      if (
        !(
          labelRef.current.contains(e.target) ||
          btnRef.current.contains(e.target)
        )
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('click', cb);

    return () => document.removeEventListener('click', cb);
  }, [disabled]);

  const handleKeyPress = el => e => {
    switch (e.key) {
      case ' ':
      case 'SpaceBar':
      case 'Enter':
        e.preventDefault();
        setSelected(el);
        setOpen(false);
        break;
      default:
        break;
    }
  };

  const toggle = () => !disabled && setOpen(!open);

  const renderedOptions = options.map(el => (
    <li
      key={el.id}
      {...(el.id === selected.id && { className: 'active' })}
      onClick={() => setSelected(el)}
      onKeyDown={handleKeyPress(el)}
      id={el.id}
      role="option"
      aria-selected={el.id === selected.id}
      tabIndex={0}
    >
      {el.label}
    </li>
  ));

  return (
    <div className={`dd dd--${type}`}>
      <div
        className={`dd__box dd__box--${type} dd__box--${
          !disabled ? 'enabled' : 'disabled'
        }`}
      >
        <span
          className={`dd__label dd__label--${type}`}
          ref={labelRef}
          onClick={toggle}
        >
          {label}&nbsp;
        </span>
        {description && <p className="dd__desc">{description}</p>}
        <button
          type="button"
          className={`dd__btn dd__btn--${type}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          ref={btnRef}
          onClick={toggle}
        >
          {selected.label}
          {open ? (
            <ArrowUp aria-hidden="true" tabIndex={-1} />
          ) : (
            <ArrowDown aria-hidden="true" tabIndex={-1} />
          )}
        </button>
      </div>
      <div
        className={cn(`dd__list-wrapper dd__list-wrapper--${type}`, {
          'dd__list-wrapper--open': open,
        })}
      >
        <ul
          className="dd__list"
          role="listbox"
          aria-activedescendant={selected.label}
          tabIndex={-1}
        >
          {renderedOptions}
        </ul>
      </div>
    </div>
  );
}

Dropdown.defaultProps = { type: 'b' };

export default Dropdown;
