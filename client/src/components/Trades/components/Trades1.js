import "./Trades.css";
import LmTrades from "./LmTrades";
import PcTrades from "./PcTrades";
import { useSelector, useDispatch } from "react-redux";
import { setStateTrades } from "../redux/actions";
import {
  getPicksList,
  getPlayersList,
} from "../services/helpers/getSearchLists";

const Trades1 = ({ secondaryTable }) => {
  const dispatch = useDispatch();
  const { allplayers, state } = useSelector((state) => state.common);
  const { leagues } = useSelector((state) => state.user);
  const { tabPrimary } = useSelector((state) => state.trades);

  const trades_headers = [
    [
      {
        text: "Date",
        colSpan: 3,
      },
      {
        text: "League",
        colSpan: 7,
      },
    ],
  ];

  const picks_list = getPicksList(state.league_season);

  const players_list = getPlayersList(leagues, allplayers, picks_list);

  const props = {
    trades_headers,
    players_list,
  };

  return (
    <>
      <h2>
        <select
          value={tabPrimary}
          onChange={(e) =>
            dispatch(setStateTrades({ tabPrimary: e.target.value }))
          }
          className="active click"
        >
          <option>Price Check</option>
          <option>Leaguemate League Trades</option>
          <option>Leaguemate Trades</option>
          <option>Trade Tips</option>
        </select>
      </h2>
      {tabPrimary !== "Price Check" ? (
        <LmTrades {...props} secondaryTable={secondaryTable} />
      ) : (
        <PcTrades {...props} secondaryTable={secondaryTable} />
      )}
    </>
  );
};

export default Trades1;
