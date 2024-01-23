import useFetchLmTrades from "../services/hooks/useFetchLmTrades";
import { useSelector, useDispatch } from "react-redux";
import LoadingIcon from "../../Common/LoadingIcon";
import TableMain from "../../Common/TableMain";
import Trade from "./Trade";
import { setStateTrades, fetchLmTrades } from "../redux/actions";
import { position_map } from "../../PlayoffPool/helpers/getWeeklyResult";

const LmTrades = ({ secondaryTable }) => {
  const dispatch = useDispatch();
  const { allplayers, state } = useSelector((state) => state.common);
  const { adpLm, lmLeagueIds, user_id, leagues } = useSelector(
    (state) => state.user
  );
  const { lmTrades, isLoading } = useSelector((state) => state.trades);
  const { trades, count, itemActive, page, searched_player, searched_manager } =
    lmTrades;

  useFetchLmTrades();

  const tradeCount = !(searched_player?.id || searched_manager?.id) ? count : 0;

  const header = [
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

  const trades_display = trades || [];

  const body = trades_display
    ?.sort((a, b) => parseInt(b.status_updated) - parseInt(a.status_updated))
    ?.map((trade) => {
      const rosters = Object.values(trade.rosters).map((roster) => {
        const starters = [];

        trade["league.roster_positions"]
          .filter((slot) => Object.keys(position_map).includes(slot))
          .forEach((slot) => {
            const league_type =
              trade["league.settings"].type === 2
                ? "Dynasty"
                : trade["league.settings"].type === 0
                ? "Redraft"
                : "All";

            const players_slot = roster.players
              .filter(
                (player_id) =>
                  position_map[slot].some((p) =>
                    allplayers[player_id]?.fantasy_positions?.includes(p)
                  ) && !starters.includes(player_id)
              )
              .sort(
                (a, b) =>
                  (adpLm?.[league_type]?.[a]?.adp || 999) -
                  (adpLm?.[league_type]?.[b]?.adp || 999)
              );

            starters.push(players_slot[0] || "0");
          });

        return {
          ...roster,
          starters: starters,
        };
      });

      const league = {
        avatar: trade["league.avatar"],
        league_id: trade["league.league_id"],
        name: trade["league.name"],
        roster_positions: trade["league.roster_positions"],
        scoring_settings: trade["league.scoring_settings"],
        settings: trade["league.settings"],
      };

      return {
        id: trade.transaction_id,
        list: [
          {
            text: <Trade trade={trade} />,
            colSpan: 10,
          },
        ],
        secondary_table: secondaryTable({ rosters, league, trade }),
      };
    });

  const loadMore = async () => {
    console.log("LOADING MORE");

    if (lmTrades.searched_player === "" && lmTrades.searched_manager === "") {
      dispatch(
        fetchLmTrades(
          user_id,
          leagues,
          trades_display.length,
          125,
          state.league_season,
          lmLeagueIds,
          true
        )
      );
    }
  };

  return isLoading ? (
    <LoadingIcon />
  ) : (
    <>
      <h1>{count}</h1>
      <TableMain
        type={"primary"}
        headers={header}
        body={body}
        itemActive={itemActive}
        setItemActive={(item) =>
          dispatch(
            setStateTrades({ lmTrades: { ...lmTrades, itemActive: item } })
          )
        }
        page={page}
        setPage={(page) =>
          dispatch(setStateTrades({ lmTrades: { ...lmTrades, page: page } }))
        }
        partial={trades_display?.length < tradeCount ? true : false}
        loadMore={loadMore}
        isLoading={isLoading}
      />
    </>
  );
};

export default LmTrades;
