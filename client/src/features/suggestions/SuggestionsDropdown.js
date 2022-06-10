import { useSelector, useDispatch } from 'react-redux';
import { setSort, selectSortBy } from './suggestionsSlice';
import Dropdown from '../../components/Dropdown';

const options = [
  { id: 'most_upvotes', label: 'Most Upvotes' },
  { id: 'least_upvotes', label: 'Least Upvotes' },
  { id: 'most_comments', label: 'Most Comments' },
  { id: 'least_comments', label: 'Least Comments' },
];

function SuggestionsDropdown() {
  const sortOption = useSelector(selectSortBy);
  const dispatch = useDispatch();

  return (
    <Dropdown
      label="Sort by :"
      options={options}
      selected={sortOption}
      setSelected={newOption => dispatch(setSort(newOption))}
      type="a"
    />
  );
}

export default SuggestionsDropdown;
