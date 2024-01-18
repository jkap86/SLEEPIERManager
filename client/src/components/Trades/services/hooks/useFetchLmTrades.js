import { fetchLmTrades } from "../../redux/actions";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";

const useFetchLmTrades = () => {
  const dispatch = useDispatch();
  const { state } = useSelector((state) => state.common);
  const { user_id, leagues } = useSelector((state) => state.user);

  useEffect(() => {
    if (state && leagues) {
      dispatch(fetchLmTrades(user_id, leagues, 0, 125, state.league_season));
    }
  }, [dispatch, state, user_id, leagues]);
};

export default useFetchLmTrades;
