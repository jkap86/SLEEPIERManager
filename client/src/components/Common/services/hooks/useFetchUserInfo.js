import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdp, fetchLmLeagueIds, resetState } from "../../redux/actions";
import { fetchUser, fetchLeagues } from "../../redux/actions";
import { fetchCommon } from "../../redux/actions";
import { checkIndexedDB, clearIndexedDB } from "../helpers/indexedDb";

const useFetchUserInfo = (to_fetch_array) => {
  const dispatch = useDispatch();
  const params = useParams();
  const {
    user_id,
    isLoadingUser,
    errorUser,
    username,
    leagues,
    isLoadingLeagues,
    errorLeagues,
    lmLeagueIds,
    type1,
    type2,
    adpLm,
    leaguemates,
  } = useSelector((state) => state.user);
  const { allplayers, state } = useSelector((state) => state.common);

  console.log({ leaguemates });

  useEffect(() => {
    if (!state) {
      dispatch(fetchCommon("state"));
    }
  }, [state]);

  useEffect(() => {
    if (
      username &&
      username?.toLowerCase() !== params.username?.toLowerCase()
    ) {
      dispatch(resetState());
    }
  }, [dispatch, username, params.username]);

  useEffect(() => {
    if (!user_id && !isLoadingUser && !errorUser) {
      dispatch(fetchUser(params.username));
    }
  }, [dispatch, user_id, params.username, errorUser, isLoadingUser]);

  useEffect(() => {
    if (user_id && state && !leagues && !isLoadingLeagues && !errorLeagues) {
      checkIndexedDB(
        user_id,
        "leagues",
        () => dispatch(fetchLeagues(user_id, state.league_season)),
        (data) => dispatch({ type: "FETCH_LEAGUES_SUCCESS", payload: data })
      );
    }
  }, [dispatch, user_id, state, leagues, isLoadingLeagues, errorLeagues]);

  useEffect(() => {
    if ((user_id, leagues && !lmLeagueIds)) {
      checkIndexedDB(
        user_id,
        "lmLeagueIds",
        () => dispatch(fetchLmLeagueIds(user_id, type1, type2)),
        (data) =>
          dispatch({
            type: "SET_STATE_USER",
            payload: { lmLeagueIds: data },
          })
      );
    }
  }, [dispatch, leagues, lmLeagueIds, user_id]);

  useEffect(() => {
    if (leagues) {
      if (!allplayers) {
        try {
          checkIndexedDB(
            "COMMON",
            "allplayers",
            () => dispatch(fetchCommon("allplayers")),
            (data) =>
              dispatch({
                type: "FETCH_COMMON_SUCCESS",
                payload: { item: "allplayers", data: data },
              })
          );
        } catch (err) {
          const retry = async () => {
            await clearIndexedDB("COMMON");
          };
        }
      }
    }
  }, [dispatch, allplayers, leagues]);

  useEffect(() => {
    if (lmLeagueIds && !adpLm) {
      checkIndexedDB(
        user_id,
        "lmAdp",
        () => dispatch(fetchAdp(lmLeagueIds, user_id)),
        (data) =>
          dispatch({
            type: "SET_STATE_USER",
            payload: { adpLm: data },
          })
      );
    }
  }, [dispatch, lmLeagueIds, adpLm, user_id]);
  console.log({ adpLm });
};

export default useFetchUserInfo;
