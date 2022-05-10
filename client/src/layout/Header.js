import { ReactComponent as IconMenu } from '../images/shared/mobile/icon-hamburger.svg';
import { ReactComponent as IconClose } from '../images/shared/mobile/icon-close.svg';
import '../css/Header.scss';

function Header({ h1Text, subText, open, onBtnClick }) {
  return (
    <>
      <header className="header">
        <h1>
          {h1Text}
          <span>{subText}</span>
        </h1>
        <button className="header__btn" onClick={onBtnClick}>
          {open ? <IconClose /> : <IconMenu />}
        </button>
      </header>
    </>
  );
}

export default Header;
