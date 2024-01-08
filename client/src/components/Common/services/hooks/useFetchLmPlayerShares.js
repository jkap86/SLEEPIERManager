import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchLmPlayerShares } from "../../redux/actions";

const useFetchLmPlayerShares = (condition) => {
  const dispatch = useDispatch();
  const { user_id, leagues, lmplayershares } = useSelector(
    (state) => state.user
  );

  console.log({ lmplayershares });

  useEffect(() => {
    if (user_id && leagues && !lmplayershares && condition) {
      dispatch(fetchLmPlayerShares(user_id));
    }
  }, [user_id, leagues, lmplayershares, condition, dispatch]);
};

export default useFetchLmPlayerShares;
