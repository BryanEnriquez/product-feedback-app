import { useAppSelector } from '../../hooks';
import AddFeedbackButton from '../new-feedback-button';
import SuggestionsCounter from '../suggestions-counter';
import SuggestionsDropdown from '../suggestions-dropdown';
import { selectCurrentUser } from '../../features/user/currentUserSlice';
import style from './sortTab.module.scss';

const SuggestionsSortTab = () => {
  const user = useAppSelector(selectCurrentUser);

  return (
    <div className={style.sortTab}>
      <div className={style.sortTab__inputBox}>
        <SuggestionsCounter />
        <SuggestionsDropdown />
      </div>
      <AddFeedbackButton currentUser={user} />
    </div>
  );
};

export default SuggestionsSortTab;
