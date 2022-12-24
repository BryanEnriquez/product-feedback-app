import { useAppSelector } from '../../hooks';
import {
  selectCategory,
  selectCounters,
} from '../../features/suggestions/suggestionsSlice';
import style from './counter.module.scss';

const SuggestionsCounter = () => {
  const suggestionsCount = useAppSelector(selectCounters);
  const category = useAppSelector(selectCategory);

  return (
    <div className={style.counter}>
      <img alt="light bulb" src="/images/icon-suggestions.svg" />
      <h2>{`${suggestionsCount[category]} Suggestions`}</h2>
    </div>
  );
};

export default SuggestionsCounter;
