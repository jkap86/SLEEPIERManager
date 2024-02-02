import useFetchLmTrades from "../services/hooks/useFetchLmTrades";
import useFetchFilteredLmTrades from "../services/hooks/useFetchFilteredLmTrades";
import { useSelector, useDispatch } from "react-redux";
import LoadingIcon from "../../Common/LoadingIcon";
import TableMain from "../../Common/TableMain";
import Trade from "./Trade";
import Search from "../../Common/Search";
import { setStateTrades, fetchLmTrades } from "../redux/actions";
import { position_map } from "../../PlayoffPool/helpers/getWeeklyResult";

const LmTrades = ({ trades_headers, players_list, secondaryTable }) => {
  const dispatch = useDispatch();
  const { allplayers, state } = useSelector((state) => state.common);
  const { adpLm, lmLeagueIds, user_id, leagues, leaguemate_ids } = useSelector(
    (state) => state.user
  );
  const { lmTrades, isLoading, tabPrimary } = useSelector(
    (state) => state.trades
  );
  const {
    trades,
    count,
    itemActive,
    page,
    searched_player,
    searched_manager,
    searches,
  } = lmTrades;

  useFetchLmTrades();

  useFetchFilteredLmTrades();

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

  const searched = searches.find(
    (search) =>
      search.player === searched_player?.id &&
      search.manager === searched_manager?.id
  );

  const tradeCount =
    searched_player?.id || searched_manager?.id ? searched?.count : count;

  const trades_display =
    ((searched_player?.id || searched_manager?.id) &&
      (searched?.trades || [])) ||
    trades ||
    [];

  console.log({
    trades: (trades || [])?.filter((trade) =>
      trade.tips.acquire.find((a) => a.player_id.includes("."))
    ),
  });
  const body = trades_display
    ?.filter(
      (trade) =>
        (tabPrimary !== "Leaguemate Trades" ||
          Object.values(trade.rosters).find((r) =>
            leaguemate_ids.includes(r.user_id)
          )) &&
        (tabPrimary !== "Trade Tips" ||
          (trade.tips.acquire?.length || 0) +
            (trade.tips.trade_away?.length || 0) >
            0)
    )
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
              ?.filter(
                (player_id) =>
                  position_map[slot].some((p) =>
                    allplayers[player_id]?.fantasy_positions?.includes(p)
                  ) && !starters.includes(player_id)
              )
              ?.sort(
                (a, b) =>
                  (adpLm?.[league_type]?.[a]?.adp || 999) -
                  (adpLm?.[league_type]?.[b]?.adp || 999)
              );

            starters.push(players_slot?.[0] || "0");
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

  const managers_list = [];

  (leagues || []).forEach((league) => {
    league.rosters
      .filter((r) => parseInt(r.user_id) > 0)
      .forEach((roster) => {
        if (!managers_list.find((m) => m.id === roster.user_id)) {
          managers_list.push({
            id: roster.user_id,
            text: roster.username,
            image: {
              src: roster.avatar,
              alt: "user avatar",
              type: "user",
            },
          });
        }
      });
  });

  return isLoading ? (
    <LoadingIcon />
  ) : (
    <>
      <h1>{tradeCount?.toLocaleString("en-US")} Trades</h1>
      <div className="trade_search_wrapper">
        <Search
          id={"By Player"}
          placeholder={`Player`}
          list={players_list}
          searched={lmTrades.searched_player}
          setSearched={(searched) =>
            dispatch(
              setStateTrades(
                { lmTrades: { ...lmTrades, searched_player: searched } },
                "TRADES"
              )
            )
          }
        />
        <Search
          id={"By Manager"}
          placeholder={`Manager`}
          list={managers_list}
          searched={lmTrades.searched_manager}
          setSearched={(searched) =>
            dispatch(
              setStateTrades(
                { lmTrades: { ...lmTrades, searched_manager: searched } },
                "TRADES"
              )
            )
          }
        />
      </div>

      <TableMain
        type={"primary trades"}
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
