import { useSelector } from "react-redux";
import Button from "./Button";
import SuggestionsCounter from "./SuggestionsCounter";
import SuggestionsDropdown from "../features/suggestions/SuggestionsDropdown";
import "../css/SortTab.scss";

function SortTab() {
  const user = useSelector(state => state.user);

  return (
    <div className="sort-tab">
      <div className="sort-tab__fb">
        <SuggestionsCounter />
        <SuggestionsDropdown />
      </div>
      <Button
        to={user ? "/feedback-create" : "/login"}
        label="+ Add Feedback"
      />
    </div>
  );
}

export default SortTab;
