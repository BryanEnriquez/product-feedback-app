import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setSort } from "./suggestionsSlice";
import Dropdown from "../../components/Dropdown";

const options = [
  { label: "Most Upvotes", value: "upvotes" },
  { label: "Least Upvotes", value: "-upvotes" },
  { label: "Most Comments", value: "comments" },
  { label: "Least Comments", value: "-comments" },
];

function SuggestionsDropdown() {
  const [selected, setSelected] = useState(options[0]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSort(selected.value));
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
