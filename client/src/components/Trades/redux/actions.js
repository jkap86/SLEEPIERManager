import axios from "axios";
import { getTradeTips } from "../services/helpers/getTradeTips";

export const setStateTrades = (state_obj) => ({
  type: `SET_STATE_TRADES`,
  payload: state_obj,
});

export const fetchLmTrades =
  (user_id, leagues, offset, limit, season) => async (dispatch, getState) => {
    dispatch({ type: "FETCH_TRADES_START" });

    try {
      const trades = await axios.post("/trade/leaguemate", {
        user_id: user_id,
        offset: offset,
        limit: limit,
      });

      const trade_tips = getTradeTips(trades.data.rows, leagues, season);

      dispatch({
        type: "FETCH_LMTRADES_SUCCESS",
        payload: {
          count: trades.data.count,
          trades: trade_tips,
        },
      });
    } catch (err) {
      console.log(err.message);
    }
  };