import { useState } from "react";
import { useDispatch } from "react-redux";
import { setCategory } from "../features/suggestions/suggestionsSlice";
import "../css/Filter.scss";

const options = ["All", "UI", "UX", "Enhancement", "Bug", "Feature"];

function Filter() {
  const [option, setOption] = useState("All");
  const dispatch = useDispatch();

  const onOptionClick = option => {
    setOption(option);
    dispatch(setCategory(option));
  };

  const renderedOptions = options.map(op => (
    <li
      key={op}
      className={`op${op === option ? " op--active" : ""}`}
      onClick={() => onOptionClick(op)}
    >
      {op}
    </li>
  ));

  return <ul className="filter">{renderedOptions}</ul>;
}

export default Filter;
