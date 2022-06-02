import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const Scroller = () => {
  const loc = useLocation();
  const nav = useNavigationType();

  useEffect(() => {
    if (nav === 'PUSH') window.scrollTo({ top: 0 });
  }, [loc, nav]);

  return null;
};

export default Scroller;
