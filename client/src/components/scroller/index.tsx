import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const Scroller = () => {
  const location = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType) window.scrollTo({ top: 0 });
  }, [location, navType]);

  return null;
};

export default Scroller;
