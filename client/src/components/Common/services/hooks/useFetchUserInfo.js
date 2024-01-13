import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetState } from "../../redux/actions";
import { fetchUser, fetchLeagues } from "../../redux/actions";
import { fetchCommon } from "../../redux/actions";
import { checkIndexedDB } from "../helpers/indexedDb";

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
  } = useSelector((state) => state.user);
  const { allplayers, state } = useSelector((state) => state.common);

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
    if (leagues) {
      if (!allplayers) {
        dispatch(fetchCommon("allplayers"));
      }
    }
  }, [dispatch, allplayers, leagues]);
};

export default useFetchUserInfo;
