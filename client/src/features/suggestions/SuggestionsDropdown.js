import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setSort } from './suggestionsSlice';
import Dropdown from '../../components/Dropdown';

const options = [
  { id: 'most_upvotes', label: 'Most Upvotes' },
  { id: 'least_upvotes', label: 'Least Upvotes' },
  { id: 'most_comments', label: 'Most Comments' },
  { id: 'least_comments', label: 'Least Comments' },
];

function SuggestionsDropdown() {
  const [selected, setSelected] = useState(options[0]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSort(selected.id));
  }, [selected, dispatch]);

  return (
    <Dropdown
      label="Sort by :"
      options={options}
      selected={selected}
      setSelected={setSelected}
      type="a"
    />
  );
}

export default SuggestionsDropdown;
