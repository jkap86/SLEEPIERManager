import { combineReducers } from "redux";
import homepageReducer from "../components/Homepage/redux/homepageReducer";
import progressReducer from "../components/Common/redux/progressReducer";
import userReducer from "../components/Common/redux/userReducer";
import commonReducer from "../components/Common/redux/commonReducer";
import leaguesReducer from "../components/Leagues/redux/leaguesReducer";
import playersReducer from "../components/Players/redux/playersReducer";
import leaguematesReducer from "../components/Leaguemates/redux/leaguematesReducer";
import tradesReducer from "../components/Trades/redux/tradesReducer";

const rootReducer = combineReducers({
  homepage: homepageReducer,
  progress: progressReducer,
  user: userReducer,
  common: commonReducer,
  leagues: leaguesReducer,
  players: playersReducer,
  leaguemates: leaguematesReducer,
  trades: tradesReducer,
});

export default rootReducer;
