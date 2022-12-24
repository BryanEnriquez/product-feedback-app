import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import ArrowUp from '../icons/arrow-up';
import ArrowDown from '../icons/arrow-down';
import style from './dropdown.module.scss';

type DropdownOption = {
  id: string;
  label: string;
};

const Dropdown = <T extends DropdownOption>({
  label,
  description,
  options,
  selected,
  setSelected,
  disabled,
  type = 'b',
}: {
  label: string;
  description?: string;
  options: T[];
  selected: T;
  setSelected: (newOption: T) => void;
  disabled?: boolean;
  type?: 'a' | 'b';
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const labelRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Close dropdown if user didn't click it or its corresponding label
  useEffect(() => {
    const cb = (e: MouseEvent) => {
      if (disabled || !(e.target instanceof HTMLElement)) return;

      if (
        !(
          labelRef.current!.contains(e.target) ||
          btnRef.current!.contains(e.target)
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', cb);

    return () => document.removeEventListener('click', cb);
  }, [disabled]);

  const handleKeyPress = (el: T) => (event: KeyboardEvent) => {
    switch (event.key) {
      case ' ':
      case 'SpaceBar':
      case 'Enter':
        event.preventDefault();
        setSelected(el);
        setIsOpen(false);
    }
  };

  const toggleDropdown = () => !disabled && setIsOpen(!isOpen);

  const renderedOptions = options.map((el) => (
    <li
      key={el.id}
      {...(el.id === selected.id && { className: style.active })}
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
    <div className={`${style.dd} ${style[`dd--${type}`]}`}>
      <div
        className={`${style.dd__box} ${style[`dd__box--${type}`]}${
          disabled ? ` ${style[`dd__box--disabled`]}` : ''
        }`}
      >
        <span
          className={`${style.dd__label} ${style[`dd__label--${type}`]}`}
          ref={labelRef}
          onClick={toggleDropdown}
        >
          {label}&nbsp;
        </span>
        {description && <p className={style.dd__desc}>{description}</p>}
        <button
          type="button"
          className={`${style.dd__btn} ${style[`dd__btn--${type}`]}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          ref={btnRef}
          onClick={toggleDropdown}
        >
          {selected.label}
          {isOpen ? <ArrowUp /> : <ArrowDown />}
        </button>
      </div>
      <div
        className={`${style.dd__listWrapper} ${
          style[`dd__listWrapper--${type}`]
        }${isOpen ? ` ${style['dd__listWrapper--open']}` : ''}`}
      >
        <ul
          className={`${style.dd__list} ${style[`dd__list--${type}`]}`}
          role="listbox"
          aria-activedescendant={selected.label}
          tabIndex={-1}
        >
          {renderedOptions}
        </ul>
      </div>
    </div>
  );
};

export default Dropdown;
