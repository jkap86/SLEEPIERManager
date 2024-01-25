import { useEffect } from "react";
import { fetchFilteredLmTrades } from "../../redux/actions";
import { useSelector, useDispatch } from "react-redux";

const useFetchFilteredLmTrades = () => {
  const dispatch = useDispatch();
  const { state } = useSelector((state) => state.common);
  const { user_id, leagues, lmLeagueIds } = useSelector((state) => state.user);
  const { lmTrades, isLoading } = useSelector((state) => state.trades);

  useEffect(() => {
    if (
      (lmTrades.searched_player.id || lmTrades.searched_manager.id) &&
      !lmTrades.searches.find(
        (s) =>
          s.player === lmTrades.searched_player.id &&
          s.manager === lmTrades.searched_manager.id
      ) &&
      !isLoading
    ) {
      console.log("fetching filtered lm trades");
      dispatch(
        fetchFilteredLmTrades(
          lmTrades.searched_player.id,
          lmTrades.searched_manager.id,
          user_id,
          leagues,
          0,
          125,
          state.league_season,
          lmLeagueIds
        )
      );
    }
  }, [
    lmTrades.searched_player,
    lmTrades.searched_manager,
    lmTrades.searches,
    dispatch,
  ]);
};

export default useFetchFilteredLmTrades;
