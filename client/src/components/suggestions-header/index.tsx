import Picture from '../picture';
import style from './header.module.scss';

const headerBackground: [string, string, string] = [
  '/images/headerBgS.png',
  '/images/headerBgM.png',
  '/images/headerBgL.png',
];

const iconHamburger = '/images/icon-hamburger.svg';
const iconClose = '/images/icon-close.svg';

type HeaderProps = {
  isOpen: boolean;
  onButtonClick: () => void;
};

const SuggestionsHeader = ({ isOpen, onButtonClick }: HeaderProps) => (
  <header className={style.header}>
    <div className={style.header__text}>
      <h1>
        Frontend Mentor <span>Feedback Board</span>
      </h1>
      <button type="button" onClick={onButtonClick}>
        <img src={isOpen ? iconClose : iconHamburger} alt="" />
      </button>
    </div>
    <Picture imgs={headerBackground} loading="eager" />
  </header>
);

export default SuggestionsHeader;
