import { useDispatch, useSelector } from 'react-redux';
import {
  selectCategory,
  setCategory,
} from '../features/suggestions/suggestionsSlice';
import '../css/Filter.scss';

const options = [
  { label: 'All', value: 'all' },
  { label: 'UI', value: 'ui' },
  { label: 'UX', value: 'ux' },
  { label: 'Enhancement', value: 'enhancement' },
  { label: 'Bug', value: 'bug' },
  { label: 'Feature', value: 'feature' },
];

function Filter() {
  const option = useSelector(selectCategory);
  const dispatch = useDispatch();

  const renderedOptions = options.map(op => (
    <li
      key={op.value}
      className={`op${option === op.value ? ' op--active' : ''}`}
      onClick={() => dispatch(setCategory(op.value))}
    >
      {op.label}
    </li>
  ));

  return <ul className="filter">{renderedOptions}</ul>;
}

export default Filter;
