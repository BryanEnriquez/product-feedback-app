import ReactDOM from 'react-dom';
import style from './portal.module.scss';

const portalEl = document.getElementById('portal') as HTMLElement;

type Props = {
  hidden: boolean;
  onBgClick: () => void;
};

const Portal = ({ hidden, onBgClick }: Props) => {
  return ReactDOM.createPortal(
    <div
      className={style.portal + (hidden ? ' ' + style['portal--hidden'] : '')}
      onClick={onBgClick}
    />,
    portalEl
  );
};

export default Portal;
