import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser, selectStatus } from "./currentUserSlice";

function CurrentUser() {
  const fetchStatus = useSelector(selectStatus);
  const dispatch = useDispatch();

  useEffect(() => {
    if (fetchStatus === "idle") dispatch(fetchCurrentUser());
  }, [fetchStatus, dispatch]);

  return null;
}

export default CurrentUser;
