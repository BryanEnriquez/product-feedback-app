import { useSelector } from 'react-redux';
import {
  selectCategory,
  selectCounters,
} from '../features/suggestions/suggestionsSlice';
import { ReactComponent as Bulb } from '../images/suggestions/icon-suggestions.svg';
import '../css/SuggestionsCounter.scss';

function SuggestionsCounter() {
  const suggestionsCount = useSelector(selectCounters);
  const category = useSelector(selectCategory);

  return (
    <div className="suggest-counter">
      <Bulb />
      <h2>{`${
        suggestionsCount[category === 'all' ? 'all' : category]
      } Suggestions`}</h2>
    </div>
  );
}

export default SuggestionsCounter;
