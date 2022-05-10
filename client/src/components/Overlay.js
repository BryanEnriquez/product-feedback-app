import ReactDOM from 'react-dom';
import cn from 'classnames';
import '../css/Overlay.scss';

const overlayEl = document.getElementById('modal');

const Overlay = ({ hidden, onBgClick }) => {
  return ReactDOM.createPortal(
    <div
      className={cn('overlay', { 'overlay--hidden': hidden })}
      onClick={onBgClick}
    />,
    overlayEl
  );
};

export default Overlay;
