import { useState } from 'react';
import SuggestionsHeader from '../suggestions-header';
import UserLinks from '../user-links';
import SuggestionsFilter from '../suggestions-filter';
import RoadmapSummary from '../roadmap-summary';
import Portal from '../portal';
import style from './sidetab.module.scss';

const SuggestionsSideTab = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onButtonClick = () => setIsOpen(!isOpen);

  return (
    <div className={style.sideTab}>
      <SuggestionsHeader isOpen={isOpen} onButtonClick={onButtonClick} />
      <div
        className={
          style.sideTab__menu +
          (isOpen ? '' : ' ' + style['sideTab__menu--hidden'])
        }
      >
        <UserLinks />
        <SuggestionsFilter />
        <RoadmapSummary />
        <Portal hidden={!isOpen} onBgClick={onButtonClick} />
      </div>
    </div>
  );
};

export default SuggestionsSideTab;
