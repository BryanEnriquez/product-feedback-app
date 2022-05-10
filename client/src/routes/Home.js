import { useState } from 'react';
import cn from 'classnames';
import Header from '../layout/Header';
import SessionLink from '../features/user/SessionLink';
import Filter from '../components/Filter';
import Stats from '../components/Stats';
import SortTab from '../components/SortTab';
import Overlay from '../components/Overlay';
import SuggestionsList from '../features/suggestions/SuggestionsList';
import '../css/Home.scss';

const SideTab = () => {
  const [open, setOpen] = useState(false);
  const onBtnClick = () => setOpen(!open);

  return (
    <div className="home__sidetab">
      <Header
        h1Text="Frontend Mentor"
        subText="Feedback Board"
        open={open}
        onBtnClick={onBtnClick}
      />
      <div className={cn('home__menu', { 'home__menu--hidden': !open })}>
        <div className="home__menu-box">
          <SessionLink className="home__login" />
          <Filter />
          <Stats />
        </div>
      </div>
      {<Overlay hidden={!open} onBgClick={onBtnClick} />}
    </div>
  );
};

function Home() {
  return (
    <div className="home">
      <SideTab />
      <SortTab />
      <SuggestionsList />
    </div>
  );
}

export default Home;
