import axios from "axios";
import { saveToDB } from "../services/helpers/indexedDb";

export const resetState = () => ({
  type: "RESET_STATE",
});

export const setStateUser = (state_obj) => ({
  type: `SET_STATE_USER`,
  payload: state_obj,
});

export const setStateCommon = (state_obj) => ({
  type: `SET_STATE_COMMON`,
  payload: state_obj,
});

export const fetchCommon = (item) => {
  return async (dispatch) => {
    dispatch({ type: "FETCH_COMMON_START", payload: { item: item } });

    try {
      const main = await axios.get(`/main/${item}`);

      const data = Array.isArray(main.data) ? main.data[0] : main.data;
      console.log({ data });
      dispatch({
        type: "FETCH_COMMON_SUCCESS",
        payload: {
          item: item,
          data: data,
        },
      });
    } catch (error) {
      dispatch({ type: "FETCH_COMMON_FAILURE", payload: error.message });

      console.error(error.message);
    }
  };
};

export const fetchUser = (username) => {
  return async (dispatch) => {
    dispatch({ type: "FETCH_USER_START" });

    try {
      const user = await axios.get("/user/upsert", {
        params: { username: username },
      });

      console.log(user.data);

      if (!user.data?.error) {
        dispatch({ type: "FETCH_USER_SUCCESS", payload: user.data.user });
      } else {
        dispatch({ type: "FETCH_USER_FAILURE", payload: user.data });
      }
    } catch (error) {
      dispatch({ type: "FETCH_USER_FAILURE", payload: error.message });
    }
  };
};

export const fetchLeagues = (user_id, season) => {
  return async (dispatch) => {
    dispatch({ type: "FETCH_LEAGUES_START" });

    try {
      const response = await fetch(
        `/league/upsert?user_id=${encodeURIComponent(
          user_id
        )}&season=${encodeURIComponent(season)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const reader = response.body.getReader();

        let leagues = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          try {
            const batch = new TextDecoder().decode(value);

            leagues += batch;
          } catch (err) {
            console.log(err);
          }
          const matches = leagues.match(/"league_id":/g);

          let count = 0;

          if (matches && matches.length > 0) {
            count = matches.length;
          }

          dispatch({
            type: "SET_STATE_PROGRESS",
            payload: { progress: count },
          });
        }

        let parsed_leagues;

        try {
          parsed_leagues = JSON.parse(leagues);
        } catch (error) {
          console.log(error);
        }

        const data = parsed_leagues.flat();

        dispatch({
          type: "FETCH_LEAGUES_SUCCESS",
          payload: data,
        });

        if (!data.find((league) => league.error)) {
          saveToDB(user_id, "leagues", {
            timestamp: new Date().getTime() + 15 * 60 * 10000,
            data: data,
          });
        }
      } else {
        dispatch({
          type: "FETCH_LEAGUES_FAILURE",
          payload: "Failed to fetch user leagues",
        });
      }
    } catch (error) {
      dispatch({ type: "FETCH_LEAGUES_FAILURE", payload: error.message });
    }
  };
};

export const fetchLmPlayerShares = (user_id) => async (dispatch) => {
  dispatch({ type: "SET_STATE_USER", payload: { isLoadingPS: true } });

  try {
    const lmplayershares = await axios.get("/user/lmplayershares", {
      params: { user_id: user_id },
    });

    console.log({
      lmplayershares: lmplayershares.data.sort((a, b) =>
        a.username > b.username ? 1 : -1
      ),
    });

    dispatch({
      type: "SET_STATE_USER",
      payload: { lmplayershares: lmplayershares.data, isLoadingPS: false },
    });
  } catch (err) {
    dispatch({
      type: "SET_STATE_USER",
      payload: { isLoadingPS: false, errorPS: err.message },
    });
  }
};

export const fetchPlayerValues = (player_ids) => {
  return async (dispatch) => {
    try {
      const pv = await axios.post("/main/playervalues", {
        player_ids: player_ids,
      });

      const values_dict = {};

      pv.data.forEach((value_obj) => {
        if (!values_dict[value_obj.date]) {
          values_dict[value_obj.date] = {};
        }

        if (!values_dict[value_obj.date][value_obj.player_id]) {
          values_dict[value_obj.date][value_obj.player_id] = {};
        }

        values_dict[value_obj.date][value_obj.player_id][value_obj.type] =
          value_obj.value;
      });

      dispatch({ type: "SET_STATE_COMMON", payload: { values: values_dict } });
    } catch (err) {
      console.log(err);
    }
  };
};
