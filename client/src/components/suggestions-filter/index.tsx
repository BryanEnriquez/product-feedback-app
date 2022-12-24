import { useAppSelector, useAppDispatch } from '../../hooks';
import {
  selectCategory,
  setCategory,
} from '../../features/suggestions/suggestionsSlice';
import type { FeedbackCategory } from '../../@types';
import style from './filter.module.scss';

const options: { label: string; value: FeedbackCategory }[] = [
  { label: 'All', value: 'all' },
  { label: 'UI', value: 'ui' },
  { label: 'UX', value: 'ux' },
  { label: 'Enhancement', value: 'enhancement' },
  { label: 'Bug', value: 'bug' },
  { label: 'Feature', value: 'feature' },
];
const SuggestionsFilter = () => {
  const option = useAppSelector(selectCategory);
  const dispatch = useAppDispatch();

  return (
    <ol className={style.filter}>
      {options.map((op) => (
        <li
          key={op.value}
          {...(option === op.value && { className: style.filter__selected })}
          onClick={() => dispatch(setCategory(op.value))}
        >
          {op.label}
        </li>
      ))}
    </ol>
  );
};

export default SuggestionsFilter;
