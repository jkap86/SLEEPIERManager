import axios from "axios";
import { getTradeTips } from "../services/helpers/getTradeTips";

export const setStateTrades = (state_obj) => ({
  type: `SET_STATE_TRADES`,
  payload: state_obj,
});

export const fetchLmTrades =
  (user_id, leagues, offset, limit, season, league_ids, more = false) =>
  async (dispatch, getState) => {
    dispatch({ type: "FETCH_TRADES_START" });

    try {
      const trades = await axios.post("/trade/leaguemate", {
        user_id: user_id,
        offset: offset,
        limit: limit,
        league_ids: league_ids,
      });

      const trade_tips = getTradeTips(trades.data.rows, leagues, season);

      dispatch({
        type: "FETCH_LMTRADES_SUCCESS",
        payload: {
          count: trades.data.count,
          trades: trade_tips,
          more: more,
        },
      });
    } catch (err) {
      console.log(err.message);
    }
  };

export const fetchFilteredLmTrades =
  (
    searchedPlayerId,
    searchedManagerId,
    user_id,
    leagues,
    offset,
    limit,
    season,
    league_ids
  ) =>
  async (dispatch, getState) => {
    dispatch({ type: "FETCH_TRADES_START" });

    try {
      const trades = await axios.post("/trade/leaguemate", {
        user_id: user_id,
        player: searchedPlayerId,
        manager: searchedManagerId,
        offset: offset,
        limit: limit,
        league_ids: league_ids,
      });

      const trades_tips = getTradeTips(trades.data.rows, leagues, season);

      dispatch({
        type: "FETCH_FILTERED_LMTRADES_SUCCESS",
        payload: {
          player: searchedPlayerId,
          manager: searchedManagerId,
          trades: trades_tips,
          count: trades.data.count,
        },
      });
    } catch (error) {
      dispatch({ type: "FETCH_TRADES_FAILURE", payload: error.message });
    }
  };

export const fetchPriceCheckTrades =
  (pricecheck_player, pricecheck_player2, offset, limit) =>
  async (dispatch, getState) => {
    dispatch({ type: "FETCH_TRADES_START" });

    const state = getState();

    const { user, common } = state;

    try {
      const player_trades = await axios.post("/trade/pricecheck", {
        player: pricecheck_player,
        player2: pricecheck_player2,
        offset: offset,
        limit: limit,
      });

      console.log({ player_trades });
      const trades_tips = getTradeTips(
        player_trades.data.rows,
        user.leagues,
        common.state.league_season
      );
      console.log({ trades_tips });
      dispatch({
        type: "FETCH_PRICECHECKTRADES_SUCCESS",
        payload: {
          pricecheck_player: pricecheck_player,
          pricecheck_player2: pricecheck_player2,
          trades: trades_tips,
          count: player_trades.data.count,
        },
      });
    } catch (error) {
      dispatch({ type: "FETCH_TRADES_FAILURE", payload: error.message });
    }
  };
