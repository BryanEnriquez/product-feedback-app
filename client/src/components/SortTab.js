import { useSelector } from 'react-redux';
import Button from './Button';
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
      <Button
        to={user ? '/new-feedback' : user === null ? '/' : '/login'}
        label="+ Add Feedback"
      />
    </div>
  );
}

export default SortTab;
