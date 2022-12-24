import { useAppSelector, useAppDispatch } from '../../hooks';
import Dropdown from '../dropdown';
import {
  setSort,
  selectSortBy,
} from '../../features/suggestions/suggestionsSlice';
import type { SuggestionsSortBy } from '../../@types';

const options: SuggestionsSortBy[] = [
  { id: 'most_upvotes', label: 'Most Upvotes' },
  { id: 'least_upvotes', label: 'Least Upvotes' },
  { id: 'most_comments', label: 'Most Comments' },
  { id: 'least_comments', label: 'Least Comments' },
];

const SuggestionsDropdown = () => {
  const sortOption = useAppSelector(selectSortBy);
  const dispatch = useAppDispatch();

  return (
    <Dropdown
      label="Sort by: "
      options={options}
      selected={sortOption}
      setSelected={(newOption) => dispatch(setSort(newOption))}
      type="a"
    />
  );
};

export default SuggestionsDropdown;
