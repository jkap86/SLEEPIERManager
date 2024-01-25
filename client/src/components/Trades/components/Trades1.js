import "./Trades.css";
import LmTrades from "./LmTrades";
import PcTrades from "./PcTrades";
import { useSelector, useDispatch } from "react-redux";
import { setStateTrades } from "../redux/actions";

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

  const picks_list = [];

  Array.from(Array(4).keys()).map((season) => {
    return Array.from(Array(5).keys()).map((round) => {
      if (season !== 0) {
        return picks_list.push({
          id: `${season + parseInt(state.league_season)} ${round + 1}.${null}`,
          text: `${season + parseInt(state.league_season)}  Round ${round + 1}`,
          image: {
            src: null,
            alt: "pick headshot",
            type: "player",
          },
        });
      } else {
        return Array.from(Array(12).keys()).map((order) => {
          return picks_list.push({
            id: `${season + parseInt(state.league_season)} ${round + 1}.${
              season === 0
                ? (order + 1).toLocaleString("en-US", {
                    minimumIntegerDigits: 2,
                  })
                : null
            }`,
            text: `${season + parseInt(state.league_season)} ${
              season === 0
                ? `${round + 1}.${(order + 1).toLocaleString("en-US", {
                    minimumIntegerDigits: 2,
                  })}`
                : ` Round ${round + 1}`
            }`,
            image: {
              src: null,
              alt: "pick headshot",
              type: "player",
            },
          });
        });
      }
    });
  });

  const players_list = leagues && [
    ...Array.from(
      new Set(
        leagues
          ?.map((league) => league.rosters?.map((roster) => roster.players))
          .flat(3)
      )
    ).map((player_id) => {
      return {
        id: player_id,
        text: allplayers[player_id]?.full_name,
        image: {
          src: player_id,
          alt: "player headshot",
          type: "player",
        },
      };
    }),
    ...picks_list,
  ];

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
          <option>Leaguemate Trades</option>
        </select>
      </h2>
      {tabPrimary === "Leaguemate Trades" ? (
        <LmTrades {...props} secondaryTable={secondaryTable} />
      ) : (
        <PcTrades {...props} secondaryTable={secondaryTable} />
      )}
    </>
  );
};

export default Trades1;
