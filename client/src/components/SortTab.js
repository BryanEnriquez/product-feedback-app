import { useSelector } from 'react-redux';
import NewFbBtn from './NewFbBtn';
import SuggestionsCounter from './SuggestionsCounter';
import SuggestionsDropdown from '../features/suggestions/SuggestionsDropdown';
import { selectCurrentUser } from '../features/user/currentUserSlice';
import '../css/SortTab.scss';

function SortTab() {
  const user = useSelector(selectCurrentUser);

  return (
    <div className="sort-tab">
      <div className="sort-tab__fb">
        <SuggestionsCounter />
        <SuggestionsDropdown />
      </div>
      <NewFbBtn currentUser={user} />
    </div>
  );
}

export default SortTab;
